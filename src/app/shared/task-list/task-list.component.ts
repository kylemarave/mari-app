import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideCheck,
  LucideChevronDown,
  LucideChevronRight,
  LucideClock,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { PRIORITY_STYLES, TaskItem } from '../../core/models/mari.models';

@Component({
  selector: 'app-task-list',
  imports: [
    FormsModule,
    LucideCheck,
    LucideChevronDown,
    LucideChevronRight,
    LucideClock,
    LucidePlus,
    LucideTrash2,
  ],
  template: `
    <div class="flex flex-col gap-2">
      @for (task of tasks(); track task.id) {
        <div>
          <div
            class="group flex items-center gap-3 rounded-[14px] border border-mari-border/80 bg-mari-bg px-3 py-3 shadow-sm transition-all hover:border-mari-primary-muted/60 hover:shadow-md"
            [class]="compact() ? 'py-2.5' : 'py-3'"
          >
            <button
              type="button"
              (click)="store.toggleTask(task.id)"
              class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border-2 transition-all"
              [class]="task.done
                ? 'border-mari-primary bg-mari-primary scale-100'
                : 'border-mari-border-secondary bg-mari-bg group-hover:border-mari-primary/50'"
            >
              @if (task.done) {
                <svg lucideCheck [size]="11" class="text-white" [strokeWidth]="3"></svg>
              }
            </button>

            @if (canExpand(task)) {
              <button
                type="button"
                (click)="toggleExpand(task.id)"
                class="shrink-0 rounded-md p-0.5 text-mari-text-tertiary hover:bg-mari-bg-secondary hover:text-mari-text"
                [attr.aria-expanded]="isExpanded(task.id)"
                aria-label="Toggle subtasks"
              >
                @if (isExpanded(task.id)) {
                  <svg lucideChevronDown [size]="16"></svg>
                } @else {
                  <svg lucideChevronRight [size]="16"></svg>
                }
              </button>
            }

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="text-sm font-semibold"
                  [class]="task.done ? 'text-mari-text-tertiary line-through' : 'text-mari-text'"
                >
                  {{ task.title }}
                </span>
                @if (task.course) {
                  <span class="mari-chip bg-mari-bg-secondary text-mari-text-secondary">{{
                    task.course
                  }}</span>
                }
              </div>
              @if (task.deadline) {
                <div class="mt-0.5 flex items-center gap-1 text-xs text-mari-text-tertiary">
                  <svg lucideClock [size]="12"></svg>
                  {{ task.deadline }}
                </div>
              }
              @if (hasSubtasks(task) && !isExpanded(task.id)) {
                <div class="mt-0.5 text-xs text-mari-text-tertiary">
                  {{ completedSubtasks(task) }}/{{ task.subtasks!.length }} subtasks done
                </div>
              }
            </div>

            <span
              class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              [class]="priorityStyle(task).bg + ' ' + priorityStyle(task).text"
            >
              {{ priorityStyle(task).label }}
            </span>

            @if (editable() && !compact()) {
              <button
                type="button"
                (click)="cycleStatus(task.id)"
                class="shrink-0 rounded-full bg-mari-bg-secondary px-2 py-1 text-[10px] font-semibold text-mari-text-secondary hover:bg-mari-primary-light hover:text-mari-primary-dark"
                title="Move to next status"
              >
                {{ statusLabel(task) }}
              </button>
              <button
                type="button"
                (click)="store.deleteTask(task.id)"
                class="shrink-0 rounded-[8px] p-1.5 text-mari-text-tertiary opacity-0 transition-all hover:bg-accent-coral-bg hover:text-accent-coral-text group-hover:opacity-100"
                aria-label="Delete task"
              >
                <svg lucideTrash2 [size]="14"></svg>
              </button>
            }
          </div>

          @if (canExpand(task) && isExpanded(task.id)) {
            <div
              class="ml-5 mt-2 flex flex-col gap-1.5 border-l-2 border-mari-primary/20 pl-4"
            >
              @for (sub of task.subtasks ?? []; track sub.id) {
                <div
                  class="flex items-center gap-2.5 rounded-[12px] bg-mari-bg-secondary/80 px-3 py-2"
                >
                  <button
                    type="button"
                    (click)="store.toggleSubtask(task.id, sub.id)"
                    class="flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors"
                    [class]="sub.done
                      ? 'border-mari-primary bg-mari-primary'
                      : 'border-mari-border-secondary bg-mari-bg'"
                  >
                    @if (sub.done) {
                      <svg lucideCheck [size]="9" class="text-white" [strokeWidth]="3"></svg>
                    }
                  </button>
                  <span
                    class="text-sm"
                    [class]="sub.done
                      ? 'text-mari-text-tertiary line-through'
                      : 'text-mari-text-secondary'"
                  >
                    {{ sub.title }}
                  </span>
                </div>
              }

              @if (editable()) {
                <form
                  (ngSubmit)="addSubtask(task.id)"
                  class="flex items-center gap-2 rounded-[12px] border border-dashed border-mari-border bg-mari-bg px-2 py-1.5"
                >
                  <input
                    type="text"
                    [ngModel]="draftFor(task.id)"
                    (ngModelChange)="setDraft(task.id, $event)"
                    [name]="'subtask-' + task.id"
                    placeholder="Add a subtask…"
                    class="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 text-sm text-mari-text placeholder:text-mari-text-tertiary focus:outline-none"
                  />
                  <button
                    type="submit"
                    [disabled]="!draftFor(task.id).trim()"
                    class="flex shrink-0 items-center gap-1 rounded-[8px] bg-mari-primary px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg lucidePlus [size]="12"></svg>
                    Add
                  </button>
                </form>
              }
            </div>
          }
        </div>
      } @empty {
        <div
          class="rounded-[14px] border border-dashed border-mari-border py-10 text-center text-sm text-mari-text-tertiary"
        >
          No tasks — add one to get started
        </div>
      }
    </div>
  `,
})
export class TaskListComponent {
  readonly tasks = input.required<TaskItem[]>();
  readonly compact = input(false);
  readonly editable = input(true);

  protected readonly store = inject(MariStoreService);
  private readonly expanded = signal<Set<string>>(new Set(['t2']));
  private readonly subtaskDrafts = signal<Record<string, string>>({});

  draftFor(taskId: string): string {
    return this.subtaskDrafts()[taskId] ?? '';
  }

  setDraft(taskId: string, value: string): void {
    this.subtaskDrafts.update((drafts) => ({ ...drafts, [taskId]: value }));
  }

  hasSubtasks(task: TaskItem): boolean {
    return (task.subtasks?.length ?? 0) > 0;
  }

  canExpand(task: TaskItem): boolean {
    return !task.done && (this.hasSubtasks(task) || this.editable());
  }

  completedSubtasks(task: TaskItem): number {
    return task.subtasks?.filter((s) => s.done).length ?? 0;
  }

  isExpanded(taskId: string): boolean {
    return this.expanded().has(taskId);
  }

  toggleExpand(taskId: string): void {
    const next = new Set(this.expanded());
    if (next.has(taskId)) {
      next.delete(taskId);
      this.clearDraft(taskId);
    } else {
      next.add(taskId);
    }
    this.expanded.set(next);
  }

  addSubtask(taskId: string): void {
    const title = this.draftFor(taskId).trim();
    if (!title) return;
    this.store.addSubtask(taskId, title);
    this.clearDraft(taskId);
    const next = new Set(this.expanded());
    next.add(taskId);
    this.expanded.set(next);
  }

  private clearDraft(taskId: string): void {
    this.subtaskDrafts.update((drafts) => {
      const next = { ...drafts };
      delete next[taskId];
      return next;
    });
  }

  priorityStyle(task: TaskItem) {
    const priority = task.done ? 'done' : task.priority;
    return PRIORITY_STYLES[priority];
  }

  statusLabel(task: TaskItem): string {
    if (task.done || task.status === 'done') return 'Reopen';
    if (task.status === 'in-progress') return 'Done';
    return 'Start';
  }

  cycleStatus(taskId: string): void {
    this.store.advanceTaskStatus(taskId);
  }
}
