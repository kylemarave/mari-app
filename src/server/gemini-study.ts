import { GoogleGenAI } from '@google/genai';
import type { Express, Request, Response } from 'express';

export interface GeminiStudySetResponse {
  title: string;
  overview: string;
  sections: {
    heading: string;
    summary: string;
    keyPoints: string[];
    cards: {
      type: 'definition' | 'concept' | 'process' | 'fact';
      question: string;
      answer: string;
    }[];
  }[];
}

const CHUNK_SIZE = 10_000;
const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'] as const;

const STUDY_PROMPT = (fileName: string, text: string) => `You are Mari, an AI study assistant similar to Gizmo AI. From the document below, create a formatted study reviewer AND flashcards.

Rules:
- Split content into 3–8 logical sections (chapters, topics, or themes)
- Each section: heading, 2–4 sentence summary, 3–6 key point bullets
- Each section: 3–6 flashcards with type one of: definition, concept, process, fact
- Questions must test understanding; answers are 1–3 sentences
- Avoid duplicate cards
- Return valid JSON only with this shape:
{
  "title": string,
  "overview": string,
  "sections": [{ "heading": string, "summary": string, "keyPoints": string[], "cards": [{ "type": "definition"|"concept"|"process"|"fact", "question": string, "answer": string }] }]
}

Document file name: ${fileName}

DOCUMENT:
${text}`;

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const breakAt = text.lastIndexOf('\n\n', end);
      if (breakAt > start + CHUNK_SIZE * 0.5) end = breakAt;
    }
    chunks.push(text.slice(start, end).trim());
    start = end;
  }
  return chunks.filter(Boolean);
}

function dedupeSections(
  sections: GeminiStudySetResponse['sections'],
): GeminiStudySetResponse['sections'] {
  const seen = new Set<string>();
  return sections.map((section) => ({
    ...section,
    cards: section.cards.filter((card) => {
      const key = card.question.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  }));
}

function parseStudyJson(raw: string): GeminiStudySetResponse {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    : trimmed;
  const parsed = JSON.parse(jsonText) as GeminiStudySetResponse;
  if (!parsed.title || !parsed.overview || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid JSON shape from Gemini');
  }
  return parsed;
}

function normalizeApiKey(raw: string | undefined): string {
  const key = raw?.trim() ?? '';
  if (!key) throw new Error('GEMINI_API_KEY is not configured on the server.');
  return key;
}

function isAuthKey(apiKey: string): boolean {
  return apiKey.startsWith('AQ.');
}

function geminiErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Gemini generation failed.';
}

async function generateViaRest(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  if (!res.ok) {
    throw new Error(body.error?.message ?? `Gemini REST failed (${res.status})`);
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini REST');
  return text;
}

async function generateViaGenAiSdk(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('Empty response from Gemini SDK');
  return text;
}

async function generateFromChunk(
  apiKey: string,
  text: string,
  fileName: string,
): Promise<GeminiStudySetResponse> {
  const prompt = STUDY_PROMPT(fileName, text);
  const errors: string[] = [];

  for (const model of MODELS) {
    if (isAuthKey(apiKey)) {
      try {
        const raw = await generateViaRest(apiKey, model, prompt);
        return parseStudyJson(raw);
      } catch (error) {
        errors.push(`${model} (REST): ${geminiErrorMessage(error)}`);
      }
    }

    try {
      const raw = await generateViaGenAiSdk(apiKey, model, prompt);
      return parseStudyJson(raw);
    } catch (error) {
      errors.push(`${model} (SDK): ${geminiErrorMessage(error)}`);
    }
  }

  throw new Error(
    errors.length
      ? `All Gemini models failed. ${errors.slice(0, 3).join(' | ')}`
      : 'Gemini generation failed.',
  );
}

function mergeStudySets(parts: GeminiStudySetResponse[]): GeminiStudySetResponse {
  const title = parts[0]?.title ?? 'New Study Set';
  const overviews = parts.map((p) => p.overview).filter(Boolean);
  const overview =
    overviews.length > 1
      ? overviews.slice(0, 3).join(' ')
      : (overviews[0] ?? 'Study material from your document.');

  const sections = parts.flatMap((p) => p.sections ?? []);
  return {
    title,
    overview: overview.slice(0, 500),
    sections: dedupeSections(sections),
  };
}

export async function generateStudySetWithGemini(
  text: string,
  fileName: string,
  pageCount: number,
): Promise<GeminiStudySetResponse & { fileName: string; pageCount: number }> {
  const apiKey = normalizeApiKey(process.env['GEMINI_API_KEY']);

  const chunks = chunkText(text);
  const partials: GeminiStudySetResponse[] = [];

  for (const chunk of chunks) {
    partials.push(await generateFromChunk(apiKey, chunk, fileName));
  }

  const merged = partials.length === 1 ? partials[0]! : mergeStudySets(partials);

  return {
    ...merged,
    fileName,
    pageCount,
  };
}

export function registerGeminiStudyRoutes(app: Express): void {
  app.post('/api/generate-study-set', async (req: Request, res: Response) => {
    try {
      const body = req.body as { text?: string; fileName?: string; pageCount?: number };
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const fileName = typeof body.fileName === 'string' ? body.fileName : 'document.pdf';
      const pageCount = typeof body.pageCount === 'number' ? body.pageCount : 0;

      if (text.length < 40) {
        res.status(400).json({ error: 'Not enough text to generate a study set.' });
        return;
      }

      const result = await generateStudySetWithGemini(text, fileName, pageCount);
      res.json(result);
    } catch (error) {
      const message = geminiErrorMessage(error);
      res.status(500).json({ error: message });
    }
  });
}
