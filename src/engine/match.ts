import { federalBenefits } from '../data/federal';
import { stateByCode } from '../data/states';
import { survivorBenefits } from '../data/survivors';
import type { Criteria, StateBenefitSpec, StateInfo } from '../data/stateTypes';
import type { Benefit, Category, MatchedBenefit, MatchResult, Profile } from '../types';
import {
  barredDischarge,
  deathUnclear,
  familyBenefitDeath,
  hasDependents,
  isSurvivor,
  isRetiree,
  isServing,
  isVeteran,
  lowIncome,
  ratingText,
  totallyDisabled,
  wartime,
  withDischargeCaveat,
} from './rules';

/** Evaluate declarative state criteria. Hard requirements return null; soft unknowns downgrade to "possible". */
export function evaluateCriteria(p: Profile, c: Criteria): MatchResult | null {
  if (barredDischarge(p)) return null;
  if (isSurvivor(p)) return evaluateSurvivorCriteria(p, c);
  const reasons: string[] = [];
  let soft = false;

  if (c.minRating !== undefined) {
    if (p.rating === null || p.rating < c.minRating) {
      // A 100%-via-TDIU veteran satisfies any rating threshold for most state programs.
      if (!(p.tdiu && c.minRating <= 100)) return null;
    }
    reasons.push(`You have a ${ratingText(p)}.`);
  }
  if (c.total) {
    if (!totallyDisabled(p)) return null;
    if (c.minRating === undefined) reasons.push(`You have a ${ratingText(p)}.`);
  }
  if (c.pt && !p.permanentAndTotal) {
    soft = true;
    reasons.push('Requires a permanent and total (P&T) rating.');
  }
  if (c.veteran && !isVeteran(p)) return null;
  if (c.serving && !isServing(p)) return null;
  if (c.guard && p.status !== 'guard_reserve') return null;
  if (c.wartime) {
    if (p.eras.length === 0) soft = true;
    else if (!wartime(p)) return null;
    else reasons.push('You served during a wartime period.');
  }
  if (c.combat && !p.combat) return null;
  if (c.purpleHeart && !p.purpleHeart) return null;
  if (c.dependents) {
    if (!hasDependents(p)) return null;
    reasons.push('This benefit is for your spouse and/or children.');
  }
  if (c.minAge !== undefined && (p.age ?? 0) < c.minAge) return null;
  if (c.homeowner) {
    if (p.housing === 'own') reasons.push('You own your home.');
    else if (p.housing === 'buying' || p.housing === '') {
      soft = true;
      reasons.push('Applies once you own a home in this state.');
    } else return null;
  }
  if (c.education) {
    if (p.wantsEducation) reasons.push('You are interested in school or training.');
    else soft = true;
  }
  if (c.lowIncome) {
    if (lowIncome(p)) reasons.push('Your household income may fall within program limits.');
    else if (p.income === 'prefer_not' || p.income === '') soft = true;
    else return null;
  }

  // Benefits with no specific criteria other than "veteran" are general — treat as possible.
  if (reasons.length === 0) soft = true;
  const result: MatchResult = { strength: soft ? 'possible' : 'likely', reasons };
  return withDischargeCaveat(p, result);
}

/**
 * Surviving spouses qualify for state programs aimed at a veteran's dependents, and for programs
 * (mostly property tax relief) that the state extends to unremarried surviving spouses. State rules
 * vary widely, so these are always "possible" matches.
 */
function evaluateSurvivorCriteria(p: Profile, c: Criteria): MatchResult | null {
  if (!c.dependents && !c.survivor) return null;
  if (c.serving || c.guard || c.combat || c.purpleHeart) return null;
  const ratingRule = c.minRating !== undefined || c.total || c.pt;
  if (ratingRule && !familyBenefitDeath(p) && !deathUnclear(p)) return null;

  const reasons: string[] = [];
  if (c.survivor) {
    if (p.remarriage !== 'no') return null;
    reasons.push('This state extends the benefit to unremarried surviving spouses.');
  } else {
    reasons.push('Programs for a veteran’s dependents often include surviving spouses and children.');
  }
  if (c.homeowner) {
    if (p.housing !== 'own' && p.housing !== 'buying' && p.housing !== '') return null;
    if (p.housing === 'own') reasons.push('You own your home.');
  }
  if (c.wartime && p.eras.length > 0 && !wartime(p)) return null;
  if (ratingRule)
    reasons.push(
      familyBenefitDeath(p)
        ? 'Eligibility depends on your spouse’s rating or a service-connected death.'
        : 'Depends on your spouse’s VA rating or whether the death was service-connected.',
    );
  return withDischargeCaveat(p, { strength: 'possible', reasons });
}

const stateAgencyLink = (s: StateInfo) => ({ label: s.agency, url: s.url });

function specToBenefit(s: StateInfo, spec: StateBenefitSpec): Benefit {
  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    level: 'state',
    agency: `State of ${s.name}`,
    summary: spec.summary,
    whatYouGet: [spec.summary, ...(spec.details ?? [])],
    eligibility: [spec.eligibility],
    howToApply: [
      `Confirm current eligibility rules and amounts with the ${s.agency}.`,
      'Contact your county or local veterans service officer (free) for help with the application.',
      'Have your DD-214 and VA benefit summary letter (download from VA.gov) ready.',
    ],
    documents: ['DD-214', 'VA benefit summary / rating decision letter', 'Proof of state residency'],
    links: [...(spec.url ? [{ label: 'Program details', url: spec.url }] : []), stateAgencyLink(s)],
    priority: spec.category === 'financial' ? 66 : spec.category === 'education' ? 64 : 50,
    match: (p) => evaluateCriteria(p, spec.who),
  };
}

const TAX_LABEL = {
  none: 'No state income tax',
  full: 'Military retirement pay exempt',
  partial: 'Military retirement pay partially exempt',
  taxed: 'Military retirement pay taxed',
} as const;

/** Benefits generated for every state from shared templates. */
function genericStateBenefits(s: StateInfo): Benefit[] {
  const agency = `State of ${s.name}`;
  return [
    {
      id: `${s.code.toLowerCase()}-retirement-tax`,
      name: `${s.name} Tax on Military Retirement: ${TAX_LABEL[s.retirementTax.status]}`,
      category: 'financial',
      level: 'state',
      agency,
      summary: s.retirementTax.note,
      whatYouGet: [
        s.retirementTax.note,
        'VA disability compensation is tax-free at both the federal and state level in every state.',
      ],
      eligibility: ['Military retirees, and in many states survivors receiving SBP annuities, who are residents of this state.'],
      howToApply: [
        'Claim the exemption or subtraction on your state income tax return.',
        'Use your 1099-R from DFAS (available on myPay).',
        'Rules change often — confirm with the state revenue department or a free MilTax consultant.',
      ],
      links: [stateAgencyLink(s), { label: 'Free MilTax help', url: 'https://www.militaryonesource.mil/financial-legal/taxes/miltax-military-tax-services/' }],
      priority: 64,
      match: (p) => {
        if (isRetiree(p)) return { strength: 'likely', reasons: ['You receive (or will receive) military retired pay.'] };
        if (isServing(p) && p.separatingSoon) return { strength: 'possible', reasons: ['Useful when deciding where to live in retirement.'] };
        if (isSurvivor(p) && (p.veteranWasRetiree || p.deathCause === 'in_service'))
          return { strength: 'possible', reasons: ['Many states tax Survivor Benefit Plan (SBP) annuities the same way as military retired pay.'] };
        return null;
      },
    },
    {
      id: `${s.code.toLowerCase()}-state-office`,
      name: `${s.name} Veterans Services & County Veterans Service Officers`,
      category: 'transition',
      level: 'state',
      agency,
      summary: `The ${s.agency} and county veterans service officers help you file VA claims for free and connect you to state-only programs.`,
      whatYouGet: [
        'Free, accredited help filing VA disability, pension, and survivor claims.',
        'Information on state veterans homes, cemeteries, license plates, and emergency assistance.',
      ],
      eligibility: ['Veterans, service members, and their families.'],
      howToApply: ['Visit the state agency website to find your nearest office or county veterans service officer.', 'Bring your DD-214 and any VA letters.'],
      links: [stateAgencyLink(s), { label: 'Find a VA-accredited representative', url: 'https://www.va.gov/get-help-from-accredited-representative/find-rep/' }],
      priority: 68,
      match: () => ({ strength: 'likely', reasons: [`You live in ${s.name}.`] }),
    },
    {
      id: `${s.code.toLowerCase()}-survivors`,
      name: `${s.name} Benefits for Surviving Spouses`,
      category: 'family',
      level: 'state',
      agency,
      summary: `Many states, including ${s.name}, extend property tax relief, tuition waivers, license and fee discounts, and burial in state veterans cemeteries to surviving spouses and children.`,
      whatYouGet: [
        'Continued property tax relief in many states if you do not remarry.',
        'State tuition programs for children (and sometimes spouses) of veterans who died from service.',
        'Free help applying for federal survivor benefits (DIC, pension, CHAMPVA) from state and county veterans service officers.',
      ],
      eligibility: ['Usually requires that you have not remarried and that the veteran was a state resident; many programs require a service-connected death or a 100% rating.'],
      howToApply: [
        `Contact the ${s.agency} or your county veterans service officer and ask specifically about surviving spouse benefits.`,
        "Bring the death certificate, marriage certificate, and the veteran's DD-214 and VA letters.",
      ],
      documents: ["Veteran's death certificate", 'Marriage certificate', "Veteran's DD-214", 'VA rating or DIC award letter'],
      links: [stateAgencyLink(s)],
      priority: 67,
      match: (p) => (isSurvivor(p) ? { strength: 'possible', reasons: [`You are a surviving spouse living in ${s.name}.`] } : null),
    },
    {
      id: `${s.code.toLowerCase()}-license`,
      name: 'Veteran Designation on Driver’s License & Specialty Plates',
      category: 'recreation',
      level: 'state',
      agency,
      summary: `Add a “Veteran” designation to your ${s.name} driver’s license or ID, and check for free or reduced-fee veteran and disabled-veteran license plates.`,
      whatYouGet: ['Easy proof of veteran status for discounts and benefits.', 'Disabled-veteran plates may include free registration or parking privileges.'],
      eligibility: ['Veterans with an honorable discharge (plate rules vary by state and rating).'],
      howToApply: ['Bring your DD-214 to the DMV/MVA when you renew or replace your license.'],
      links: [stateAgencyLink(s)],
      priority: 28,
      match: (p) => (isVeteran(p) && !barredDischarge(p) ? { strength: 'possible', reasons: ['Available to most veterans in every state.'] } : null),
    },
    {
      id: `${s.code.toLowerCase()}-outdoors`,
      name: 'Hunting, Fishing & State Park Discounts',
      category: 'recreation',
      level: 'state',
      agency,
      summary: `Many states, including ${s.name}, offer free or discounted hunting/fishing licenses and state park access for disabled veterans and some active-duty members.`,
      whatYouGet: ['Free or reduced-cost licenses and park passes (rules vary).'],
      eligibility: ['Usually requires state residency and a qualifying disability rating.'],
      howToApply: ['Check your state wildlife/parks agency or ask the state veterans office.'],
      links: [stateAgencyLink(s)],
      priority: 20,
      match: (p) => (p.rating !== null || isServing(p) ? { strength: 'possible', reasons: ['Your service or rating may qualify you for discounts.'] } : null),
    },
  ];
}

export function stateBenefits(code: string): Benefit[] {
  const s = stateByCode(code);
  if (!s) return [];
  return [...s.benefits.map((spec) => specToBenefit(s, spec)), ...genericStateBenefits(s)];
}

export function allBenefitsFor(p: Profile): Benefit[] {
  return [...federalBenefits, ...survivorBenefits, ...stateBenefits(p.state)];
}

export function matchBenefits(p: Profile): MatchedBenefit[] {
  const out: MatchedBenefit[] = [];
  for (const benefit of allBenefitsFor(p)) {
    const result = benefit.match(p);
    if (result) out.push({ benefit, result });
  }
  return out.sort((a, b) => {
    if (a.result.strength !== b.result.strength) return a.result.strength === 'likely' ? -1 : 1;
    return b.benefit.priority - a.benefit.priority;
  });
}

/** The most important next steps: highest-priority likely matches. */
export function topActions(matches: MatchedBenefit[], n = 4): MatchedBenefit[] {
  return matches
    .filter((m) => m.result.strength === 'likely')
    .sort((a, b) => b.benefit.priority - a.benefit.priority)
    .slice(0, n);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  disability: 'Disability & Compensation',
  health: 'Health Care',
  education: 'Education & Training',
  housing: 'Housing & Home Loans',
  employment: 'Employment',
  financial: 'Financial & Tax',
  insurance: 'Life Insurance',
  family: 'Family & Dependents',
  transition: 'Transition & Support',
  recreation: 'Recreation, ID & Discounts',
  memorial: 'Burial & Memorial',
};

export const CATEGORY_ORDER: Category[] = [
  'disability',
  'health',
  'financial',
  'education',
  'employment',
  'housing',
  'family',
  'transition',
  'insurance',
  'recreation',
  'memorial',
];
