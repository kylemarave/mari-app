import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideBrain, LucideChevronRight, LucideFileText, LucideSparkles, LucideTrash2 } from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { ProfileService } from '../../core/services/profile.service';
import { PdfDeckUploaderComponent } from '../../shared/pdf-deck-uploader/pdf-deck-uploader.component';

@Component({
  selector: 'app-study-sets-page',
  imports: [
    RouterLink,
    LucideChevronRight,
    LucideBrain,
    LucideFileText,
    LucideSparkles,
    LucideTrash2,
    DecimalPipe,
    PdfDeckUploaderComponent,
  ],
  template: `
    <div class="mari-page max-w-4xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Study Sets</h1>
        <p class="mt-1 text-sm text-mari-text-secondary">
          {{ store.studyDecks().length }} decks · spaced repetition flashcards
        </p>
        @if (!profile.isPro() && profile.aiImportsLimit() !== null) {
          <p
            class="mt-3 inline-flex items-center gap-2 rounded-[10px] border border-mari-border bg-mari-bg-secondary/60 px-3 py-2 text-xs text-mari-text-secondary"
          >
            <svg lucideSparkles [size]="14" class="text-mari-primary"></svg>
            AI PDF imports this month: {{ profile.aiImportsUsed() }} / {{ profile.aiImportsLimit() }}
          </p>
        } @else if (profile.isPro()) {
          <p class="mt-3 text-xs text-mari-text-tertiary">Unlimited AI PDF imports on Pro.</p>
        }
      </div>

      <app-pdf-deck-uploader />

      @if (store.studyDecks().length) {
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-sm font-bold uppercase tracking-wide text-mari-text-tertiary">Your library</h2>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          @for (deck of store.studyDecks(); track deck.id) {
            <div
              class="group mari-surface-elevated relative p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div class="absolute right-3 top-3 z-10">
                @if (confirmingDelete() === deck.id) {
                  <div class="flex items-center gap-1 rounded-[10px] border border-mari-border bg-mari-bg p-1 shadow-md">
                    <button
                      type="button"
                      (click)="deleteDeck(deck.id)"
                      class="rounded-[8px] bg-accent-coral px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      (click)="cancelDelete()"
                      class="rounded-[8px] px-2 py-1.5 text-xs font-semibold text-mari-text-secondary hover:bg-mari-bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                } @else {
                  <button
                    type="button"
                    (click)="requestDelete(deck.id, $event)"
                    class="rounded-[10px] p-2 text-mari-text-tertiary opacity-0 transition-all hover:bg-accent-coral-bg hover:text-accent-coral-text group-hover:opacity-100"
                    aria-label="Delete study set"
                  >
                    <svg lucideTrash2 [size]="16"></svg>
                  </button>
                }
              </div>

              <a [routerLink]="['/study-sets', deck.id]" class="block">
                <div class="flex items-start justify-between gap-3 pr-8">
                  <div
                    class="flex size-12 items-center justify-center rounded-[14px] bg-mari-primary-light text-mari-primary-dark"
                  >
                    <svg lucideBrain [size]="24"></svg>
                  </div>
                  <svg
                    lucideChevronRight
                    [size]="20"
                    class="text-mari-text-tertiary group-hover:text-mari-primary"
                  ></svg>
                </div>
                <h2 class="mt-4 text-lg font-bold text-mari-text group-hover:text-mari-primary-dark">
                  {{ deck.title }}
                </h2>
                @if (deck.sourceFile) {
                  <div class="mt-1 flex items-center gap-1.5 text-xs text-mari-text-tertiary">
                    <svg lucideFileText [size]="12"></svg>
                    From {{ deck.sourceFile }}
                  </div>
                }
                <p class="mt-1 text-sm text-mari-text-tertiary">
                  {{ deck.learned }}/{{ deck.cards.length }} cards mastered
                </p>
                <div class="mt-4 h-2 overflow-hidden rounded-full bg-mari-bg-secondary">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-mari-primary to-accent-teal transition-all"
                    [style.width.%]="progress(deck)"
                  ></div>
                </div>
                <div class="mt-2 flex items-center justify-between text-xs font-semibold text-mari-text-secondary">
                  <span>{{ progress(deck) | number: '1.0-0' }}% complete</span>
                  <span class="text-mari-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Start session →
                  </span>
                </div>
              </a>
            </div>
          }
        </div>
      } @else {
        <div class="mari-surface rounded-[16px] border border-dashed border-mari-border px-6 py-10 text-center">
          <p class="text-sm text-mari-text-secondary">
            No study sets yet. Upload a PDF above to create your first deck.
          </p>
        </div>
      }
    </div>
  `,
})
export class StudySetsPage {
  protected readonly store = inject(MariStoreService);
  protected readonly profile = inject(ProfileService);
  protected readonly confirmingDelete = signal<string | null>(null);

  progress(deck: { learned: number; cards: unknown[] }): number {
    return deck.cards.length ? (deck.learned / deck.cards.length) * 100 : 0;
  }

  requestDelete(deckId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmingDelete.set(deckId);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(null);
  }

  deleteDeck(deckId: string): void {
    this.store.deleteStudyDeck(deckId);
    this.confirmingDelete.set(null);
  }
}
