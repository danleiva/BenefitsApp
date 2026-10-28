import type { MatchedBenefit, Strength } from '../types';

export function MatchBadge({ strength }: { strength: Strength }) {
  return strength === 'likely' ? (
    <span className="badge badge-likely">Likely eligible</span>
  ) : (
    <span className="badge badge-possible">May be eligible</span>
  );
}

interface Props {
  match: MatchedBenefit;
  onOpen: (m: MatchedBenefit) => void;
}

export function BenefitCard({ match, onOpen }: Props) {
  const { benefit: b, result } = match;
  return (
    <article className="benefit-card">
      <div className="benefit-meta">
        <MatchBadge strength={result.strength} />
        <span className={`badge badge-level ${b.level}`}>{b.level === 'federal' ? 'Federal' : b.agency.replace('State of ', '')}</span>
      </div>
      <h3>{b.name}</h3>
      <p className="benefit-summary">{b.summary}</p>
      {result.reasons[0] && <p className="benefit-reason">✓ {result.reasons[0]}</p>}
      <div className="benefit-actions">
        <button type="button" className="btn btn-secondary" onClick={() => onOpen(match)}>
          Details &amp; how to apply
        </button>
        <a className="btn-link" href={b.links[0].url} target="_blank" rel="noopener noreferrer">
          Official site ↗
        </a>
      </div>
    </article>
  );
}
