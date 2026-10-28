import type { Benefit } from '../types';
import {
  age,
  barredDischarge,
  deathUnclear,
  hasKids,
  isSurvivor,
  likely,
  lowIncome,
  possible,
  serviceConnectedDeath,
  wartime,
  withDischargeCaveat,
} from '../engine/rules';

const VA_PHONE = '1-800-827-1000';
const DEATH_CERT = "Veteran's death certificate";
const MARRIAGE = 'Marriage certificate';
const DD214 = "Veteran's DD-214 or other separation documents";
const FIND_REP = { label: 'Find a free accredited VSO representative', url: 'https://www.va.gov/get-help-from-accredited-representative/find-rep/' };

/** Federal benefits for surviving spouses (and, through them, surviving children). */
export const survivorBenefits: Benefit[] = [
  {
    id: 'dic',
    name: 'Dependency and Indemnity Compensation (DIC)',
    category: 'family',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Tax-free monthly payments to surviving spouses and children of service members who died in the line of duty or veterans who died from a service-connected condition.',
    whatYouGet: [
      'Tax-free monthly payment — the 2026 base rate is $1,699.36 for a surviving spouse.',
      'About $421 more per month for each child under 18, plus extra if the veteran was rated totally disabled for 8 years before death, or if you need Aid & Attendance.',
      'Payments are no longer reduced by Survivor Benefit Plan (SBP) annuities.',
    ],
    eligibility: [
      'The service member died in the line of duty, OR the veteran died from a service-connected illness or injury (including PACT Act presumptive conditions), OR the veteran was rated totally disabled for 10+ years before death (5+ years after discharge, or 1+ year for former POWs).',
      'You were married to the veteran and lived with them continuously (or separation was not your fault), and were married at least 1 year, had a child together, or married within 15 years of discharge.',
      'You have not remarried, or you remarried at age 55 or older (after Dec 16, 2003).',
    ],
    howToApply: [
      'If the service member died on active duty, your Casualty Assistance Officer will help you file — DIC is often started automatically.',
      'Otherwise, file VA Form 21P-534EZ (this one form also applies for Survivors Pension and accrued benefits). File within 1 year of death to receive payments back to the date of death.',
      'If the veteran had a condition that is now presumptive under the PACT Act, include it — even if VA denied it before.',
      'Get free help from an accredited VSO or your state veterans office.',
    ],
    documents: [DEATH_CERT, MARRIAGE, DD214, "Children's birth certificates", "Veteran's medical records (if death was from an illness)"],
    forms: ['VA Form 21P-534EZ'],
    phone: VA_PHONE,
    links: [
      { label: 'Apply for DIC', url: 'https://www.va.gov/family-and-caregiver-benefits/survivor-compensation/dependency-indemnity-compensation/' },
      { label: 'DIC rates', url: 'https://www.va.gov/family-and-caregiver-benefits/survivor-compensation/dependency-indemnity-compensation/survivor-rates/' },
      { label: 'The PACT Act and survivors', url: 'https://www.va.gov/resources/the-pact-act-and-your-va-benefits/' },
      FIND_REP,
    ],
    priority: 105,
    match: (p) => {
      if (!isSurvivor(p) || barredDischarge(p)) return null;
      if (p.remarriage === 'before55') return possible('Remarriage before 55 ends DIC — but it can be restored if that marriage ends by death or divorce.');
      if (serviceConnectedDeath(p))
        return withDischargeCaveat(p, likely(p.deathCause === 'in_service' ? 'Your spouse died in the line of duty.' : 'Your spouse died from a service-connected condition.'));
      if (p.deathCause === 'rated_total') return possible('DIC is payable if your spouse was rated totally disabled for at least 10 years before death.');
      if (p.exposures.length) return possible('Your spouse had a toxic exposure — deaths from PACT Act presumptive conditions qualify for DIC.');
      if (deathUnclear(p)) return possible('If the death is linked to service, you qualify. A VSO can help review the death certificate and records.');
      return null;
    },
  },
  {
    id: 'survivors-pension',
    name: 'Survivors Pension',
    category: 'financial',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Tax-free monthly payments for low-income, unremarried surviving spouses and children of wartime veterans.',
    whatYouGet: ['Monthly payment that brings household income up to a VA-set level.', 'Higher amounts with Aid & Attendance or housebound status.'],
    eligibility: [
      'The veteran had a discharge other than dishonorable and served at least 1 day during a wartime period (generally 90 days of active duty; 24 months if entered after Sept 7, 1980).',
      'You have not remarried.',
      'Your income and net worth are below VA limits.',
    ],
    howToApply: ['Apply with VA Form 21P-534EZ (the same form as DIC) online or by mail.', 'For Aid & Attendance, add VA Form 21-2680 completed by a doctor.'],
    documents: [DEATH_CERT, MARRIAGE, DD214, 'Income and asset information'],
    forms: ['VA Form 21P-534EZ', 'VA Form 21-2680'],
    phone: VA_PHONE,
    links: [{ label: 'Survivors Pension', url: 'https://www.va.gov/family-and-caregiver-benefits/survivor-compensation/survivors-pension/' }, FIND_REP],
    priority: 72,
    match: (p) => {
      if (!isSurvivor(p) || p.remarriage !== 'no' || barredDischarge(p) || !wartime(p)) return null;
      if (lowIncome(p)) return withDischargeCaveat(p, likely('Your spouse served during wartime and your household income may be within limits.'));
      if (p.income === 'prefer_not' || p.income === '') return possible('Depends on household income and net worth.');
      return null;
    },
  },
  {
    id: 'fry-scholarship',
    name: 'Marine Gunnery Sgt. John David Fry Scholarship',
    category: 'education',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Full Post-9/11 GI Bill benefits for spouses and children of service members who died in the line of duty after Sept 10, 2001.',
    whatYouGet: ['Up to 36 months of tuition and fees, a monthly housing allowance, and a books stipend.', 'Children may also get Yellow Ribbon help.'],
    eligibility: [
      'Spouse or child of a service member who died in the line of duty on or after Sept 11, 2001 (including Selected Reserve members who died from a service-connected disability).',
      'Spouses whose service member died on or after Jan 1, 2013 have no time limit; children may use it from age 18 (or high school graduation) to 33.',
    ],
    howToApply: ['Apply online with VA Form 22-5490.', 'If you also qualify for DEA, compare carefully — in some cases you must choose one.'],
    forms: ['VA Form 22-5490'],
    phone: '1-888-442-4551',
    links: [{ label: 'Fry Scholarship', url: 'https://www.va.gov/education/survivor-dependent-benefits/fry-scholarship/' }],
    priority: 84,
    match: (p) => {
      if (!isSurvivor(p) || p.deathCause !== 'in_service') return null;
      if (!p.eras.includes('post911')) return p.eras.length === 0 ? possible('Applies if your spouse died in the line of duty after Sept 10, 2001.') : null;
      return p.wantsEducation || hasKids(p)
        ? likely('Your spouse died in the line of duty after 9/11 — you and your children may use the Fry Scholarship.')
        : possible('Your spouse died in the line of duty after 9/11.');
    },
  },
  {
    id: 'sbp-annuity',
    name: 'Survivor Benefit Plan (SBP) Annuity',
    category: 'financial',
    level: 'federal',
    agency: 'DFAS',
    summary: 'A monthly annuity from your spouse\'s military retired pay — automatic for active-duty deaths and paid if the retiree enrolled in SBP.',
    whatYouGet: [
      'Up to 55% of the retiree\'s chosen base amount, paid monthly for life (taxable).',
      'Since 2023, SBP is no longer reduced by DIC (the "widow\'s tax" has ended).',
    ],
    eligibility: [
      'Surviving spouse of a retiree who elected SBP, or of a service member who died on active duty (coverage is automatic).',
      'Remarrying before age 55 suspends the annuity.',
    ],
    howToApply: [
      'Notify DFAS of the death (800-321-1080) to stop retired pay and start the annuity.',
      'Submit DD Form 2656-7 with the death certificate and marriage certificate.',
    ],
    documents: [DEATH_CERT, MARRIAGE],
    forms: ['DD Form 2656-7'],
    phone: '1-800-321-1080',
    links: [{ label: 'SBP for survivors (DFAS)', url: 'https://www.dfas.mil/RetiredMilitary/survivors/' }],
    priority: 90,
    match: (p) => {
      if (!isSurvivor(p)) return null;
      if (p.deathCause === 'in_service') return likely('SBP coverage is automatic when a service member dies on active duty.');
      if (p.veteranWasRetiree)
        return p.remarriage === 'before55'
          ? possible('Remarriage before 55 suspends SBP — it can resume if that marriage ends.')
          : likely('Your spouse was a military retiree — if they elected SBP, you receive a monthly annuity.');
      return null;
    },
  },
  {
    id: 'death-gratuity-sgli',
    name: 'Death Gratuity & SGLI Life Insurance Payment',
    category: 'insurance',
    level: 'federal',
    agency: 'Department of Defense / Department of Veterans Affairs',
    summary: 'A $100,000 tax-free death gratuity plus SGLI life insurance (up to $500,000) for survivors of service members who die on active duty.',
    whatYouGet: ['$100,000 death gratuity, usually paid within days.', 'SGLI payout to named beneficiaries; VGLI if the veteran converted coverage after leaving service.'],
    eligibility: ['Survivors of service members who died on active duty or in certain Reserve/Guard duty statuses; beneficiaries named on SGLI/VGLI.'],
    howToApply: ['Your Casualty Assistance Officer files the death gratuity and SGLI claims with you.', 'For VGLI, file a claim with the Office of Servicemembers\' Group Life Insurance (OSGLI): 800-419-1473.'],
    documents: [DEATH_CERT, MARRIAGE],
    phone: '1-800-419-1473',
    links: [
      { label: 'SGLI', url: 'https://www.va.gov/life-insurance/options-eligibility/sgli/' },
      { label: 'VGLI', url: 'https://www.va.gov/life-insurance/options-eligibility/vgli/' },
    ],
    priority: 70,
    match: (p) => {
      if (!isSurvivor(p)) return null;
      if (p.deathCause === 'in_service') return likely('Your spouse died while serving.');
      return possible('If your spouse kept VGLI or VALife coverage after service, you may be a beneficiary.');
    },
  },
  {
    id: 'survivor-burial',
    name: 'Burial Allowance, Headstone & Memorial Items',
    category: 'memorial',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Help with burial and funeral costs, a free headstone or marker, burial flag, and a Presidential Memorial Certificate.',
    whatYouGet: [
      'Burial allowance and plot allowance (higher for service-connected deaths).',
      'Free burial in a VA national cemetery with a headstone, and a burial flag.',
      'Presidential Memorial Certificate; you can also be buried with your spouse in a national cemetery.',
    ],
    eligibility: ['Survivors of veterans with a discharge other than dishonorable. Non-service-connected burial allowance claims must be filed within 2 years of burial.'],
    howToApply: [
      'To schedule a burial in a national cemetery, call the National Cemetery Scheduling Office at 800-535-1117.',
      'File VA Form 21P-530EZ for the burial allowance (VA often pays automatically to surviving spouses on record).',
      'Order a headstone with VA Form 40-1330 and a memorial certificate with VA Form 40-0247.',
    ],
    documents: [DEATH_CERT, DD214, 'Funeral and burial receipts'],
    forms: ['VA Form 21P-530EZ', 'VA Form 40-1330', 'VA Form 40-0247'],
    phone: '1-800-535-1117',
    links: [
      { label: 'Burial allowance', url: 'https://www.va.gov/burials-memorials/veterans-burial-allowance/' },
      { label: 'Burials & memorials', url: 'https://www.va.gov/burials-memorials/' },
    ],
    priority: 66,
    match: (p) => {
      if (!isSurvivor(p) || barredDischarge(p)) return null;
      return withDischargeCaveat(p, serviceConnectedDeath(p) ? likely('Service-connected deaths qualify for a higher burial allowance.') : possible('Available for most veterans; file within 2 years of burial.'));
    },
  },
  {
    id: 'grief-support',
    name: 'Grief Support & Bereavement Counseling',
    category: 'family',
    level: 'federal',
    agency: 'VA Vet Centers / Military OneSource / TAPS',
    summary: 'Free, confidential grief counseling for military and veteran families, including peer support through TAPS (24/7).',
    whatYouGet: [
      'Vet Center bereavement counseling for families of service members who died while serving (including Guard/Reserve on orders).',
      'Military OneSource counseling and survivor support.',
      'TAPS (Tragedy Assistance Program for Survivors): 24/7 helpline, peer mentors, and casework — free for anyone grieving a military or veteran loss.',
    ],
    eligibility: ['Surviving family members; eligibility varies by program, and TAPS serves anyone grieving a military or veteran loss.'],
    howToApply: ['Call the Vet Center Call Center at 877-927-8387 or visit a local Vet Center.', 'Call the TAPS helpline any time at 800-959-8277.'],
    phone: '1-800-959-8277',
    links: [
      { label: 'Find a Vet Center', url: 'https://www.va.gov/find-locations/?facilityType=vet_center' },
      { label: 'TAPS', url: 'https://www.taps.org/' },
      { label: 'Military OneSource survivor support', url: 'https://www.militaryonesource.mil/' },
    ],
    priority: 88,
    match: (p) => (isSurvivor(p) ? likely('Support is available to you and your children.') : null),
  },
  {
    id: 'derived-preference',
    name: "Federal Hiring: Derived Veterans' Preference",
    category: 'employment',
    level: 'federal',
    agency: 'Office of Personnel Management',
    summary: "Unremarried surviving spouses of certain veterans can claim 10-point veterans' preference for federal jobs.",
    whatYouGet: ["10-point derived preference on USAJOBS applications."],
    eligibility: ['Unremarried widow(er) of a veteran who served during a war or qualifying campaign, or who died while on active duty (not under dishonorable conditions).'],
    howToApply: ['Submit SF-15 with proof of the veteran\'s service, the death certificate, and your marriage certificate when applying on USAJOBS.'],
    documents: [DEATH_CERT, MARRIAGE, DD214],
    forms: ['SF-15'],
    links: [
      { label: 'FedsHireVets: derived preference', url: 'https://www.fedshirevets.gov/' },
      { label: 'USAJOBS', url: 'https://www.usajobs.gov/' },
    ],
    priority: 50,
    match: (p) => {
      if (!isSurvivor(p) || p.remarriage !== 'no' || barredDischarge(p)) return null;
      if (!(wartime(p) || p.deathCause === 'in_service')) return null;
      return p.employment === 'unemployed' ? likely('You are looking for work and may claim derived preference.') : possible('Useful if you apply for federal jobs.');
    },
  },
  {
    id: 'ssa-survivors',
    name: 'Social Security Survivors Benefits',
    category: 'financial',
    level: 'federal',
    agency: 'Social Security Administration',
    summary: 'Monthly payments for widows, widowers, and children based on your spouse\'s work record — including military service credits — plus a one-time $255 payment.',
    whatYouGet: ['Monthly benefits for a surviving spouse caring for a child under 16, or at age 60+ (50+ if disabled).', 'Monthly benefits for children under 18 (19 if in high school).', 'One-time $255 lump-sum death payment.'],
    eligibility: ['Your spouse worked long enough to earn Social Security credits (military service counts). Paid in addition to DIC.'],
    howToApply: ['Call SSA at 800-772-1213 or visit a local office — survivors benefits can\'t be fully claimed online.'],
    documents: [DEATH_CERT, MARRIAGE, "Children's birth certificates", "Spouse's W-2s or tax return for the year of death"],
    phone: '1-800-772-1213',
    links: [{ label: 'SSA survivors benefits', url: 'https://www.ssa.gov/survivor' }],
    priority: 74,
    match: (p) => {
      if (!isSurvivor(p)) return null;
      if (p.kidsUnder18 > 0) return likely('You have children under 18.');
      if (age(p) >= 60) return likely('You are 60 or older.');
      return possible('Survivors benefits begin at age 60, or earlier if you care for a young child or are disabled.');
    },
  },
];
