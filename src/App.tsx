import { useMemo, useState } from 'react';
import { PrintReport } from './components/PrintReport';
import { Results } from './components/Results';
import { Wizard } from './components/Wizard';
import { emptyProfile } from './data/options';
import { matchBenefits } from './engine/match';
import type { Profile } from './types';

type Stage = 'welcome' | 'wizard' | 'results';

export default function App() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const matches = useMemo(() => (stage === 'results' ? matchBenefits(profile) : []), [stage, profile]);

  const go = (s: Stage) => {
    setStage(s);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <div className="crisis-bar" role="note">
        <span>
          <strong>In crisis?</strong> Veterans Crisis Line: dial <a href="tel:988">988</a> then press 1, text{' '}
          <a href="sms:838255">838255</a>, or{' '}
          <a href="https://www.veteranscrisisline.net/get-help-now/chat/" target="_blank" rel="noopener noreferrer">
            chat online
          </a>
          .
        </span>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button type="button" className="brand" onClick={() => go('welcome')} aria-label="Benefits Navigator home">
            <span className="brand-mark" aria-hidden="true">
              ★
            </span>
            <span>
              Benefits Navigator
              <small>for service members &amp; veterans</small>
            </span>
          </button>
          {stage === 'results' && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go('wizard')}>
              Edit answers
            </button>
          )}
        </div>
      </header>

      <main className="container" id="main">
        {stage === 'welcome' && <Welcome onStart={() => go('wizard')} />}
        {stage === 'wizard' && (
          <Wizard profile={profile} onChange={setProfile} onFinish={() => go('results')} onCancel={() => go('welcome')} />
        )}
        {stage === 'results' && (
          <Results
            profile={profile}
            matches={matches}
            onEdit={() => go('wizard')}
            onRestart={() => {
              setProfile(emptyProfile());
              go('welcome');
            }}
          />
        )}
      </main>

      {stage === 'results' && <PrintReport profile={profile} matches={matches} />}

      <footer className="site-footer">
        <div className="container">
          <p>
            Benefits Navigator is an independent informational tool and is <strong>not affiliated with</strong> the U.S. Department of
            Veterans Affairs, the Department of Defense, or any state government. Results are estimates based on your answers — always
            confirm eligibility with the official agency. Benefit information last reviewed October 2026.
          </p>
          <p>Your answers stay in your browser and are never sent or stored anywhere.</p>
        </div>
      </footer>
    </>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="welcome">
      <section className="hero">
        <p className="eyebrow">Free · Private · About 5 minutes</p>
        <h1>Find every benefit you’ve earned.</h1>
        <p className="lead">
          Answer a few questions about your service, disability rating, family, and where you live. We’ll match you with federal VA
          and DoD programs plus benefits from your state — with plain-language explanations and step-by-step instructions to apply.
        </p>
        <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
          Get started →
        </button>
        <p className="hero-note">No account, no sign-up. Your answers never leave your device.</p>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title" className="sr-only">
          How it works
        </h2>
        <ol className="how-grid">
          <li className="card">
            <span className="how-num">1</span>
            <h3>Tell us about you</h3>
            <p>Service history, discharge, VA rating, family, education, and location.</p>
          </li>
          <li className="card">
            <span className="how-num">2</span>
            <h3>See your matches</h3>
            <p>Disability pay, health care, GI Bill, home loans, state tax breaks, tuition waivers, and more — sorted by what matters most.</p>
          </li>
          <li className="card">
            <span className="how-num">3</span>
            <h3>Apply with confidence</h3>
            <p>Every benefit includes eligibility, documents to gather, forms, official links, and a printable report.</p>
          </li>
        </ol>
      </section>

      <section className="covers card">
        <h2>What we check</h2>
        <ul className="covers-list">
          <li>VA disability compensation &amp; PACT Act</li>
          <li>VA health care, TRICARE &amp; CHAMPVA</li>
          <li>GI Bill, VR&amp;E &amp; tuition assistance</li>
          <li>VA home loans &amp; housing grants</li>
          <li>Federal hiring preference &amp; job help</li>
          <li>Pension, CRSC/CRDP &amp; insurance</li>
          <li>Family &amp; dependent benefits</li>
          <li>Benefits in all 50 states + DC</li>
        </ul>
      </section>
    </div>
  );
}
