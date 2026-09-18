import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import './Sidebar.css';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/medicines', label: 'Medicines' },
  { to: '/sales', label: 'Sales' },
  { to: '/reports', label: 'Reports' },
  { to: '/alerts', label: 'Alerts' },
];

export default function Sidebar() {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isTenantRoot = user?.role === 'admin';

  const closeMobileMenu = () => setMobileOpen(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      navigate('/register', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Could not delete your account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-mark">Apothecary</span>
          <span className="sidebar-brand-sub">Inventory & sales</span>
        </div>
        <button
          type="button"
          className="sidebar-menu-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className="sidebar-menu-toggle-bar" />
          <span className="sidebar-menu-toggle-bar" />
          <span className="sidebar-menu-toggle-bar" />
        </button>
      </div>

      <div className={`sidebar-body${mobileOpen ? ' open' : ''}`}>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
              onClick={closeMobileMenu}
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
          <button className="sidebar-delete-account" onClick={() => setConfirmingDelete(true)}>
            Delete account
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete account"
          message={
            isTenantRoot
              ? "This permanently deletes your pharmacy: your account, every staff account, and all medicines and sales data. This can't be undone."
              : "This permanently deletes your account. The pharmacy's data and other staff accounts are unaffected. This can't be undone."
          }
          confirmLabel={deleting ? 'Deleting…' : 'Delete account'}
          danger
          onCancel={() => {
            if (!deleting) {
              setConfirmingDelete(false);
              setDeleteError('');
            }
          }}
          onConfirm={handleDeleteAccount}
        />
      )}
      {deleteError && <p className="sidebar-delete-error">{deleteError}</p>}
    </aside>
  );
}
