import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LucideArrowLeft, LucideFileText, LucideTrash2 } from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { FlashcardComponent } from '../../shared/flashcard/flashcard.component';

@Component({
  selector: 'app-study-session-page',
  imports: [RouterLink, FlashcardComponent, LucideArrowLeft, LucideFileText, LucideTrash2, DecimalPipe],
  template: `
    <div class="mari-page mx-auto max-w-2xl">
      <a
        routerLink="/study-sets"
        class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-mari-text-secondary hover:text-mari-primary"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        All study sets
      </a>

      @if (deck(); as d) {
        <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">{{ d.title }}</h1>
            @if (d.sourceFile) {
              <div class="mt-1 flex items-center gap-1.5 text-sm text-mari-text-tertiary">
                <svg lucideFileText [size]="14"></svg>
                Generated from {{ d.sourceFile }}
              </div>
            }
            <p class="mt-1 text-sm text-mari-text-secondary">
              Session in progress · flip and rate each card
            </p>
          </div>

          @if (confirmDelete()) {
            <div class="flex items-center gap-2 rounded-[12px] border border-mari-border bg-mari-bg px-3 py-2 shadow-sm">
              <span class="text-sm text-mari-text-secondary">Delete this set?</span>
              <button
                type="button"
                (click)="deleteDeck(d.id)"
                class="rounded-[8px] bg-accent-coral px-3 py-1.5 text-xs font-semibold text-white"
              >
                Delete
              </button>
              <button
                type="button"
                (click)="confirmDelete.set(false)"
                class="rounded-[8px] px-3 py-1.5 text-xs font-semibold text-mari-text-secondary hover:bg-mari-bg-secondary"
              >
                Cancel
              </button>
            </div>
          } @else {
            <button
              type="button"
              (click)="confirmDelete.set(true)"
              class="inline-flex items-center gap-1.5 rounded-[12px] border border-mari-border px-3 py-2 text-sm font-medium text-mari-text-secondary transition-colors hover:border-accent-coral/40 hover:bg-accent-coral-bg hover:text-accent-coral-text"
            >
              <svg lucideTrash2 [size]="16"></svg>
              Delete set
            </button>
          }
        </div>

        <div class="mari-surface-elevated p-6 lg:p-8">
          <app-flashcard [deck]="d" [deckId]="d.id" />
        </div>

        <div class="mt-5 grid grid-cols-3 gap-3">
          <div class="mari-stat py-4 text-center">
            <div class="mari-stat-label">Learned</div>
            <div class="text-2xl font-bold text-accent-teal">{{ d.learned }}</div>
          </div>
          <div class="mari-stat py-4 text-center">
            <div class="mari-stat-label">Remaining</div>
            <div class="text-2xl font-bold text-mari-primary">{{ d.cards.length - d.learned }}</div>
          </div>
          <div class="mari-stat py-4 text-center">
            <div class="mari-stat-label">Progress</div>
            <div class="text-2xl font-bold">{{ progress(d) | number: '1.0-0' }}%</div>
          </div>
        </div>
      } @else {
        <div class="mari-surface py-16 text-center">
          <p class="text-mari-text-secondary">Study set not found.</p>
          <a routerLink="/study-sets" class="mari-link-action mt-2 inline-block">Back to study sets</a>
        </div>
      }
    </div>
  `,
})
export class StudySessionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(MariStoreService);
  protected readonly confirmDelete = signal(false);

  private readonly deckIdParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('deckId') ?? '')),
    { initialValue: '' },
  );

  protected readonly deck = computed(() => this.store.getDeck(this.deckIdParam()));

  constructor() {
    effect(() => {
      this.deckIdParam();
      this.confirmDelete.set(false);
    });
  }

  progress(d: { learned: number; cards: unknown[] }): number {
    return d.cards.length ? (d.learned / d.cards.length) * 100 : 0;
  }

  deleteDeck(deckId: string): void {
    this.store.deleteStudyDeck(deckId);
    void this.router.navigate(['/study-sets']);
  }
}
