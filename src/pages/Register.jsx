import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { register, login } from '../lib/auth';
import { useAuth } from '../lib/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fullName, mobile, password);
      // Auto-login right after registration so the guest lands straight
      // on the booking page instead of having to log in separately.
      await login(mobile, password);
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="auth-logo-box">🏨</div>
        <h1 className="brand-title">BookMyRoom</h1>
        <p className="auth-tagline">Smart room booking &amp; stay management</p>
        <ul className="auth-features">
          <li><CheckCircle2 size={18} /> Instant room booking</li>
          <li><CheckCircle2 size={18} /> Live occupancy &amp; check-in tracking</li>
          <li><CheckCircle2 size={18} /> Guest self-registration</li>
          <li><CheckCircle2 size={18} /> Admin dashboard &amp; reports</li>
        </ul>
      </div>

      <div className="auth-panel">
        <div className="auth-container">
          <h2>Guest Registration</h2>
          <p className="auth-subtitle">Create an account to start booking rooms.</p>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Full Name</label>
              <input placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Mobile Number</label>
              <input placeholder="+919876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input placeholder="At least 6 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
          </form>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
