import { useEffect, useRef } from 'react';
import { CATEGORY_LABELS } from '../engine/match';
import type { MatchedBenefit } from '../types';
import { MatchBadge } from './BenefitCard';

interface Props {
  match: MatchedBenefit | null;
  onClose: () => void;
}

export function BenefitDetail({ match, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (match && !d.open) d.showModal();
    if (!match && d.open) d.close();
  }, [match]);

  return (
    <dialog
      ref={ref}
      className="detail"
      onClose={onClose}
      onClick={(e) => {
        // Close when clicking the backdrop.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="detail-title"
    >
      {match && <DetailBody match={match} onClose={onClose} />}
    </dialog>
  );
}

function DetailBody({ match, onClose }: { match: MatchedBenefit; onClose: () => void }) {
  const { benefit: b, result } = match;
  const [primary, ...more] = b.links;
  return (
    <article className="detail-inner">
      <header className="detail-header">
        <div>
          <p className="eyebrow">
            {CATEGORY_LABELS[b.category]} · {b.agency}
          </p>
          <h2 id="detail-title">{b.name}</h2>
          <MatchBadge strength={result.strength} />
        </div>
        <button type="button" className="btn-icon close" onClick={onClose} aria-label="Close details">
          ×
        </button>
      </header>

      <div className="detail-body">
        <p className="lead">{b.summary}</p>

        <section className="why">
          <h3>Why this matched</h3>
          <ul>
            {result.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <div className="detail-grid">
          <section>
            <h3>What you get</h3>
            <ul>
              {b.whatYouGet.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Who is eligible</h3>
            <ul>
              {b.eligibility.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        </div>

        <section>
          <h3>How to apply</h3>
          <ol className="steps">
            {b.howToApply.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </section>

        {(b.documents?.length || b.forms?.length) && (
          <div className="detail-grid">
            {b.documents?.length ? (
              <section>
                <h3>Documents to gather</h3>
                <ul className="checklist">
                  {b.documents.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {b.forms?.length ? (
              <section>
                <h3>Forms</h3>
                <ul>
                  {b.forms.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}

        {b.phone && (
          <p className="phone">
            Questions? Call <a href={`tel:${b.phone.replace(/[^\d]/g, '')}`}>{b.phone}</a>
          </p>
        )}

        {more.length > 0 && (
          <section>
            <h3>More information</h3>
            <ul className="link-list">
              {more.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="detail-footer">
        <a className="btn btn-primary" href={primary.url} target="_blank" rel="noopener noreferrer">
          {primary.label} ↗
        </a>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </footer>
    </article>
  );
}
