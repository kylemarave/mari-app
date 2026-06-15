import { Injectable } from '@angular/core';
import { Flashcard } from '../models/mari.models';
import { createId } from '../data/seed-data';

export interface PdfReviewResult {
  fileName: string;
  title: string;
  cards: Flashcard[];
  excerpt: string;
  pageCount: number;
}

@Injectable({ providedIn: 'root' })
export class PdfFlashcardService {
  async reviewPdf(file: File): Promise<PdfReviewResult> {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Please upload a PDF file.');
    }

    const { text, pageCount } = await this.extractText(file);
    const cleaned = this.normalizeText(text);

    if (cleaned.length < 40) {
      throw new Error(
        'Could not read enough text from this PDF. Try a text-based PDF rather than a scanned image.',
      );
    }

    const cards = this.generateFlashcards(cleaned);
    if (!cards.length) {
      throw new Error('No study cards could be generated from this PDF. Try a document with clearer headings or definitions.');
    }

    return {
      fileName: file.name,
      title: this.titleFromFileName(file.name),
      cards,
      excerpt: cleaned.slice(0, 280).trim() + (cleaned.length > 280 ? '…' : ''),
      pageCount,
    };
  }

  private async extractText(file: File): Promise<{ text: string; pageCount: number }> {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data }).promise;
    const chunks: string[] = [];

    for (let page = 1; page <= pdf.numPages; page++) {
      const pageDoc = await pdf.getPage(page);
      const content = await pageDoc.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (pageText) chunks.push(pageText);
    }

    return { text: chunks.join('\n\n'), pageCount: pdf.numPages };
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\u0000/g, '')
      .replace(/\s+/g, ' ')
      .replace(/(\.)([A-Z])/g, '$1 $2')
      .trim();
  }

  private titleFromFileName(fileName: string): string {
    const base = fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
    return base.replace(/\b\w/g, (char) => char.toUpperCase()) || 'New Study Set';
  }

  private generateFlashcards(text: string): Flashcard[] {
    const lines = this.splitLines(text);
    const drafts: { question: string; answer: string; score: number }[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      const colon = line.match(/^(.{3,70}?)\s*[:\u2014\u2013-]\s*(.{12,})$/);
      if (colon) {
        this.pushDraft(drafts, seen, `What is ${this.cleanTerm(colon[1])}?`, colon[2], 5);
        continue;
      }

      const defined = line.match(
        /^([A-Z][A-Za-z0-9\s\-()]{2,55}?)\s+(is|are|refers to|means|defined as)\s+(.{12,})$/i,
      );
      if (defined) {
        this.pushDraft(
          drafts,
          seen,
          `What ${defined[2].toLowerCase()} ${this.cleanTerm(defined[1])}?`,
          defined[3],
          4,
        );
      }
    }

    for (let i = 0; i < lines.length - 1; i++) {
      const heading = lines[i];
      const body = lines[i + 1];
      if (this.looksLikeHeading(heading) && body.length >= 40 && body.length <= 320) {
        this.pushDraft(drafts, seen, `Explain: ${heading}`, body, 3);
      }
    }

    for (const line of lines) {
      const bullet = line.match(/^(?:\d+[.)]|[-•*])\s+(.{12,})$/);
      if (bullet) {
        const content = bullet[1];
        const split = content.match(/^(.{3,55}?)\s*[:\u2014\u2013-]\s*(.{8,})$/);
        if (split) {
          this.pushDraft(drafts, seen, `What is ${this.cleanTerm(split[1])}?`, split[2], 3);
        } else {
          this.pushDraft(drafts, seen, `Key point from ${this.inferTopic(lines)}`, content, 2);
        }
      }
    }

    if (drafts.length < 4) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
      for (let i = 0; i < sentences.length - 1; i += 2) {
        const questionSentence = sentences[i].trim();
        const answerSentence = sentences[i + 1]?.trim();
        if (!questionSentence || !answerSentence) continue;
        this.pushDraft(
          drafts,
          seen,
          `Review: ${this.trimTo(questionSentence, 90)}`,
          this.trimTo(`${questionSentence} ${answerSentence}`, 220),
          1,
        );
      }
    }

    return drafts
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((card) => ({
        id: createId('c'),
        question: this.trimTo(card.question, 120),
        answer: this.trimTo(card.answer, 280),
      }));
  }

  private splitLines(text: string): string[] {
    const byParagraph = text.split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/);
    return byParagraph.map((part) => part.trim()).filter((part) => part.length >= 8);
  }

  private looksLikeHeading(line: string): boolean {
    if (line.length < 4 || line.length > 72) return false;
    if (/[.!?]$/.test(line)) return false;
    if (/^\d+[.)]/.test(line)) return false;
    return /^[A-Z0-9]/.test(line);
  }

  private inferTopic(lines: string[]): string {
    const heading = lines.find((line) => this.looksLikeHeading(line));
    return heading ? this.trimTo(heading, 40) : 'this document';
  }

  private cleanTerm(term: string): string {
    return term.replace(/\s+/g, ' ').trim();
  }

  private trimTo(value: string, max: number): string {
    const trimmed = value.replace(/\s+/g, ' ').trim();
    if (trimmed.length <= max) return trimmed;
    return trimmed.slice(0, max - 1).trim() + '…';
  }

  private pushDraft(
    drafts: { question: string; answer: string; score: number }[],
    seen: Set<string>,
    question: string,
    answer: string,
    score: number,
  ): void {
    const q = this.trimTo(question, 120);
    const a = this.trimTo(answer, 280);
    const key = q.toLowerCase();
    if (seen.has(key) || a.length < 12) return;
    seen.add(key);
    drafts.push({ question: q, answer: a, score });
  }
}
