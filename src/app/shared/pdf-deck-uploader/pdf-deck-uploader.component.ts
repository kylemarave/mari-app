import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideCheck,
  LucideChevronDown,
  LucideLoaderCircle,
  LucideSparkles,
  LucideUpload,
  LucideX,
} from '@lucide/angular';
import { AiFlashcardDraft, Flashcard, FlashcardType } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { PdfFlashcardService, PdfReviewResult } from '../../core/services/pdf-flashcard.service';

type UploaderStep = 'idle' | 'processing' | 'review' | 'error';

@Component({
  selector: 'app-pdf-deck-uploader',
  imports: [
    FormsModule,
    LucideUpload,
    LucideLoaderCircle,
    LucideSparkles,
    LucideCheck,
    LucideX,
    LucideChevronDown,
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
                  Upload lecture notes or a textbook chapter — Mari AI will build a Gizmo-style reviewer
                  and flashcards for you.
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
            <p class="mt-4 text-base font-semibold text-mari-text">Mari AI is building your reviewer…</p>
            <p class="mt-1 max-w-sm text-sm text-mari-text-secondary">
              Analyzing {{ processingFile() }} with Gemini
            </p>
          </div>
        }

        @case ('review') {
          @if (review(); as data) {
            <div class="border-b border-mari-border bg-mari-bg-secondary/50 px-5 py-4 sm:px-6">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mari-primary">
                    <svg lucideSparkles [size]="14"></svg>
                    AI study reviewer
                  </div>
                  <p class="mt-1 truncate text-sm text-mari-text-secondary">
                    {{ data.fileName }} · {{ data.pageCount }} pages · {{ draftCards().length }} flashcards
                    @if (data.source === 'gemini') {
                      <span class="mari-chip ml-1 bg-mari-primary-light text-mari-primary-dark">Gemini</span>
                    }
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
                <input type="text" [(ngModel)]="deckTitle" class="mari-input" placeholder="Name your study set" />
              </div>

              <div class="rounded-[14px] border border-mari-border bg-mari-bg-secondary/50 p-4">
                <div class="text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">Overview</div>
                <p class="mt-2 text-sm leading-relaxed text-mari-text-secondary">{{ data.overview }}</p>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-bold text-mari-text">Sections & flashcards</h3>
                  <span class="text-xs text-mari-text-tertiary">Expand to review before saving</span>
                </div>

                @for (section of data.sections; track section.heading) {
                  <div class="overflow-hidden rounded-[14px] border border-mari-border bg-mari-bg">
                    <button
                      type="button"
                      class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-mari-bg-secondary/50"
                      (click)="toggleSection(section.heading)"
                    >
                      <span class="font-semibold text-mari-text">{{ section.heading }}</span>
                      <svg
                        lucideChevronDown
                        [size]="18"
                        class="shrink-0 text-mari-text-tertiary transition-transform"
                        [class.rotate-180]="isSectionExpanded(section.heading)"
                      ></svg>
                    </button>

                    @if (isSectionExpanded(section.heading)) {
                      <div class="space-y-4 border-t border-mari-border px-4 py-4">
                        <p class="text-sm leading-relaxed text-mari-text-secondary">{{ section.summary }}</p>
                        @if (section.keyPoints.length) {
                          <ul class="list-inside list-disc space-y-1 text-sm text-mari-text-secondary">
                            @for (point of section.keyPoints; track point) {
                              <li>{{ point }}</li>
                            }
                          </ul>
                        }

                        <div class="space-y-2">
                          @for (card of sectionCards(section); track card.question) {
                            <div class="rounded-[12px] border border-mari-border bg-mari-bg-secondary/40 p-3">
                              <div class="mb-2 flex items-center justify-between gap-2">
                                <span class="mari-chip bg-mari-primary-light text-mari-primary-dark">
                                  {{ cardTypeLabel(card.type) }}
                                </span>
                                @if (!hasDraftCard(card.question)) {
                                  <span class="text-[10px] font-medium text-mari-text-tertiary">Removed from set</span>
                                }
                              </div>
                              <p class="text-sm font-semibold text-mari-text">{{ card.question }}</p>
                              <p class="mt-1 text-sm text-mari-text-secondary">{{ card.answer }}</p>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="flex flex-col gap-3 border-t border-mari-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm text-mari-text-secondary">
                  {{ draftCards().length }} cards will be saved to your library.
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
            <div
              class="rounded-[14px] border border-accent-coral/30 bg-accent-coral-bg px-4 py-3 text-sm text-accent-coral-text"
            >
              {{ errorMessage() }}
            </div>
            <button type="button" (click)="reset()" class="mari-btn-primary mt-4">Try another PDF</button>
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
  protected readonly expandedSections = signal<Record<string, boolean>>({});
  protected deckTitle = '';

  protected readonly draftQuestionSet = computed(
    () => new Set(this.draftCards().map((c) => c.question.toLowerCase().trim())),
  );

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

  toggleSection(heading: string): void {
    this.expandedSections.update((state) => ({
      ...state,
      [heading]: !state[heading],
    }));
  }

  isSectionExpanded(heading: string): boolean {
    return this.expandedSections()[heading] ?? true;
  }

  sectionCards(section: PdfReviewResult['sections'][number]): AiFlashcardDraft[] {
    return section.cards ?? [];
  }

  hasDraftCard(question: string): boolean {
    return this.draftQuestionSet().has(question.toLowerCase().trim());
  }

  cardTypeLabel(type: FlashcardType): string {
    const labels: Record<FlashcardType, string> = {
      definition: 'Definition',
      concept: 'Concept',
      process: 'Process',
      fact: 'Fact',
    };
    return labels[type] ?? type;
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
    this.expandedSections.set({});
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
      const expanded: Record<string, boolean> = {};
      for (const section of result.sections) {
        expanded[section.heading] = true;
      }
      this.expandedSections.set(expanded);
      this.step.set('review');
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Failed to process PDF.');
      this.step.set('error');
    }
  }
}
