import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import ProfileMenu from '../components/ProfileMenu';
import IdProofManager from '../components/IdProofManager';

const STATUS_LABELS = { checked_in: 'checked in', checked_out: 'checked out' };

function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export default function GuestDashboard() {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ room_id: '', from_date: '', to_date: '' });
  const [message, setMessage] = useState('');
  const [hasIdProof, setHasIdProof] = useState(null); // null = still checking
  const todayISO = new Date().toISOString().slice(0, 10);

  async function loadData() {
    const [roomsData, bookingsData] = await Promise.all([
      apiRequest('/api/rooms'),
      apiRequest('/api/bookings')
    ]);
    setRooms(roomsData.filter((r) => r.status === 'available'));
    setBookings(bookingsData);
  }

  async function checkIdProof() {
    if (!profile?.id) return;
    try {
      const data = await apiRequest(`/api/guests/${profile.id}/id-proof`);
      setHasIdProof(Boolean(data.id_proof_type && data.id_proof_number && data.image_url));
    } catch {
      setHasIdProof(false);
    }
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => { checkIdProof(); }, [profile?.id]);

  async function handleBook(e) {
    e.preventDefault();
    setMessage('');
    try {
      await apiRequest('/api/bookings', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Room booked successfully!');
      setForm({ room_id: '', from_date: '', to_date: '' });
      loadData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, var(--teal-900), var(--teal-950))',
        color: 'white', padding: '20px 44px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="auth-logo-box" style={{ width: 38, height: 38, fontSize: 18, marginBottom: 0 }}>🏨</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18 }}>BookMyRoom</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>{profile?.full_name}</span>
          <ProfileMenu name={profile?.full_name} roleLabel="Guest" />
        </div>
      </div>

      <main className="main-content" style={{ margin: '0 auto' }}>
        <div className="welcome-block">
          <h2>Welcome, {profile?.full_name} 👋</h2>
          <p>Book a room or check your existing reservations below.</p>
        </div>

        <div className="card">
          <h3>Book a Room</h3>
          {hasIdProof === false && (
            <p style={{ fontSize: 13.5, color: 'var(--danger)', marginBottom: 12 }}>
              Please add your ID proof below before booking a room — it's required for check-in.
            </p>
          )}
          <form onSubmit={handleBook} className="booking-form">
            <select value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })} required disabled={!hasIdProof}>
              <option value="">Select a room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} — {r.room_type} (₹{r.price_per_night}/night)
                </option>
              ))}
            </select>
            <label>From: <input type="date" min={todayISO} value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })} required disabled={!hasIdProof} /></label>
            <label>To: <input type="date" min={form.from_date || todayISO} value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })} required disabled={!hasIdProof} /></label>
            <button type="submit" disabled={!hasIdProof}>Book Now</button>
          </form>
          {message && <p style={{ marginTop: 12, fontSize: 14, color: 'var(--teal-700)' }}>{message}</p>}
        </div>

        <div className="card">
          <h3>My Bookings</h3>
          <table>
            <thead>
              <tr><th>Room</th><th>From</th><th>To</th><th>Cost</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.rooms?.room_number}</td>
                  <td>{b.from_date}</td>
                  <td>{b.to_date}</td>
                  <td>₹{b.total_cost}</td>
                  <td><StatusPill status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {profile?.id && (
          <div className="card">
            <h3>ID Proof</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8, marginBottom: 14 }}>
              Add a government ID for faster check-in.
            </p>
            <IdProofManager guestId={profile.id} onSaved={checkIdProof} />
          </div>
        )}
      </main>
    </div>
  );
}
