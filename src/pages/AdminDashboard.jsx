import { useEffect, useMemo, useState } from 'react';
import { Building2, CheckSquare, BookOpen, Users, Wallet, ArrowDownToLine, ArrowUpFromLine, DoorClosed } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { getToken } from '../lib/auth';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../lib/AuthContext';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const STATUS_LABELS = { checked_in: 'checked in', checked_out: 'checked out' };

function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [newRoom, setNewRoom] = useState({ room_number: '', room_type: 'standard', price_per_night: '' });
  const [reportFilters, setReportFilters] = useState({ from: '', to: '', status: '' });
  const [bookingForm, setBookingForm] = useState({ guest_id: '', room_id: '', from_date: '', to_date: '' });
  const [bookingMessage, setBookingMessage] = useState('');
  const [showNewGuest, setShowNewGuest] = useState(false);
  const [newGuest, setNewGuest] = useState({ full_name: '', mobile_number: '', password: '' });
  const [newGuestMessage, setNewGuestMessage] = useState('');

  async function loadData() {
    const [roomsData, bookingsData, guestsData] = await Promise.all([
      apiRequest('/api/rooms'),
      apiRequest('/api/bookings'),
      apiRequest('/api/guests')
    ]);
    setRooms(roomsData);
    setBookings(bookingsData);
    setGuests(guestsData);
  }

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      totalRooms: rooms.length,
      available: rooms.filter((r) => r.status === 'available').length,
      occupied: rooms.filter((r) => r.status === 'occupied').length,
      totalBookings: bookings.length,
      uniqueGuests: new Set(bookings.map((b) => b.guest_id)).size,
      revenue: bookings.filter((b) => b.status !== 'cancelled').reduce((sum, b) => sum + Number(b.total_cost || 0), 0),
      checkInToday: bookings.filter((b) => b.from_date === today && b.status === 'booked').length,
      checkOutToday: bookings.filter((b) => b.to_date === today && b.status === 'checked_in').length
    };
  }, [rooms, bookings]);

  async function addRoom(e) {
    e.preventDefault();
    await apiRequest('/api/rooms', { method: 'POST', body: JSON.stringify(newRoom) });
    setNewRoom({ room_number: '', room_type: 'standard', price_per_night: '' });
    loadData();
  }

  async function createBookingForGuest(e) {
    e.preventDefault();
    setBookingMessage('');
    try {
      await apiRequest('/api/bookings', { method: 'POST', body: JSON.stringify(bookingForm) });
      setBookingMessage('Booking created successfully!');
      setBookingForm({ guest_id: '', room_id: '', from_date: '', to_date: '' });
      loadData();
    } catch (err) {
      setBookingMessage(err.message);
    }
  }

  async function createGuestQuick(e) {
    e.preventDefault();
    setNewGuestMessage('');
    try {
      const { profile: created } = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(newGuest)
      });
      setNewGuestMessage('Guest added.');
      setNewGuest({ full_name: '', mobile_number: '', password: '' });
      await loadData();
      // Auto-select the newly created guest in the booking form
      setBookingForm((f) => ({ ...f, guest_id: created.id }));
      setShowNewGuest(false);
    } catch (err) {
      setNewGuestMessage(err.message);
    }
  }

  async function checkIn(id) {
    await apiRequest(`/api/bookings/${id}/check-in`, { method: 'PATCH' });
    loadData();
  }

  async function checkOut(id) {
    await apiRequest(`/api/bookings/${id}/check-out`, { method: 'PATCH' });
    loadData();
  }

  async function downloadReport(format) {
    const token = getToken();
    const params = new URLSearchParams(reportFilters);
    const res = await fetch(`${API_URL}/api/reports/${format}?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    a.click();
  }

  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="app-shell">
      <Sidebar active={tab} onNavigate={setTab} />

      <main className="main-content">
        <div className="content-header">
          <div>
            <h1>{tab === 'dashboard' ? 'Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}</h1>
            <p className="content-date">{todayLabel}</p>
          </div>
          <div className="user-chip">
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, textAlign: 'right' }}>{profile?.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>Administrator</div>
            </div>
            <div className="user-avatar">{profile?.full_name?.[0]?.toUpperCase() || 'A'}</div>
          </div>
        </div>

        {tab === 'dashboard' && (
          <>
            <div className="welcome-block">
              <h2>Welcome back 👋</h2>
              <p>Monitor bookings, revenue and occupancy from one place.</p>
            </div>

            <div className="stat-grid">
              <StatCard icon={Building2} label="Total Rooms" value={stats.totalRooms} />
              <StatCard icon={CheckSquare} label="Available" value={stats.available} />
              <StatCard icon={BookOpen} label="Bookings" value={stats.totalBookings} />
              <StatCard icon={Users} label="Guests" value={stats.uniqueGuests} />
              <StatCard icon={Wallet} label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} />
              <StatCard icon={ArrowDownToLine} label="Check-In Today" value={stats.checkInToday} />
              <StatCard icon={ArrowUpFromLine} label="Check-Out Today" value={stats.checkOutToday} />
              <StatCard icon={DoorClosed} label="Occupied" value={stats.occupied} />
            </div>
          </>
        )}

        {(tab === 'dashboard' || tab === 'rooms') && (
          <div className="card">
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
          </div>
        )}

        {(tab === 'dashboard' || tab === 'rooms') && (
          <div className="card">
            <h3>Rooms ({rooms.length})</h3>
            <table>
              <thead><tr><th>Room No.</th><th>Type</th><th>Price</th><th>Status</th></tr></thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}><td>{r.room_number}</td><td>{r.room_type}</td><td>₹{r.price_per_night}</td><td><StatusPill status={r.status} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(tab === 'dashboard' || tab === 'bookings' || tab === 'guests') && (
          <div className="card">
            <h3>Create Booking for a Guest</h3>
            <form onSubmit={createBookingForGuest} className="booking-form">
              <select value={bookingForm.guest_id} onChange={(e) => setBookingForm({ ...bookingForm, guest_id: e.target.value })} required>
                <option value="">Select guest</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>{g.full_name} — {g.mobile_number}</option>
                ))}
              </select>
              <select value={bookingForm.room_id} onChange={(e) => setBookingForm({ ...bookingForm, room_id: e.target.value })} required>
                <option value="">Select room</option>
                {rooms.filter((r) => r.status === 'available').map((r) => (
                  <option key={r.id} value={r.id}>Room {r.room_number} — {r.room_type} (₹{r.price_per_night}/night)</option>
                ))}
              </select>
              <label>From: <input type="date" value={bookingForm.from_date} onChange={(e) => setBookingForm({ ...bookingForm, from_date: e.target.value })} required /></label>
              <label>To: <input type="date" value={bookingForm.to_date} onChange={(e) => setBookingForm({ ...bookingForm, to_date: e.target.value })} required /></label>
              <button type="submit">Create Booking</button>
              <button type="button" onClick={() => setShowNewGuest((s) => !s)} style={{ background: 'transparent', color: 'var(--teal-700)', border: '1.5px solid var(--teal-700)' }}>
                {showNewGuest ? 'Cancel' : '+ New Guest'}
              </button>
            </form>
            {bookingMessage && <p style={{ marginTop: 12, fontSize: 14, color: 'var(--teal-700)' }}>{bookingMessage}</p>}

            {showNewGuest && (
              <form onSubmit={createGuestQuick} className="booking-form" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-soft)' }}>
                <input placeholder="Full Name" value={newGuest.full_name} onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })} required />
                <input placeholder="Mobile Number" value={newGuest.mobile_number} onChange={(e) => setNewGuest({ ...newGuest, mobile_number: e.target.value })} required />
                <input placeholder="Password (min 6 chars)" type="password" minLength={6} value={newGuest.password} onChange={(e) => setNewGuest({ ...newGuest, password: e.target.value })} required />
                <button type="submit">Add Guest</button>
              </form>
            )}
            {newGuestMessage && <p style={{ marginTop: 8, fontSize: 14, color: 'var(--teal-700)' }}>{newGuestMessage}</p>}
          </div>
        )}

        {(tab === 'dashboard' || tab === 'bookings' || tab === 'guests') && (
          <div className="card">
            <h3>{tab === 'guests' ? 'Guest Bookings' : 'All Bookings'}</h3>
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
                    <td><StatusPill status={b.status} /></td>
                    <td>
                      {b.status === 'booked' && <button onClick={() => checkIn(b.id)}>Check In</button>}
                      {b.status === 'checked_in' && <button onClick={() => checkOut(b.id)}>Check Out</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(tab === 'dashboard' || tab === 'reports') && (
          <div className="card">
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
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={20} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
