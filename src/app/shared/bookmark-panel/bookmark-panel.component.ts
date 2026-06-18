import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideExternalLink, LucideLink2, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { BookmarkLink } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';
import { bookmarkHref, safeHttpUrl } from '../../core/utils/safe-url';

@Component({
  selector: 'app-bookmark-panel',
  imports: [FormsModule, LucideExternalLink, LucideLink2, LucidePlus, LucideTrash2],
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
            [class.pointer-events-none]="!isSafeUrl(link.url)"
            [class.opacity-40]="!isSafeUrl(link.url)"
            [attr.aria-label]="'Open ' + link.title"
          >
            <svg lucideExternalLink [size]="16"></svg>
          </a>
          @if (editable()) {
            <button
              type="button"
              (click)="remove(link.id)"
              class="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-mari-text-tertiary opacity-0 transition-all hover:bg-accent-coral-bg hover:text-accent-coral-text group-hover:opacity-100"
              aria-label="Delete bookmark"
            >
              <svg lucideTrash2 [size]="14"></svg>
            </button>
          }
        </div>
      } @empty {
        <div class="col-span-full flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-mari-border py-8 text-center">
          <svg lucideLink2 [size]="24" class="text-mari-text-tertiary"></svg>
          <p class="text-sm text-mari-text-tertiary">No bookmarks saved yet</p>
        </div>
      }
    </div>

    @if (editable()) {
      <form (ngSubmit)="addLink()" class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input type="text" [(ngModel)]="title" name="bmTitle" placeholder="Link title" class="mari-input sm:col-span-2" />
        <input type="text" [(ngModel)]="url" name="bmUrl" placeholder="URL (e.g. khanacademy.org)" class="mari-input" />
        <input type="text" [(ngModel)]="category" name="bmCat" placeholder="Category" class="mari-input" />
        <button type="submit" [disabled]="!canAdd()" class="mari-btn-primary sm:col-span-2">
          <svg lucidePlus [size]="16"></svg>
          Add bookmark
        </button>
      </form>
    }
  `,
})
export class BookmarkPanelComponent {
  readonly bookmarks = input.required<BookmarkLink[]>();
  readonly grid = input(false);
  readonly editable = input(false);
  readonly courseId = input<string | undefined>();

  private readonly store = inject(MariStoreService);

  protected title = '';
  protected url = '';
  protected category = 'Reference';

  formatUrl(url: string): string {
    return bookmarkHref(url);
  }

  isSafeUrl(url: string): boolean {
    return safeHttpUrl(url) !== null;
  }

  canAdd(): boolean {
    return Boolean(this.title.trim() && safeHttpUrl(this.url));
  }

  addLink(): void {
    if (!this.canAdd()) return;
    const href = safeHttpUrl(this.url);
    if (!href) return;
    const favicon = this.title.trim().slice(0, 2).toUpperCase();
    this.store.addBookmark({
      title: this.title.trim(),
      url: href,
      category: this.category.trim() || 'Reference',
      favicon,
      courseId: this.courseId(),
    });
    this.title = '';
    this.url = '';
    this.category = 'Reference';
  }

  remove(id: string): void {
    this.store.deleteBookmark(id);
  }
}
