import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-mari-logo',
  host: {
    class: 'block shrink-0',
    '[class]': 'hostClass()',
    '[class.mari-logo-animated]': 'animated()',
  },
  template: `
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" class="block size-full">
      <!-- soft inner highlight -->
      <ellipse cx="18" cy="14" rx="14" ry="10" fill="white" fill-opacity="0.12" />

      <!-- open-book pages behind the M -->
      <path
        d="M24 38.5C18.5 36.5 13 37.5 10 39V16.5C13 14.5 18.5 13.5 24 15.5C29.5 13.5 35 14.5 38 16.5V39C35 37.5 29.5 36.5 24 38.5Z"
        fill="white"
        fill-opacity="0.14"
      />
      <path
        d="M24 15.5V38.5"
        stroke="white"
        stroke-opacity="0.22"
        stroke-width="1.2"
        stroke-linecap="round"
      />

      <!-- stylized M -->
      <path
        class="mari-logo-mark"
        d="M12.5 34.5V13.5C12.5 12.4 13.4 11.5 14.5 11.5H17.8L24 24.2L30.2 11.5H33.5C34.6 11.5 35.5 12.4 35.5 13.5V34.5"
        stroke="white"
        stroke-width="4.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- sparkle -->
      <path
        class="mari-logo-sparkle"
        d="M38.2 10.2L38.7 11.5L40 12L38.7 12.5L38.2 13.8L37.7 12.5L36.4 12L37.7 11.5L38.2 10.2Z"
        fill="white"
        fill-opacity="0.95"
      />

      <!-- progress dot -->
      <circle class="mari-logo-dot" cx="11.5" cy="36.5" r="2.2" fill="#5eead4" />
    </svg>
  `,
})
export class MariLogoComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly animated = input(false);

  protected readonly hostClass = computed(
    () => `mari-logo mari-logo-${this.size()}`,
  );
}
