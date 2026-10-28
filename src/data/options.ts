import type { Profile } from '../types';

export interface Option<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

export const emptyProfile = (): Profile => ({
  status: '',
  branch: '',
  discharge: 'unknown',
  serviceLength: '',
  eras: [],
  separationYear: null,
  separatingSoon: false,
  combat: false,
  purpleHeart: false,
  exposures: [],
  rating: null,
  permanentAndTotal: false,
  tdiu: false,
  claimPending: false,
  unratedConditions: false,
  severeDisability: false,
  needsDailyCare: false,
  marital: '',
  kidsUnder18: 0,
  kidsInSchool: 0,
  disabledChild: false,
  age: null,
  education: '',
  wantsEducation: false,
  employment: '',
  income: '',
  housing: '',
  studentLoans: false,
  state: '',
  zip: '',
});

export const STATUS_OPTIONS: Option<Exclude<Profile['status'], ''>>[] = [
  { value: 'active', label: 'Active duty', hint: 'Currently serving full-time' },
  { value: 'guard_reserve', label: 'National Guard or Reserve', hint: 'Currently a drilling member' },
  { value: 'veteran', label: 'Veteran', hint: 'Separated from service' },
  { value: 'retired', label: 'Military retiree', hint: '20+ years or Reserve retirement' },
  { value: 'medically_retired', label: 'Medically retired', hint: 'Retired for disability (TDRL/PDRL)' },
];

export const BRANCH_OPTIONS: Option<Exclude<Profile['branch'], ''>>[] = [
  { value: 'army', label: 'Army' },
  { value: 'navy', label: 'Navy' },
  { value: 'air_force', label: 'Air Force' },
  { value: 'marine_corps', label: 'Marine Corps' },
  { value: 'coast_guard', label: 'Coast Guard' },
  { value: 'space_force', label: 'Space Force' },
  { value: 'army_national_guard', label: 'Army National Guard' },
  { value: 'air_national_guard', label: 'Air National Guard' },
];

export const DISCHARGE_OPTIONS: Option<Profile['discharge']>[] = [
  { value: 'honorable', label: 'Honorable' },
  { value: 'general', label: 'General (Under Honorable Conditions)' },
  { value: 'oth', label: 'Other Than Honorable (OTH)' },
  { value: 'bad_conduct', label: 'Bad Conduct' },
  { value: 'dishonorable', label: 'Dishonorable' },
  { value: 'uncharacterized', label: 'Uncharacterized / Entry-level' },
  { value: 'unknown', label: 'Not sure' },
];

export const LENGTH_OPTIONS: Option<Exclude<Profile['serviceLength'], ''>>[] = [
  { value: 'lt_90d', label: 'Less than 90 days' },
  { value: '90d_2y', label: '90 days – 2 years' },
  { value: '2_6y', label: '2 – 6 years' },
  { value: '6_10y', label: '6 – 10 years' },
  { value: '10_20y', label: '10 – 20 years' },
  { value: '20_plus', label: '20+ years' },
];

export const ERA_OPTIONS: Option<Profile['eras'][number]>[] = [
  { value: 'post911', label: 'Post-9/11 (Sept 11, 2001 – present)', hint: 'At least 90 days of active duty' },
  { value: 'gulf_war', label: 'Gulf War (Aug 1990 – Sept 2001)' },
  { value: 'vietnam', label: 'Vietnam Era (1955 – 1975)' },
  { value: 'korea', label: 'Korean War (1950 – 1955)' },
  { value: 'wwii', label: 'World War II (1941 – 1946)' },
  { value: 'peacetime', label: 'Peacetime only (e.g., 1975 – 1990)' },
];

export const EXPOSURE_OPTIONS: Option<Profile['exposures'][number]>[] = [
  { value: 'burn_pits', label: 'Burn pits / airborne hazards (post-9/11 deployments)' },
  { value: 'gulf_war', label: 'Gulf War illness / Southwest Asia (1990+)' },
  { value: 'agent_orange', label: 'Agent Orange (Vietnam, Thailand, Korea DMZ, etc.)' },
  { value: 'camp_lejeune', label: 'Camp Lejeune contaminated water (1953 – 1987)' },
  { value: 'radiation', label: 'Radiation (nuclear testing, cleanup, etc.)' },
  { value: 'other', label: 'Other hazardous exposure' },
];

export const RATING_OPTIONS: Option[] = [
  { value: 'none', label: 'No rating' },
  ...[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => ({ value: String(n), label: `${n}%` })),
];

export const MARITAL_OPTIONS: Option<Exclude<Profile['marital'], ''>>[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export const EDUCATION_OPTIONS: Option<Exclude<Profile['education'], ''>>[] = [
  { value: 'no_hs', label: 'Some high school' },
  { value: 'hs', label: 'High school diploma / GED' },
  { value: 'some_college', label: 'Some college or vocational training' },
  { value: 'associate', label: 'Associate degree' },
  { value: 'bachelor', label: "Bachelor's degree" },
  { value: 'graduate', label: 'Graduate degree' },
];

export const EMPLOYMENT_OPTIONS: Option<Exclude<Profile['employment'], ''>>[] = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Looking for work' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'unable', label: 'Unable to work' },
];

export const INCOME_OPTIONS: Option<Exclude<Profile['income'], ''>>[] = [
  { value: 'lt_20k', label: 'Under $20,000' },
  { value: '20_40k', label: '$20,000 – $40,000' },
  { value: '40_75k', label: '$40,000 – $75,000' },
  { value: '75_125k', label: '$75,000 – $125,000' },
  { value: 'gt_125k', label: 'Over $125,000' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

export const HOUSING_OPTIONS: Option<Exclude<Profile['housing'], ''>>[] = [
  { value: 'own', label: 'I own my home' },
  { value: 'buying', label: "I'm looking to buy" },
  { value: 'rent', label: 'I rent' },
  { value: 'with_family', label: 'Living with family/friends' },
  { value: 'at_risk', label: 'At risk of losing my housing' },
  { value: 'homeless', label: 'Currently homeless' },
];

export const STATE_OPTIONS: Option[] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'],
  ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'],
  ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
  ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'],
  ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'], ['XX', 'Outside the United States'],
].map(([value, label]) => ({ value, label }));

export const labelFor = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.label ?? '';
