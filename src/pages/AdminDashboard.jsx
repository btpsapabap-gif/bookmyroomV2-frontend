import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newRoom, setNewRoom] = useState({ room_number: '', room_type: 'standard', price_per_night: '' });
  const [reportFilters, setReportFilters] = useState({ from: '', to: '', status: '' });

  async function loadData() {
    const [roomsData, bookingsData] = await Promise.all([
      apiRequest('/api/rooms'),
      apiRequest('/api/bookings')
    ]);
    setRooms(roomsData);
    setBookings(bookingsData);
  }

  useEffect(() => { loadData(); }, []);

  async function addRoom(e) {
    e.preventDefault();
    await apiRequest('/api/rooms', { method: 'POST', body: JSON.stringify(newRoom) });
    setNewRoom({ room_number: '', room_type: 'standard', price_per_night: '' });
    loadData();
  }

  async function checkIn(id) {
    await apiRequest(`/api/bookings/${id}/check-in`, { method: 'PATCH' });
    loadData();
  }

  async function checkOut(id) {
    await apiRequest(`/api/bookings/${id}/check-out`, { method: 'PATCH' });
    loadData();
  }

  // Reports are downloaded directly with the auth token in the URL query
  // (kept simple here; for production, prefer a signed short-lived link).
  async function downloadReport(format) {
    const { data: { session } } = await supabase.auth.getSession();
    const params = new URLSearchParams(reportFilters);
    const res = await fetch(`${API_URL}/api/reports/${format}?${params}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    a.click();
  }

  return (
    <div className="dashboard">
      <header>
        <h2>Admin Dashboard</h2>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </header>

      <section>
        <h3>Add Room</h3>
        <form onSubmit={addRoom} className="booking-form">
          <input placeholder="Room Number" value={newRoom.room_number} onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })} required />
          <select value={newRoom.room_type} onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
          </select>
          <input placeholder="Price/Night" type="number" value={newRoom.price_per_night} onChange={(e) => setNewRoom({ ...newRoom, price_per_night: e.target.value })} required />
          <button type="submit">Add Room</button>
        </form>
      </section>

      <section>
        <h3>Rooms ({rooms.length})</h3>
        <table>
          <thead><tr><th>Room No.</th><th>Type</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}><td>{r.room_number}</td><td>{r.room_type}</td><td>₹{r.price_per_night}</td><td>{r.status}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>All Bookings</h3>
        <table>
          <thead><tr><th>Guest</th><th>Mobile</th><th>Room</th><th>From</th><th>To</th><th>Cost</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.profiles?.full_name}</td>
                <td>{b.profiles?.mobile_number}</td>
                <td>{b.rooms?.room_number}</td>
                <td>{b.from_date}</td>
                <td>{b.to_date}</td>
                <td>₹{b.total_cost}</td>
                <td>{b.status}</td>
                <td>
                  {b.status === 'booked' && <button onClick={() => checkIn(b.id)}>Check In</button>}
                  {b.status === 'checked_in' && <button onClick={() => checkOut(b.id)}>Check Out</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Reports</h3>
        <div className="booking-form">
          <label>From: <input type="date" value={reportFilters.from} onChange={(e) => setReportFilters({ ...reportFilters, from: e.target.value })} /></label>
          <label>To: <input type="date" value={reportFilters.to} onChange={(e) => setReportFilters({ ...reportFilters, to: e.target.value })} /></label>
          <select value={reportFilters.status} onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="booked">Booked</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={() => downloadReport('pdf')}>Download PDF</button>
          <button onClick={() => downloadReport('excel')}>Download Excel</button>
        </div>
      </section>
    </div>
  );
}
