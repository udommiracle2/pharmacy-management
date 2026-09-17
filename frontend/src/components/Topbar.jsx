import './Topbar.css';

export default function Topbar({ title, subtitle, actions }) {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </header>
  );
}
