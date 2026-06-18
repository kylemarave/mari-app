import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideShield } from '@lucide/angular';

@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink, LucideShield],
  template: `
    <div class="mari-public-container py-10 sm:py-14">
      <article class="mx-auto max-w-2xl">
        <span
          class="mari-chip bg-mari-primary-light text-mari-primary-dark ring-1 ring-mari-primary-muted/40"
        >
          <svg lucideShield [size]="12"></svg>
          Legal
        </span>
        <h1 class="mt-4 text-2xl font-bold text-mari-text sm:text-3xl">Privacy Policy</h1>
        <p class="mt-2 text-sm text-mari-text-tertiary">Last updated: June 18, 2026</p>

        <div class="mari-surface-elevated mt-8 space-y-6 p-6 text-sm leading-relaxed text-mari-text-secondary sm:p-8">
          <section>
            <h2 class="mb-2 text-base font-semibold text-mari-text">Overview</h2>
            <p>
              Mari (“we”, “our”, “the app”) is a student workspace for tasks, courses, schedules, and
              study sets. This policy describes what information we collect, how we use it, and the
              choices you have. This is placeholder copy — replace with counsel-reviewed text before
              a public launch.
            </p>
          </section>

          <section>
            <h2 class="mb-2 text-base font-semibold text-mari-text">Information we collect</h2>
            <ul class="list-inside list-disc space-y-2">
              <li>
                <strong class="text-mari-text">Account data</strong> — email and password (via Supabase
                Auth), optional profile fields you enter (name, university, program).
              </li>
              <li>
                <strong class="text-mari-text">Workspace data</strong> — tasks, courses, bookmarks,
                schedule entries, and study sets. Today most workspace data is stored locally in your
                browser; plan and AI usage limits are stored in Supabase.
              </li>
              <li>
                <strong class="text-mari-text">Uploaded files</strong> — PDFs you submit for AI study-set
                generation are processed server-side to produce flashcards; we do not intend to retain
                PDFs longer than needed for that request.
              </li>
              <li>
                <strong class="text-mari-text">Usage data</strong> — basic logs from our hosting provider
                (e.g. Vercel) such as IP address, browser type, and request timestamps.
              </li>
            </ul>
          </section>

          <section>
            <h2 class="mb-2 text-base font-semibold text-mari-text">How we use information</h2>
            <ul class="list-inside list-disc space-y-2">
              <li>Provide authentication and secure access to your account.</li>
              <li>Run core app features (tasks, courses, study tools) on your device and servers.</li>
              <li>Generate AI study content from PDFs when you request it (Google Gemini).</li>
              <li>Enforce free-tier AI import limits and subscription plans when billing is enabled.</li>
              <li>Improve reliability, security, and support.</li>
            </ul>
          </section>

          <section>
            <h2 class="mb-2 text-base font-semibold text-mari-text">Third-party services</h2>
            <p>
              Mari uses Supabase (authentication and database), Vercel (hosting), and Google Gemini
              (AI generation). Each provider has its own privacy policy. We do not sell your personal
              information.
            </p>
          </section>

          <section>
            <h2 class="mb-2 text-base font-semibold text-mari-text">Data retention & deletion</h2>
            <p>
              You can delete local workspace data from Settings. Account deletion and full data export
              are planned features — contact us if you need help removing your account before then.
            </p>
          </section>

          <section>
            <h2 class="mb-2 text-base font-semibold text-mari-text">Contact</h2>
            <p>
              Questions about privacy? Email
              <a href="mailto:support@mari.app" class="font-medium text-mari-primary hover:underline"
                >support@mari.app</a
              >
              (placeholder address).
            </p>
          </section>
        </div>

        <p class="mt-8 text-center text-sm text-mari-text-secondary">
          See also
          <a routerLink="/terms" class="font-semibold text-mari-primary hover:underline">Terms of Service</a>
          ·
          <a routerLink="/" class="font-semibold text-mari-primary hover:underline">Back to home</a>
        </p>
      </article>
    </div>
  `,
})
export class PrivacyPage {}
