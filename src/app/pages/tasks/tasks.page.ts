import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus } from '@lucide/angular';
import { MariStoreService } from '../../core/services/mari-store.service';
import { TaskPriority } from '../../core/models/mari.models';
import { TaskListComponent } from '../../shared/task-list/task-list.component';

type TaskFilter = 'all' | 'high' | 'medium' | 'low';

@Component({
  selector: 'app-tasks-page',
  imports: [TaskListComponent, FormsModule, LucidePlus],
  template: `
    <div class="mari-page mx-auto max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-mari-text sm:text-3xl">Tasks</h1>
        <p class="mt-1 text-sm text-mari-text-secondary">
          {{ store.activeTasks().length }} active · {{ completedTasks().length }} completed
        </p>
      </div>

      <div class="mb-4 grid grid-cols-3 gap-3">
        <div class="mari-stat py-3">
          <div class="mari-stat-label">Active</div>
          <div class="text-xl font-bold">{{ store.activeTasks().length }}</div>
        </div>
        <div class="mari-stat border-accent-coral/30 py-3">
          <div class="mari-stat-label">Urgent</div>
          <div class="text-xl font-bold text-accent-coral">{{ store.highPriorityTasks().length }}</div>
        </div>
        <div class="mari-stat py-3">
          <div class="mari-stat-label">Done</div>
          <div class="text-xl font-bold text-accent-teal">{{ completedTasks().length }}</div>
        </div>
      </div>

      <form
        (ngSubmit)="addTask()"
        class="mari-surface-elevated mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
      >
        <div class="min-w-0 flex-1">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">New task</label>
          <input type="text" [(ngModel)]="newTitle" name="title" placeholder="What needs to get done?" class="mari-input" />
        </div>
        <div class="sm:w-36">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-mari-text-tertiary">Priority</label>
          <select [(ngModel)]="newPriority" name="priority" class="mari-input">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button type="submit" [disabled]="!newTitle.trim()" class="mari-btn-primary sm:mb-0">
          <svg lucidePlus [size]="16"></svg>
          Add task
        </button>
      </form>

      <div class="mb-4 flex flex-wrap gap-2">
        @for (f of filters; track f.id) {
          <button
            type="button"
            (click)="filter.set(f.id)"
            class="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            [class]="filter() === f.id
              ? 'bg-mari-primary text-white shadow-sm'
              : 'bg-mari-bg text-mari-text-secondary ring-1 ring-mari-border hover:bg-mari-bg-secondary'"
          >
            {{ f.label }}
          </button>
        }
      </div>

      <section class="mari-surface p-5">
        <app-task-list [tasks]="filteredActive()" />
      </section>

      @if (completedTasks().length) {
        <section class="mari-surface mt-4 p-5">
          <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-mari-text-tertiary">
            Completed
          </h2>
          <app-task-list [tasks]="completedTasks()" />
        </section>
      }
    </div>
  `,
})
export class TasksPage {
  protected readonly store = inject(MariStoreService);
  protected newTitle = '';
  protected newPriority: TaskPriority = 'medium';
  protected readonly filter = signal<TaskFilter>('all');

  protected readonly filters: { id: TaskFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
  ];

  completedTasks() {
    return this.store.tasks().filter((t) => t.done);
  }

  filteredActive = computed(() => {
    const active = this.store.activeTasks();
    const f = this.filter();
    if (f === 'all') return active;
    return active.filter((t) => t.priority === f);
  });

  addTask(): void {
    const title = this.newTitle.trim();
    if (!title) return;
    this.store.addTask(title, this.newPriority);
    this.newTitle = '';
    this.newPriority = 'medium';
  }
}
