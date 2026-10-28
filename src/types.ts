export type ServiceStatus =
  | 'active'
  | 'guard_reserve'
  | 'veteran'
  | 'retired'
  | 'medically_retired';

export type Branch =
  | 'army'
  | 'navy'
  | 'air_force'
  | 'marine_corps'
  | 'coast_guard'
  | 'space_force'
  | 'army_national_guard'
  | 'air_national_guard';

export type Discharge =
  | 'honorable'
  | 'general'
  | 'oth'
  | 'bad_conduct'
  | 'dishonorable'
  | 'uncharacterized'
  | 'unknown';

export type ServiceLength =
  | 'lt_90d'
  | '90d_2y'
  | '2_6y'
  | '6_10y'
  | '10_20y'
  | '20_plus';

export type Era = 'post911' | 'gulf_war' | 'vietnam' | 'korea' | 'wwii' | 'peacetime';

export type Exposure =
  | 'burn_pits'
  | 'gulf_war'
  | 'agent_orange'
  | 'camp_lejeune'
  | 'radiation'
  | 'other';

export type Marital = 'single' | 'married' | 'divorced' | 'separated' | 'widowed';

export type Education =
  | 'no_hs'
  | 'hs'
  | 'some_college'
  | 'associate'
  | 'bachelor'
  | 'graduate';

export type Employment = 'employed' | 'unemployed' | 'self_employed' | 'student' | 'retired' | 'unable';

export type Income = 'lt_20k' | '20_40k' | '40_75k' | '75_125k' | 'gt_125k' | 'prefer_not';

export type Housing = 'own' | 'rent' | 'buying' | 'with_family' | 'at_risk' | 'homeless';

export interface Profile {
  // Service
  status: ServiceStatus | '';
  branch: Branch | '';
  discharge: Discharge;
  serviceLength: ServiceLength | '';
  eras: Era[];
  separationYear: number | null;
  separatingSoon: boolean;
  combat: boolean;
  purpleHeart: boolean;
  exposures: Exposure[];
  // Disability
  rating: number | null; // null = no VA rating
  permanentAndTotal: boolean;
  tdiu: boolean;
  claimPending: boolean;
  unratedConditions: boolean;
  severeDisability: boolean;
  needsDailyCare: boolean;
  // Family
  marital: Marital | '';
  kidsUnder18: number;
  kidsInSchool: number;
  disabledChild: boolean;
  // Life
  age: number | null;
  education: Education | '';
  wantsEducation: boolean;
  employment: Employment | '';
  income: Income | '';
  housing: Housing | '';
  studentLoans: boolean;
  // Location
  state: string; // two-letter code, 'XX' for outside the US, '' if unanswered
  zip: string;
}

export type Category =
  | 'disability'
  | 'health'
  | 'education'
  | 'housing'
  | 'employment'
  | 'financial'
  | 'insurance'
  | 'family'
  | 'transition'
  | 'recreation'
  | 'memorial';

export interface Link {
  label: string;
  url: string;
}

export type Strength = 'likely' | 'possible';

export interface MatchResult {
  strength: Strength;
  reasons: string[];
}

export interface Benefit {
  id: string;
  name: string;
  category: Category;
  level: 'federal' | 'state';
  agency: string;
  summary: string;
  whatYouGet: string[];
  eligibility: string[];
  howToApply: string[];
  documents?: string[];
  forms?: string[];
  phone?: string;
  links: Link[]; // first link is the primary "apply / learn more" destination
  /** Higher numbers float to the top of results and the "Start here" list. */
  priority: number;
  match: (p: Profile) => MatchResult | null;
}

export interface MatchedBenefit {
  benefit: Benefit;
  result: MatchResult;
}
