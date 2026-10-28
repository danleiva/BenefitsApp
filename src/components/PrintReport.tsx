import { stateByCode } from '../data/states';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../engine/match';
import { estimatedCompensation } from '../engine/rules';
import type { MatchedBenefit, Profile } from '../types';
import { profileFacts } from './summary';

/** Full, expanded report that only renders when printing (or saving as PDF). */
export function PrintReport({ profile, matches }: { profile: Profile; matches: MatchedBenefit[] }) {
  const st = stateByCode(profile.state);
  const comp = estimatedCompensation(profile);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="print-report" aria-hidden="true">
      <header>
        <h1>My Military & Veteran Benefits Report</h1>
        <p>Prepared {date}</p>
        <p>
          <strong>Profile:</strong> {profileFacts(profile).join(' · ')}
        </p>
        {comp !== null && comp > 0 && (
          <p>
            <strong>Estimated VA compensation:</strong> ${comp.toFixed(2)}/month (2026 rate, veteran alone)
          </p>
        )}
        <p className="print-note">
          This report is an estimate based on your answers, not an official eligibility decision. Bring it to a free accredited
          Veterans Service Officer, your {st ? st.agency : 'state veterans affairs office'}, or VA (1-800-827-1000) to confirm and apply.
        </p>
      </header>

      {CATEGORY_ORDER.map((cat) => {
        const items = matches.filter((m) => m.benefit.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat}>
            <h2>{CATEGORY_LABELS[cat]}</h2>
            {items.map(({ benefit: b, result }) => (
              <article key={b.id} className="print-benefit">
                <h3>
                  ☐ {b.name} <em>({result.strength === 'likely' ? 'Likely eligible' : 'May be eligible'} · {b.agency})</em>
                </h3>
                <p>{b.summary}</p>
                {result.reasons.length > 0 && (
                  <p>
                    <strong>Why:</strong> {result.reasons.join(' ')}
                  </p>
                )}
                <p>
                  <strong>How to apply:</strong>
                </p>
                <ol>
                  {b.howToApply.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                {b.documents?.length ? (
                  <p>
                    <strong>Documents:</strong> {b.documents.join('; ')}
                  </p>
                ) : null}
                {b.forms?.length ? (
                  <p>
                    <strong>Forms:</strong> {b.forms.join(', ')}
                  </p>
                ) : null}
                <p className="print-links">
                  {b.links.map((l) => (
                    <span key={l.url}>
                      {l.label}: {l.url}
                    </span>
                  ))}
                  {b.phone && <span>Phone: {b.phone}</span>}
                </p>
              </article>
            ))}
          </section>
        );
      })}

      <footer>
        <p>
          Veterans Crisis Line: dial 988 then press 1 · text 838255 · VA benefits: 1-800-827-1000 · Homeless veterans: 1-877-424-3838
        </p>
        <p>Not affiliated with the U.S. Department of Veterans Affairs or Department of Defense.</p>
      </footer>
    </div>
  );
}
