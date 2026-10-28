import { useMemo, useState } from 'react';
import { CATEGORY_LABELS, CATEGORY_ORDER, topActions } from '../engine/match';
import { estimatedCompensation } from '../engine/rules';
import type { Category, MatchedBenefit, Profile } from '../types';
import { BenefitCard } from './BenefitCard';
import { BenefitDetail } from './BenefitDetail';
import { HelpPanel } from './HelpPanel';
import { profileFacts } from './summary';

interface Props {
  profile: Profile;
  matches: MatchedBenefit[];
  onEdit: () => void;
  onRestart: () => void;
}

type LevelFilter = 'all' | 'federal' | 'state';

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function Results({ profile, matches, onEdit, onRestart }: Props) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [likelyOnly, setLikelyOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<MatchedBenefit | null>(null);

  const likelyCount = matches.filter((m) => m.result.strength === 'likely').length;
  const stateCount = matches.filter((m) => m.benefit.level === 'state').length;
  const comp = estimatedCompensation(profile);
  const top = topActions(matches);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matches.filter(
      (m) =>
        (category === 'all' || m.benefit.category === category) &&
        (level === 'all' || m.benefit.level === level) &&
        (!likelyOnly || m.result.strength === 'likely') &&
        (!q || `${m.benefit.name} ${m.benefit.summary} ${m.benefit.agency}`.toLowerCase().includes(q)),
    );
  }, [matches, category, level, likelyOnly, query]);

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const m of matches) c[m.benefit.category] = (c[m.benefit.category] ?? 0) + 1;
    return c;
  }, [matches]);

  const groups = CATEGORY_ORDER.map((cat) => ({ cat, items: filtered.filter((m) => m.benefit.category === cat) })).filter((g) => g.items.length);

  return (
    <div className="results">
      <section className="results-hero card">
        <div className="results-hero-main">
          <p className="eyebrow">Your personalized benefits</p>
          <h2>
            We found <span className="accent">{matches.length} benefits</span> you may qualify for
          </h2>
          <ul className="fact-chips" aria-label="Your answers">
            {profileFacts(profile).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              Print / Save as PDF
            </button>
            <button type="button" className="btn btn-ghost" onClick={onEdit}>
              Edit my answers
            </button>
            <button type="button" className="btn-link" onClick={onRestart}>
              Start over
            </button>
          </div>
        </div>
        <dl className="stats">
          <div>
            <dt>Likely eligible</dt>
            <dd>{likelyCount}</dd>
          </div>
          <div>
            <dt>State benefits</dt>
            <dd>{stateCount}</dd>
          </div>
          {comp !== null && comp > 0 && (
            <div>
              <dt>Est. VA compensation</dt>
              <dd>
                {money(comp)}
                <small>/mo</small>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {comp !== null && comp > 0 && (
        <p className="footnote">
          Compensation estimate uses 2026 VA rates for a veteran with no dependents. Veterans rated 30%+ receive more for a spouse and children.
        </p>
      )}

      {top.length > 0 && (
        <section className="start-here" aria-labelledby="start-title">
          <h2 id="start-title">Start here: your top next steps</h2>
          <ol className="start-list">
            {top.map((m) => (
              <li key={m.benefit.id}>
                <button type="button" onClick={() => setOpen(m)}>
                  <strong>{m.benefit.name}</strong>
                  <span>{m.result.reasons[0] ?? m.benefit.summary}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="results-layout">
        <div className="results-main">
          <div className="toolbar" role="search">
            <input
              type="search"
              className="input"
              placeholder="Search benefits…"
              aria-label="Search benefits"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="segmented" role="group" aria-label="Benefit source">
              {(['all', 'federal', 'state'] as LevelFilter[]).map((l) => (
                <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}>
                  {l === 'all' ? 'All' : l === 'federal' ? 'Federal' : 'State'}
                </button>
              ))}
            </div>
            <label className="toggle">
              <input type="checkbox" checked={likelyOnly} onChange={(e) => setLikelyOnly(e.target.checked)} />
              Likely eligible only
            </label>
          </div>

          <div className="chips" role="group" aria-label="Filter by category">
            <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
              All <span>{matches.length}</span>
            </button>
            {CATEGORY_ORDER.filter((c) => counts[c]).map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABELS[c]} <span>{counts[c]}</span>
              </button>
            ))}
          </div>

          {groups.length === 0 && <p className="empty">No benefits match these filters.</p>}

          {groups.map((g) => (
            <section key={g.cat} className="group" aria-labelledby={`g-${g.cat}`}>
              <h2 id={`g-${g.cat}`} className="group-title">
                {CATEGORY_LABELS[g.cat]}
              </h2>
              <div className="benefit-grid">
                {g.items.map((m) => (
                  <BenefitCard key={m.benefit.id} match={m} onOpen={setOpen} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <HelpPanel profile={profile} />
      </div>

      <BenefitDetail match={open} onClose={() => setOpen(null)} />
    </div>
  );
}
