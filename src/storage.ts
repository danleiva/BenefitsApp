import { emptyProfile } from './data/options';
import type { Profile } from './types';

export type Stage = 'welcome' | 'wizard' | 'results';

export interface SavedSession {
  stage: Stage;
  step: number;
  profile: Profile;
  savedAt: string;
}

const KEY = 'benefits-navigator:v1';

/** Minimal Storage surface so tests can pass a fake. */
type KV = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const browserStorage = (): KV | null => {
  try {
    return window.localStorage;
  } catch {
    return null; // Blocked (privacy settings, sandboxed iframe) — the app works without saving.
  }
};

/** Parse saved data defensively: unknown or missing fields fall back to defaults so old saves keep working. */
export function parseSession(raw: string | null): SavedSession | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<SavedSession>;
    if (!data || typeof data !== 'object' || !data.profile || typeof data.profile !== 'object') return null;
    const base = emptyProfile();
    const profile = { ...base } as Record<string, unknown>;
    for (const [k, v] of Object.entries(data.profile)) {
      // Only keep known keys whose type matches the default (null defaults accept numbers).
      if (!(k in base)) continue;
      const def = (base as unknown as Record<string, unknown>)[k];
      if (def === null ? v === null || typeof v === 'number' : Array.isArray(def) ? Array.isArray(v) : typeof v === typeof def)
        profile[k] = v;
    }
    const stage: Stage = data.stage === 'wizard' || data.stage === 'results' ? data.stage : 'welcome';
    const step = typeof data.step === 'number' && data.step >= 0 ? Math.floor(data.step) : 0;
    return { stage, step, profile: profile as unknown as Profile, savedAt: typeof data.savedAt === 'string' ? data.savedAt : '' };
  } catch {
    return null;
  }
}

export function loadSession(store: KV | null = browserStorage()): SavedSession | null {
  try {
    return parseSession(store?.getItem(KEY) ?? null);
  } catch {
    return null;
  }
}

export function saveSession(s: Omit<SavedSession, 'savedAt'>, store: KV | null = browserStorage()) {
  try {
    store?.setItem(KEY, JSON.stringify({ ...s, savedAt: new Date().toISOString() }));
  } catch {
    // Quota exceeded or storage blocked — saving is a convenience, so ignore.
  }
}

export function clearSession(store: KV | null = browserStorage()) {
  try {
    store?.removeItem(KEY);
  } catch {
    // Ignore.
  }
}

/** True when the profile has any answers worth offering to resume. */
export const hasAnswers = (p: Profile) => p.status !== '' || p.state !== '';
