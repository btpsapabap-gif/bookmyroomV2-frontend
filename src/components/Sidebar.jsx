import { LayoutDashboard, BookOpen, Users, BedDouble, BarChart3, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'bookings', label: 'Bookings', icon: BookOpen },
  { key: 'guests', label: 'Guests', icon: Users },
  { key: 'rooms', label: 'Rooms', icon: BedDouble },
  { key: 'reports', label: 'Reports', icon: BarChart3 }
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="auth-logo-box">🏨</div>
        <span>BookMyRoom</span>
      </div>

      <p className="sidebar-section-label">Enterprise</p>
      <nav>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`sidebar-link ${active === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <button className="sidebar-link sidebar-logout" onClick={() => supabase.auth.signOut()}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
