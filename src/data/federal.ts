import type { Benefit } from '../types';
import {
  age,
  atLeastYears,
  barredDischarge,
  goodDischarge,
  hasDependents,
  hasKids,
  hasRating,
  isActive,
  isGuardReserve,
  isMarried,
  isRetiree,
  isServing,
  isVeteran,
  likely,
  lowIncome,
  possible,
  ratingAtLeast,
  ratingText,
  recentlySeparated,
  totallyDisabled,
  uncertainDischarge,
  wartime,
  withDischargeCaveat,
} from '../engine/rules';

const DD214 = 'DD-214 (Certificate of Release or Discharge from Active Duty) or other separation documents';
const VA_PHONE = '1-800-827-1000';
const FIND_REP = { label: 'Find a free accredited VSO representative', url: 'https://www.va.gov/get-help-from-accredited-representative/find-rep/' };

export const federalBenefits: Benefit[] = [
  // ───────────────────────────── Disability ─────────────────────────────
  {
    id: 'va-disability-compensation',
    name: 'VA Disability Compensation',
    category: 'disability',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Tax-free monthly payments for injuries or illnesses caused or made worse by your military service. Rated from 0% to 100%.',
    whatYouGet: [
      'Tax-free monthly payment based on your combined rating (2026: about $180/mo at 10% up to $3,939/mo at 100% for a veteran alone).',
      'Additional pay for a spouse, children, and dependent parents if rated 30% or higher.',
      'A rating also unlocks many other federal and state benefits (health care priority, property tax breaks, VR&E, and more).',
    ],
    eligibility: [
      'A current illness or injury that affects your mind or body, AND',
      'Served on active duty, active duty for training, or inactive duty training, AND',
      'The condition is linked to service (or made worse by it). A discharge other than dishonorable is required.',
    ],
    howToApply: [
      'Gather evidence: service treatment records, private medical records, and buddy/lay statements (VA Form 21-10210).',
      'Consider filing an Intent to File (VA Form 21-0966) first — it can lock in an earlier effective date for back pay for up to one year.',
      'File online at VA.gov with VA Form 21-526EZ, by mail, in person at a VA regional office, or with help from a free accredited VSO.',
      'Attend any Compensation & Pension (C&P) exams VA schedules.',
      'Track your claim on VA.gov. If you disagree with the decision, you can request a Higher-Level Review, file a Supplemental Claim, or appeal to the Board.',
    ],
    documents: [DD214, 'Service treatment records', 'Private medical records', 'Buddy/lay statements'],
    forms: ['VA Form 21-526EZ', 'VA Form 21-0966 (Intent to File)'],
    phone: VA_PHONE,
    links: [
      { label: 'File a disability claim', url: 'https://www.va.gov/disability/how-to-file-claim/' },
      { label: 'Eligibility', url: 'https://www.va.gov/disability/eligibility/' },
      { label: 'Current compensation rates', url: 'https://www.va.gov/disability/compensation-rates/veteran-rates/' },
      { label: 'Check your claim status', url: 'https://www.va.gov/claim-or-appeal-status/' },
      FIND_REP,
    ],
    priority: 100,
    match: (p) => {
      if (isActive(p)) return null; // active duty sees BDD instead
      if (barredDischarge(p)) return null;
      if (hasRating(p)) {
        const r = likely(`You have a ${ratingText(p)}.`);
        r.reasons.push(
          p.unratedConditions
            ? 'You noted conditions that are not yet rated — you can file for an increase or new conditions.'
            : 'If your conditions have worsened, you can file for an increased rating.',
        );
        return r;
      }
      if (p.claimPending) return likely('You have a claim in progress — track it and respond quickly to any VA requests.');
      if (p.unratedConditions || p.combat || p.exposures.length > 0 || p.purpleHeart) {
        const reasons: string[] = [];
        if (p.unratedConditions) reasons.push('You have health conditions you believe are connected to service.');
        if (p.exposures.length) reasons.push('You reported a toxic exposure — many related conditions are "presumptive" under the PACT Act.');
        if (p.combat) reasons.push('Combat veterans have relaxed evidence rules for injuries incurred in combat.');
        if (p.purpleHeart) reasons.push('You are a Purple Heart recipient.');
        return withDischargeCaveat(p, likely(...reasons));
      }
      if (isVeteran(p) || isGuardReserve(p))
        return withDischargeCaveat(p, possible('Any condition linked to service — even minor ones like tinnitus or back pain — can qualify.'));
      return null;
    },
  },
  {
    id: 'bdd',
    name: 'Benefits Delivery at Discharge (BDD) — file before you separate',
    category: 'disability',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Active-duty members can file a disability claim 180–90 days before separation so compensation can start soon after discharge.',
    whatYouGet: [
      'A disability decision as soon as possible after separation — often within weeks.',
      'Exams done while still on active duty, near your installation.',
    ],
    eligibility: [
      'Currently on full-time active duty (including Guard/Reserve on Title 10 orders).',
      'Known separation date 180–90 days in the future.',
      'Available for VA exams during the 45 days after you file.',
    ],
    howToApply: [
      'Within 180–90 days of separation, file VA Form 21-526EZ on VA.gov and mark it as a BDD claim.',
      'Upload your service treatment records (or a copy from your medical unit).',
      'Fewer than 90 days left? You can still file a pre-discharge claim, it just isn\'t BDD.',
    ],
    documents: ['Service treatment records', 'Separation orders'],
    forms: ['VA Form 21-526EZ'],
    phone: VA_PHONE,
    links: [
      { label: 'Pre-discharge (BDD) claims', url: 'https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/' },
      { label: 'Transition Assistance Program', url: 'https://www.dodtap.mil/' },
    ],
    priority: 95,
    match: (p) => {
      if (!isActive(p) && !isGuardReserve(p)) return null;
      if (p.separatingSoon) return likely('You plan to separate or retire within the next year.');
      if (isActive(p)) return possible('Useful when you get within 180 days of separation or retirement.');
      return null;
    },
  },
  {
    id: 'pact-act',
    name: 'PACT Act Toxic Exposure Benefits & Screening',
    category: 'disability',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'The PACT Act added 20+ presumptive conditions for burn pits, Agent Orange, Gulf War, and radiation exposure — no need to prove the link to service.',
    whatYouGet: [
      'Presumptive service connection for many cancers and respiratory illnesses.',
      'A free toxic exposure screening at any VA health facility.',
      'Expanded VA health care eligibility for exposed veterans.',
    ],
    eligibility: [
      'Burn pits / post-9/11: served in Iraq, Afghanistan, Syria, Djibouti, Lebanon, Uzbekistan, Yemen, and other listed locations on or after Aug 2, 1990 (Gulf War) or Sept 11, 2001.',
      'Agent Orange: Vietnam, Thailand bases, Laos, Cambodia, Guam/American Samoa, Johnston Atoll (specific dates).',
      'Radiation: Enewetak Atoll cleanup, Palomares, Hiroshima/Nagasaki, nuclear testing, and other listed events.',
      'Camp Lejeune: 30+ days at Camp Lejeune or MCAS New River, Aug 1953 – Dec 1987.',
    ],
    howToApply: [
      'Ask for a toxic exposure screening at your VA facility or primary care appointment.',
      'File a disability claim (VA Form 21-526EZ) listing the presumptive condition and where you served.',
      'If VA previously denied a now-presumptive condition, file a Supplemental Claim (VA Form 20-0995).',
    ],
    forms: ['VA Form 21-526EZ', 'VA Form 20-0995'],
    phone: VA_PHONE,
    links: [
      { label: 'The PACT Act and your VA benefits', url: 'https://www.va.gov/resources/the-pact-act-and-your-va-benefits/' },
      { label: 'File a claim', url: 'https://www.va.gov/disability/how-to-file-claim/' },
    ],
    priority: 90,
    match: (p) => {
      if (barredDischarge(p)) return null;
      if (p.exposures.length)
        return withDischargeCaveat(p, likely('You reported a possible toxic exposure during service.'));
      if (p.eras.includes('post911') || p.eras.includes('gulf_war') || p.eras.includes('vietnam'))
        return possible('Veterans of your service era are often covered by PACT Act presumptions depending on where they served.');
      return null;
    },
  },
  {
    id: 'tdiu',
    name: 'Individual Unemployability (TDIU)',
    category: 'disability',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Pays compensation at the 100% rate if your service-connected conditions keep you from holding a steady job, even if your rating is below 100%.',
    whatYouGet: ['Monthly compensation at the 100% rate (about $3,939/mo in 2026 for a veteran alone).'],
    eligibility: [
      'At least one condition rated 60%+, OR a combined 70%+ with at least one condition at 40%+, AND',
      'Unable to maintain substantially gainful employment (marginal/odd jobs are allowed).',
      'Exceptions may be considered on an extra-schedular basis.',
    ],
    howToApply: [
      'File VA Form 21-8940 along with a disability claim (21-526EZ) on VA.gov or by mail.',
      'VA may send VA Form 21-4192 to your recent employers.',
    ],
    forms: ['VA Form 21-8940', 'VA Form 21-526EZ'],
    phone: VA_PHONE,
    links: [{ label: 'Individual Unemployability', url: 'https://www.va.gov/disability/eligibility/special-claims/unemployability/' }, FIND_REP],
    priority: 85,
    match: (p) => {
      if (p.tdiu || p.rating === 100) return null;
      if (!ratingAtLeast(p, 60)) return null;
      if (p.employment === 'unemployed' || p.employment === 'unable')
        return likely(`You have a ${ratingText(p)} and are not currently working.`);
      return possible(`With a ${ratingText(p)}, you may qualify if your conditions keep you from working.`);
    },
  },
  {
    id: 'add-dependents',
    name: 'Add Dependents to Your VA Compensation',
    category: 'disability',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Veterans rated 30% or higher get extra monthly compensation for a spouse, children, and dependent parents — but only after you add them.',
    whatYouGet: [
      'Higher monthly compensation for each eligible dependent.',
      'Extra for children 18–23 in school and for a spouse who needs Aid & Attendance.',
    ],
    eligibility: ['Combined rating of 30% or higher', 'Spouse, unmarried children under 18 (or 18–23 in school), helpless children, or dependent parents'],
    howToApply: [
      'Sign in to VA.gov and use "Add or remove dependents" (VA Form 21-686c).',
      'For children 18–23 in school, also submit VA Form 21-674.',
    ],
    documents: ['Marriage certificate', "Children's birth certificates", 'Social Security numbers'],
    forms: ['VA Form 21-686c', 'VA Form 21-674'],
    phone: VA_PHONE,
    links: [{ label: 'Add or remove dependents', url: 'https://www.va.gov/view-change-dependents/add-remove-form-21-686c/' }],
    priority: 80,
    match: (p) => {
      if (!ratingAtLeast(p, 30) || !hasDependents(p)) return null;
      const who = [isMarried(p) ? 'a spouse' : '', hasKids(p) ? 'children' : ''].filter(Boolean).join(' and ');
      return likely(`You have a ${ratingText(p)} and ${who}. Make sure they are on your award.`);
    },
  },
  {
    id: 'crsc-crdp',
    name: 'CRSC / CRDP — receive retired pay and VA compensation',
    category: 'financial',
    level: 'federal',
    agency: 'DFAS / Your Service Branch',
    summary:
      'Normally military retired pay is reduced by your VA compensation. CRDP and CRSC restore some or all of that offset.',
    whatYouGet: [
      'CRDP: automatic restoration of retired pay for retirees rated 50%+ with 20+ years.',
      'CRSC: tax-free payment for combat-related disabilities (10%+), including medical retirees with fewer than 20 years.',
    ],
    eligibility: [
      'CRDP: 20+ years (or TERA/Reserve retirement), VA rating 50% or higher. Enrollment is automatic.',
      'CRSC: military retiree with combat-related disabilities (armed conflict, hazardous duty, training simulating war, or an instrumentality of war). Must apply through your branch.',
    ],
    howToApply: [
      'CRDP is automatic — check your retiree account statement on myPay.',
      'For CRSC, submit DD Form 2860 to your branch\'s CRSC office with documentation tying each disability to combat-related events.',
      'You can only receive one at a time; DFAS pays whichever is larger, and you can switch during open season.',
    ],
    forms: ['DD Form 2860 (CRSC)'],
    links: [
      { label: 'CRSC (DFAS)', url: 'https://www.dfas.mil/RetiredMilitary/disability/crsc/' },
      { label: 'CRDP (DFAS)', url: 'https://www.dfas.mil/RetiredMilitary/disability/crdp/' },
    ],
    priority: 75,
    match: (p) => {
      if (!isRetiree(p) || !ratingAtLeast(p, 10)) return null;
      if (ratingAtLeast(p, 50) && atLeastYears(p, 20)) return likely(`You are a 20+ year retiree with a ${ratingText(p)} (CRDP).`);
      if (p.combat || p.purpleHeart || p.status === 'medically_retired')
        return likely(`You are a retiree with a ${ratingText(p)} and combat-related service (CRSC).`);
      return possible(`As a retiree with a ${ratingText(p)}, check whether any conditions are combat-related (CRSC).`);
    },
  },
  {
    id: 'discharge-upgrade',
    name: 'Discharge Upgrade or Character of Discharge Review',
    category: 'disability',
    level: 'federal',
    agency: 'Your Service Branch / Department of Veterans Affairs',
    summary:
      'If your discharge is other than honorable, you may be able to get it upgraded — or VA may still find you eligible for benefits.',
    whatYouGet: [
      'An upgraded discharge opens most VA, education, and state benefits.',
      'Special consideration for PTSD, TBI, military sexual trauma, and sexual orientation-based discharges.',
      'Even without an upgrade, VA can provide emergency mental health care and may grant benefits after a character-of-discharge review.',
    ],
    eligibility: ['Any veteran with a General, Other Than Honorable, Bad Conduct (special court-martial), or uncharacterized discharge.'],
    howToApply: [
      'Use the VA.gov discharge upgrade wizard to find the right board for your branch.',
      'Discharged within 15 years: apply to your branch\'s Discharge Review Board (DD Form 293). Otherwise apply to the Board for Correction of Military/Naval Records (DD Form 149).',
      'Free legal help is often available through law school clinics and VSOs.',
    ],
    forms: ['DD Form 293', 'DD Form 149'],
    links: [
      { label: 'Discharge upgrade instructions', url: 'https://www.va.gov/discharge-upgrade-instructions/' },
      { label: 'VA mental health care (available to OTH veterans)', url: 'https://www.va.gov/health-care/health-needs-conditions/mental-health/' },
      FIND_REP,
    ],
    priority: 98,
    match: (p) => {
      if (!isVeteran(p)) return null;
      if (p.discharge === 'general') return possible('An upgrade to Honorable can unlock the Post-9/11 GI Bill and some state benefits.');
      if (uncertainDischarge(p) && p.discharge !== 'unknown')
        return likely('Your discharge type limits some benefits — an upgrade or VA review may restore them.');
      if (barredDischarge(p)) return likely('A Board for Correction of Military Records review is the main path to restore benefits.');
      return null;
    },
  },

  // ───────────────────────────── Health ─────────────────────────────
  {
    id: 'va-health-care',
    name: 'VA Health Care',
    category: 'health',
    level: 'federal',
    agency: 'Veterans Health Administration',
    summary:
      'Comprehensive medical care at VA facilities and through community providers — primary care, specialists, mental health, prescriptions, and more.',
    whatYouGet: [
      'Primary and specialty care, mental health, prescriptions, hearing aids, and eyeglasses (for many veterans).',
      'Community Care with private doctors when VA can\'t see you in time or you live far from a facility.',
      'Free care for service-connected conditions; many veterans pay no copays at all.',
      'Combat veterans get free care for conditions possibly related to service for several years after discharge.',
    ],
    eligibility: [
      'Served in active military service and were not dishonorably discharged.',
      'Generally 24 continuous months of service or the full period called to active duty (waived for service-connected disabilities, hardship discharges, and others).',
      'Assigned to a priority group based on rating, income, and service history.',
    ],
    howToApply: [
      'Apply online with VA Form 10-10EZ, call 877-222-8387, or visit any VA medical center.',
      'Once enrolled, schedule your first appointment and get a Veteran Health Identification Card (VHIC).',
    ],
    documents: [DD214, 'Health insurance cards', 'Prior year gross household income (for some priority groups)'],
    forms: ['VA Form 10-10EZ'],
    phone: '1-877-222-8387',
    links: [
      { label: 'Apply for VA health care', url: 'https://www.va.gov/health-care/apply-for-health-care-form-10-10ez/' },
      { label: 'Eligibility', url: 'https://www.va.gov/health-care/eligibility/' },
      { label: 'Community Care', url: 'https://www.va.gov/communitycare/' },
    ],
    priority: 96,
    match: (p) => {
      if (isActive(p) || barredDischarge(p)) return null;
      const reasons: string[] = [];
      if (hasRating(p)) reasons.push(`Your ${ratingText(p)} gives you higher priority — care for rated conditions is free.`);
      if (p.combat) reasons.push('Combat veterans receive enhanced eligibility after discharge.');
      if (p.exposures.length) reasons.push('Toxic-exposed veterans have expanded eligibility under the PACT Act.');
      if (lowIncome(p)) reasons.push('Lower household income may qualify you for free or low-cost care.');
      if (isGuardReserve(p)) return possible('Guard/Reserve members who were activated for federal service may qualify.');
      if (reasons.length === 0) reasons.push('Most veterans with an other-than-dishonorable discharge can enroll.');
      return withDischargeCaveat(p, likely(...reasons));
    },
  },
  {
    id: 'mental-health',
    name: 'Mental Health Care & Vet Centers',
    category: 'health',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Free, confidential counseling for PTSD, depression, MST, and readjustment — including at community-based Vet Centers, often without VA health enrollment.',
    whatYouGet: [
      'Individual, group, marriage, and family counseling at 300+ Vet Centers.',
      'Same-day mental health services at VA medical centers.',
      'Emergency mental health care for veterans in crisis — even with an OTH discharge or no VA enrollment.',
    ],
    eligibility: [
      'Vet Centers: served in a combat theater or area of hostility, experienced military sexual trauma, provided mortuary services, or served on drone crews — includes Guard/Reserve and family members.',
      'Emergency care: most former service members, including those with OTH discharges.',
    ],
    howToApply: [
      'Walk in or call a Vet Center — no claim needed. Call 877-927-8387 (24/7 Vet Center Call Center).',
      'In crisis? Dial 988 and press 1, text 838255, or chat online with the Veterans Crisis Line.',
    ],
    phone: '1-877-927-8387',
    links: [
      { label: 'Find a Vet Center', url: 'https://www.va.gov/find-locations/?facilityType=vet_center' },
      { label: 'VA mental health services', url: 'https://www.va.gov/health-care/health-needs-conditions/mental-health/' },
      { label: 'Veterans Crisis Line', url: 'https://www.veteranscrisisline.net/' },
    ],
    priority: 70,
    match: (p) => {
      if (p.combat || p.exposures.length) return likely('Combat and deployed service members and veterans qualify for Vet Center counseling.');
      if (isVeteran(p) || isGuardReserve(p)) return possible('Free confidential counseling is available to many veterans and their families.');
      return null;
    },
  },
  {
    id: 'va-dental',
    name: 'VA Dental Care',
    category: 'health',
    level: 'federal',
    agency: 'Veterans Health Administration',
    summary: 'Full VA dental care for veterans rated 100% (or TDIU) and certain other groups; discounted dental insurance (VADIP) for any enrolled veteran.',
    whatYouGet: ['Comprehensive dental care at no cost for eligible veterans.', 'Access to discounted private dental insurance through VADIP for anyone enrolled in VA health care.'],
    eligibility: [
      'Class IV: 100% service-connected rating or TDIU — full dental care.',
      'Service-connected dental condition, former POWs, and certain recently discharged veterans (apply within 180 days of discharge).',
    ],
    howToApply: ['Enroll in VA health care, then ask your VA primary care team for a dental referral.'],
    phone: '1-877-222-8387',
    links: [{ label: 'VA dental care', url: 'https://www.va.gov/health-care/about-va-health-benefits/dental-care/' }],
    priority: 60,
    match: (p) => {
      if (totallyDisabled(p)) return likely('Veterans rated 100% or paid at 100% via TDIU get full VA dental care.');
      if (isVeteran(p) && recentlySeparated(p)) return possible('Recently discharged veterans may get one-time dental care if they apply within 180 days of discharge.');
      if (isVeteran(p) && !barredDischarge(p)) return possible('Any VA-enrolled veteran can buy discounted dental insurance through VADIP.');
      return null;
    },
  },
  {
    id: 'tricare',
    name: 'TRICARE Health Coverage',
    category: 'health',
    level: 'federal',
    agency: 'Defense Health Agency',
    summary: 'Military health plan for service members, retirees, Guard/Reserve, and their families.',
    whatYouGet: [
      'Active duty: TRICARE Prime at no cost; family members enroll in Prime or Select.',
      'Retirees: TRICARE Prime (where available) or Select with annual enrollment fees.',
      'Guard/Reserve: TRICARE Reserve Select premium-based coverage when not on active orders.',
      'Age 65+: TRICARE For Life as a wraparound to Medicare Part A and B.',
    ],
    eligibility: [
      'Active duty and activated Guard/Reserve and families.',
      'Military retirees (including medical retirees) and families.',
      'Selected Reserve members not on orders and not eligible for FEHB (TRICARE Reserve Select).',
    ],
    howToApply: [
      'Make sure you and your family are registered in DEERS (visit an ID card office).',
      'Enroll online with milConnect or the TRICARE website within 90 days of a qualifying life event (retirement, marriage, birth).',
      'At 65, enroll in Medicare Part B to keep TRICARE For Life.',
    ],
    documents: ['Military ID / retiree ID', 'DEERS registration for family members'],
    links: [
      { label: 'TRICARE plans', url: 'https://www.tricare.mil/Plans' },
      { label: 'TRICARE Reserve Select', url: 'https://www.tricare.mil/trs' },
      { label: 'TRICARE For Life', url: 'https://www.tricare.mil/tfl' },
      { label: 'milConnect (DEERS)', url: 'https://milconnect.dmdc.osd.mil/' },
    ],
    priority: 88,
    match: (p) => {
      if (isActive(p)) return likely('Active-duty service members and families are covered by TRICARE.');
      if (isGuardReserve(p)) return likely('Selected Reserve members can buy TRICARE Reserve Select when not on orders.');
      if (isRetiree(p))
        return likely(age(p) >= 65 ? 'As a retiree 65+, TRICARE For Life covers you alongside Medicare.' : 'Military retirees and families can enroll in TRICARE.');
      return null;
    },
  },
  {
    id: 'champva',
    name: 'CHAMPVA — Health Coverage for Your Family',
    category: 'family',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Health insurance for the spouse and children of a veteran rated permanently and totally disabled, if they aren\'t eligible for TRICARE.',
    whatYouGet: ['Coverage similar to TRICARE for medical care, prescriptions (often free through Meds by Mail), and more.'],
    eligibility: [
      'Spouse or child of a veteran rated permanently and totally (P&T) disabled from service-connected conditions, OR of a veteran who died from a service-connected condition.',
      'Not eligible for TRICARE (so most military retirees\' families use TRICARE instead).',
    ],
    howToApply: ['Submit VA Form 10-10d with supporting documents by mail or online.', 'Call 800-733-8387 with questions.'],
    documents: ["Veteran's P&T rating decision letter", 'Marriage certificate / birth certificates', 'Other health insurance info'],
    forms: ['VA Form 10-10d', 'VA Form 10-7959c'],
    phone: '1-800-733-8387',
    links: [{ label: 'CHAMPVA', url: 'https://www.va.gov/family-and-caregiver-benefits/health-and-disability/champva/' }],
    priority: 82,
    match: (p) => {
      if (!hasDependents(p) || !totallyDisabled(p)) return null;
      if (isRetiree(p)) return possible('Your family likely uses TRICARE as retirees, but CHAMPVA applies if they lose TRICARE eligibility.');
      if (p.permanentAndTotal) return likely('Your family qualifies because you are rated permanent and total (P&T).');
      return possible('If VA rates you permanent and total (P&T), your spouse and children can get CHAMPVA.');
    },
  },
  {
    id: 'caregiver',
    name: 'Program of Comprehensive Assistance for Family Caregivers',
    category: 'family',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Monthly stipend, training, respite care, and health coverage for a family caregiver of a veteran who needs in-person personal care.',
    whatYouGet: ['Monthly caregiver stipend', 'Caregiver health insurance (CHAMPVA) if uninsured', 'Respite care, counseling, and training', 'Caregiver may get commissary/exchange access'],
    eligibility: [
      'Veteran has a single or combined service-connected rating of 70% or higher.',
      'Needs in-person personal care for at least 6 continuous months (help with daily activities or supervision).',
    ],
    howToApply: ['Veteran and caregiver complete VA Form 10-10CG together online or by mail.', 'Contact your VA Caregiver Support Coordinator: 855-260-3274.'],
    forms: ['VA Form 10-10CG'],
    phone: '1-855-260-3274',
    links: [{ label: 'VA Caregiver Support Program', url: 'https://www.caregiver.va.gov/' }],
    priority: 78,
    match: (p) => {
      if (!ratingAtLeast(p, 70)) return null;
      if (p.needsDailyCare) return likely('You are rated 70%+ and need help with daily activities.');
      if (p.severeDisability) return possible('With a severe service-connected disability, a family caregiver may qualify for support.');
      return null;
    },
  },
  {
    id: 'foreign-medical',
    name: 'VA Foreign Medical Program',
    category: 'health',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Pays for care of service-connected conditions for veterans who live or travel outside the U.S.',
    whatYouGet: ['Reimbursement for treatment of service-connected conditions abroad.'],
    eligibility: ['Veterans with service-connected conditions who live or travel overseas (except the Philippines, which has its own VA program).'],
    howToApply: ['Register with VA Form 10-7959f-1, then submit claims with itemized bills.'],
    forms: ['VA Form 10-7959f-1'],
    links: [{ label: 'Foreign Medical Program', url: 'https://www.va.gov/health-care/foreign-medical-program/' }],
    priority: 70,
    match: (p) => (p.state === 'XX' && hasRating(p) ? likely('You live outside the U.S. and have service-connected conditions.') : null),
  },

  // ───────────────────────────── Education ─────────────────────────────
  {
    id: 'post-911-gi-bill',
    name: 'Post-9/11 GI Bill (Chapter 33)',
    category: 'education',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Pays tuition and fees, a monthly housing allowance, and a books stipend for college, vocational school, apprenticeships, and on-the-job training.',
    whatYouGet: [
      'Up to 36 months of benefits.',
      'Full in-state tuition at public schools at the 100% tier (capped amount at private schools; Yellow Ribbon may cover more).',
      'Monthly housing allowance based on the school\'s ZIP code (E-5 with dependents BAH rate).',
      'Up to $1,000/year for books and supplies.',
    ],
    eligibility: [
      'At least 90 days of active duty after Sept 10, 2001 (benefit percentage rises with time served — 36 months = 100%).',
      'OR a Purple Heart after Sept 10, 2001, OR 30+ continuous days with a service-connected disability discharge.',
      'Veterans need an honorable discharge. Those who left service after Jan 1, 2013 have no time limit to use it.',
    ],
    howToApply: [
      'Compare schools with the GI Bill Comparison Tool.',
      'Apply online with VA Form 22-1990 to get your Certificate of Eligibility (COE).',
      'Give the COE to your school\'s certifying official.',
    ],
    documents: [DD214, 'Bank account info for direct deposit', 'School and program info'],
    forms: ['VA Form 22-1990'],
    phone: '1-888-442-4551',
    links: [
      { label: 'Post-9/11 GI Bill', url: 'https://www.va.gov/education/about-gi-bill-benefits/post-9-11/' },
      { label: 'How to apply', url: 'https://www.va.gov/education/how-to-apply/' },
      { label: 'GI Bill Comparison Tool', url: 'https://www.va.gov/education/gi-bill-comparison-tool/' },
    ],
    priority: 92,
    match: (p) => {
      if (!p.eras.includes('post911')) return null;
      if (p.serviceLength === 'lt_90d' && !p.purpleHeart) return null;
      const reason = p.wantsEducation ? 'You served after 9/11 and are interested in school or training.' : 'You served on active duty after 9/11.';
      if (isVeteran(p) && !isRetiree(p) && p.discharge !== 'honorable')
        return possible(reason, 'An honorable discharge is required for the Post-9/11 GI Bill.');
      if (isGuardReserve(p)) return possible(reason, 'Guard/Reserve members earn eligibility through qualifying active-duty (Title 10/32) orders.');
      return p.wantsEducation ? likely(reason) : possible(reason);
    },
  },
  {
    id: 'gi-bill-transfer',
    name: 'Transfer Your GI Bill to a Spouse or Children',
    category: 'family',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Career service members can transfer unused Post-9/11 GI Bill months to a spouse or children — but only while still serving.',
    whatYouGet: ['Up to 36 months of Post-9/11 GI Bill benefits shared among dependents.'],
    eligibility: [
      'Currently serving with at least 6 years of service, AND',
      'Agree to serve 4 additional years (rules vary; cap of 16 years of service to request).',
      'Must request transfer before leaving service.',
    ],
    howToApply: ['Request transfer through milConnect (Transfer of Education Benefits) while serving.', 'Dependents then apply to VA with VA Form 22-1990E.'],
    forms: ['VA Form 22-1990E'],
    links: [
      { label: 'Transfer Post-9/11 GI Bill', url: 'https://www.va.gov/education/transfer-post-9-11-gi-bill-to-dependents/' },
      { label: 'milConnect', url: 'https://milconnect.dmdc.osd.mil/' },
    ],
    priority: 85,
    match: (p) => {
      if (!isServing(p) || !hasDependents(p)) return null;
      if (atLeastYears(p, 6)) return likely('You are serving with 6+ years and have dependents — you must transfer before you separate.');
      return possible('After 6 years of service, you may be able to transfer GI Bill benefits to your family.');
    },
  },
  {
    id: 'mgib',
    name: 'Montgomery GI Bill (Active Duty & Selected Reserve)',
    category: 'education',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Monthly education payments for those who paid into the MGIB-AD ($1,200) or have a 6-year Selected Reserve obligation (MGIB-SR).',
    whatYouGet: ['Up to 36 months of monthly payments for college, training, licensing, and apprenticeships.'],
    eligibility: [
      'MGIB-AD: paid $1,200 into the program, have a high school diploma/GED, and an honorable discharge. Generally 10 years from separation to use.',
      'MGIB-SR: 6-year Selected Reserve obligation, completed IADT, and remain in good standing.',
    ],
    howToApply: ['Apply on VA.gov with VA Form 22-1990.', 'If eligible for both MGIB and Post-9/11, compare carefully before choosing.'],
    forms: ['VA Form 22-1990'],
    phone: '1-888-442-4551',
    links: [
      { label: 'MGIB Active Duty', url: 'https://www.va.gov/education/about-gi-bill-benefits/montgomery-active-duty/' },
      { label: 'MGIB Selected Reserve', url: 'https://www.va.gov/education/about-gi-bill-benefits/montgomery-selected-reserve/' },
    ],
    priority: 55,
    match: (p) => {
      if (isGuardReserve(p)) return likely('Selected Reserve members with a 6-year obligation can use MGIB-SR.');
      if ((isVeteran(p) || isActive(p)) && p.wantsEducation && !p.eras.every((e) => e === 'wwii' || e === 'korea'))
        return possible('If you paid $1,200 into the Montgomery GI Bill, you may be eligible.');
      return null;
    },
  },
  {
    id: 'vre',
    name: 'Veteran Readiness and Employment (VR&E / Chapter 31)',
    category: 'employment',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary:
      'Personalized career counseling, job training, college, and job placement for veterans with service-connected disabilities — often covering more than the GI Bill.',
    whatYouGet: [
      'Tuition, fees, books, and supplies paid directly; plus a monthly subsistence allowance.',
      'Career counseling, resume help, and job placement.',
      'Independent-living services for veterans who can\'t work right now.',
      'Doesn\'t use up GI Bill entitlement in most cases.',
    ],
    eligibility: [
      'Discharge other than dishonorable and a service-connected rating of at least 10% (or a memorandum rating of 20%+ for those still serving).',
      'No time limit for veterans discharged after Jan 1, 2013.',
    ],
    howToApply: ['Apply online with VA Form 28-1900.', 'Meet with a Vocational Rehabilitation Counselor (VRC) to build your plan.'],
    forms: ['VA Form 28-1900'],
    phone: VA_PHONE,
    links: [{ label: 'Veteran Readiness and Employment', url: 'https://www.va.gov/careers-employment/vocational-rehabilitation/' }],
    priority: 87,
    match: (p) => {
      if (!ratingAtLeast(p, 10)) {
        if (isActive(p) && (p.unratedConditions || p.claimPending)) return possible('Service members with a pending claim or memorandum rating of 20%+ may qualify.');
        return null;
      }
      const reasons = [`You have a ${ratingText(p)}.`];
      if (p.wantsEducation) reasons.push('You are interested in school or training.');
      if (p.employment === 'unemployed') reasons.push('You are looking for work.');
      return likely(...reasons);
    },
  },
  {
    id: 'dea',
    name: "Dependents' Educational Assistance (DEA / Chapter 35)",
    category: 'family',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Monthly education payments for the spouse and children of a veteran rated permanently and totally disabled.',
    whatYouGet: ['Up to 36 months (or 45 months for some) of monthly education payments for degrees, certificates, apprenticeships, and on-the-job training.'],
    eligibility: [
      "Spouse or child of a veteran who is permanently and totally disabled from a service-connected condition, or who died in service or from a service-connected condition.",
      'Children generally use it between ages 18 and 26.',
    ],
    howToApply: ['Dependents apply with VA Form 22-5490 online or by mail.'],
    forms: ['VA Form 22-5490'],
    phone: '1-888-442-4551',
    links: [
      { label: "Dependents' Educational Assistance", url: 'https://www.va.gov/education/survivor-dependent-benefits/dependents-education-assistance/' },
    ],
    priority: 80,
    match: (p) => {
      if (!hasDependents(p) || !totallyDisabled(p)) return null;
      if (p.permanentAndTotal) return likely('Your spouse and children may use DEA because you are rated permanent and total.');
      return possible('If VA rates your disability permanent and total (P&T), your spouse and children can use DEA.');
    },
  },
  {
    id: 'tuition-assistance',
    name: 'Military Tuition Assistance (TA)',
    category: 'education',
    level: 'federal',
    agency: 'Your Service Branch',
    summary: 'Your branch pays up to $250 per semester hour (up to $4,500/year in most branches) for off-duty college courses — without touching the GI Bill.',
    whatYouGet: ['Tuition paid directly to the school for approved courses.', 'Lets you save GI Bill benefits for later or for your family.'],
    eligibility: ['Active duty, and many Guard/Reserve members (branch and state rules vary).', 'Approval from your education center before enrolling.'],
    howToApply: [
      'Talk to your installation education center or counselor.',
      'Request TA in your branch portal: ArmyIgnitED (Army), Navy College (Navy/Marine Corps), AFVEC (Air & Space Force), or ETQC/Coast Guard Voluntary Education.',
    ],
    links: [
      { label: 'ArmyIgnitED', url: 'https://www.armyignited.army.mil/' },
      { label: 'Navy College Program', url: 'https://www.navycollege.navy.mil/' },
      { label: 'AFVEC (Air & Space Force)', url: 'https://afvec.us.af.mil/' },
      { label: 'DANTES voluntary education', url: 'https://www.dantes.mil/' },
    ],
    priority: 75,
    match: (p) => {
      if (!isServing(p)) return null;
      return p.wantsEducation ? likely('You are currently serving and interested in school.') : possible('Available to many currently serving members.');
    },
  },
  {
    id: 'cool',
    name: 'Credentialing Opportunities On-Line (COOL)',
    category: 'education',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Pays for professional certifications and licenses related to your military job or career goals.',
    whatYouGet: ['Funding for exam fees and some training for industry certifications (IT, project management, trades, healthcare, and more).'],
    eligibility: ['Currently serving members (active, Guard, and Reserve); rules vary by branch.'],
    howToApply: ['Browse credentials on the COOL website and request funding through your branch COOL program.'],
    links: [{ label: 'DoD COOL', url: 'https://www.cool.osd.mil/' }],
    priority: 55,
    match: (p) => (isServing(p) ? possible('Currently serving members can get certifications paid for.') : null),
  },

  // ───────────────────────────── Transition ─────────────────────────────
  {
    id: 'tap',
    name: 'Transition Assistance Program (TAP)',
    category: 'transition',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Mandatory, free workshops and counseling to prepare for civilian life — VA benefits, employment, education, and financial planning.',
    whatYouGet: ['Individualized counseling, VA benefits briefing, employment workshops, and a personalized transition plan.'],
    eligibility: ['Service members separating or retiring; start at least 365 days before separation (24 months for retirees).'],
    howToApply: ['Contact your installation Transition Assistance Center to schedule initial counseling.'],
    links: [{ label: 'DoD TAP', url: 'https://www.dodtap.mil/' }],
    priority: 90,
    match: (p) => (isServing(p) && p.separatingSoon ? likely('You are separating within a year — TAP is required and should start ASAP.') : null),
  },
  {
    id: 'skillbridge',
    name: 'DoD SkillBridge',
    category: 'transition',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Spend up to your last 180 days of service in a civilian internship, apprenticeship, or job training — while still receiving military pay.',
    whatYouGet: ['Real-world training and work experience with industry partners while on active-duty pay and benefits.'],
    eligibility: ['Active-duty service members within 180 days of separation with command approval.'],
    howToApply: ['Find an approved program on the SkillBridge website.', 'Get your commander\'s approval and coordinate with your installation transition office.'],
    links: [{ label: 'SkillBridge', url: 'https://skillbridge.osd.mil/' }],
    priority: 80,
    match: (p) => (isActive(p) && p.separatingSoon ? likely('You are on active duty and separating within a year.') : null),
  },
  {
    id: 'military-onesource',
    name: 'Military OneSource (incl. free MilTax filing)',
    category: 'transition',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Free 24/7 support: confidential counseling, financial and legal consultations, relocation help, and free tax filing software.',
    whatYouGet: ['Non-medical counseling', 'Financial and tax consultations', 'MilTax free tax prep and filing', 'Spouse career and education support'],
    eligibility: ['Service members, Guard/Reserve, their families, and veterans up to 365 days after separation or retirement.'],
    howToApply: ['Call 800-342-9647 or visit the website — no application required.'],
    phone: '1-800-342-9647',
    links: [
      { label: 'Military OneSource', url: 'https://www.militaryonesource.mil/' },
      { label: 'MilTax', url: 'https://www.militaryonesource.mil/financial-legal/taxes/miltax-military-tax-services/' },
    ],
    priority: 60,
    match: (p) => {
      if (isServing(p)) return likely('Available to all currently serving members and families.');
      if (isVeteran(p) && recentlySeparated(p)) return likely('You separated within the past year.');
      return null;
    },
  },
  {
    id: 'scra',
    name: 'Servicemembers Civil Relief Act (SCRA) Protections',
    category: 'financial',
    level: 'federal',
    agency: 'Department of Justice / Department of Defense',
    summary: 'Caps interest at 6% on debts taken out before active duty, lets you break leases for PCS/deployment, and protects against default judgments and foreclosure.',
    whatYouGet: [
      '6% interest-rate cap on pre-service loans and credit cards.',
      'Terminate residential and auto leases for PCS (and other qualifying orders).',
      'Protection from evictions, foreclosures, and default judgments while on active duty.',
    ],
    eligibility: ['Active duty, and Guard/Reserve on federal orders for 30+ consecutive days.'],
    howToApply: ['Send a written request and a copy of your orders to the lender or landlord.', 'Get free help from your installation legal assistance office (JAG).'],
    links: [
      { label: 'SCRA (Department of Justice)', url: 'https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra' },
      { label: 'Find legal assistance', url: 'https://legalassistance.law.af.mil/' },
    ],
    priority: 65,
    match: (p) => {
      if (isActive(p)) return likely('You are on active duty.');
      if (isGuardReserve(p)) return possible('Applies whenever you are on federal orders for 30+ days.');
      return null;
    },
  },
  {
    id: 'userra',
    name: 'USERRA Job Protections',
    category: 'employment',
    level: 'federal',
    agency: 'Department of Labor (VETS)',
    summary: 'Protects your civilian job, seniority, and benefits when you are called to military service.',
    whatYouGet: ['Right to be reemployed after service, with seniority and pay you would have earned.', 'Protection from discrimination because of service.'],
    eligibility: ['Guard, Reserve, and anyone who leaves a civilian job for uniformed service (cumulative limit of 5 years, with exceptions).'],
    howToApply: ['Give your employer advance notice of service.', 'If you have a problem, contact ESGR (ombudsman) or file a complaint with DOL-VETS.'],
    links: [
      { label: 'USERRA (Department of Labor)', url: 'https://www.dol.gov/agencies/vets/programs/userra' },
      { label: 'ESGR', url: 'https://www.esgr.mil/' },
    ],
    priority: 60,
    match: (p) => (isGuardReserve(p) ? likely('Guard and Reserve members are protected when called to service.') : null),
  },

  // ───────────────────────────── Housing ─────────────────────────────
  {
    id: 'va-home-loan',
    name: 'VA Home Loan Guaranty',
    category: 'housing',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Buy, build, or refinance a home with no down payment, no private mortgage insurance, and competitive rates through private lenders.',
    whatYouGet: [
      'No down payment for most borrowers and no PMI.',
      'Limited closing costs; VA funding fee is waived if you receive VA compensation (any %) or are a Purple Heart recipient on active duty.',
      'Reusable benefit; also covers cash-out and IRRRL (streamline) refinancing.',
    ],
    eligibility: [
      'Generally 90 continuous days of active service in wartime or 181 days in peacetime; 24 months for most post-1980 enlisted veterans.',
      'Guard/Reserve: 6 years of service or 90 days of active-duty orders.',
      'Discharge other than dishonorable. Surviving spouses may also qualify.',
    ],
    howToApply: [
      'Request your Certificate of Eligibility (COE) on VA.gov or through your lender.',
      'Shop VA-approved lenders and compare rates.',
      'Use a real estate agent experienced with VA loans.',
    ],
    documents: [DD214, 'Statement of service (if still serving)', 'Income and credit documentation for the lender'],
    forms: ['VA Form 26-1880 (COE request)'],
    phone: '1-877-827-3702',
    links: [
      { label: 'VA home loans', url: 'https://www.va.gov/housing-assistance/home-loans/' },
      { label: 'Request a COE', url: 'https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/' },
    ],
    priority: 78,
    match: (p) => {
      if (barredDischarge(p) || p.serviceLength === 'lt_90d') return null;
      const reasons: string[] = [];
      if (p.housing === 'buying') reasons.push('You are looking to buy a home.');
      if (p.housing === 'rent' || p.housing === 'with_family') reasons.push('You currently rent — a VA loan can make buying possible with $0 down.');
      if (hasRating(p)) reasons.push('Your VA rating means the VA funding fee is waived.');
      if (p.housing === 'own') reasons.push('Homeowners can refinance with a VA cash-out or IRRRL loan.');
      if (reasons.length === 0) reasons.push('Most veterans and service members qualify.');
      const r = p.housing === 'buying' || p.housing === 'rent' ? likely(...reasons) : possible(...reasons);
      return withDischargeCaveat(p, r);
    },
  },
  {
    id: 'adapted-housing',
    name: 'Specially Adapted Housing (SAH/SHA) Grants',
    category: 'housing',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Grants to build, buy, or modify a home to support independent living with certain severe service-connected disabilities.',
    whatYouGet: ['SAH grant (largest amount, adjusted every October) or SHA grant for home adaptations like ramps, wider doors, and accessible bathrooms.'],
    eligibility: [
      'Service-connected loss or loss of use of limbs, blindness, severe burns, ALS, or certain respiratory injuries.',
    ],
    howToApply: ['Apply with VA Form 26-4555 online or by mail.', 'A VA SAH agent will visit to evaluate your needs.'],
    forms: ['VA Form 26-4555'],
    phone: '1-877-827-3702',
    links: [{ label: 'Disability housing grants', url: 'https://www.va.gov/housing-assistance/disability-housing-grants/' }],
    priority: 75,
    match: (p) => (p.severeDisability && hasRating(p) ? likely('You reported a severe service-connected disability.') : null),
  },
  {
    id: 'auto-allowance',
    name: 'Automobile Allowance & Adaptive Equipment',
    category: 'disability',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'A one-time payment toward a vehicle plus adaptive equipment (hand controls, lifts) if a service-connected disability affects your ability to drive.',
    whatYouGet: ['One-time allowance toward a car (amount adjusted yearly — over $26,000) paid to the seller.', 'Adaptive equipment such as power steering, brakes, hand controls, and lifts.'],
    eligibility: ['Service-connected loss or loss of use of hands or feet, vision loss, severe burns, or ALS (and certain others).'],
    howToApply: ['Apply BEFORE buying with VA Form 21-4502 (or VA Form 10-1394 for adaptive equipment only).'],
    forms: ['VA Form 21-4502', 'VA Form 10-1394'],
    phone: VA_PHONE,
    links: [{ label: 'Automobile allowance', url: 'https://www.va.gov/disability/eligibility/special-claims/automobile-allowance-adaptive-equipment/' }],
    priority: 70,
    match: (p) => (p.severeDisability && hasRating(p) ? likely('You reported a severe service-connected disability.') : null),
  },
  {
    id: 'homeless',
    name: 'Homeless & Housing Crisis Help (HUD-VASH, SSVF)',
    category: 'housing',
    level: 'federal',
    agency: 'Department of Veterans Affairs / HUD',
    summary: 'Immediate help for veterans who are homeless or at risk: emergency housing, rental assistance, and case management.',
    whatYouGet: [
      'HUD-VASH rental vouchers with VA case management.',
      'SSVF rapid rehousing and homelessness prevention (back rent, deposits, utilities).',
      'Grant and Per Diem transitional housing.',
    ],
    eligibility: ['Veterans who are homeless or at imminent risk; some programs accept OTH discharges.'],
    howToApply: ['Call the National Call Center for Homeless Veterans at 877-424-3838 (24/7).', 'Or walk into any VA medical center and ask for the homeless program.'],
    phone: '1-877-424-3838',
    links: [{ label: 'VA homeless programs', url: 'https://www.va.gov/homeless/' }],
    priority: 110,
    match: (p) => {
      if (p.housing === 'homeless') return likely('You told us you are currently without stable housing — please call 877-424-3838 today.');
      if (p.housing === 'at_risk') return likely('You told us you are at risk of losing your housing.');
      return null;
    },
  },

  // ───────────────────────────── Employment ─────────────────────────────
  {
    id: 'veterans-preference',
    name: "Federal Hiring: Veterans' Preference & Special Authorities",
    category: 'employment',
    level: 'federal',
    agency: 'Office of Personnel Management',
    summary: 'Extra points and special hiring paths for federal jobs, including noncompetitive appointment for veterans with a 30%+ disability.',
    whatYouGet: [
      '5-point preference for eligible honorably discharged veterans; 10-point preference for disabled veterans and Purple Heart recipients.',
      'VRA and 30% or More Disabled Veteran hiring authorities let agencies hire you without competition.',
    ],
    eligibility: ['Honorable or general discharge plus qualifying service (dates, campaign badge, or disability).', 'Retirees at major or above generally need a disability to get preference.'],
    howToApply: ['Build your profile on USAJOBS and upload your DD-214 (Member 4 copy) and VA letter (SF-15 for 10-point).'],
    documents: ['DD-214 Member 4 copy', 'VA benefit summary letter', 'SF-15 (for 10-point preference)'],
    links: [
      { label: 'FedsHireVets', url: 'https://www.fedshirevets.gov/' },
      { label: 'USAJOBS veterans hiring paths', url: 'https://www.usajobs.gov/help/working-in-government/unique-hiring-paths/veterans/' },
    ],
    priority: 62,
    match: (p) => {
      if (!isVeteran(p) && !(isActive(p) && p.separatingSoon)) return null;
      if (!goodDischarge(p) && !isActive(p)) return null;
      if (ratingAtLeast(p, 30)) return likely('With a 30%+ rating, you qualify for 10-point preference and noncompetitive hiring.');
      if (ratingAtLeast(p, 10) || p.purpleHeart) return likely('You likely qualify for 10-point veterans\' preference.');
      return p.employment === 'unemployed' ? likely('You are looking for work and likely qualify for veterans\' preference.') : possible('Most honorably discharged veterans qualify for 5-point preference.');
    },
  },
  {
    id: 'american-job-centers',
    name: 'Veteran Employment Help at American Job Centers',
    category: 'employment',
    level: 'federal',
    agency: 'Department of Labor',
    summary: 'Priority of service plus dedicated veteran employment specialists (DVOP/LVER) for job search, training, and unemployment benefits (UCX).',
    whatYouGet: [
      'One-on-one help from veteran employment representatives.',
      'Priority for federally funded job training.',
      'Unemployment Compensation for Ex-servicemembers (UCX) if you recently separated and can\'t find work.',
    ],
    eligibility: ['Veterans and eligible spouses. UCX: recently separated from active duty with an honorable discharge.'],
    howToApply: ['Find your local American Job Center on CareerOneStop.', 'For UCX, file with your state unemployment agency and provide your DD-214 (Member 4).'],
    phone: '1-877-872-5627',
    links: [
      { label: 'CareerOneStop for veterans', url: 'https://www.careeronestop.org/Veterans/' },
      { label: 'Find unemployment benefits', url: 'https://www.careeronestop.org/LocalHelp/UnemploymentBenefits/find-unemployment-benefits.aspx' },
    ],
    priority: 58,
    match: (p) => {
      if (!isVeteran(p)) return null;
      if (p.employment === 'unemployed')
        return likely(recentlySeparated(p) ? 'You are recently separated and looking for work (UCX may apply).' : 'You are looking for work.');
      return null;
    },
  },

  // ───────────────────────────── Financial / Pension ─────────────────────────────
  {
    id: 'va-pension',
    name: 'Veterans Pension (incl. Aid & Attendance)',
    category: 'financial',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Tax-free monthly payments for low-income wartime veterans who are 65+ or have a permanent disability, with extra for Aid & Attendance or housebound status.',
    whatYouGet: ['Monthly payment that brings income up to a VA-set level.', 'Higher amounts for Aid & Attendance (help with daily living) or housebound status.'],
    eligibility: [
      'Discharge other than dishonorable and wartime service (at least 1 day during a wartime period — e.g., Gulf War Aug 2, 1990 to present).',
      'Generally 90 days of active duty (24 months for those entering after Sept 7, 1980).',
      'Age 65+, OR permanently and totally disabled, OR in a nursing home, OR receiving SSDI/SSI.',
      'Income and net worth below VA limits.',
    ],
    howToApply: ['Apply with VA Form 21P-527EZ online or by mail.', 'For Aid & Attendance, add VA Form 21-2680 completed by a doctor.'],
    forms: ['VA Form 21P-527EZ', 'VA Form 21-2680'],
    phone: VA_PHONE,
    links: [
      { label: 'Veterans Pension', url: 'https://www.va.gov/pension/' },
      { label: 'Aid & Attendance and Housebound', url: 'https://www.va.gov/pension/aid-attendance-housebound/' },
      FIND_REP,
    ],
    priority: 72,
    match: (p) => {
      if (!isVeteran(p) || !wartime(p) || barredDischarge(p)) return null;
      const qualifyingAge = age(p) >= 65 || p.employment === 'unable' || p.needsDailyCare;
      if (!qualifyingAge) return null;
      if (lowIncome(p)) return withDischargeCaveat(p, likely('You are a wartime veteran with limited income who is 65+ or disabled.'));
      if (p.needsDailyCare) return possible('You need help with daily activities — Aid & Attendance may apply if income/assets are within limits.');
      if (p.income === 'prefer_not' || p.income === '') return possible('Depends on household income and net worth.');
      return null;
    },
  },
  {
    id: 'sbp',
    name: 'Survivor Benefit Plan (SBP)',
    category: 'insurance',
    level: 'federal',
    agency: 'DFAS',
    summary: 'Provides a lifetime monthly annuity to your surviving spouse or children from your military retired pay.',
    whatYouGet: ['Up to 55% of your chosen base amount paid monthly to survivors for life.'],
    eligibility: ['Military retirees (decision made at retirement — declining requires spouse concurrence).'],
    howToApply: ['Elect SBP coverage during retirement processing (DD Form 2656). Talk to your Retirement Services Officer.'],
    forms: ['DD Form 2656'],
    links: [{ label: 'Survivor Benefit Plan (DFAS)', url: 'https://www.dfas.mil/RetiredMilitary/provide/sbp/' }],
    priority: 55,
    match: (p) => {
      if (isRetiree(p) && hasDependents(p)) return likely('You are a retiree with a spouse or children.');
      if (isServing(p) && p.separatingSoon && atLeastYears(p, 20)) return likely('You are approaching retirement — SBP must be decided before you retire.');
      return null;
    },
  },
  {
    id: 'student-loan-discharge',
    name: 'Federal Student Loan Discharge (TPD)',
    category: 'financial',
    level: 'federal',
    agency: 'Department of Education',
    summary: 'Federal student loans can be fully discharged if VA rates you 100% or TDIU for service-connected conditions — and it is not taxable federally.',
    whatYouGet: ['Discharge of federal Direct, FFEL, and Perkins loans and TEACH Grant service obligations.'],
    eligibility: ['VA rating of 100% for service-connected conditions, or TDIU.'],
    howToApply: [
      'Education identifies many eligible veterans automatically through a VA data match.',
      'If you weren\'t notified, apply at DisabilityDischarge.com/StudentAid.gov with your VA letter.',
    ],
    documents: ['VA letter showing 100% rating or TDIU'],
    links: [{ label: 'Total and Permanent Disability Discharge', url: 'https://studentaid.gov/manage-loans/forgiveness-cancellation/disability-discharge' }],
    priority: 80,
    match: (p) => {
      if (!totallyDisabled(p)) return null;
      return p.studentLoans ? likely('You have federal student loans and a 100%/TDIU rating.') : possible('If you have federal student loans, they may be discharged.');
    },
  },
  {
    id: 'ssa',
    name: 'Social Security Disability — Expedited for Veterans',
    category: 'financial',
    level: 'federal',
    agency: 'Social Security Administration',
    summary: 'Veterans rated 100% P&T and service members injured on active duty get expedited processing of Social Security disability claims.',
    whatYouGet: ['Faster SSDI decisions (SSDI is separate from and in addition to VA compensation).'],
    eligibility: ['VA rating of 100% P&T, OR injured on active duty after Oct 1, 2001 (Wounded Warriors), plus SSA work credits.'],
    howToApply: ['Apply at SSA.gov or call 800-772-1213; mention your 100% P&T rating and provide your VA letter.'],
    phone: '1-800-772-1213',
    links: [{ label: 'SSA benefits for veterans', url: 'https://www.ssa.gov/people/veterans/' }],
    priority: 60,
    match: (p) => {
      if (p.rating === 100 && p.permanentAndTotal && p.employment !== 'employed') return likely('You are rated 100% P&T.');
      if (totallyDisabled(p) && p.employment === 'unable') return possible('You are unable to work due to disability.');
      return null;
    },
  },

  // ───────────────────────────── Insurance ─────────────────────────────
  {
    id: 'sgli',
    name: 'SGLI, FSGLI & TSGLI Life Insurance',
    category: 'insurance',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Low-cost group life insurance up to $500,000 for service members, coverage for spouses and children, and traumatic injury protection.',
    whatYouGet: ['SGLI up to $500,000', 'FSGLI for spouses (up to $100,000) and free coverage for children', 'TSGLI payments of $25,000–$100,000 for qualifying traumatic injuries'],
    eligibility: ['Active duty, Ready Reserve, National Guard, cadets/midshipmen, and others.'],
    howToApply: ['Manage coverage and beneficiaries in SOES via milConnect.'],
    links: [
      { label: 'SGLI', url: 'https://www.va.gov/life-insurance/options-eligibility/sgli/' },
      { label: 'TSGLI', url: 'https://www.va.gov/life-insurance/options-eligibility/tsgli/' },
    ],
    priority: 50,
    match: (p) => (isServing(p) ? likely('Currently serving members are automatically covered by SGLI.') : null),
  },
  {
    id: 'vgli',
    name: "Veterans' Group Life Insurance (VGLI)",
    category: 'insurance',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Convert your SGLI to lifetime renewable coverage after separation — no health questions if you apply within 240 days.',
    whatYouGet: ['Up to the amount of SGLI you had at separation (renewable for life).'],
    eligibility: ['Had SGLI while serving. Apply within 1 year and 120 days of separation (no health questions within 240 days).'],
    howToApply: ['Apply online through the VA life insurance site.'],
    links: [{ label: 'VGLI', url: 'https://www.va.gov/life-insurance/options-eligibility/vgli/' }],
    priority: 65,
    match: (p) => {
      if (isServing(p) && p.separatingSoon) return likely('You are separating soon — convert SGLI within 240 days to skip health questions.');
      if (isVeteran(p) && recentlySeparated(p, 1)) return likely('You separated recently — you may still be in the VGLI window.');
      return null;
    },
  },
  {
    id: 'valife',
    name: 'VA Life Insurance (VALife)',
    category: 'insurance',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Guaranteed-acceptance whole life insurance up to $40,000 for veterans with any service-connected rating — no medical exam.',
    whatYouGet: ['Up to $40,000 of whole life coverage (in $10,000 increments) that builds cash value.', 'Full coverage after a 2-year waiting period.'],
    eligibility: ['Any VA service-connected disability rating (0%–100%), age 80 or younger (any age if you apply within 2 years of a new rating).'],
    howToApply: ['Apply online in minutes on VA.gov.'],
    links: [{ label: 'VALife', url: 'https://www.va.gov/life-insurance/options-eligibility/valife/' }],
    priority: 58,
    match: (p) => (hasRating(p) && age(p) <= 80 ? likely(`You have a ${ratingText(p)}.`) : null),
  },
  {
    id: 'vmli',
    name: "Veterans' Mortgage Life Insurance (VMLI)",
    category: 'insurance',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'Mortgage protection insurance up to $200,000 for veterans who received a Specially Adapted Housing grant.',
    whatYouGet: ['Pays your mortgage lender up to $200,000 if you pass away.'],
    eligibility: ['Severely disabled veterans who received an SAH grant and have a mortgage on the adapted home. Apply before age 70.'],
    howToApply: ['Ask your SAH agent or apply with VA Form 29-8636.'],
    forms: ['VA Form 29-8636'],
    links: [{ label: 'VMLI', url: 'https://www.va.gov/life-insurance/options-eligibility/vmli/' }],
    priority: 45,
    match: (p) => (p.severeDisability && hasRating(p) && p.housing === 'own' ? possible('If you used an SAH grant for your home.') : null),
  },

  // ───────────────────────────── Family ─────────────────────────────
  {
    id: 'mycaa',
    name: 'MyCAA Scholarship for Military Spouses',
    category: 'family',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Up to $4,000 for a spouse to earn a license, certification, or associate degree for a portable career.',
    whatYouGet: ['Up to $4,000 in tuition assistance for the spouse.'],
    eligibility: ['Spouse of an active-duty member in pay grades E-1 to E-6, W-1 to W-2, or O-1 to O-3 (includes Title 10 Guard/Reserve).'],
    howToApply: ['Spouse creates an account on the MyCAA portal and works with a SECO career coach.'],
    links: [{ label: 'MyCAA', url: 'https://mycaa.militaryonesource.mil/' }],
    priority: 55,
    match: (p) => (isActive(p) && isMarried(p) ? possible('Your spouse may qualify depending on your pay grade.') : null),
  },
  {
    id: 'child-care',
    name: 'Military Child Care & Fee Assistance',
    category: 'family',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Subsidized child development centers on base, and fee assistance for off-base community providers.',
    whatYouGet: ['Income-based fees at military Child Development Centers.', 'Fee assistance for licensed community child care when on-base care is unavailable.'],
    eligibility: ['Active duty and activated Guard/Reserve families with children typically under 13.'],
    howToApply: ['Request care on MilitaryChildCare.com.'],
    links: [{ label: 'MilitaryChildCare.com', url: 'https://www.militarychildcare.com/' }],
    priority: 60,
    match: (p) => (isServing(p) && p.kidsUnder18 > 0 ? likely('You are serving and have children under 18.') : null),
  },

  // ───────────────────────────── Recreation / ID / Privileges ─────────────────────────────
  {
    id: 'commissary-exchange',
    name: 'Commissary, Exchange & MWR Access',
    category: 'recreation',
    level: 'federal',
    agency: 'Department of Defense',
    summary: 'Shop tax-free at military exchanges and save at commissaries — now open to all veterans with a service-connected rating.',
    whatYouGet: ['In-store commissary and exchange shopping', 'MWR facilities and programs', 'Online exchange shopping is open to all honorably discharged veterans'],
    eligibility: [
      'Active duty, Guard/Reserve, retirees, and Medal of Honor recipients (DoD ID card).',
      'Veterans with any service-connected rating, Purple Heart recipients, and former POWs (use your VHIC).',
      'All honorably discharged veterans for online exchange shopping.',
    ],
    howToApply: [
      'Rated veterans: enroll in VA health care to get a Veteran Health Identification Card (VHIC) marked "Service Connected".',
      'Veterans rated 100% or TDIU can get a DoD ID card at a RAPIDS office.',
    ],
    links: [
      { label: 'Veteran Health ID Card', url: 'https://www.va.gov/health-care/get-health-id-card/' },
      { label: 'Online exchange shopping for veterans', url: 'https://www.shopmyexchange.com/vets' },
    ],
    priority: 50,
    match: (p) => {
      if (isServing(p) || isRetiree(p)) return likely('Your military or retiree ID gives you full access.');
      if (hasRating(p) || p.purpleHeart) return likely('Veterans with a service-connected rating or Purple Heart qualify for in-person access.');
      if (isVeteran(p) && p.discharge === 'honorable') return possible('Honorably discharged veterans can shop the online exchanges.');
      return null;
    },
  },
  {
    id: 'space-a',
    name: 'Space-Available (Space-A) Military Flights',
    category: 'recreation',
    level: 'federal',
    agency: 'Air Mobility Command',
    summary: 'Fly on military aircraft for free (or a small fee) when seats are available.',
    whatYouGet: ['Free travel on DoD aircraft within the U.S. and overseas on a space-available basis.'],
    eligibility: ['Active duty and families, retirees and families, Guard/Reserve, and veterans rated 100% P&T (CONUS and certain routes).'],
    howToApply: ['Sign up at passenger terminals or by email, with your ID card.'],
    links: [{ label: 'AMC Travel (Space-A)', url: 'https://www.amc.af.mil/AMC-Travel-Site/' }],
    priority: 30,
    match: (p) => {
      if (isServing(p) || isRetiree(p)) return possible('Space-A travel is available with your military ID.');
      if (p.rating === 100 && p.permanentAndTotal) return possible('Veterans rated 100% P&T are eligible for Space-A travel.');
      return null;
    },
  },
  {
    id: 'parks-pass',
    name: 'Free Lifetime National Parks Pass',
    category: 'recreation',
    level: 'federal',
    agency: 'National Park Service / Interior',
    summary: 'Free lifetime America the Beautiful pass for veterans; free annual pass for current service members.',
    whatYouGet: ['Free entry to national parks, wildlife refuges, and 2,000+ federal recreation sites.'],
    eligibility: ['Veterans (with proof of service) and Gold Star families: free lifetime pass.', 'Current service members and dependents: free annual Military Pass.'],
    howToApply: ['Show your VHIC, Veteran ID Card, veteran designation on your driver\'s license, or DD-214 at any federal recreation site.'],
    links: [{ label: 'Free access for veterans', url: 'https://www.nps.gov/planyourvisit/veterans-and-gold-star-families-free-access.htm' }],
    priority: 25,
    match: (p) => (isServing(p) || isVeteran(p) ? likely('Available to all service members and veterans.') : null),
  },
  {
    id: 'veteran-id',
    name: 'Veteran ID Card (VIC)',
    category: 'recreation',
    level: 'federal',
    agency: 'Department of Veterans Affairs',
    summary: 'A free photo ID proving your veteran status — used for retail discounts and many benefits without carrying your DD-214.',
    whatYouGet: ['Official proof of veteran status accepted by many businesses for discounts.'],
    eligibility: ['Veterans with an honorable or general discharge (OTH may qualify with a favorable VA determination).'],
    howToApply: ['Apply online on VA.gov with a photo and your service information.'],
    links: [{ label: 'Veteran ID Card', url: 'https://www.va.gov/records/get-veteran-id-cards/vic/' }],
    priority: 35,
    match: (p) => (isVeteran(p) && !isRetiree(p) && goodDischarge(p) ? possible('Handy proof of service for discounts and benefits.') : null),
  },

  // ───────────────────────────── Memorial ─────────────────────────────
  {
    id: 'burial',
    name: 'Burial & Memorial Benefits',
    category: 'memorial',
    level: 'federal',
    agency: 'National Cemetery Administration',
    summary: 'Burial in a VA national cemetery, a headstone or marker, burial flag, and Presidential Memorial Certificate — plan ahead with pre-need eligibility.',
    whatYouGet: ['Gravesite, opening/closing, vault, and perpetual care in a national cemetery', 'Spouse and dependent burial eligibility', 'Burial allowance for service-connected deaths and some others'],
    eligibility: ['Veterans with a discharge other than dishonorable; spouses and dependent children.'],
    howToApply: ['Apply for a pre-need eligibility determination now (VA Form 40-10007) so your family has less to do later.'],
    forms: ['VA Form 40-10007'],
    phone: '1-800-535-1117',
    links: [
      { label: 'Burials & memorials', url: 'https://www.va.gov/burials-memorials/' },
      { label: 'Pre-need eligibility', url: 'https://www.va.gov/burials-memorials/pre-need-eligibility/' },
    ],
    priority: 20,
    match: (p) => {
      if (!isVeteran(p) || barredDischarge(p)) return null;
      return age(p) >= 60 || totallyDisabled(p) ? likely('Planning ahead with a pre-need determination saves your family stress.') : possible('Available to most veterans — consider applying for pre-need eligibility.');
    },
  },
];
