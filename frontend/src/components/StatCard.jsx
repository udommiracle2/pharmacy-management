import './StatCard.css';

/**
 * A single dashboard statistic. `tone` picks the accent colour used for
 * the left edge and the value, so cards read differently by meaning
 * instead of all looking identical.
 */
export default function StatCard({ label, value, tone = 'primary', hint }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </div>
  );
}
