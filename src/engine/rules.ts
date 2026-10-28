import type { MatchResult, Profile, Strength } from '../types';

/** Separated from service (any veteran or retiree). */
export const isVeteran = (p: Profile) =>
  p.status === 'veteran' || p.status === 'retired' || p.status === 'medically_retired';

export const isRetiree = (p: Profile) => p.status === 'retired' || p.status === 'medically_retired';

export const isActive = (p: Profile) => p.status === 'active';

export const isGuardReserve = (p: Profile) => p.status === 'guard_reserve';

export const isServing = (p: Profile) => isActive(p) || isGuardReserve(p);

/** Discharge that clearly meets the "other than dishonorable" bar for most VA benefits. */
export const goodDischarge = (p: Profile) =>
  p.discharge === 'honorable' || p.discharge === 'general' || isRetiree(p);

/** Discharge that may or may not qualify (VA makes a character-of-discharge determination). */
export const uncertainDischarge = (p: Profile) =>
  p.discharge === 'oth' ||
  p.discharge === 'bad_conduct' ||
  p.discharge === 'uncharacterized' ||
  p.discharge === 'unknown';

export const barredDischarge = (p: Profile) => p.discharge === 'dishonorable';

/** Has any VA service-connected rating, including 0%. */
export const hasRating = (p: Profile) => p.rating !== null;

export const ratingAtLeast = (p: Profile, n: number) => p.rating !== null && p.rating >= n;

/** Rated 100% or paid at the 100% rate through TDIU. */
export const totallyDisabled = (p: Profile) => p.rating === 100 || p.tdiu;

export const isMarried = (p: Profile) => p.marital === 'married';

export const hasKids = (p: Profile) => p.kidsUnder18 > 0 || p.kidsInSchool > 0 || p.disabledChild;

export const hasDependents = (p: Profile) => isMarried(p) || hasKids(p);

export const wartime = (p: Profile) =>
  p.eras.some((e) => e === 'post911' || e === 'gulf_war' || e === 'vietnam' || e === 'korea' || e === 'wwii');

export const lowIncome = (p: Profile) => p.income === 'lt_20k' || p.income === '20_40k';

export const yearsSinceSeparation = (p: Profile, now = new Date().getFullYear()) =>
  p.separationYear === null ? null : now - p.separationYear;

export const recentlySeparated = (p: Profile, years = 1) => {
  const y = yearsSinceSeparation(p);
  return y !== null && y <= years;
};

export const atLeastYears = (p: Profile, years: number) => {
  const min: Record<string, number> = {
    lt_90d: 0,
    '90d_2y': 0.25,
    '2_6y': 2,
    '6_10y': 6,
    '10_20y': 10,
    '20_plus': 20,
  };
  return p.serviceLength !== '' && min[p.serviceLength] >= years;
};

export const age = (p: Profile) => p.age ?? 0;

export const likely = (...reasons: string[]): MatchResult => ({ strength: 'likely', reasons });
export const possible = (...reasons: string[]): MatchResult => ({ strength: 'possible', reasons });

/** Downgrade a likely match to "possible" when the discharge needs a VA review. */
export const withDischargeCaveat = (p: Profile, r: MatchResult): MatchResult => {
  if (!uncertainDischarge(p) || isServing(p)) return r;
  return {
    strength: 'possible' as Strength,
    reasons: [
      ...r.reasons,
      'Your discharge type may require a VA "character of discharge" review — you can still apply.',
    ],
  };
};

export const ratingText = (p: Profile) =>
  p.rating === null ? '' : p.tdiu && p.rating < 100 ? `${p.rating}% rating (paid at 100% via TDIU)` : `${p.rating}% VA rating`;

/**
 * 2026 VA disability compensation, veteran alone with no dependents
 * (rates effective Dec 1, 2025 after the 2.8% COLA).
 */
export const COMPENSATION_2026: Record<number, number> = {
  0: 0,
  10: 180.42,
  20: 356.66,
  30: 552.47,
  40: 795.84,
  50: 1132.9,
  60: 1435.02,
  70: 1808.45,
  80: 2102.15,
  90: 2362.3,
  100: 3938.58,
};

export const estimatedCompensation = (p: Profile): number | null => {
  if (p.rating === null) return null;
  if (p.tdiu) return COMPENSATION_2026[100];
  return COMPENSATION_2026[p.rating] ?? null;
};
