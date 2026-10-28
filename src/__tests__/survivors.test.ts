import { describe, expect, it } from 'vitest';
import { emptyProfile } from '../data/options';
import { matchBenefits } from '../engine/match';
import { estimatedDic } from '../engine/rules';
import type { Profile } from '../types';

const survivor = (over: Partial<Profile> = {}): Profile => ({
  ...emptyProfile(),
  status: 'surviving_spouse',
  marital: 'widowed',
  branch: 'army',
  discharge: 'honorable',
  serviceLength: '6_10y',
  eras: ['post911'],
  deathCause: 'in_service',
  remarriage: 'no',
  kidsUnder18: 2,
  age: 36,
  housing: 'own',
  state: 'TX',
  ...over,
});

const match = (p: Profile) => new Map(matchBenefits(p).map((m) => [m.benefit.id, m.result.strength]));

describe('surviving spouse matching', () => {
  it('matches core survivor benefits for a line-of-duty death', () => {
    const m = match(survivor());
    for (const id of ['dic', 'fry-scholarship', 'sbp-annuity', 'death-gratuity-sgli', 'tricare', 'grief-support', 'ssa-survivors', 'dea', 'va-home-loan', 'commissary-exchange', 'parks-pass'])
      expect(m.has(id), id).toBe(true);
    expect(m.get('dic')).toBe('likely');
    expect(m.get('tricare')).toBe('likely');
  });

  it('never shows benefits meant for the living veteran', () => {
    const m = match(survivor({ exposures: ['burn_pits'] }));
    for (const id of ['va-disability-compensation', 'pact-act', 'va-health-care', 'post-911-gi-bill', 'va-pension', 'tdiu', 'add-dependents', 'tx-license', 'tx-edu'])
      expect(m.has(id), id).toBe(false);
  });

  it('uses CHAMPVA (not TRICARE) for a non-retiree veteran who died from a service-connected condition', () => {
    const m = match(survivor({ deathCause: 'service_connected', eras: ['vietnam'] }));
    expect(m.get('champva')).toBe('likely');
    expect(m.has('tricare')).toBe(false);
    expect(m.has('fry-scholarship')).toBe(false);
  });

  it('marks DIC possible when the cause of death is unknown, and offers survivors pension when income is low', () => {
    const m = match(survivor({ deathCause: 'unknown', eras: ['vietnam'], income: 'lt_20k', age: 70 }));
    expect(m.get('dic')).toBe('possible');
    expect(m.get('survivors-pension')).toBe('likely');
  });

  it('handles remarriage before 55', () => {
    const m = match(survivor({ deathCause: 'service_connected', remarriage: 'before55' }));
    expect(m.get('dic')).toBe('possible');
    expect(m.has('champva')).toBe(false);
    expect(m.has('tx-prop')).toBe(false);
    expect(m.has('survivors-pension')).toBe(false);
  });

  it('extends flagged state property tax programs to unremarried survivors', () => {
    const m = match(survivor({ deathCause: 'service_connected' }));
    expect(m.get('tx-prop')).toBe('possible');
    expect(m.get('tx-survivors')).toBe('possible');
    // Arizona's program is not flagged for survivors.
    expect(match(survivor({ state: 'AZ' })).has('az-prop')).toBe(false);
  });

  it('estimates DIC with children and only for service-connected deaths', () => {
    expect(estimatedDic(survivor())).toBe(2541.36);
    expect(estimatedDic(survivor({ deathCause: 'other' }))).toBeNull();
    expect(estimatedDic(survivor({ remarriage: 'before55' }))).toBeNull();
  });
});
