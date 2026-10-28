import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  BRANCH_OPTIONS,
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
  STATE_OPTIONS,
  STATUS_OPTIONS,
} from '../data/options';
import { isServing, isVeteran } from '../engine/rules';
import type { Profile } from '../types';
import { Choice, Counter, Field, MultiChoice, Select, TextInput, YesNo } from './fields';

interface Props {
  profile: Profile;
  onChange: (p: Profile) => void;
  onFinish: () => void;
  onCancel: () => void;
  initialStep?: number;
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

export function Wizard({ profile: p, onChange, onFinish, onCancel, initialStep = 0 }: Props) {
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...p, [k]: v });

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const serving = isServing(p);
  const vet = isVeteran(p);

  const steps: Step[] = [
    {
      title: 'Your service',
      intro: 'Tell us about your military status. This determines which federal programs apply to you.',
      validate: () => (p.status ? null : 'Please choose your current status to continue.'),
      render: () => (
        <>
          <Choice legend="What is your current status?" options={STATUS_OPTIONS} value={p.status} onChange={(v) => set('status', v)} />
          <Choice legend="Branch of service" options={BRANCH_OPTIONS} value={p.branch} onChange={(v) => set('branch', v)} columns={2} />
          {p.status === 'veteran' && (
            <Choice
              legend="Character of discharge"
              help="Shown on your DD-214, block 24. Don't worry if it's not Honorable — many benefits are still available."
              options={DISCHARGE_OPTIONS}
              value={p.discharge}
              onChange={(v) => set('discharge', v)}
            />
          )}
          <Choice legend="Total time in service (active duty or Guard/Reserve)" options={LENGTH_OPTIONS} value={p.serviceLength} onChange={(v) => set('serviceLength', v)} columns={3} />
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
      intro: 'When and where you served affects GI Bill, pension, and toxic exposure benefits.',
      render: () => (
        <>
          <MultiChoice legend="When did you serve? (select all that apply)" options={ERA_OPTIONS} value={p.eras} onChange={(v) => set('eras', v)} />
          <YesNo
            legend="Did you deploy to a combat zone or receive hostile fire / imminent danger pay?"
            value={p.combat}
            onChange={(v) => set('combat', v)}
          />
          <YesNo legend="Are you a Purple Heart recipient?" value={p.purpleHeart} onChange={(v) => set('purpleHeart', v)} />
          <MultiChoice
            legend="Were you exposed to any of these? (optional)"
            help="Many related conditions are presumed service-connected under the PACT Act."
            options={EXPOSURE_OPTIONS}
            value={p.exposures}
            onChange={(v) => set('exposures', v)}
          />
        </>
      ),
    },
    {
      title: 'Disability',
      intro: 'Your VA disability rating unlocks many federal and state benefits. Skip anything you don’t know.',
      render: () => (
        <>
          {!(p.status === 'active') && (
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
      intro: 'Many benefits extend to spouses and children, and some pay more if you have dependents.',
      render: () => (
        <>
          <Choice legend="Marital status" options={MARITAL_OPTIONS} value={p.marital} onChange={(v) => set('marital', v)} columns={3} />
          <Field legend="Children">
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
            help="Used only to check income-based programs like VA Pension. Stays on your device."
            options={INCOME_OPTIONS}
            value={p.income}
            onChange={(v) => set('income', v)}
            columns={3}
          />
          <YesNo legend="Do you have federal student loans?" value={p.studentLoans} onChange={(v) => set('studentLoans', v)} />
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

  const current = steps[step];
  const last = step === steps.length - 1;

  const next = () => {
    const err = current.validate?.() ?? null;
    setError(err);
    if (err) return;
    if (last) onFinish();
    else setStep(step + 1);
  };

  const back = () => {
    setError(null);
    if (step === 0) onCancel();
    else setStep(step - 1);
  };

  return (
    <section className="wizard" aria-labelledby="wizard-title">
      <div className="progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
        <ol className="progress-steps">
          {steps.map((s, i) => (
            <li key={s.title} className={i === step ? 'current' : i < step ? 'done' : ''}>
              <button type="button" onClick={() => i < step && setStep(i)} disabled={i >= step} aria-current={i === step ? 'step' : undefined}>
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
      </div>
    </section>
  );
}
