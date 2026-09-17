import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4em 2em' }}>
      <h1>404.<br /> <br />Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
