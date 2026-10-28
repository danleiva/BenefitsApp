import { describe, expect, it } from 'vitest';
import { emptyProfile } from '../data/options';
import { clearSession, hasAnswers, loadSession, parseSession, saveSession } from '../storage';

const fakeStore = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};

describe('saved answers', () => {
  it('round-trips a session', () => {
    const store = fakeStore();
    const profile = { ...emptyProfile(), status: 'veteran' as const, rating: 50, state: 'OH', eras: ['post911' as const] };
    saveSession({ stage: 'results', step: 3, profile }, store);
    const got = loadSession(store);
    expect(got?.stage).toBe('results');
    expect(got?.step).toBe(3);
    expect(got?.profile).toEqual(profile);
    clearSession(store);
    expect(loadSession(store)).toBeNull();
  });

  it('fills in fields missing from older saves and drops unknown or mistyped ones', () => {
    const raw = JSON.stringify({ stage: 'wizard', step: 2, profile: { status: 'veteran', rating: 'bad', bogus: 1, eras: 'x' } });
    const got = parseSession(raw)!;
    expect(got.profile.status).toBe('veteran');
    expect(got.profile.rating).toBeNull();
    expect(got.profile.eras).toEqual([]);
    expect(got.profile.remarriage).toBe('no');
    expect('bogus' in got.profile).toBe(false);
  });

  it('ignores corrupt data and blocked storage', () => {
    expect(parseSession('{not json')).toBeNull();
    expect(parseSession(JSON.stringify({ stage: 'results' }))).toBeNull();
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => {} };
    expect(loadSession(throwing)).toBeNull();
    expect(() => saveSession({ stage: 'welcome', step: 0, profile: emptyProfile() }, throwing)).not.toThrow();
  });

  it('only offers to resume when there are real answers', () => {
    expect(hasAnswers(emptyProfile())).toBe(false);
    expect(hasAnswers({ ...emptyProfile(), status: 'active' })).toBe(true);
  });
});
