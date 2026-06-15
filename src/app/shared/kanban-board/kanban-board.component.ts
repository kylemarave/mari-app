import { Component, input } from '@angular/core';
import { ACCENT_STYLES, KanbanAccent, KanbanColumn } from '../../core/models/mari.models';

@Component({
  selector: 'app-kanban-board',
  template: `
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      @for (col of columns(); track col.id) {
        <div class="flex min-h-[180px] flex-col rounded-[14px] border border-mari-border/80 bg-mari-bg-secondary/80 p-3">
          <div
            class="mb-3 flex items-center justify-between rounded-[10px] px-3 py-2 text-xs font-bold uppercase tracking-wide"
            [class]="columnHeaderClass(col)"
          >
            <span>{{ col.title }}</span>
            <span class="rounded-full bg-white/60 px-2 py-0.5 text-[10px]">{{ col.tasks.length }}</span>
          </div>
          <div class="flex flex-1 flex-col gap-2">
            @for (task of col.tasks; track task) {
              <div
                class="rounded-[12px] border border-mari-border bg-mari-bg px-3 py-2.5 text-sm font-medium text-mari-text shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                {{ task }}
              </div>
            } @empty {
              <div
                class="flex flex-1 items-center justify-center rounded-[12px] border border-dashed border-mari-border py-6 text-center text-xs text-mari-text-tertiary"
              >
                Drop tasks here
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class KanbanBoardComponent {
  readonly columns = input.required<KanbanColumn[]>();

  columnHeaderClass(col: KanbanColumn): string {
    if (col.accent === 'blue') {
      return 'bg-accent-blue-bg text-accent-blue-text';
    }
    const styles = ACCENT_STYLES[col.accent as Exclude<KanbanAccent, 'blue'>];
    return `${styles.card} ${styles.text}`;
  }
}
