import { Component, computed, input, signal } from '@angular/core';
import { LucideFileText, LucideImage, LucideUpload } from '@lucide/angular';
import { CourseFile, FileSort } from '../../core/models/mari.models';

@Component({
  selector: 'app-file-repo',
  imports: [LucideFileText, LucideImage, LucideUpload],
  template: `
    <div>
      <div class="mb-4 flex gap-1 rounded-[12px] border border-mari-border bg-mari-bg-secondary p-1">
        @for (sort of sortOptions; track sort.id) {
          <button
            type="button"
            (click)="activeSort.set(sort.id)"
            class="flex-1 rounded-[10px] py-2 text-xs font-bold uppercase tracking-wide transition-all"
            [class]="activeSort() === sort.id
              ? 'bg-mari-bg text-mari-primary shadow-sm'
              : 'text-mari-text-secondary hover:text-mari-text'"
          >
            {{ sort.label }}
          </button>
        }
      </div>

      <div class="mb-4 flex flex-col gap-2">
        @for (file of sortedFiles(); track file.id) {
          <div
            class="group flex items-center gap-3 rounded-[14px] border border-mari-border/80 bg-mari-bg px-4 py-3 shadow-sm transition-all hover:border-mari-primary-muted hover:shadow-md"
          >
            <div class="flex size-10 items-center justify-center rounded-[12px] bg-mari-primary-light text-mari-primary-dark">
              @if (file.type === 'PNG') {
                <svg lucideImage [size]="18"></svg>
              } @else {
                <svg lucideFileText [size]="18"></svg>
              }
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-semibold text-mari-text">{{ file.name }}</div>
              <div class="flex flex-wrap gap-2 text-xs text-mari-text-tertiary">
                <span class="mari-chip bg-mari-bg-secondary py-0">{{ file.type }}</span>
                <span>{{ file.date }}</span>
                <span>{{ file.size }}</span>
              </div>
            </div>
          </div>
        } @empty {
          <div class="rounded-[14px] border border-dashed border-mari-border py-10 text-center text-sm text-mari-text-tertiary">
            No files in this folder yet
          </div>
        }
      </div>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-mari-primary/40 bg-mari-primary-light/50 py-4 text-sm font-semibold text-mari-primary-dark transition-all hover:border-mari-primary hover:bg-mari-primary-light"
      >
        <svg lucideUpload [size]="18"></svg>
        Upload files
      </button>
    </div>
  `,
})
export class FileRepoComponent {
  readonly files = input.required<CourseFile[]>();

  protected readonly activeSort = signal<FileSort>('name');
  protected readonly sortOptions: { id: FileSort; label: string }[] = [
    { id: 'name', label: 'Name' },
    { id: 'date', label: 'Date' },
    { id: 'type', label: 'Type' },
  ];

  protected readonly sortedFiles = computed(() => {
    const list = [...this.files()];
    const sort = this.activeSort();
    return list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'type') return a.type.localeCompare(b.type);
      return b.date.localeCompare(a.date);
    });
  });
}
