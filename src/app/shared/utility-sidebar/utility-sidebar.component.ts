import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentProfile } from '../../core/models/mari.models';
import { UtilityGlancePanelComponent } from '../utility-glance-panel/utility-glance-panel.component';

@Component({
  selector: 'app-utility-sidebar',
  host: { class: 'block h-full min-h-0 min-w-0 shrink-0' },
  imports: [RouterLink, UtilityGlancePanelComponent],
  template: `
    <aside
      class="box-border flex h-full w-full min-w-0 flex-col gap-4 overflow-x-hidden border-l border-mari-border/80 bg-mari-bg/95 p-4 backdrop-blur-sm xl:p-5"
    >
      <div class="mari-surface min-w-0 p-4 text-center">
        <div
          class="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue-bg to-mari-primary-light text-base font-bold text-accent-blue-text ring-2 ring-mari-bg"
        >
          {{ profile().initials }}
        </div>
        <div class="text-base font-semibold text-mari-text">{{ profile().shortName }}</div>
        <div class="text-xs text-mari-text-tertiary">{{ profile().university }} · {{ profile().program }}</div>
        <a routerLink="/settings" class="mari-btn-primary mt-4 w-full text-sm"> Manage ID </a>
      </div>

      <app-utility-glance-panel />
    </aside>
  `,
})
export class UtilitySidebarComponent {
  readonly profile = input.required<StudentProfile>();
}
