import { Component, computed, inject, input, signal } from '@angular/core';
import { LucideRotateCw, LucideThumbsDown, LucideThumbsUp } from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { StudyDeck } from '../../core/models/mari.models';

@Component({
  selector: 'app-flashcard',
  imports: [LucideRotateCw, LucideThumbsUp, LucideThumbsDown],
  template: `
    <div>
      <div
        class="relative cursor-pointer overflow-hidden rounded-[10px] border border-mari-primary-muted/60 bg-gradient-to-br from-mari-primary-light via-mari-bg to-mari-primary-light/40 text-center shadow-sm transition-all duration-300 hover:shadow-md"
        [class]="compact() ? 'min-h-[96px] p-2.5' : 'min-h-[180px] p-5'"
        (click)="flip()"
        (keydown.enter)="flip()"
        (keydown.space)="flip(); $event.preventDefault()"
        tabindex="0"
        role="button"
      >
        @if (!compact()) {
          <div class="absolute -right-8 -top-8 size-32 rounded-full bg-mari-primary/5"></div>
        }
        @if (!flipped()) {
          <p class="relative font-bold text-mari-primary-dark" [class]="compact() ? 'text-xs leading-snug' : 'text-lg'">
            {{ currentCard().question }}
          </p>
          @if (!compact()) {
            <p class="relative mt-2 text-xs text-mari-text-tertiary">Tap to reveal answer</p>
          }
        } @else {
          <p class="relative text-xs leading-relaxed text-mari-text" [class]="compact() ? 'text-[11px]' : 'text-sm'">
            {{ currentCard().answer }}
          </p>
        }

        <button
          type="button"
          (click)="flip(); $event.stopPropagation()"
          class="relative inline-flex items-center gap-1 rounded-[8px] bg-mari-primary text-white shadow-sm transition-all hover:bg-mari-primary-dark"
          [class]="compact() ? 'mt-2 px-2.5 py-1 text-[10px] font-semibold' : 'mt-4 px-4 py-1.5 text-xs font-semibold'"
        >
          <svg lucideRotateCw [size]="compact() ? 12 : 16"></svg>
          {{ flipped() ? 'Question' : 'Flip' }}
        </button>
      </div>

      @if (showFeedback()) {
        <div class="grid grid-cols-2 gap-1.5" [class]="compact() ? 'mt-2' : 'mt-3'">
          <button
            type="button"
            (click)="markLearned()"
            class="flex items-center justify-center gap-1 rounded-[8px] border border-accent-teal/30 bg-accent-teal-bg font-semibold text-accent-teal-text transition-all hover:shadow-sm active:scale-[0.98]"
            [class]="compact() ? 'py-1.5 text-[10px]' : 'py-2.5 text-sm'"
          >
            <svg lucideThumbsUp [size]="compact() ? 12 : 18"></svg>
            Learned
          </button>
          <button
            type="button"
            (click)="markReview()"
            class="flex items-center justify-center gap-1 rounded-[8px] border border-accent-coral/30 bg-accent-coral-bg font-semibold text-accent-coral-text transition-all hover:shadow-sm active:scale-[0.98]"
            [class]="compact() ? 'py-1.5 text-[10px]' : 'py-2.5 text-sm'"
          >
            <svg lucideThumbsDown [size]="compact() ? 12 : 18"></svg>
            Review
          </button>
        </div>
      }

      <div class="flex items-center gap-2" [class]="compact() ? 'mt-2' : 'mt-4'">
        <div class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-mari-border">
          <div
            class="h-full rounded-full bg-gradient-to-r from-mari-primary to-accent-teal transition-all duration-500"
            [style.width.%]="progress()"
          ></div>
        </div>
        <span class="shrink-0 text-[10px] font-bold text-mari-text-secondary">
          {{ currentIndex() + 1 }}/{{ deck().cards.length }}
        </span>
      </div>
    </div>
  `,
})
export class FlashcardComponent {
  readonly deck = input.required<StudyDeck>();
  readonly deckId = input<string>();
  readonly compact = input(false);
  readonly showFeedback = input(true);

  private readonly store = inject(MariStoreService);

  protected readonly flipped = signal(false);
  protected readonly currentIndex = signal(0);

  protected readonly currentCard = computed(
    () => this.deck().cards[this.currentIndex()] ?? this.deck().cards[0],
  );

  protected readonly progress = computed(() => {
    const total = this.deck().cards.length;
    return total ? ((this.currentIndex() + 1) / total) * 100 : 0;
  });

  flip(): void {
    this.flipped.update((v) => !v);
  }

  markLearned(): void {
    this.store.recordCardLearned(this.deckId() ?? this.deck().id);
    this.nextCard();
  }

  markReview(): void {
    this.nextCard();
  }

  private nextCard(): void {
    this.flipped.set(false);
    const next = (this.currentIndex() + 1) % this.deck().cards.length;
    this.currentIndex.set(next);
  }
}
