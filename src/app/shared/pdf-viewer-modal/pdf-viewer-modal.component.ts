import { Component, input, output } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-pdf-viewer-modal',
  imports: [LucideX],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-mari-text/50 p-4 backdrop-blur-sm"
        (click)="close()"
      >
        <div
          class="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[20px] border border-mari-border bg-mari-bg shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between gap-3 border-b border-mari-border px-5 py-4">
            <div class="min-w-0">
              <h2 class="truncate text-base font-bold text-mari-text">{{ title() }}</h2>
              <p class="text-xs text-mari-text-tertiary">{{ imageMode() ? 'Image preview' : 'PDF preview' }}</p>
            </div>
            <button
              type="button"
              (click)="close()"
              class="shrink-0 rounded-[10px] p-2 text-mari-text-secondary hover:bg-mari-bg-secondary hover:text-mari-text"
              aria-label="Close preview"
            >
              <svg lucideX [size]="20"></svg>
            </button>
          </div>

          <div class="min-h-0 flex-1 bg-mari-bg-secondary">
            @if (url()) {
              @if (imageMode()) {
                <div class="flex h-[75dvh] items-center justify-center p-4">
                  <img [src]="url()" [alt]="title()" class="max-h-full max-w-full rounded-lg object-contain shadow-md" />
                </div>
              } @else {
                <iframe [src]="url()" [title]="title()" class="h-[75dvh] w-full border-0"></iframe>
              }
            } @else {
              <div class="flex h-[75dvh] items-center justify-center px-6 text-center text-sm text-mari-text-secondary">
                Preview unavailable for this file.
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class PdfViewerModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly url = input<SafeResourceUrl | string | null>(null);
  readonly imageMode = input(false);

  readonly closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
