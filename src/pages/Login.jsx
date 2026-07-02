import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mobile number -> synthetic email, matching the scheme used at registration.
    // This lets us use plain email/password auth under the hood while the
    // person only ever sees "mobile number" as their login.
    const digitsOnly = mobile.replace(/[^\d]/g, '');
    const syntheticEmail = `${digitsOnly}@bookmyroom.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password
    });

    setLoading(false);
    if (error) {
      setError('Incorrect mobile number or password.');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
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
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Login with your mobile number to continue.</p>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Mobile Number</label>
              <input placeholder="+919876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input placeholder="Enter password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
          <p>New guest? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}
