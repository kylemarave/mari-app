import { Component, inject, input } from '@angular/core';
import { StudentProfile } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';

const LOGO_PRESETS = ['🎓', '📚', '✨', '🌸', '🔬', '📝'];

@Component({
  selector: 'app-virtual-id-card',
  template: `
    @if (variant() === 'widget') {
      <div class="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-accent-blue-bg/80 via-white to-mari-primary-light/50 p-5 ring-1 ring-mari-border/60">
        <div class="absolute -right-6 -top-6 size-24 rounded-full bg-mari-primary/10"></div>
        <div class="relative flex items-start gap-4">
          @if (profile().logoUrl) {
            <img
              [src]="profile().logoUrl"
              alt="Profile logo"
              class="size-12 shrink-0 rounded-2xl object-cover shadow-md ring-2 ring-white"
            />
          } @else {
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue-text to-mari-primary-dark text-base font-bold text-white shadow-md"
            >
              {{ profile().initials }}
            </div>
          }
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

        <label
          class="relative mt-4 flex h-10 cursor-pointer items-center justify-center rounded-[12px] border-2 border-dashed border-mari-primary-muted/50 bg-white/60 text-xs font-medium text-mari-text-tertiary transition-colors hover:border-mari-primary hover:text-mari-primary"
        >
          + Upload logo or choose preset
          <input type="file" accept="image/*" class="sr-only" (change)="onLogoUpload($event)" />
        </label>

        <div class="mt-2 flex flex-wrap justify-center gap-1.5">
          @for (preset of logoPresets; track preset) {
            <button
              type="button"
              (click)="setPresetLogo(preset)"
              class="flex size-8 items-center justify-center rounded-lg border border-mari-border bg-white text-base transition-colors hover:border-mari-primary hover:bg-mari-primary-light"
            >
              {{ preset }}
            </button>
          }
        </div>
      </div>
    } @else if (variant() === 'mobile-header') {
      <div
        class="flex items-center gap-3 rounded-[16px] border border-mari-border/80 bg-mari-bg p-4 shadow-sm"
      >
        @if (profile().logoUrl) {
          <img [src]="profile().logoUrl" alt="Logo" class="size-11 shrink-0 rounded-xl object-cover" />
        } @else {
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue-bg to-mari-primary-light text-sm font-bold text-accent-blue-text"
          >
            {{ profile().initials }}
          </div>
        }
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-mari-text">{{ profile().name }}</div>
          <div class="text-xs text-mari-text-tertiary">
            {{ profile().university }} · {{ profile().program }}
          </div>
        </div>
        <label class="cursor-pointer rounded-[10px] border border-mari-border bg-mari-bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-mari-text-tertiary hover:border-mari-primary hover:text-mari-primary">
          Logo
          <input type="file" accept="image/*" class="sr-only" (change)="onLogoUpload($event)" />
        </label>
      </div>
    } @else {
      <div class="rounded-[12px] border border-mari-border bg-mari-bg p-4 text-center">
        @if (profile().logoUrl) {
          <img [src]="profile().logoUrl" alt="Logo" class="mx-auto mb-2 size-12 rounded-full object-cover" />
        } @else {
          <div
            class="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-accent-blue-bg text-sm font-medium text-accent-blue-text"
          >
            {{ profile().initials }}
          </div>
        }
        <div class="text-sm font-medium text-mari-text">{{ profile().shortName }}</div>
        <div class="text-xs text-mari-text-tertiary">{{ profile().program }}</div>
      </div>
    }
  `,
})
export class VirtualIdCardComponent {
  readonly profile = input.required<StudentProfile>();
  readonly variant = input<'widget' | 'mobile-header' | 'sidebar'>('widget');

  private readonly store = inject(MariStoreService);
  protected readonly logoPresets = LOGO_PRESETS;

  onLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 512 * 1024) {
      alert('Logo must be under 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.store.updateStudent({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  setPresetLogo(preset: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#eeedfe';
    ctx.fillRect(0, 0, 96, 96);
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(preset, 48, 52);
    this.store.updateStudent({ logoUrl: canvas.toDataURL('image/png') });
  }
}
