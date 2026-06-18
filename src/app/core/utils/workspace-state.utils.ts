import { createId, EMPTY_STATE } from '../data/seed-data';
import {
  AppState,
  CourseAccent,
  ScheduleBlock,
  ScheduleEntry,
} from '../models/mari.models';

const SYNC_AT_PREFIX = 'mari-app-sync-at-';

export function storageKeyForUser(userId: string): string {
  return `mari-app-state-${userId}`;
}

export function syncAtKeyForUser(userId: string): string {
  return `${SYNC_AT_PREFIX}${userId}`;
}

export function getLocalSyncAt(userId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(syncAtKeyForUser(userId));
}

export function setLocalSyncAt(userId: string, iso: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(syncAtKeyForUser(userId), iso);
  } catch {
    /* storage full or unavailable */
  }
}

/** True when the workspace has user-created content worth uploading. */
export function hasWorkspaceContent(state: AppState): boolean {
  if (state.tasks.length > 0) return true;
  if (state.courses.length > 0) return true;
  if (state.studyDecks.length > 0) return true;
  if (state.bookmarks.length > 0) return true;
  if ((state.scheduleEntries?.length ?? 0) > 0) return true;
  if (Object.values(state.courseFiles ?? {}).some((files) => files.length > 0)) return true;
  if (state.countdown.label.trim() || state.countdown.daysLeft > 0) return true;
  if (state.student.university.trim() || state.student.program.trim()) return true;
  if (state.student.name.trim() && state.student.name !== 'Student') return true;
  return false;
}

export function parseAppState(raw: string): AppState {
  const parsed = JSON.parse(raw) as Partial<AppState> & {
    scheduleBlocks?: ScheduleBlock[];
  };
  const merged = { ...structuredClone(EMPTY_STATE), ...parsed } as AppState;
  if (parsed.scheduleBlocks && !parsed.scheduleEntries) {
    merged.scheduleEntries = migrateLegacySchedule(parsed.scheduleBlocks);
  } else if (!merged.scheduleEntries) {
    merged.scheduleEntries = [];
  }
  if (!merged.courseFiles) {
    merged.courseFiles = {};
  }
  return merged;
}

export function parseAppStateJson(value: unknown): AppState | null {
  if (!value || typeof value !== 'object') return null;
  try {
    return parseAppState(JSON.stringify(value));
  } catch {
    return null;
  }
}

function migrateLegacySchedule(blocks: ScheduleBlock[]): ScheduleEntry[] {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (!blocks.length) return [];
  return blocks.map((block, index) => ({
    id: createId(`sch-m${index}`),
    date: today,
    ...block,
  }));
}

export function loadLocalState(userId: string): AppState {
  if (typeof localStorage === 'undefined') return structuredClone(EMPTY_STATE);
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return structuredClone(EMPTY_STATE);
    return parseAppState(raw);
  } catch {
    return structuredClone(EMPTY_STATE);
  }
}

export function saveLocalState(userId: string, state: AppState, syncAt?: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(state));
    setLocalSyncAt(userId, syncAt ?? new Date().toISOString());
  } catch {
    /* storage full or unavailable */
  }
}
