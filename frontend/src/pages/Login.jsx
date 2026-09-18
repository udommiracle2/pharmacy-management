// import { useState } from 'react';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import './Login.css';

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const from = location.state?.from?.pathname || '/';

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSubmitting(true);
//     try {
//       await login(email, password);
//       navigate(from, { replace: true });
//     } catch (err) {
//       setError(err.response?.data?.message || 'Could not log in. Check your details and try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="login-screen">
//       <div className="login-hero">
//         <div className="login-hero-content">
//           <span className="login-hero-mark">Apothecary</span>
//           <h1>Every pack, every expiry date, every sale — accounted for.</h1>
//           <p>Stock levels, expiry dates and daily sales, tracked in one place for your pharmacy counter.</p>
//         </div>
//         <svg className="login-hero-motif" viewBox="0 0 200 200" aria-hidden="true">
//           <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.08)" />
//           <circle cx="150" cy="70" r="28" fill="rgba(255,255,255,0.06)" />
//           <circle cx="90" cy="150" r="22" fill="rgba(255,255,255,0.07)" />
//           <circle cx="170" cy="170" r="12" fill="rgba(255,255,255,0.09)" />
//         </svg>
//       </div>

//       <div className="login-form-side">
//         <form className="login-form" onSubmit={handleSubmit}>
//           <h2>Staff sign in</h2>
//           <p className="login-form-sub">Use the account your pharmacy admin set up for you.</p>

//           {error && <p className="error-text">{error}</p>}

//           <div className="field">
//             <label htmlFor="email">Email address</label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               autoFocus
//               autoComplete="username"
//             />
//           </div>

//           <div className="field">
//             <label htmlFor="password">Password</label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               autoComplete="current-password"
//             />
//           </div>

//           <button className="btn btn-primary login-submit" type="submit" disabled={submitting}>
//             {submitting ? 'Signing in…' : 'Sign in'}
//           </button>

//           <p className="login-hint">
//             New here? <Link to="/register">Create a staff account</Link>.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }






import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-hero">
        <div className="login-hero-content">
          <span className="login-hero-mark">Apothecary</span>
          <h1>Every pack, every expiry date, every sale — accounted for.</h1>
          <p>Stock levels, expiry dates and daily sales, tracked in one place for your pharmacy counter.</p>
        </div>
        <svg className="login-hero-motif" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.08)" />
          <circle cx="150" cy="70" r="28" fill="rgba(255,255,255,0.06)" />
          <circle cx="90" cy="150" r="22" fill="rgba(255,255,255,0.07)" />
          <circle cx="170" cy="170" r="12" fill="rgba(255,255,255,0.09)" />
        </svg>
      </div>

      <div className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Staff sign in</h2>
          <p className="login-form-sub">Use the account your pharmacy admin set up for you.</p>

          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="login-hint">
            New here? <Link to="/register">Create a staff account</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
