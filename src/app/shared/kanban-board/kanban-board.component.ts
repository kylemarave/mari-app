import { Component, inject, input } from '@angular/core';
import { ACCENT_STYLES, KanbanAccent, KanbanColumn } from '../../core/models/mari.models';
import { MariStoreService } from '../../core/services/mari-store.service';

@Component({
  selector: 'app-kanban-board',
  template: `
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch sm:gap-4">
      @for (col of columns(); track col.id) {
        <div
          class="flex h-full flex-col rounded-[10px] border border-mari-border/60 bg-mari-bg-secondary/40 p-2.5"
        >
          <div
            class="mb-2 flex items-center justify-between rounded-[8px] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide"
            [class]="columnHeaderClass(col)"
          >
            <span>{{ col.title }}</span>
            <span class="rounded-full bg-mari-bg/60 px-1.5 py-0.5 text-[9px]">{{ col.tasks.length }}</span>
          </div>
          <div class="flex flex-col gap-1.5">
            @for (task of col.tasks; track task.id) {
              <button
                type="button"
                (click)="onTaskClick(task.id)"
                class="rounded-[8px] border border-mari-border bg-mari-bg px-2.5 py-2 text-left text-xs font-medium text-mari-text shadow-sm transition-transform hover:-translate-y-0.5 hover:border-mari-primary-muted hover:shadow-md"
                [title]="editable() ? 'Click to move to next column' : ''"
              >
                {{ task.title }}
              </button>
            } @empty {
              <div
                class="rounded-[8px] border border-dashed border-mari-border py-3 text-center text-[10px] text-mari-text-tertiary"
              >
                No tasks here
              </div>
            }
          </div>
        </div>
      }
    </div>
    @if (editable()) {
      <p class="mt-2.5 text-center text-[10px] text-mari-text-tertiary">
        Click a task to move it: To-do → In progress → Done
      </p>
    }
  `,
})
export class KanbanBoardComponent {
  readonly columns = input.required<KanbanColumn[]>();
  readonly editable = input(false);

  private readonly store = inject(MariStoreService);

  onTaskClick(taskId: string): void {
    if (!this.editable()) return;
    this.store.advanceTaskStatus(taskId);
  }

  columnHeaderClass(col: KanbanColumn): string {
    if (col.accent === 'blue') {
      return 'bg-accent-blue-bg text-accent-blue-text';
    }
    const styles = ACCENT_STYLES[col.accent as Exclude<KanbanAccent, 'blue'>];
    return `${styles.card} ${styles.text}`;
  }
}
