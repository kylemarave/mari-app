import { GoogleGenerativeAI } from '@google/generative-ai';
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

async function generateFromChunk(
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  text: string,
  fileName: string,
): Promise<GeminiStudySetResponse> {
  const prompt = `You are Mari, an AI study assistant similar to Gizmo AI. From the document below, create a formatted study reviewer AND flashcards.

Rules:
- Split content into 3–8 logical sections (chapters, topics, or themes)
- Each section: heading, 2–4 sentence summary, 3–6 key point bullets
- Each section: 3–6 flashcards with type one of: definition, concept, process, fact
- Questions must test understanding; answers are 1–3 sentences
- Avoid duplicate cards
- Return valid JSON only

Document file name: ${fileName}

DOCUMENT:
${text}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });

  const raw = result.response.text();
  if (!raw) throw new Error('Empty response from Gemini');
  const parsed = JSON.parse(raw) as GeminiStudySetResponse;
  if (!parsed.title || !parsed.overview || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid JSON shape from Gemini');
  }
  return parsed;
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
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const chunks = chunkText(text);
  const partials: GeminiStudySetResponse[] = [];

  for (const chunk of chunks) {
    partials.push(await generateFromChunk(model, chunk, fileName));
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
      const message = error instanceof Error ? error.message : 'Gemini generation failed.';
      res.status(500).json({ error: message });
    }
  });
}
