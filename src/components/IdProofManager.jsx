import { useEffect, useState } from 'react';
import { apiRequest, apiUpload } from '../lib/api';

const ID_TYPES = ['PAN', 'Aadhar', 'Passport', 'Driving License', 'Other'];

export default function IdProofManager({ guestId, onSaved }) {
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ id_proof_type: 'PAN', id_proof_number: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest(`/api/guests/${guestId}/id-proof`);
      setCurrent(data);
      if (data.id_proof_type) {
        setForm({ id_proof_type: data.id_proof_type, id_proof_number: data.id_proof_number || '' });
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (guestId) load(); }, [guestId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('id_proof_type', form.id_proof_type);
      formData.append('id_proof_number', form.id_proof_number);
      if (file) formData.append('file', file);

      await apiUpload(`/api/guests/${guestId}/id-proof`, formData);
      setMessage('ID proof saved.');
      setFile(null);
      await load();
      if (onSaved) onSaved();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading ID proof…</p>;

  return (
    <div>
      {current?.image_url && (
        <div style={{ marginBottom: 12 }}>
          <img
            src={current.image_url}
            alt="ID proof"
            style={{ maxWidth: 220, borderRadius: 10, border: '1px solid var(--border-soft)', display: 'block' }}
          />
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>
            {current.id_proof_type} — {current.id_proof_number}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <select value={form.id_proof_type} onChange={(e) => setForm({ ...form, id_proof_type: e.target.value })}>
          {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          placeholder="ID Number"
          value={form.id_proof_number}
          onChange={(e) => setForm({ ...form, id_proof_number: e.target.value })}
          required
        />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : current?.image_url ? 'Update ID Proof' : 'Save ID Proof'}
        </button>
      </form>
      {message && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--teal-700)' }}>{message}</p>}
    </div>
  );
}
