import './AlertBanner.css';

/**
 * A compact list of alert rows (low stock or expiry). `tone` controls
 * the colour treatment; `emptyText` shows when there's nothing to flag.
 */
export default function AlertBanner({ title, tone = 'warning', items, renderItem, emptyText }) {
  return (
    <div className={`alert-banner tone-${tone}`}>
      <h3 className="alert-banner-title">{title}</h3>
      {items.length === 0 ? (
        <p className="alert-banner-empty">{emptyText}</p>
      ) : (
        <ul className="alert-banner-list">
          {items.map((item, i) => (
            <li key={item._id || i}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
