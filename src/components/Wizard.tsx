import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  BRANCH_OPTIONS,
  DEATH_CAUSE_OPTIONS,
  DISCHARGE_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  ERA_OPTIONS,
  EXPOSURE_OPTIONS,
  HOUSING_OPTIONS,
  INCOME_OPTIONS,
  LENGTH_OPTIONS,
  MARITAL_OPTIONS,
  RATING_OPTIONS,
  REMARRIAGE_OPTIONS,
  STATE_OPTIONS,
  STATUS_OPTIONS,
} from '../data/options';
import { isServing, isSurvivor, isVeteran } from '../engine/rules';
import type { Profile } from '../types';
import { Choice, Counter, Field, MultiChoice, Select, TextInput, YesNo } from './fields';

interface Props {
  profile: Profile;
  onChange: (p: Profile) => void;
  step: number;
  onStepChange: (step: number) => void;
  onFinish: () => void;
  onCancel: () => void;
}

interface Step {
  title: string;
  intro: string;
  render: () => ReactNode;
  /** Returns an error message if the step can't be completed yet. */
  validate?: () => string | null;
}

const toInt = (s: string) => {
  const n = parseInt(s.replace(/\D/g, ''), 10);
  return Number.isNaN(n) ? null : n;
};

/** Answers that only make sense for a living service member/veteran, cleared when switching to surviving spouse. */
const VETERAN_ONLY: Partial<Profile> = {
  rating: null,
  permanentAndTotal: false,
  tdiu: false,
  claimPending: false,
  unratedConditions: false,
  severeDisability: false,
  needsDailyCare: false,
  separatingSoon: false,
  separationYear: null,
  combat: false,
  purpleHeart: false,
};

/** Answers that only make sense for a surviving spouse. */
const SURVIVOR_ONLY: Partial<Profile> = { deathCause: '', remarriage: 'no', veteranWasRetiree: false };

export function Wizard({ profile: p, onChange, step: rawStep, onStepChange, onFinish, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...p, [k]: v });

  const serving = isServing(p);
  const vet = isVeteran(p);
  const survivor = isSurvivor(p);

  const setStatus = (status: Profile['status']) => {
    if (status === p.status) return;
    if (status === 'surviving_spouse') onChange({ ...p, ...VETERAN_ONLY, status, marital: 'widowed' });
    else onChange({ ...p, ...SURVIVOR_ONLY, status, marital: p.status === 'surviving_spouse' ? '' : p.marital });
  };

  const steps: Step[] = [
    {
      title: survivor ? 'Their service' : 'Your service',
      intro: survivor
        ? 'We’re sorry for your loss. Tell us about your spouse’s military service — it determines which survivor benefits apply to you.'
        : 'Tell us about your military status. This determines which federal programs apply to you.',
      validate: () => (p.status ? null : 'Please choose your current status to continue.'),
      render: () => (
        <>
          <Choice legend="Which best describes you?" options={STATUS_OPTIONS} value={p.status} onChange={setStatus} />
          <Choice
            legend={survivor ? 'Their branch of service' : 'Branch of service'}
            options={BRANCH_OPTIONS}
            value={p.branch}
            onChange={(v) => set('branch', v)}
            columns={2}
          />
          {(p.status === 'veteran' || survivor) && (
            <Choice
              legend={survivor ? 'Their character of discharge' : 'Character of discharge'}
              help={
                survivor
                  ? 'Shown on their DD-214, block 24. If they died on active duty, choose Honorable.'
                  : "Shown on your DD-214, block 24. Don't worry if it's not Honorable — many benefits are still available."
              }
              options={DISCHARGE_OPTIONS}
              value={p.discharge}
              onChange={(v) => set('discharge', v)}
            />
          )}
          <Choice
            legend={survivor ? 'Their total time in service' : 'Total time in service (active duty or Guard/Reserve)'}
            options={LENGTH_OPTIONS}
            value={p.serviceLength}
            onChange={(v) => set('serviceLength', v)}
            columns={3}
          />
          {survivor && (
            <YesNo
              legend="Was your spouse a military retiree (receiving military retired pay)?"
              value={p.veteranWasRetiree}
              onChange={(v) => set('veteranWasRetiree', v)}
            />
          )}
          {vet && (
            <TextInput
              label="Year you separated or retired"
              value={p.separationYear?.toString() ?? ''}
              onChange={(v) => set('separationYear', toInt(v))}
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 2019"
            />
          )}
          {serving && (
            <YesNo
              legend="Do you expect to separate or retire within the next 12 months?"
              value={p.separatingSoon}
              onChange={(v) => set('separatingSoon', v)}
            />
          )}
        </>
      ),
    },
    {
      title: 'Service history',
      intro: survivor
        ? 'When and where your spouse served affects survivor pension, education, and PACT Act benefits.'
        : 'When and where you served affects GI Bill, pension, and toxic exposure benefits.',
      render: () => (
        <>
          <MultiChoice
            legend={survivor ? 'When did your spouse serve? (select all that apply)' : 'When did you serve? (select all that apply)'}
            options={ERA_OPTIONS}
            value={p.eras}
            onChange={(v) => set('eras', v)}
          />
          {!survivor && (
            <>
              <YesNo
                legend="Did you deploy to a combat zone or receive hostile fire / imminent danger pay?"
                value={p.combat}
                onChange={(v) => set('combat', v)}
              />
              <YesNo legend="Are you a Purple Heart recipient?" value={p.purpleHeart} onChange={(v) => set('purpleHeart', v)} />
            </>
          )}
          <MultiChoice
            legend={survivor ? 'Was your spouse exposed to any of these? (optional)' : 'Were you exposed to any of these? (optional)'}
            help={
              survivor
                ? 'If your spouse died from a PACT Act presumptive condition, you may qualify for DIC — even if VA denied a claim before.'
                : 'Many related conditions are presumed service-connected under the PACT Act.'
            }
            options={EXPOSURE_OPTIONS}
            value={p.exposures}
            onChange={(v) => set('exposures', v)}
          />
        </>
      ),
    },
    survivor
      ? {
          title: 'About your loss',
          intro: 'These answers determine eligibility for DIC, CHAMPVA, education benefits, and more. Choose “Not sure” for anything you don’t know.',
          render: () => (
            <>
              <Choice
                legend="Which best describes your spouse’s death?"
                help="A Veterans Service Officer can help you review the death certificate and records — this is free."
                options={DEATH_CAUSE_OPTIONS}
                value={p.deathCause}
                onChange={(v) => set('deathCause', v)}
                columns={1}
              />
              <Choice
                legend="Have you remarried?"
                options={REMARRIAGE_OPTIONS}
                value={p.remarriage}
                onChange={(v) => set('remarriage', v)}
                columns={1}
              />
            </>
          ),
        }
      : {
          title: 'Disability',
          intro: 'Your VA disability rating unlocks many federal and state benefits. Skip anything you don’t know.',
          render: () => (
            <>
              {p.status !== 'active' && (
                <Select
                  label="Current combined VA disability rating"
                  help="Find it in your VA benefit summary letter or the VA: Health and Benefits app."
                  options={RATING_OPTIONS}
                  value={p.rating === null ? 'none' : String(p.rating)}
                  placeholder="Select your rating"
                  onChange={(v) => {
                    const rating = v === 'none' || v === '' ? null : Number(v);
                    onChange({ ...p, rating, permanentAndTotal: rating === null ? false : p.permanentAndTotal, tdiu: rating === null ? false : p.tdiu });
                  }}
                />
              )}
              {p.rating !== null && p.rating >= 60 && p.rating < 100 && (
                <YesNo
                  legend="Are you paid at the 100% rate through Individual Unemployability (TDIU)?"
                  value={p.tdiu}
                  onChange={(v) => set('tdiu', v)}
                />
              )}
              {p.rating !== null && (p.rating === 100 || p.tdiu) && (
                <YesNo
                  legend="Is your rating Permanent and Total (P&T)?"
                  help="Your VA decision letter will say “permanent and total” or “no future exams scheduled.”"
                  value={p.permanentAndTotal}
                  onChange={(v) => set('permanentAndTotal', v)}
                />
              )}
              <YesNo legend="Do you have a VA disability claim or appeal in progress?" value={p.claimPending} onChange={(v) => set('claimPending', v)} />
              <YesNo
                legend="Do you have injuries or health conditions from service that are not rated yet?"
                help="Examples: hearing loss/tinnitus, back or knee pain, PTSD, sleep apnea, migraines."
                value={p.unratedConditions}
                onChange={(v) => set('unratedConditions', v)}
              />
              <YesNo
                legend="Do you have a severe service-connected disability?"
                help="Loss or loss of use of a limb, blindness, severe burns, ALS, or similar."
                value={p.severeDisability}
                onChange={(v) => set('severeDisability', v)}
              />
              <YesNo legend="Do you need help from another person with daily activities?" value={p.needsDailyCare} onChange={(v) => set('needsDailyCare', v)} />
            </>
          ),
        },
    {
      title: 'Family',
      intro: survivor
        ? 'Surviving children may qualify for DIC, education, and health benefits of their own.'
        : 'Many benefits extend to spouses and children, and some pay more if you have dependents.',
      render: () => (
        <>
          {!survivor && <Choice legend="Marital status" options={MARITAL_OPTIONS} value={p.marital} onChange={(v) => set('marital', v)} columns={3} />}
          <Field legend={survivor ? 'Children of the veteran' : 'Children'}>
            <Counter label="Children under 18" value={p.kidsUnder18} onChange={(v) => set('kidsUnder18', v)} />
            <Counter label="Children 18–23 in school" value={p.kidsInSchool} onChange={(v) => set('kidsInSchool', v)} />
          </Field>
          <YesNo
            legend="Do you have a child who became permanently disabled before age 18?"
            value={p.disabledChild}
            onChange={(v) => set('disabledChild', v)}
          />
        </>
      ),
    },
    {
      title: 'About you',
      intro: 'These answers help us find education, employment, and income-based programs.',
      render: () => (
        <>
          <TextInput label="Your age" value={p.age?.toString() ?? ''} onChange={(v) => set('age', toInt(v))} inputMode="numeric" maxLength={3} placeholder="e.g. 34" />
          <Choice legend="Highest level of education" options={EDUCATION_OPTIONS} value={p.education} onChange={(v) => set('education', v)} />
          <YesNo
            legend="Are you interested in college, vocational training, or a certification?"
            value={p.wantsEducation}
            onChange={(v) => set('wantsEducation', v)}
          />
          <Choice legend="Employment status" options={EMPLOYMENT_OPTIONS} value={p.employment} onChange={(v) => set('employment', v)} columns={3} />
          <Choice
            legend="Approximate yearly household income"
            help={`Used only to check income-based programs like ${survivor ? 'Survivors Pension' : 'VA Pension'}. Stays on your device.`}
            options={INCOME_OPTIONS}
            value={p.income}
            onChange={(v) => set('income', v)}
            columns={3}
          />
          {!survivor && <YesNo legend="Do you have federal student loans?" value={p.studentLoans} onChange={(v) => set('studentLoans', v)} />}
        </>
      ),
    },
    {
      title: 'Where you live',
      intro: 'Every state offers its own veteran benefits — from property tax breaks to free tuition.',
      validate: () => (p.state ? null : 'Please choose your state to see state benefits.'),
      render: () => (
        <>
          <Select label="State of residence" options={STATE_OPTIONS} value={p.state} onChange={(v) => set('state', v)} placeholder="Choose your state" />
          {p.state !== 'XX' && (
            <TextInput
              label="ZIP code (optional)"
              help="Used to link you to your nearest VA facilities."
              value={p.zip}
              onChange={(v) => set('zip', v.replace(/\D/g, '').slice(0, 5))}
              inputMode="numeric"
              maxLength={5}
              placeholder="e.g. 78701"
            />
          )}
          <Choice legend="Housing situation" options={HOUSING_OPTIONS} value={p.housing} onChange={(v) => set('housing', v)} />
        </>
      ),
    },
  ];

  const step = Math.min(Math.max(rawStep, 0), steps.length - 1);
  const current = steps[step];
  const last = step === steps.length - 1;

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const next = () => {
    const err = current.validate?.() ?? null;
    setError(err);
    if (err) return;
    if (last) onFinish();
    else onStepChange(step + 1);
  };

  const back = () => {
    setError(null);
    if (step === 0) onCancel();
    else onStepChange(step - 1);
  };

  return (
    <section className="wizard" aria-labelledby="wizard-title">
      <div className="progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
        <ol className="progress-steps">
          {steps.map((s, i) => (
            <li key={i} className={i === step ? 'current' : i < step ? 'done' : ''}>
              <button type="button" onClick={() => i < step && onStepChange(i)} disabled={i >= step} aria-current={i === step ? 'step' : undefined}>
                <span className="progress-dot">{i < step ? '✓' : i + 1}</span>
                <span className="progress-name">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="progress-bar">
          <div style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="card wizard-card">
        <p className="eyebrow">
          Step {step + 1} of {steps.length}
        </p>
        <h2 id="wizard-title" ref={headingRef} tabIndex={-1}>
          {current.title}
        </h2>
        <p className="lead">{current.intro}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {current.render()}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="wizard-nav">
            <button type="button" className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
            <button type="submit" className="btn btn-primary">
              {last ? 'See my benefits' : 'Continue →'}
            </button>
          </div>
        </form>
        <p className="saved-note">Your answers are saved automatically on this device.</p>
      </div>
    </section>
  );
}
