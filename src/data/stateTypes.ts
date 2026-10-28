import type { Category } from '../types';

export type RetirementTaxStatus = 'none' | 'full' | 'partial' | 'taxed';

/** Simple, declarative eligibility rules for a state benefit. All listed conditions must hold. */
export interface Criteria {
  /** Minimum VA rating. */
  minRating?: number;
  /** Requires 100% rating or TDIU. */
  total?: boolean;
  /** Requires a permanent & total rating (in addition to `total`). */
  pt?: boolean;
  /** Veterans/retirees only (not currently serving). */
  veteran?: boolean;
  /** Currently serving (active, Guard, Reserve). */
  serving?: boolean;
  /** Guard/Reserve only. */
  guard?: boolean;
  /** Wartime service required. */
  wartime?: boolean;
  /** Requires a spouse or children (benefit is for dependents). */
  dependents?: boolean;
  /** Requires a homeowner (or buyer) — property-tax style benefits. */
  homeowner?: boolean;
  /** Interested in education. */
  education?: boolean;
  minAge?: number;
  purpleHeart?: boolean;
  combat?: boolean;
  lowIncome?: boolean;
}

export interface StateBenefitSpec {
  id: string;
  name: string;
  category: Category;
  summary: string;
  details?: string[];
  who: Criteria;
  /** Plain-language eligibility shown to the user. */
  eligibility: string;
  url?: string;
}

export interface StateInfo {
  code: string;
  name: string;
  agency: string;
  url: string;
  phone?: string;
  retirementTax: { status: RetirementTaxStatus; note: string };
  benefits: StateBenefitSpec[];
}
