import { Component, input } from '@angular/core';
import { LucideExternalLink, LucideLink2 } from '@lucide/angular';
import { BookmarkLink } from '../../core/models/mari.models';

@Component({
  selector: 'app-bookmark-panel',
  imports: [LucideExternalLink, LucideLink2],
  template: `
    <div [class]="grid() ? 'grid grid-cols-1 gap-2 sm:grid-cols-2' : 'flex flex-col gap-2'">
      @for (link of bookmarks(); track link.id) {
        <div
          class="group flex items-center gap-3 rounded-[14px] border border-mari-border/80 bg-mari-bg px-3 py-3 shadow-sm transition-all hover:border-mari-primary-muted hover:shadow-md"
        >
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-mari-primary-light to-accent-blue-bg text-[10px] font-bold text-mari-primary-dark"
          >
            {{ link.favicon }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold text-mari-text group-hover:text-mari-primary-dark">
              {{ link.title }}
            </div>
            <div class="truncate text-xs text-mari-text-tertiary">{{ link.url }}</div>
          </div>
          <span class="mari-chip hidden shrink-0 bg-mari-bg-secondary text-mari-text-secondary sm:inline">
            {{ link.category }}
          </span>
          <a
            [href]="formatUrl(link.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-mari-text-tertiary transition-colors hover:bg-mari-primary-light hover:text-mari-primary"
            [attr.aria-label]="'Open ' + link.title"
          >
            <svg lucideExternalLink [size]="16"></svg>
          </a>
        </div>
      } @empty {
        <div class="col-span-full flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-mari-border py-8 text-center">
          <svg lucideLink2 [size]="24" class="text-mari-text-tertiary"></svg>
          <p class="text-sm text-mari-text-tertiary">No bookmarks saved yet</p>
        </div>
      }
    </div>
  `,
})
export class BookmarkPanelComponent {
  readonly bookmarks = input.required<BookmarkLink[]>();
  readonly grid = input(false);

  formatUrl(url: string): string {
    return url.startsWith('http') ? url : `https://${url}`;
  }
}
