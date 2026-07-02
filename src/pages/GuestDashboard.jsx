import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function GuestDashboard() {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ room_id: '', from_date: '', to_date: '' });
  const [message, setMessage] = useState('');

  async function loadData() {
    const [roomsData, bookingsData] = await Promise.all([
      apiRequest('/api/rooms'),
      apiRequest('/api/bookings')
    ]);
    setRooms(roomsData.filter((r) => r.status === 'available'));
    setBookings(bookingsData);
  }

  useEffect(() => { loadData(); }, []);

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
    <div className="dashboard">
      <header>
        <h2>Welcome, {profile?.full_name}</h2>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </header>

      <section>
        <h3>Book a Room</h3>
        <form onSubmit={handleBook} className="booking-form">
          <select value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })} required>
            <option value="">Select a room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.room_number} — {r.room_type} (₹{r.price_per_night}/night)
              </option>
            ))}
          </select>
          <label>From: <input type="date" value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })} required /></label>
          <label>To: <input type="date" value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })} required /></label>
          <button type="submit">Book Now</button>
        </form>
        {message && <p>{message}</p>}
      </section>

      <section>
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
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
