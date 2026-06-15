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
        class="relative min-h-[200px] cursor-pointer overflow-hidden rounded-[20px] border border-mari-primary-muted/60 bg-gradient-to-br from-mari-primary-light via-white to-mari-primary-light/40 p-6 text-center shadow-md transition-all duration-300 hover:shadow-lg"
        [class]="compact() ? 'min-h-[160px] p-4' : 'p-6'"
        (click)="flip()"
        (keydown.enter)="flip()"
        (keydown.space)="flip(); $event.preventDefault()"
        tabindex="0"
        role="button"
      >
        <div class="absolute -right-8 -top-8 size-32 rounded-full bg-mari-primary/5"></div>
        @if (!flipped()) {
          <p class="relative font-bold text-mari-primary-dark" [class]="compact() ? 'text-base' : 'text-xl'">
            {{ currentCard().question }}
          </p>
          <p class="relative mt-2 text-xs text-mari-text-tertiary">Tap to reveal answer</p>
        } @else {
          <p class="relative text-base leading-relaxed text-mari-text">{{ currentCard().answer }}</p>
        }

        <button
          type="button"
          (click)="flip(); $event.stopPropagation()"
          class="relative mt-5 inline-flex items-center gap-2 rounded-[12px] bg-mari-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-mari-primary-dark hover:shadow-md"
        >
          <svg lucideRotateCw [size]="16"></svg>
          {{ flipped() ? 'Show question' : 'Flip card' }}
        </button>
      </div>

      @if (showFeedback()) {
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            (click)="markLearned()"
            class="flex items-center justify-center gap-2 rounded-[14px] border border-accent-teal/30 bg-accent-teal-bg py-2.5 text-sm font-semibold text-accent-teal-text transition-all hover:shadow-md active:scale-[0.98]"
          >
            <svg lucideThumbsUp [size]="18"></svg>
            Learned
          </button>
          <button
            type="button"
            (click)="markReview()"
            class="flex items-center justify-center gap-2 rounded-[14px] border border-accent-coral/30 bg-accent-coral-bg py-2.5 text-sm font-semibold text-accent-coral-text transition-all hover:shadow-md active:scale-[0.98]"
          >
            <svg lucideThumbsDown [size]="18"></svg>
            Review
          </button>
        </div>
      }

      <div class="mt-4 flex items-center gap-3">
        <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-mari-border">
          <div
            class="h-full rounded-full bg-gradient-to-r from-mari-primary to-accent-teal transition-all duration-500"
            [style.width.%]="progress()"
          ></div>
        </div>
        <span class="shrink-0 text-xs font-bold text-mari-text-secondary">
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
