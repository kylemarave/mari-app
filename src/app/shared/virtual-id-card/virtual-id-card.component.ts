import { Component, input } from '@angular/core';
import { StudentProfile } from '../../core/models/mari.models';

@Component({
  selector: 'app-virtual-id-card',
  template: `
    @if (variant() === 'widget') {
      <div class="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-accent-blue-bg/80 via-white to-mari-primary-light/50 p-5 ring-1 ring-mari-border/60">
        <div class="absolute -right-6 -top-6 size-24 rounded-full bg-mari-primary/10"></div>
        <div class="relative flex items-start gap-4">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue-text to-mari-primary-dark text-base font-bold text-white shadow-md"
          >
            {{ profile().initials }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-lg font-bold text-mari-text">{{ profile().name }}</div>
            <div class="text-sm text-mari-text-secondary">
              {{ profile().university }} · {{ profile().program }}
            </div>
            <div class="mt-2 inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-mari-primary-dark ring-1 ring-mari-primary-muted/30">
              Virtual ID · Active
            </div>
          </div>
        </div>
        <div
          class="relative mt-4 flex h-10 items-center justify-center rounded-[12px] border-2 border-dashed border-mari-primary-muted/50 bg-white/60 text-xs font-medium text-mari-text-tertiary transition-colors hover:border-mari-primary hover:text-mari-primary"
        >
          + Upload logo or choose preset
        </div>
      </div>
    } @else if (variant() === 'mobile-header') {
      <div
        class="flex items-center gap-3 rounded-[16px] border border-mari-border/80 bg-mari-bg p-4 shadow-sm"
      >
        <div
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue-bg to-mari-primary-light text-sm font-bold text-accent-blue-text"
        >
          {{ profile().initials }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-mari-text">{{ profile().name }}</div>
          <div class="text-xs text-mari-text-tertiary">
            {{ profile().university }} · {{ profile().program }}
          </div>
        </div>
        <div class="rounded-[10px] border border-mari-border bg-mari-bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-mari-text-tertiary">
          Logo
        </div>
      </div>
    } @else {
      <div class="rounded-[12px] border border-mari-border bg-mari-bg p-4 text-center">
        <div
          class="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-accent-blue-bg text-sm font-medium text-accent-blue-text"
        >
          {{ profile().initials }}
        </div>
        <div class="text-sm font-medium text-mari-text">{{ profile().shortName }}</div>
        <div class="text-xs text-mari-text-tertiary">{{ profile().program }}</div>
      </div>
    }
  `,
})
export class VirtualIdCardComponent {
  readonly profile = input.required<StudentProfile>();
  readonly variant = input<'widget' | 'mobile-header' | 'sidebar'>('widget');
}
