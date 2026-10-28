# Benefits Navigator

A free, private web app that asks U.S. service members, veterans, and surviving spouses about their service, VA disability rating, family, education, income, and location, then matches them with federal and state benefits — with plain-language explanations, eligibility, documents to gather, forms, official links, and step-by-step instructions to apply.

- **Six-step questionnaire:** service, service history (eras, combat, Purple Heart, toxic exposures), disability, family, about you, and where you live.
- **Results dashboard:** "Start here" top next steps, estimated monthly VA compensation, filters by category / federal vs. state / likely eligible, and search.
- **Benefit details:** why you matched, what you get, who is eligible, how to apply, documents, forms, phone numbers, and official links.
- **Print / Save as PDF:** a full, expanded report with checkboxes to bring to a VSO or VA appointment.
- **Surviving spouses:** a dedicated path that asks about the veteran's service, the cause of death, and remarriage, then matches DIC (with a payment estimate), Survivors Pension, the Fry Scholarship, SBP, CHAMPVA/TRICARE, DEA, home loans, burial benefits, grief support, Social Security survivors benefits, and state programs that extend to survivors.
- **Saved progress:** answers are saved automatically in the browser's `localStorage`, so people can leave and come back, and reloading resumes at the same step. "Start over" or "Erase my saved answers" clears them. Saved data is validated on load, and the app still works if storage is blocked.
- **Private by design:** a static site with no backend. Answers never leave the browser.

## What's covered

- **Federal (about 45 programs):** VA disability compensation, BDD, PACT Act, TDIU, dependents, CRSC/CRDP, discharge upgrades, VA health/dental/mental health/Vet Centers, TRICARE, CHAMPVA, caregiver program, Post-9/11 and Montgomery GI Bill, GI Bill transfer, VR&E, DEA, Tuition Assistance, COOL, TAP, SkillBridge, Military OneSource, SCRA, USERRA, VA home loans, SAH/SHA grants, auto allowance, homeless programs, federal hiring preference, American Job Centers/UCX, VA pension and Aid & Attendance, SBP, student loan TPD discharge, SSA expedited disability, SGLI/VGLI/VALife/VMLI, MyCAA, child care, commissary/exchange, Space-A, the parks pass, the Veteran ID card, and burial benefits.
- **Survivors:** DIC, Survivors Pension, Fry Scholarship, SBP annuity, death gratuity/SGLI, burial allowance, grief support (Vet Centers, TAPS), derived veterans' preference, and Social Security survivors benefits. CHAMPVA, DEA, TRICARE, VA home loans, commissary access, and the parks pass also cover eligible survivors.
- **State (all 50 states and DC):** military retirement income-tax treatment, disabled-veteran property tax relief, state tuition programs, and other notable state programs (e.g., Texas Hazlewood, Massachusetts Chapter 115, Ohio county emergency aid), plus the state veterans agency for every state.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # matching-engine unit tests
npm run build      # typecheck + production build into dist/
```

Built with React, TypeScript, and Vite. No runtime dependencies besides React.

## Project layout

```
src/
  types.ts              Profile and Benefit types
  data/federal.ts       Federal benefits with eligibility rules
  data/survivors.ts     Federal benefits for surviving spouses
  data/states.ts        50-state + DC data (tax, property, education, more)
  data/options.ts       Questionnaire options and the empty profile
  engine/rules.ts       Profile helpers, 2026 VA compensation rates
  engine/match.ts       Matching, state criteria evaluation, sorting
  storage.ts            Save/restore answers in localStorage
  components/           Wizard, Results, BenefitCard, BenefitDetail, PrintReport, HelpPanel
```

Each benefit has a `match(profile)` function that returns `likely`, `possible`, or `null`, with human-readable reasons. State benefits use declarative `Criteria` (e.g., `{ total: true, pt: true, homeowner: true }`). Add `survivor: true` when a state extends a program to unremarried surviving spouses.

## Deploying

`.github/workflows/deploy.yml` runs tests and deploys `dist/` to GitHub Pages on every push to `main`. Enable it under **Settings → Pages → Source: GitHub Actions**. The build uses relative paths, so it also works on Netlify, Vercel, or any static host.

## Keeping data current

Benefit amounts and state laws change every year, especially state retirement-tax rules and property-tax thresholds. Benefit information was last reviewed in October 2026. To update:

- `COMPENSATION_2026` and `DIC_BASE_2026` in `src/engine/rules.ts` (VA rates change every December 1).
- `retirementTax` and property entries in `src/data/states.ts`.
- The "last reviewed" date in `src/App.tsx`.

## Disclaimer

Not affiliated with the U.S. Department of Veterans Affairs, the Department of Defense, or any state government. Results are estimates; users are always directed to official sources to confirm eligibility.
