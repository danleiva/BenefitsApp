import type { Criteria, StateBenefitSpec, StateInfo } from './stateTypes';

/*
 * State benefit data. Summaries are intentionally conservative: dollar amounts and
 * thresholds change often, so every card links to the state's official agency and
 * asks the user to confirm details. Last reviewed: October 2026.
 */

const property = (id: string, summary: string, who: Criteria, eligibility: string, details: string[] = []): StateBenefitSpec => ({
  id,
  name: who.minRating !== undefined || who.total ? 'Disabled Veteran Property Tax Relief' : 'Veteran Property Tax Exemption',
  category: 'financial',
  summary,
  who: { homeowner: true, ...who },
  eligibility,
  details: [...details, 'Apply through your county assessor or tax office; deadlines are often early in the year.'],
});

const edu = (id: string, name: string, summary: string, who: Criteria, eligibility: string, url?: string): StateBenefitSpec => ({
  id,
  name,
  category: 'education',
  summary,
  who,
  eligibility,
  url,
});

const other = (
  id: string,
  name: string,
  category: StateBenefitSpec['category'],
  summary: string,
  who: Criteria,
  eligibility: string,
  url?: string,
): StateBenefitSpec => ({ id, name, category, summary, who, eligibility, url });

export const states: StateInfo[] = [
  {
    code: 'AL', name: 'Alabama', agency: 'Alabama Department of Veterans Affairs', url: 'https://va.alabama.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Alabama income tax.' },
    benefits: [
      property('al-prop', 'Full homestead property tax exemption for veterans rated 100% permanent and total.', { total: true }, '100% service-connected (P&T) veteran, primary residence.'),
      edu('al-edu', 'Alabama G.I. & Dependents’ Educational Benefit', 'Tuition and fees at Alabama public colleges for spouses and children of veterans rated 20% or higher.', { dependents: true, minRating: 20 }, 'Dependents of a veteran rated 20%+ who was an Alabama resident; age and residency rules apply.'),
    ],
  },
  {
    code: 'AK', name: 'Alaska', agency: 'Alaska Office of Veterans Affairs', url: 'https://veterans.alaska.gov/',
    retirementTax: { status: 'none', note: 'Alaska has no state income tax.' },
    benefits: [
      property('ak-prop', 'Exemption on the first $150,000 of assessed value of your home for veterans rated 50% or higher.', { minRating: 50 }, 'Veteran with a 50%+ service-connected rating; primary residence.'),
      other('ak-hunt', 'Free Disabled Veteran Hunting & Fishing License', 'recreation', 'Free hunting, sport fishing, and trapping license for veterans rated 50% or higher.', { minRating: 50 }, 'Alaska resident veteran with a 50%+ rating.', 'https://www.adfg.alaska.gov/'),
    ],
  },
  {
    code: 'AZ', name: 'Arizona', agency: 'Arizona Department of Veterans’ Services', url: 'https://dvs.az.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay has been fully exempt from Arizona income tax since 2021.' },
    benefits: [
      property('az-prop', 'Partial property tax exemption for disabled veterans, prorated by rating and subject to income and assessed-value limits.', { minRating: 10 }, 'Arizona resident veteran with a service-connected disability; income and value limits apply.'),
    ],
  },
  {
    code: 'AR', name: 'Arkansas', agency: 'Arkansas Department of Veterans Affairs', url: 'https://veterans.arkansas.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from Arkansas income tax.' },
    benefits: [
      property('ar-prop', 'Full property tax exemption on the home of veterans rated 100% or TDIU (also certain loss-of-limb/blindness disabilities).', { total: true }, '100% or TDIU veteran; primary residence.'),
      edu('ar-edu', 'Arkansas Military Dependents’ Scholarship', 'Tuition and fee waiver at Arkansas public colleges for spouses and children of veterans rated 100% P&T.', { dependents: true, total: true, pt: true }, 'Dependents of a 100% P&T veteran (also KIA/MIA/POW).'),
    ],
  },
  {
    code: 'CA', name: 'California', agency: 'California Department of Veterans Affairs (CalVet)', url: 'https://www.calvet.ca.gov/',
    retirementTax: { status: 'partial', note: 'Starting with tax year 2025, California excludes up to $20,000 of military retirement pay for retirees under income limits. The rest is taxable.' },
    benefits: [
      property('ca-prop', 'Disabled Veterans’ Exemption reduces assessed value of your home (roughly $175,000, or $260,000+ for low-income households; adjusted yearly).', { total: true, survivor: true }, 'Veteran rated 100% or TDIU; primary residence.'),
      edu('ca-edu', 'CalVet College Fee Waiver', 'Waives tuition and fees at California community colleges, CSU, and UC for dependents of service-connected disabled veterans.', { dependents: true, minRating: 0 }, 'Children/spouses of veterans with a service-connected disability (several plans; income limits apply for some).', 'https://www.calvet.ca.gov/VetServices/Pages/College-Fee-Waiver.aspx'),
      other('ca-home', 'CalVet Home Loans', 'housing', 'State home loan program for veterans buying in California, including options for those who may not qualify for a VA loan.', { veteran: true }, 'California veterans; program terms vary.', 'https://www.calvet.ca.gov/calvet-programs/home-loans'),
    ],
  },
  {
    code: 'CO', name: 'Colorado', agency: 'Colorado Division of Veterans Affairs', url: 'https://vets.colorado.gov/',
    retirementTax: { status: 'partial', note: 'Colorado allows a military retirement subtraction (about $15,000 for those under 55) and larger pension subtractions at 55 and 65.' },
    benefits: [
      property('co-prop', 'Exempts 50% of the first $200,000 of your home’s actual value for veterans rated 100% P&T.', { total: true, pt: true, survivor: true }, '100% P&T veteran who has owned and occupied the home since Jan 1 of the tax year.'),
    ],
  },
  {
    code: 'CT', name: 'Connecticut', agency: 'Connecticut Department of Veterans Affairs', url: 'https://portal.ct.gov/dva',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from Connecticut income tax.' },
    benefits: [
      property('ct-prop', 'Additional property tax exemption for disabled veterans, scaled by rating, with expanded relief for 100% P&T veterans.', { minRating: 10 }, 'Veteran with a service-connected rating; file with your town assessor.'),
      edu('ct-edu', 'Connecticut Veteran Tuition Waiver', 'Tuition waived at Connecticut public colleges and universities for eligible wartime veterans.', { veteran: true, wartime: true, education: true }, 'Honorably discharged veteran with qualifying wartime service who is a Connecticut resident.'),
    ],
  },
  {
    code: 'DE', name: 'Delaware', agency: 'Delaware Commission of Veterans Affairs', url: 'https://veteransaffairs.delaware.gov/',
    retirementTax: { status: 'partial', note: 'Delaware excludes part of military retirement pay (amount depends on age and is scheduled to increase).' },
    benefits: [
      property('de-prop', 'Exemption from school property taxes for veterans rated 100% P&T (and certain others).', { total: true }, '100% service-connected veteran, Delaware resident for 3+ years.'),
    ],
  },
  {
    code: 'DC', name: 'District of Columbia', agency: 'DC Mayor’s Office of Veterans Affairs', url: 'https://ova.dc.gov/',
    retirementTax: { status: 'taxed', note: 'DC taxes military retirement pay (limited pension exclusions may apply at 62+).' },
    benefits: [],
  },
  {
    code: 'FL', name: 'Florida', agency: 'Florida Department of Veterans’ Affairs', url: 'https://www.floridavets.org/',
    retirementTax: { status: 'none', note: 'Florida has no state income tax.' },
    benefits: [
      property('fl-prop', 'Total homestead exemption for veterans with a service-connected permanent and total disability; $5,000 exemption for veterans rated 10%+.', { minRating: 10, survivor: true }, 'Full exemption at 100% P&T (or TDIU P&T); $5,000 off assessed value at 10%+.', ['Veterans 65+ with combat-related disabilities can get a percentage discount.']),
      edu('fl-edu', 'Scholarships for Children & Spouses of Disabled Veterans', 'Florida scholarship covering tuition and fees for dependents of veterans with 100% service-connected P&T disabilities.', { dependents: true, total: true, pt: true }, 'Dependents of a 100% P&T veteran who meets Florida residency rules.'),
      other('fl-hunt', 'Disabled Veteran Hunting & Fishing License', 'recreation', 'Free or discounted Florida hunting and fishing licenses for disabled veterans.', { minRating: 10 }, 'Florida resident veteran with a qualifying rating.', 'https://myfwc.com/license/'),
    ],
  },
  {
    code: 'GA', name: 'Georgia', agency: 'Georgia Department of Veterans Service', url: 'https://veterans.georgia.gov/',
    retirementTax: { status: 'partial', note: 'For tax year 2026, Georgia exempts up to $65,000 of military retirement pay (law sunsets in 2028).' },
    benefits: [
      property('ga-prop', 'Large homestead exemption (over $100,000 of assessed value, indexed yearly) for veterans rated 100% or TDIU.', { total: true, survivor: true }, '100% or TDIU veteran (also certain loss-of-limb/blindness disabilities).'),
      other('ga-tag', 'Free Disabled Veteran License Plate', 'recreation', 'Free license plate and exemption from the annual ad valorem vehicle tax for qualifying disabled veterans.', { minRating: 100 }, 'Veterans rated 100% or with certain specific disabilities.', 'https://dor.georgia.gov/motor-vehicles'),
    ],
  },
  {
    code: 'HI', name: 'Hawaii', agency: 'Hawaii Office of Veterans’ Services', url: 'https://dod.hawaii.gov/ovs/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Hawaii income tax.' },
    benefits: [
      property('hi-prop', 'Full real property tax exemption for veterans who are totally disabled due to service (administered by each county).', { total: true }, '100% service-connected veteran; primary residence.'),
    ],
  },
  {
    code: 'ID', name: 'Idaho', agency: 'Idaho Division of Veterans Services', url: 'https://www.veterans.idaho.gov/',
    retirementTax: { status: 'partial', note: 'Idaho’s retirement deduction applies to military retirees 65+ (or 62+ and disabled), subject to limits.' },
    benefits: [
      property('id-prop', 'Property tax reduction for veterans rated 100% or TDIU.', { total: true }, '100% or TDIU veteran; primary residence. Apply with your county by April 15.'),
    ],
  },
  {
    code: 'IL', name: 'Illinois', agency: 'Illinois Department of Veterans’ Affairs', url: 'https://veterans.illinois.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Illinois income tax.' },
    benefits: [
      property('il-prop', 'Homestead exemption for veterans with disabilities: $2,500 off EAV at 30–49%, $5,000 at 50–69%, and fully exempt at 70% or higher.', { minRating: 30 }, 'Veteran rated 30%+; primary residence.'),
      edu('il-edu', 'Illinois Veteran Grant (IVG)', 'Pays tuition and certain fees at Illinois public colleges and universities.', { veteran: true, education: true }, 'Illinois resident with about one year of active service and an honorable discharge, who lived in Illinois before entering service (or within 6 months after).'),
    ],
  },
  {
    code: 'IN', name: 'Indiana', agency: 'Indiana Department of Veterans Affairs', url: 'https://www.in.gov/dva/',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from Indiana income tax.' },
    benefits: [
      property('in-prop', 'Property tax deductions for disabled veterans; amounts depend on rating, age, and service.', { minRating: 10 }, 'Veterans with service-connected ratings (larger deductions at higher ratings).'),
      edu('in-edu', 'Children of Disabled Veterans Tuition Remission', 'Reduced tuition at Indiana public colleges for children of disabled veterans.', { dependents: true, minRating: 0 }, 'Children of veterans with a service-connected disability who meet Indiana residency rules.'),
    ],
  },
  {
    code: 'IA', name: 'Iowa', agency: 'Iowa Department of Veterans Affairs', url: 'https://va.iowa.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from Iowa income tax.' },
    benefits: [
      property('ia-prop', 'Disabled Veteran Homestead Credit fully exempts the homestead of veterans rated 100% or TDIU; all honorably discharged veterans may also get the Military Service Tax Exemption.', { veteran: true }, 'Full credit at 100%/TDIU; smaller exemption for other honorably discharged veterans.'),
    ],
  },
  {
    code: 'KS', name: 'Kansas', agency: 'Kansas Office of Veterans Services', url: 'https://kcva.ks.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Kansas income tax.' },
    benefits: [
      property('ks-prop', 'Homestead property tax refund for disabled veterans rated 50% or higher.', { minRating: 50 }, 'Veteran with a 50%+ rating, Kansas resident homeowner.'),
      edu('ks-edu', 'Kansas Military Service Scholarship', 'Tuition and fees at Kansas public colleges for veterans who served in combat after 9/11.', { veteran: true, combat: true, education: true }, 'Kansas resident who served in a qualifying combat area on or after Sept 11, 2001.'),
    ],
  },
  {
    code: 'KY', name: 'Kentucky', agency: 'Kentucky Department of Veterans Affairs', url: 'https://veterans.ky.gov/',
    retirementTax: { status: 'partial', note: 'Kentucky excludes up to $31,110 of retirement income; service before 1998 may be fully excluded.' },
    benefits: [
      property('ky-prop', 'Disability homestead exemption (about $46,000 of assessed value, adjusted every two years) for veterans who are totally disabled.', { total: true }, 'Veteran rated 100% or totally disabled; primary residence.'),
      edu('ky-edu', 'Kentucky Veterans Tuition Waiver', 'Tuition waived at Kentucky public colleges for dependents of veterans who are 100% disabled or died from service.', { dependents: true, total: true }, 'Children/spouses of qualifying disabled or deceased veterans.'),
    ],
  },
  {
    code: 'LA', name: 'Louisiana', agency: 'Louisiana Department of Veterans Affairs', url: 'https://www.vetaffairs.la.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Louisiana income tax.' },
    benefits: [
      property('la-prop', 'Additional homestead exemption: $2,500 at 50–69%, $4,500 at 70–99%, and full exemption at 100% (some municipal taxes excepted).', { minRating: 50, survivor: true }, 'Veteran rated 50%+; primary residence.'),
      edu('la-edu', 'Louisiana Title 29 Dependent Tuition Exemption', 'Tuition waiver at Louisiana public colleges for children and spouses of veterans rated 90% or higher.', { dependents: true, minRating: 90 }, 'Dependents of a veteran rated 90%+ (or deceased from service) meeting residency rules.'),
    ],
  },
  {
    code: 'ME', name: 'Maine', agency: 'Maine Bureau of Veterans’ Services', url: 'https://www.maine.gov/veterans/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Maine income tax.' },
    benefits: [
      property('me-prop', 'Veterans’ property tax exemption for wartime veterans 62+ or 100% disabled; larger exemption for paraplegic veterans.', { veteran: true, wartime: true }, 'Wartime veteran age 62+ or with a 100% rating.'),
      edu('me-edu', 'Maine Veterans Dependents Educational Benefits', 'Tuition waiver at Maine public colleges for dependents of veterans rated 100% P&T.', { dependents: true, total: true, pt: true }, 'Spouses and children of a 100% P&T veteran.'),
    ],
  },
  {
    code: 'MD', name: 'Maryland', agency: 'Maryland Department of Veterans & Military Families', url: 'https://veterans.maryland.gov/',
    retirementTax: { status: 'partial', note: 'Maryland excludes up to $12,500 of military retirement pay ($20,000 at age 55+).' },
    benefits: [
      property('md-prop', 'Full property tax exemption on the home of veterans rated 100% P&T.', { total: true, pt: true, survivor: true }, '100% P&T veteran; primary residence.'),
      edu('md-edu', 'Edward T. Conroy Memorial Scholarship', 'Tuition and fees at Maryland colleges for children of veterans with a 100% service-connected disability.', { dependents: true, total: true }, 'Children/spouses of 100% disabled or deceased veterans.'),
    ],
  },
  {
    code: 'MA', name: 'Massachusetts', agency: 'Massachusetts Executive Office of Veterans Services', url: 'https://www.mass.gov/orgs/executive-office-of-veterans-services',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Massachusetts income tax.' },
    benefits: [
      other('ma-ch115', 'Chapter 115 Veterans’ Benefits (financial assistance)', 'financial', 'Need-based monthly cash and medical assistance for veterans and their dependents, administered through your local Veterans’ Service Officer.', { veteran: true, lowIncome: true }, 'Massachusetts veterans and dependents who meet income and asset limits.'),
      property('ma-prop', 'Clause 22 property tax exemptions for veterans with a 10%+ rating; larger exemptions at 100% and full exemption for paraplegic veterans.', { minRating: 10 }, 'Veteran rated 10%+; file with your local assessor.'),
      edu('ma-edu', 'Massachusetts Veteran Tuition Waiver', 'Tuition waived at Massachusetts public colleges for eligible veterans.', { veteran: true, education: true }, 'Massachusetts resident veterans meeting service requirements.'),
    ],
  },
  {
    code: 'MI', name: 'Michigan', agency: 'Michigan Veterans Affairs Agency', url: 'https://www.michiganveterans.com/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Michigan income tax.' },
    benefits: [
      property('mi-prop', 'Full property tax exemption on the homestead of veterans rated 100% or TDIU.', { total: true, survivor: true }, '100% or TDIU veteran; primary residence.'),
      edu('mi-edu', 'Michigan Children of Veterans Tuition Grant', 'Tuition grant for children of veterans who are totally disabled or died from service.', { dependents: true, total: true }, 'Children 16–26 of qualifying veterans.'),
      other('mi-trust', 'Michigan Veterans Trust Fund Emergency Grants', 'financial', 'One-time emergency financial help for veterans facing a temporary hardship.', { veteran: true, wartime: true }, 'Michigan wartime veterans facing an unexpected financial emergency.'),
    ],
  },
  {
    code: 'MN', name: 'Minnesota', agency: 'Minnesota Department of Veterans Affairs', url: 'https://mn.gov/mdva/',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from Minnesota income tax.' },
    benefits: [
      property('mn-prop', 'Disabled Veterans’ Market Value Exclusion: $150,000 at 70%+ and $300,000 at 100% P&T.', { minRating: 70, survivor: true }, 'Veteran rated 70%+; primary residence.'),
      edu('mn-edu', 'Minnesota GI Bill', 'State education and training grants for veterans, service members, and some dependents.', { education: true }, 'Minnesota veterans and service members meeting service requirements.'),
    ],
  },
  {
    code: 'MS', name: 'Mississippi', agency: 'Mississippi Veterans Affairs', url: 'https://www.msva.ms.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Mississippi income tax.' },
    benefits: [property('ms-prop', 'Full homestead exemption for veterans rated 100% service-connected.', { total: true }, '100% service-connected veteran; primary residence.')],
  },
  {
    code: 'MO', name: 'Missouri', agency: 'Missouri Veterans Commission', url: 'https://mvc.dps.mo.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Missouri income tax.' },
    benefits: [
      edu('mo-edu', 'Missouri Returning Heroes’ Education Act', 'Caps tuition at Missouri public colleges for veterans who served in a combat zone after 9/11.', { veteran: true, combat: true, education: true }, 'Veterans with qualifying combat service after Sept 11, 2001 and an honorable discharge.'),
    ],
  },
  {
    code: 'MT', name: 'Montana', agency: 'Montana Veterans Affairs Division', url: 'https://montanaveterans.mt.gov/',
    retirementTax: { status: 'partial', note: 'Montana exempts 50% of military retirement pay for a limited period (rules depend on residency).' },
    benefits: [property('mt-prop', 'Disabled Veteran Property Tax Assistance for 100% or TDIU veterans, based on income.', { total: true, survivor: true }, '100%/TDIU veteran (and surviving spouses), income limits apply.')],
  },
  {
    code: 'NE', name: 'Nebraska', agency: 'Nebraska Department of Veterans’ Affairs', url: 'https://veterans.nebraska.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from Nebraska income tax.' },
    benefits: [
      property('ne-prop', 'Homestead exemption for veterans rated 100% or TDIU (no income limit for some categories).', { total: true, survivor: true }, '100% or TDIU veteran; file with your county assessor.'),
      edu('ne-edu', 'Nebraska Tuition Waiver for Dependents', 'Tuition waiver at Nebraska public colleges for dependents of veterans who are 100% disabled or died from service.', { dependents: true, total: true }, 'Spouses and children of qualifying veterans.'),
    ],
  },
  {
    code: 'NV', name: 'Nevada', agency: 'Nevada Department of Veterans Services', url: 'https://veterans.nv.gov/',
    retirementTax: { status: 'none', note: 'Nevada has no state income tax.' },
    benefits: [
      property('nv-prop', 'Disabled veteran exemption for veterans rated 60%+ (larger at 80% and 100%); can be applied to property or vehicle privilege tax.', { minRating: 60 }, 'Veteran rated 60%+.'),
    ],
  },
  {
    code: 'NH', name: 'New Hampshire', agency: 'New Hampshire Division of Community Based Military Programs', url: 'https://www.nh.gov/nhveterans/',
    retirementTax: { status: 'none', note: 'New Hampshire does not tax wages or retirement pay.' },
    benefits: [
      property('nh-prop', 'Service-connected Total Disability Tax Credit ($700–$5,000, set by your town) plus the standard Veterans’ Tax Credit.', { veteran: true, survivor: true }, 'Veterans with qualifying service; larger credit at 100% P&T.'),
    ],
  },
  {
    code: 'NJ', name: 'New Jersey', agency: 'New Jersey Department of Military & Veterans Affairs', url: 'https://www.nj.gov/military/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from New Jersey income tax.' },
    benefits: [
      property('nj-prop', 'Full property tax exemption for veterans rated 100% P&T; all honorably discharged veterans get a $250 annual deduction.', { veteran: true, survivor: true }, 'Full exemption at 100% P&T; $250 deduction for other eligible veterans.'),
    ],
  },
  {
    code: 'NM', name: 'New Mexico', agency: 'New Mexico Department of Veterans Services', url: 'https://www.nmdvs.org/',
    retirementTax: { status: 'partial', note: 'New Mexico exempts up to $30,000 of military retirement pay through tax year 2026 (check for extension).' },
    benefits: [
      property('nm-prop', 'Starting in 2026, disabled veterans get a property tax exemption proportional to their rating (full at 100%). All veterans may claim a $4,000 veteran exemption.', { veteran: true }, 'Veterans with a service-connected rating; $4,000 exemption for other veterans.'),
    ],
  },
  {
    code: 'NY', name: 'New York', agency: 'New York State Department of Veterans’ Services', url: 'https://veterans.ny.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from New York income tax.' },
    benefits: [
      property('ny-prop', 'Alternative Veterans’ Exemption and Cold War Veterans’ Exemption (local option) with additional reductions for disabled veterans.', { veteran: true }, 'Veterans with qualifying service; amounts depend on your municipality and rating.'),
      edu('ny-edu', 'New York Veterans Tuition Awards (VTA)', 'Awards for full- or part-time study at New York colleges for eligible veterans.', { veteran: true, education: true }, 'New York residents who served in qualifying conflicts/areas.', 'https://www.hesc.ny.gov/'),
    ],
  },
  {
    code: 'NC', name: 'North Carolina', agency: 'North Carolina Department of Military & Veterans Affairs', url: 'https://www.milvets.nc.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt for retirees with 20+ years of service or medical retirement; some others may qualify under the Bailey settlement.' },
    benefits: [
      property('nc-prop', 'Disabled Veteran Homestead Exclusion removes the first $45,000 of appraised value for veterans rated 100% or TDIU.', { total: true, survivor: true }, '100% or TDIU veteran; primary residence.'),
      edu('nc-edu', 'NC Scholarships for Children of Wartime Veterans', 'Tuition and fees (plus board in some classes) at NC public colleges for children of qualifying disabled or deceased wartime veterans.', { dependents: true, minRating: 20, wartime: true }, 'Children of wartime veterans who are disabled, deceased, POW/MIA, or awarded certain decorations.'),
    ],
  },
  {
    code: 'ND', name: 'North Dakota', agency: 'North Dakota Department of Veterans Affairs', url: 'https://www.veterans.nd.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from North Dakota income tax.' },
    benefits: [property('nd-prop', 'Disabled Veterans Property Tax Credit for veterans rated 50% or higher, scaled by rating.', { minRating: 50 }, 'Veteran rated 50%+; primary residence.')],
  },
  {
    code: 'OH', name: 'Ohio', agency: 'Ohio Department of Veterans Services', url: 'https://dvs.ohio.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Ohio income tax.' },
    benefits: [
      property('oh-prop', 'Enhanced Homestead Exemption for veterans rated 100% or TDIU.', { total: true }, '100% or TDIU veteran; primary residence.'),
      other('oh-cvsc', 'County Veterans Service Commission Emergency Assistance', 'financial', 'Every Ohio county has a Veterans Service Commission that provides emergency financial assistance (rent, utilities, food) and free claims help.', { veteran: true }, 'Ohio veterans and dependents facing financial hardship.'),
      edu('oh-edu', 'Ohio War Orphans & Severely Disabled Veterans’ Children Scholarship', 'Tuition assistance at Ohio colleges for children of wartime veterans rated 60%+ or deceased.', { dependents: true, minRating: 60, wartime: true }, 'Children of wartime veterans with 60%+ ratings (or deceased/POW/MIA).'),
    ],
  },
  {
    code: 'OK', name: 'Oklahoma', agency: 'Oklahoma Department of Veterans Affairs', url: 'https://oklahoma.gov/veterans.html',
    retirementTax: { status: 'full', note: 'Oklahoma exempts military retirement pay (confirm current percentage with the Oklahoma Tax Commission).' },
    benefits: [
      property('ok-prop', 'Full property tax exemption on the homestead of veterans rated 100% P&T.', { total: true, pt: true, survivor: true }, '100% P&T veteran; primary residence.'),
      other('ok-sales', 'Sales Tax Exemption for 100% Disabled Veterans', 'financial', 'Oklahoma exempts eligible 100% P&T veterans (and surviving spouses) from state sales tax on purchases up to an annual cap.', { total: true, pt: true }, '100% P&T veteran; apply through the Oklahoma Tax Commission.'),
    ],
  },
  {
    code: 'OR', name: 'Oregon', agency: 'Oregon Department of Veterans’ Affairs', url: 'https://www.oregon.gov/odva/',
    retirementTax: { status: 'partial', note: 'Oregon only exempts retirement pay for service before Oct 1991; most current retirees are taxed.' },
    benefits: [
      property('or-prop', 'Disabled veteran property tax exemption (roughly $25,000–$30,000 of assessed value, adjusted yearly) for veterans rated 40%+.', { minRating: 40 }, 'Veteran rated 40%+; primary residence.'),
      other('or-loan', 'ODVA Veterans’ Home Loan Program', 'housing', 'Oregon’s state-backed home loan program for eligible veterans, usable once per lifetime.', { veteran: true }, 'Veterans meeting ODVA service requirements.', 'https://www.oregon.gov/odva/Home-Loans/'),
    ],
  },
  {
    code: 'PA', name: 'Pennsylvania', agency: 'Pennsylvania Department of Military & Veterans Affairs', url: 'https://www.pa.gov/agencies/dmva',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Pennsylvania income tax.' },
    benefits: [
      property('pa-prop', 'Disabled Veterans Real Estate Tax Exemption for veterans rated 100% or TDIU with demonstrated financial need.', { total: true, survivor: true }, '100%/TDIU veteran with wartime service and financial need.'),
      other('pa-vta', 'Veterans’ Temporary Assistance (VTA)', 'financial', 'Short-term financial help for food, shelter, fuel, and clothing for veterans in need.', { veteran: true, lowIncome: true }, 'Pennsylvania veterans and dependents facing financial hardship.'),
    ],
  },
  {
    code: 'RI', name: 'Rhode Island', agency: 'Rhode Island Office of Veterans Services', url: 'https://vets.ri.gov/',
    retirementTax: { status: 'full', note: 'Rhode Island exempts military retirement pay (confirm current rules with the RI Division of Taxation).' },
    benefits: [property('ri-prop', 'Local property tax exemptions for veterans, with larger amounts for disabled veterans (set by each city/town).', { veteran: true }, 'Veterans meeting local service and disability requirements.')],
  },
  {
    code: 'SC', name: 'South Carolina', agency: 'South Carolina Department of Veterans’ Affairs', url: 'https://scdva.sc.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from South Carolina income tax.' },
    benefits: [
      property('sc-prop', 'Full property tax exemption on your home and up to two vehicles for veterans rated 100% P&T.', { total: true, pt: true, survivor: true }, '100% P&T veteran.'),
      edu('sc-edu', 'South Carolina Free Tuition for Children of Certain Veterans', 'Free tuition at SC public colleges for children of veterans who are 100% disabled, POW, Purple Heart recipients, or killed in action.', { dependents: true }, 'Children of qualifying veterans meeting SC residency rules.'),
    ],
  },
  {
    code: 'SD', name: 'South Dakota', agency: 'South Dakota Department of Veterans Affairs', url: 'https://vetaffairs.sd.gov/',
    retirementTax: { status: 'none', note: 'South Dakota has no state income tax.' },
    benefits: [
      property('sd-prop', 'Exemption of up to $200,000 of assessed value for veterans rated 100% or TDIU; full exemption for paraplegic veterans.', { total: true }, '100% or TDIU veteran; primary residence.'),
      edu('sd-edu', 'South Dakota Free Tuition for Veterans', 'Free tuition at South Dakota public universities for eligible veterans.', { veteran: true, education: true }, 'Eligible veterans with qualifying service and residency.'),
    ],
  },
  {
    code: 'TN', name: 'Tennessee', agency: 'Tennessee Department of Veterans Services', url: 'https://www.tn.gov/veteran.html',
    retirementTax: { status: 'none', note: 'Tennessee has no tax on wages or retirement pay.' },
    benefits: [
      property('tn-prop', 'Property Tax Relief for disabled veterans rated 100% (or with certain specific disabilities).', { total: true }, '100% service-connected veteran; apply with the Comptroller’s office.'),
      edu('tn-edu', 'Tennessee Helping Heroes Grant', 'Grant for veterans with post-9/11 service attending Tennessee colleges.', { veteran: true, education: true }, 'Tennessee residents with a qualifying service medal after Sept 11, 2001.'),
    ],
  },
  {
    code: 'TX', name: 'Texas', agency: 'Texas Veterans Commission', url: 'https://www.tvc.texas.gov/',
    retirementTax: { status: 'none', note: 'Texas has no state income tax.' },
    benefits: [
      property('tx-prop', 'Full homestead exemption for veterans rated 100% or TDIU; partial exemptions ($5,000–$12,000) for 10–99% ratings.', { minRating: 10, survivor: true }, 'Veteran rated 10%+ (full exemption at 100%/TDIU).'),
      edu('tx-edu', 'Hazlewood Act', 'Up to 150 credit hours of tuition exemption at Texas public colleges; unused hours can be transferred to a child (Legacy Program).', { veteran: true }, 'Texas resident veteran who entered service in Texas (or was a Texas resident), with 181+ days of active duty and an honorable discharge.', 'https://www.tvc.texas.gov/education/hazlewood/'),
      other('tx-vlb', 'Texas Veterans Land Board Loans', 'housing', 'Low-interest state loans for land, homes, and home improvements for Texas veterans.', { veteran: true }, 'Texas veterans with qualifying service.', 'https://www.vlb.texas.gov/'),
    ],
  },
  {
    code: 'UT', name: 'Utah', agency: 'Utah Department of Veterans & Military Affairs', url: 'https://veterans.utah.gov/',
    retirementTax: { status: 'full', note: 'Utah taxes military retirement pay but offers a credit that effectively eliminates the tax.' },
    benefits: [property('ut-prop', 'Property tax exemption proportional to your rating (e.g., 50% rating = 50% of the maximum exemption).', { minRating: 10 }, 'Veteran rated 10%+; primary residence.')],
  },
  {
    code: 'VT', name: 'Vermont', agency: 'Vermont Office of Veterans Affairs', url: 'https://veterans.vermont.gov/',
    retirementTax: { status: 'partial', note: 'Vermont fully exempts military retirement pay for households with AGI of $125,000 or less, with a partial exemption up to $175,000.' },
    benefits: [property('vt-prop', 'Disabled veterans’ exemption of $10,000–$40,000 of assessed value (set by your town) for veterans rated 50%+.', { minRating: 50 }, 'Veteran rated 50%+; file by May 1.')],
  },
  {
    code: 'VA', name: 'Virginia', agency: 'Virginia Department of Veterans Services', url: 'https://www.dvs.virginia.gov/',
    retirementTax: { status: 'partial', note: 'Virginia allows a subtraction of up to $40,000 of military retirement pay (2025 and later).' },
    benefits: [
      property('va-prop', 'Full real estate tax exemption on the home of veterans rated 100% P&T (or TDIU in some cases); one vehicle may also be exempt.', { total: true, survivor: true }, '100% P&T veteran; primary residence.'),
      edu('va-edu', 'Virginia Military Survivors & Dependents Education Program (VMSDEP)', 'Waives tuition and fees at Virginia public colleges for dependents of veterans rated 90%+ (or killed/MIA).', { dependents: true, minRating: 90 }, 'Spouses and children of qualifying veterans meeting residency rules.'),
    ],
  },
  {
    code: 'WA', name: 'Washington', agency: 'Washington Department of Veterans Affairs', url: 'https://www.dva.wa.gov/',
    retirementTax: { status: 'none', note: 'Washington has no state income tax.' },
    benefits: [
      property('wa-prop', 'Property tax exemption or deferral for veterans rated 80%+ (or TDIU), with household income limits.', { minRating: 80 }, 'Veteran rated 80%+ or TDIU, under income limits.'),
      edu('wa-edu', 'Washington Veteran Tuition Waivers', 'Public colleges may waive tuition for eligible veterans, service members, and dependents of disabled veterans.', { education: true }, 'Rules vary by school; ask the college veterans office.'),
    ],
  },
  {
    code: 'WV', name: 'West Virginia', agency: 'West Virginia Department of Veterans Assistance', url: 'https://veterans.wv.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is fully exempt from West Virginia income tax.' },
    benefits: [property('wv-prop', 'Homestead exemption on the first $20,000 of assessed value for veterans who are 100% disabled.', { total: true }, '100% service-connected veteran; primary residence.')],
  },
  {
    code: 'WI', name: 'Wisconsin', agency: 'Wisconsin Department of Veterans Affairs', url: 'https://dva.wi.gov/',
    retirementTax: { status: 'full', note: 'Military retirement pay is exempt from Wisconsin income tax.' },
    benefits: [
      other('wi-prop', 'Veterans & Surviving Spouses Property Tax Credit', 'financial', 'Refundable state income tax credit equal to the property taxes on your home for veterans rated 100% or TDIU.', { total: true, homeowner: true, survivor: true }, '100% or TDIU veteran who is a Wisconsin resident.'),
      edu('wi-edu', 'Wisconsin GI Bill', 'Full tuition and fee remission at UW and Wisconsin technical colleges for eligible veterans, plus dependents of veterans rated 30%+.', { education: true }, 'Wisconsin veterans with qualifying service and residency; dependents of veterans rated 30%+.'),
    ],
  },
  {
    code: 'WY', name: 'Wyoming', agency: 'Wyoming Veterans Commission', url: 'https://www.wyomilitary.wyo.gov/veterans/',
    retirementTax: { status: 'none', note: 'Wyoming has no state income tax.' },
    benefits: [property('wy-prop', 'Veterans’ property tax exemption for wartime veterans (can also apply to vehicle registration fees).', { veteran: true, wartime: true }, 'Honorably discharged wartime veterans; Wyoming residents for 3+ years.')],
  },
];

export const stateByCode = (code: string) => states.find((s) => s.code === code);
