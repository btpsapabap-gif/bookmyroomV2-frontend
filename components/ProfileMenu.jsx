import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { logout } from '../lib/auth';

// Avatar circle that opens a small dropdown with the person's name,
// role, and a Logout action. Click outside to close.
export default function ProfileMenu({ name, roleLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="user-avatar"
        style={{ border: 'none', cursor: 'pointer' }}
        aria-label="Profile menu"
      >
        {name?.[0]?.toUpperCase() || '?'}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '48px', right: 0, minWidth: 180,
          background: 'var(--card-bg)', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(13,61,56,0.16)', overflow: 'hidden', zIndex: 20
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{roleLabel}</div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 16px', background: 'transparent', border: 'none',
              color: 'var(--danger)', fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
