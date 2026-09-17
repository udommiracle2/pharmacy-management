import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/medicines', label: 'Medicines' },
  { to: '/sales', label: 'Sales' },
  { to: '/reports', label: 'Reports' },
  { to: '/alerts', label: 'Alerts' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">Apothecary</span>
        <span className="sidebar-brand-sub">Inventory & sales</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-name">{user?.name}</span>
          <span className="sidebar-user-role">{user?.role}</span>
        </div>
        <button className="btn btn-outline sidebar-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
