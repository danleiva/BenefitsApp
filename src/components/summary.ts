import {
  BRANCH_OPTIONS,
  DISCHARGE_OPTIONS,
  labelFor,
  MARITAL_OPTIONS,
  STATE_OPTIONS,
  STATUS_OPTIONS,
} from '../data/options';
import { ratingText } from '../engine/rules';
import type { Profile } from '../types';

/** Short human-readable facts about the profile, for chips and the printed report. */
export function profileFacts(p: Profile): string[] {
  const kids = p.kidsUnder18 + p.kidsInSchool;
  return [
    labelFor(STATUS_OPTIONS, p.status),
    labelFor(BRANCH_OPTIONS, p.branch),
    p.status === 'veteran' && p.discharge !== 'unknown' ? `${labelFor(DISCHARGE_OPTIONS, p.discharge)} discharge` : '',
    p.rating !== null ? ratingText(p) + (p.permanentAndTotal ? ' (P&T)' : '') : 'No VA rating',
    p.marital ? labelFor(MARITAL_OPTIONS, p.marital) : '',
    kids > 0 ? `${kids} ${kids === 1 ? 'child' : 'children'}` : '',
    p.age ? `Age ${p.age}` : '',
    labelFor(STATE_OPTIONS, p.state),
  ].filter(Boolean);
}
