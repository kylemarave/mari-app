import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideCheck,
  LucideFileText,
  LucideLoaderCircle,
  LucideSparkles,
  LucideTrash2,
  LucideUpload,
  LucideX,
} from '@lucide/angular';
import { Flashcard } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import {
  PdfFlashcardService,
  PdfReviewResult,
} from '../../core/services/pdf-flashcard.service';

type UploaderStep = 'idle' | 'processing' | 'review' | 'error';

@Component({
  selector: 'app-pdf-deck-uploader',
  imports: [
    FormsModule,
    LucideUpload,
    LucideFileText,
    LucideLoaderCircle,
    LucideSparkles,
    LucideCheck,
    LucideTrash2,
    LucideX,
  ],
  template: `
    <section class="mari-surface-elevated mb-6 overflow-hidden">
      @switch (step()) {
        @case ('idle') {
          <div class="p-5 sm:p-6">
            <div class="mb-4 flex items-start gap-3">
              <div
                class="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-mari-primary to-mari-primary-dark text-white shadow-sm"
              >
                <svg lucideSparkles [size]="22"></svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-mari-text">Create from PDF</h2>
                <p class="mt-0.5 text-sm text-mari-text-secondary">
                  Upload lecture notes or a textbook chapter — Mari will review the content and
                  generate flashcards for you.
                </p>
              </div>
            </div>

            <label
              class="flex cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed px-6 py-10 transition-colors"
              [class]="dragging()
                ? 'border-mari-primary bg-mari-primary-light/50'
                : 'border-mari-border bg-mari-bg-secondary/60 hover:border-mari-primary-muted hover:bg-mari-primary-light/30'"
              (dragover)="onDragOver($event)"
              (dragleave)="dragging.set(false)"
              (drop)="onDrop($event)"
            >
              <div
                class="mb-3 flex size-14 items-center justify-center rounded-full bg-mari-bg text-mari-primary shadow-sm"
              >
                <svg lucideUpload [size]="28"></svg>
              </div>
              <p class="text-sm font-semibold text-mari-text">Drop your PDF here</p>
              <p class="mt-1 text-xs text-mari-text-tertiary">or click to browse · max 15 MB</p>
              <input
                type="file"
                accept="application/pdf,.pdf"
                class="sr-only"
                (change)="onFileSelected($event)"
              />
            </label>
          </div>
        }

        @case ('processing') {
          <div class="flex flex-col items-center px-6 py-14 text-center">
            <svg lucideLoaderCircle [size]="40" class="animate-spin text-mari-primary"></svg>
            <p class="mt-4 text-base font-semibold text-mari-text">Reviewing your PDF…</p>
            <p class="mt-1 max-w-sm text-sm text-mari-text-secondary">
              Extracting text and drafting flashcards from {{ processingFile() }}
            </p>
          </div>
        }

        @case ('review') {
          @if (review(); as data) {
            <div class="border-b border-mari-border bg-mari-bg-secondary/50 px-5 py-4 sm:px-6">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mari-primary">
                    <svg lucideFileText [size]="14"></svg>
                    Review generated set
                  </div>
                  <p class="mt-1 truncate text-sm text-mari-text-secondary">
                    {{ data.fileName }} · {{ data.pageCount }} pages · {{ draftCards().length }} cards
                  </p>
                </div>
                <button
                  type="button"
                  (click)="reset()"
                  class="rounded-[10px] p-2 text-mari-text-tertiary hover:bg-mari-bg hover:text-mari-text"
                  aria-label="Cancel"
                >
                  <svg lucideX [size]="18"></svg>
                </button>
              </div>
            </div>

            <div class="space-y-5 p-5 sm:p-6">
              <div>
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                  Study set name
                </label>
                <input
                  type="text"
                  [(ngModel)]="deckTitle"
                  class="mari-input"
                  placeholder="Name your study set"
                />
              </div>

              <div class="rounded-[14px] border border-mari-border bg-mari-bg-secondary/50 p-4">
                <div class="text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                  Document preview
                </div>
                <p class="mt-2 text-sm leading-relaxed text-mari-text-secondary">{{ data.excerpt }}</p>
              </div>

              <div>
                <div class="mb-3 flex items-center justify-between gap-3">
                  <h3 class="text-sm font-bold text-mari-text">
                    Generated flashcards ({{ draftCards().length }})
                  </h3>
                  <span class="text-xs text-mari-text-tertiary">Remove any you don't need</span>
                </div>

                <div class="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  @for (card of draftCards(); track card.id) {
                    <div class="rounded-[14px] border border-mari-border bg-mari-bg p-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <div class="text-xs font-semibold uppercase tracking-wide text-mari-primary">
                            Question
                          </div>
                          <p class="mt-1 text-sm font-semibold text-mari-text">{{ card.question }}</p>
                          <div class="mt-3 text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">
                            Answer
                          </div>
                          <p class="mt-1 text-sm text-mari-text-secondary">{{ card.answer }}</p>
                        </div>
                        <button
                          type="button"
                          (click)="removeCard(card.id)"
                          class="shrink-0 rounded-[8px] p-2 text-mari-text-tertiary hover:bg-accent-coral-bg hover:text-accent-coral-text"
                          aria-label="Remove card"
                        >
                          <svg lucideTrash2 [size]="16"></svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="flex flex-col gap-3 border-t border-mari-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm text-mari-text-secondary">
                  Ready to study? This set will be saved to your library.
                </p>
                <div class="flex gap-2">
                  <button type="button" (click)="reset()" class="mari-btn-secondary">Cancel</button>
                  <button
                    type="button"
                    (click)="createDeck()"
                    [disabled]="!deckTitle.trim() || !draftCards().length"
                    class="mari-btn-primary"
                  >
                    <svg lucideCheck [size]="16"></svg>
                    Create study set
                  </button>
                </div>
              </div>
            </div>
          }
        }

        @case ('error') {
          <div class="p-5 sm:p-6">
            <div class="rounded-[14px] border border-accent-coral/30 bg-accent-coral-bg px-4 py-3 text-sm text-accent-coral-text">
              {{ errorMessage() }}
            </div>
            <button type="button" (click)="reset()" class="mari-btn-primary mt-4">
              Try another PDF
            </button>
          </div>
        }
      }
    </section>
  `,
})
export class PdfDeckUploaderComponent {
  readonly created = output<string>();

  private readonly pdfService = inject(PdfFlashcardService);
  private readonly store = inject(MariStoreService);
  private readonly router = inject(Router);

  protected readonly step = signal<UploaderStep>('idle');
  protected readonly dragging = signal(false);
  protected readonly processingFile = signal('');
  protected readonly review = signal<PdfReviewResult | null>(null);
  protected readonly draftCards = signal<Flashcard[]>([]);
  protected readonly errorMessage = signal('');
  protected deckTitle = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files.item(0);
    if (file) void this.processFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (file) void this.processFile(file);
    input.value = '';
  }

  removeCard(cardId: string): void {
    this.draftCards.update((cards) => cards.filter((card) => card.id !== cardId));
  }

  createDeck(): void {
    const title = this.deckTitle.trim();
    const cards = this.draftCards();
    const sourceFile = this.review()?.fileName;
    if (!title || !cards.length) return;

    const deck = this.store.addStudyDeck({ title, cards, sourceFile });
    this.created.emit(deck.id);
    void this.router.navigate(['/study-sets', deck.id]);
    this.reset();
  }

  reset(): void {
    this.step.set('idle');
    this.review.set(null);
    this.draftCards.set([]);
    this.deckTitle = '';
    this.errorMessage.set('');
    this.processingFile.set('');
  }

  private async processFile(file: File): Promise<void> {
    if (file.size > 15 * 1024 * 1024) {
      this.errorMessage.set('PDF must be 15 MB or smaller.');
      this.step.set('error');
      return;
    }

    this.processingFile.set(file.name);
    this.step.set('processing');

    try {
      const result = await this.pdfService.reviewPdf(file);
      this.review.set(result);
      this.draftCards.set(result.cards.map((card) => ({ ...card })));
      this.deckTitle = result.title;
      this.step.set('review');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Failed to process PDF.');
      this.step.set('error');
    }
  }
}
