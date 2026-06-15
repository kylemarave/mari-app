import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  LucideEye,
  LucideFileText,
  LucideImage,
  LucideTrash2,
  LucideUpload,
} from '@lucide/angular';
import { CourseFile, FileSort } from '../../core/models/mari.models';
import { CourseFileStorageService } from '../../core/services/course-file-storage.service';
import { MariStoreService } from '../../core/services/mari-store.service';
import { PdfViewerModalComponent } from '../pdf-viewer-modal/pdf-viewer-modal.component';

@Component({
  selector: 'app-file-repo',
  imports: [
    LucideFileText,
    LucideImage,
    LucideUpload,
    LucideTrash2,
    LucideEye,
    PdfViewerModalComponent,
  ],
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
            <button
              type="button"
              (click)="openPreview(file)"
              class="flex min-w-0 flex-1 items-center gap-3 text-left"
              [class]="isPreviewable(file) ? 'cursor-pointer' : 'cursor-default'"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-mari-primary-light text-mari-primary-dark">
                @if (file.type === 'PNG' || file.type === 'JPG') {
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
            </button>

            <div class="flex shrink-0 items-center gap-1">
              @if (isPreviewable(file)) {
                <button
                  type="button"
                  (click)="openPreview(file)"
                  class="rounded-[8px] p-2 text-mari-text-tertiary hover:bg-mari-primary-light hover:text-mari-primary-dark"
                  aria-label="View file"
                >
                  <svg lucideEye [size]="16"></svg>
                </button>
              }
              @if (editable()) {
                <button
                  type="button"
                  (click)="deleteFile(file.id)"
                  class="rounded-[8px] p-2 text-mari-text-tertiary opacity-0 transition-all hover:bg-accent-coral-bg hover:text-accent-coral-text group-hover:opacity-100"
                  aria-label="Delete file"
                >
                  <svg lucideTrash2 [size]="16"></svg>
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="rounded-[14px] border border-dashed border-mari-border py-10 text-center text-sm text-mari-text-tertiary">
            No files in this folder yet
          </div>
        }
      </div>

      @if (editable()) {
        <label
          class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-mari-primary/40 bg-mari-primary-light/50 py-4 text-sm font-semibold text-mari-primary-dark transition-all hover:border-mari-primary hover:bg-mari-primary-light"
          [class.opacity-60]="uploading()"
        >
          <svg lucideUpload [size]="18"></svg>
          {{ uploading() ? 'Uploading…' : 'Upload files' }}
          <input
            type="file"
            class="sr-only"
            accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
            multiple
            [disabled]="uploading()"
            (change)="onFilesSelected($event)"
          />
        </label>
        @if (uploadError()) {
          <p class="mt-2 text-xs text-accent-coral-text">{{ uploadError() }}</p>
        }
      }

      <app-pdf-viewer-modal
        [open]="viewerOpen()"
        [title]="viewerTitle()"
        [url]="viewerSafeUrl()"
        [imageMode]="viewerImageMode()"
        (closed)="closePreview()"
      />
    </div>
  `,
})
export class FileRepoComponent {
  readonly files = input.required<CourseFile[]>();
  readonly courseId = input.required<string>();
  readonly editable = input(true);

  private readonly store = inject(MariStoreService);
  private readonly fileStorage = inject(CourseFileStorageService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly activeSort = signal<FileSort>('name');
  protected readonly uploading = signal(false);
  protected readonly uploadError = signal('');
  protected readonly viewerOpen = signal(false);
  protected readonly viewerTitle = signal('');
  protected readonly viewerSafeUrl = signal<SafeResourceUrl | null>(null);
  protected readonly viewerImageMode = signal(false);
  private previewObjectUrl: string | null = null;

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

  isPreviewable(file: CourseFile): boolean {
    return Boolean(file.stored && (this.isPdf(file) || this.isImage(file)));
  }

  isPdf(file: CourseFile): boolean {
    return file.type === 'PDF' || file.mimeType === 'application/pdf';
  }

  isImage(file: CourseFile): boolean {
    return file.type === 'PNG' || file.type === 'JPG' || file.type === 'JPEG' || file.mimeType?.startsWith('image/') === true;
  }

  async openPreview(file: CourseFile): Promise<void> {
    if (!this.isPreviewable(file)) return;

    this.closePreview();
    this.viewerTitle.set(file.name);
    this.viewerImageMode.set(this.isImage(file));

    if (!file.stored) {
      this.viewerSafeUrl.set(null);
      this.viewerOpen.set(true);
      return;
    }

    try {
      const blob = await this.fileStorage.getBlob(file.id);
      if (!blob) {
        this.viewerSafeUrl.set(null);
        this.viewerOpen.set(true);
        return;
      }
      this.previewObjectUrl = this.fileStorage.createObjectUrl(blob);
      this.viewerSafeUrl.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(this.previewObjectUrl),
      );
      this.viewerOpen.set(true);
    } catch {
      this.uploadError.set('Could not open this PDF preview.');
    }
  }

  closePreview(): void {
    this.viewerOpen.set(false);
    this.viewerTitle.set('');
    this.viewerSafeUrl.set(null);
    this.viewerImageMode.set(false);
    if (this.previewObjectUrl) {
      this.fileStorage.revokeObjectUrl(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }

  deleteFile(fileId: string): void {
    this.store.deleteCourseFile(this.courseId(), fileId);
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const selected = input.files;
    if (!selected?.length) return;

    this.uploading.set(true);
    this.uploadError.set('');

    try {
      for (const file of Array.from(selected)) {
        await this.uploadFile(file);
      }
    } catch {
      this.uploadError.set('Upload failed. Try a smaller PDF (under 15 MB).');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  private async uploadFile(file: File): Promise<void> {
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('File too large');
    }

    const id = `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    await this.fileStorage.saveBlob(id, file);

    const courseFile: CourseFile = {
      id,
      name: file.name,
      type: fileTypeLabel(file),
      date: formatFileDate(new Date()),
      size: formatFileSize(file.size),
      mimeType: file.type,
      stored: true,
    };

    this.store.addCourseFile(this.courseId(), courseFile);
  }
}

function fileTypeLabel(file: File): string {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'PDF';
  if (file.type.startsWith('image/')) {
    const ext = file.name.split('.').pop()?.toUpperCase();
    return ext ?? 'IMG';
  }
  const ext = file.name.split('.').pop()?.toUpperCase();
  return ext ?? 'FILE';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}
