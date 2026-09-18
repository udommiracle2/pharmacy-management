import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      {/* <div className="login-hero">
        <div className="login-hero-content">
          <span className="login-hero-mark">Apothecary</span>
          <h1>Set up your pharmacy in a minute.</h1>
          <p>Signing up creates your own pharmacy account, separate from everyone else's. You'll be its admin.</p>
        </div>
        <svg className="login-hero-motif" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.08)" />
          <circle cx="150" cy="70" r="28" fill="rgba(255,255,255,0.06)" />
          <circle cx="90" cy="150" r="22" fill="rgba(255,255,255,0.07)" />
          <circle cx="170" cy="170" r="12" fill="rgba(255,255,255,0.09)" />
        </svg>
      </div> */}

      <div className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Create your account</h2>
          <p className="login-form-sub">Set up your own pharmacy in a few seconds.</p>

          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={handleChange('name')} required autoFocus />
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button className="btn btn-primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="login-hint">
            Already have an account? <Link to="/login">Sign in instead</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
