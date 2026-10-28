import { describe, expect, it } from 'vitest';
import { federalBenefits } from '../data/federal';
import { emptyProfile, STATE_OPTIONS } from '../data/options';
import { states } from '../data/states';
import { evaluateCriteria, matchBenefits, stateBenefits, topActions } from '../engine/match';
import { estimatedCompensation } from '../engine/rules';
import type { Profile } from '../types';

const profile = (over: Partial<Profile>): Profile => ({ ...emptyProfile(), ...over });
const ids = (p: Profile) => matchBenefits(p).map((m) => m.benefit.id);
const strengthOf = (p: Profile, id: string) => matchBenefits(p).find((m) => m.benefit.id === id)?.result.strength;

const disabledVet = profile({
  status: 'veteran',
  branch: 'army',
  discharge: 'honorable',
  serviceLength: '6_10y',
  eras: ['post911'],
  separationYear: 2015,
  combat: true,
  rating: 100,
  permanentAndTotal: true,
  marital: 'married',
  kidsUnder18: 2,
  age: 41,
  housing: 'own',
  state: 'TX',
});

describe('data integrity', () => {
  it('has unique benefit ids', () => {
    const all = [...federalBenefits, ...states.flatMap((s) => stateBenefits(s.code))];
    expect(new Set(all.map((b) => b.id)).size).toBe(all.length);
  });

  it('covers all 50 states and DC', () => {
    expect(states).toHaveLength(51);
    const optionCodes = STATE_OPTIONS.map((o) => o.value).filter((c) => c !== 'XX');
    expect(states.map((s) => s.code).sort()).toEqual(optionCodes.sort());
  });

  it('every benefit has an https primary link and apply steps', () => {
    const all = [...federalBenefits, ...states.flatMap((s) => stateBenefits(s.code))];
    for (const b of all) {
      expect(b.links.length, b.id).toBeGreaterThan(0);
      for (const l of b.links) expect(l.url, b.id).toMatch(/^https:\/\//);
      expect(b.howToApply.length, b.id).toBeGreaterThan(0);
    }
  });

  it('every state agency URL is https', () => {
    for (const s of states) expect(s.url).toMatch(/^https:\/\//);
  });
});

describe('matching', () => {
  it('matches core benefits for a 100% P&T married veteran in Texas', () => {
    const got = ids(disabledVet);
    for (const id of ['va-disability-compensation', 'va-health-care', 'champva', 'dea', 'tx-prop', 'tx-edu', 'va-dental', 'add-dependents', 'post-911-gi-bill']) {
      expect(got, id).toContain(id);
    }
    expect(strengthOf(disabledVet, 'champva')).toBe('likely');
    expect(strengthOf(disabledVet, 'tx-prop')).toBe('likely');
    // Active-duty-only benefits should not appear.
    expect(got).not.toContain('bdd');
    expect(got).not.toContain('tuition-assistance');
  });

  it('downgrades CHAMPVA to possible when not P&T', () => {
    expect(strengthOf({ ...disabledVet, permanentAndTotal: false }, 'champva')).toBe('possible');
  });

  it('shows active-duty transition benefits when separating soon', () => {
    const p = profile({ status: 'active', branch: 'navy', serviceLength: '6_10y', eras: ['post911'], separatingSoon: true, marital: 'married', state: 'VA' });
    const got = ids(p);
    for (const id of ['bdd', 'tap', 'skillbridge', 'tricare', 'gi-bill-transfer', 'vgli', 'scra']) expect(got, id).toContain(id);
    expect(got).not.toContain('va-disability-compensation');
    expect(got).not.toContain('va-health-care');
  });

  it('excludes most benefits for a dishonorable discharge but surfaces the upgrade path', () => {
    const p = profile({ status: 'veteran', discharge: 'dishonorable', rating: null, state: 'OH', housing: 'own' });
    const got = ids(p);
    expect(got).toContain('discharge-upgrade');
    expect(got).not.toContain('va-health-care');
    expect(got).not.toContain('va-home-loan');
    expect(got).not.toContain('oh-cvsc');
  });

  it('marks OTH veterans as possible rather than excluded', () => {
    const p = profile({ status: 'veteran', discharge: 'oth', state: 'CA' });
    expect(strengthOf(p, 'va-health-care')).toBe('possible');
    expect(strengthOf(p, 'discharge-upgrade')).toBe('likely');
  });

  it('puts homeless help at the top of next steps', () => {
    const p = profile({ status: 'veteran', discharge: 'honorable', housing: 'homeless', state: 'WA' });
    expect(topActions(matchBenefits(p))[0].benefit.id).toBe('homeless');
  });

  it('suggests TDIU for unemployed 70% veterans but not 100%', () => {
    const p = profile({ status: 'veteran', discharge: 'honorable', rating: 70, employment: 'unemployed', state: 'FL' });
    expect(strengthOf(p, 'tdiu')).toBe('likely');
    expect(ids({ ...p, rating: 100 })).not.toContain('tdiu');
  });

  it('only shows VA pension to low-income wartime veterans who are 65+ or disabled', () => {
    const p = profile({ status: 'veteran', discharge: 'honorable', eras: ['vietnam'], age: 72, income: 'lt_20k', state: 'AL' });
    expect(strengthOf(p, 'va-pension')).toBe('likely');
    expect(ids({ ...p, income: 'gt_125k' })).not.toContain('va-pension');
    expect(ids({ ...p, eras: ['peacetime'] })).not.toContain('va-pension');
  });

  it('includes state retirement tax info for retirees', () => {
    const p = profile({ status: 'retired', serviceLength: '20_plus', state: 'GA' });
    expect(strengthOf(p, 'ga-retirement-tax')).toBe('likely');
  });

  it('returns only federal benefits for veterans living abroad', () => {
    const p = profile({ status: 'veteran', discharge: 'honorable', rating: 30, state: 'XX' });
    const matches = matchBenefits(p);
    expect(matches.every((m) => m.benefit.level === 'federal')).toBe(true);
    expect(matches.map((m) => m.benefit.id)).toContain('foreign-medical');
  });

  it('sorts likely matches before possible ones', () => {
    const m = matchBenefits(disabledVet);
    const firstPossible = m.findIndex((x) => x.result.strength === 'possible');
    expect(m.slice(firstPossible).every((x) => x.result.strength === 'possible')).toBe(true);
  });
});

describe('state criteria', () => {
  it('treats TDIU as meeting rating thresholds', () => {
    const p = profile({ status: 'veteran', discharge: 'honorable', rating: 70, tdiu: true, housing: 'own' });
    expect(evaluateCriteria(p, { total: true, homeowner: true })?.strength).toBe('likely');
    expect(evaluateCriteria(p, { minRating: 80 })).not.toBeNull();
  });

  it('excludes renters from property tax benefits', () => {
    const p = profile({ status: 'veteran', discharge: 'honorable', rating: 100, housing: 'rent' });
    expect(evaluateCriteria(p, { total: true, homeowner: true })).toBeNull();
  });
});

describe('compensation estimate', () => {
  it('uses 2026 veteran-alone rates and the 100% rate for TDIU', () => {
    expect(estimatedCompensation(profile({ rating: 10 }))).toBe(180.42);
    expect(estimatedCompensation(profile({ rating: 70, tdiu: true }))).toBe(3938.58);
    expect(estimatedCompensation(profile({}))).toBeNull();
  });
});
