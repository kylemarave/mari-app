import { Component, computed, input } from '@angular/core';
import {
  LucideBookOpen,
  LucideCalculator,
  LucideCoffee,
  LucideDna,
  LucideFlame,
  LucideFlaskConical,
  LucideGift,
  LucideLayers,
  LucideMonitor,
  LucidePenLine,
  LucideRocket,
  LucideScrollText,
  LucideShield,
  LucideSmartphone,
  LucideSparkles,
  LucideTarget,
  LucideTimer,
  LucideZap,
} from '@lucide/angular';

export type MariBadgeIcon =
  | 'calculator'
  | 'flask'
  | 'monitor'
  | 'pen'
  | 'dna'
  | 'coffee'
  | 'book'
  | 'target'
  | 'gift'
  | 'zap'
  | 'shield'
  | 'layers'
  | 'smartphone'
  | 'rocket'
  | 'scroll'
  | 'sparkles'
  | 'timer'
  | 'flame';

export type MariBadgeVariant =
  | 'primary'
  | 'teal'
  | 'coral'
  | 'amber'
  | 'blue'
  | 'sage'
  | 'neutral';

@Component({
  selector: 'app-mari-icon-badge',
  host: {
    class: 'inline-flex shrink-0',
  },
  imports: [
    LucideCalculator,
    LucideFlaskConical,
    LucideMonitor,
    LucidePenLine,
    LucideDna,
    LucideCoffee,
    LucideBookOpen,
    LucideTarget,
    LucideGift,
    LucideZap,
    LucideShield,
    LucideLayers,
    LucideSmartphone,
    LucideRocket,
    LucideScrollText,
    LucideSparkles,
    LucideTimer,
    LucideFlame,
  ],
  template: `
    <span
      class="mari-icon-badge"
      [class]="sizeClass() + ' ' + variantClass()"
      aria-hidden="true"
    >
      @switch (icon()) {
        @case ('calculator') {
          <svg lucideCalculator [size]="iconSize()"></svg>
        }
        @case ('flask') {
          <svg lucideFlaskConical [size]="iconSize()"></svg>
        }
        @case ('monitor') {
          <svg lucideMonitor [size]="iconSize()"></svg>
        }
        @case ('pen') {
          <svg lucidePenLine [size]="iconSize()"></svg>
        }
        @case ('dna') {
          <svg lucideDna [size]="iconSize()"></svg>
        }
        @case ('coffee') {
          <svg lucideCoffee [size]="iconSize()"></svg>
        }
        @case ('book') {
          <svg lucideBookOpen [size]="iconSize()"></svg>
        }
        @case ('target') {
          <svg lucideTarget [size]="iconSize()"></svg>
        }
        @case ('gift') {
          <svg lucideGift [size]="iconSize()"></svg>
        }
        @case ('zap') {
          <svg lucideZap [size]="iconSize()"></svg>
        }
        @case ('shield') {
          <svg lucideShield [size]="iconSize()"></svg>
        }
        @case ('layers') {
          <svg lucideLayers [size]="iconSize()"></svg>
        }
        @case ('smartphone') {
          <svg lucideSmartphone [size]="iconSize()"></svg>
        }
        @case ('rocket') {
          <svg lucideRocket [size]="iconSize()"></svg>
        }
        @case ('scroll') {
          <svg lucideScrollText [size]="iconSize()"></svg>
        }
        @case ('sparkles') {
          <svg lucideSparkles [size]="iconSize()"></svg>
        }
        @case ('timer') {
          <svg lucideTimer [size]="iconSize()"></svg>
        }
        @case ('flame') {
          <svg lucideFlame [size]="iconSize()"></svg>
        }
      }
    </span>
  `,
})
export class MariIconBadgeComponent {
  readonly icon = input.required<MariBadgeIcon>();
  readonly variant = input<MariBadgeVariant>('primary');
  readonly size = input<'xs' | 'sm' | 'md'>('sm');

  protected readonly iconSize = computed(() => {
    const sizes = { xs: 13, sm: 15, md: 18 } as const;
    return sizes[this.size()];
  });

  protected readonly sizeClass = computed(() => `mari-icon-badge-${this.size()}`);

  protected readonly variantClass = computed(() => {
    const map: Record<MariBadgeVariant, string> = {
      primary: 'mari-icon-badge-primary',
      teal: 'mari-icon-badge-teal',
      coral: 'mari-icon-badge-coral',
      amber: 'mari-icon-badge-amber',
      blue: 'mari-icon-badge-blue',
      sage: 'mari-icon-badge-sage',
      neutral: 'mari-icon-badge-neutral',
    };
    return map[this.variant()];
  });
}
