// A mobile number field with a fixed "+91" prefix the user can't edit or
// remove. The person only ever types the 10-digit number; we assemble
// the full "+91XXXXXXXXXX" value for the parent form automatically.
export default function MobileInput({ value, onChange, required = true, placeholder = '10-digit mobile number' }) {
  const digits = value?.startsWith('+91') ? value.slice(3) : (value || '').replace(/\D/g, '');

  function handleChange(e) {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(onlyDigits ? `+91${onlyDigits}` : '');
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      border: '1.5px solid var(--border-soft)', borderRadius: 10,
      overflow: 'hidden', background: 'white'
    }}>
      <span style={{
        display: 'flex', alignItems: 'center', padding: '0 12px',
        background: 'var(--bg-page)', fontWeight: 700, fontSize: 14,
        color: 'var(--teal-800)', borderRight: '1.5px solid var(--border-soft)'
      }}>
        +91
      </span>
      <input
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={digits}
        onChange={handleChange}
        required={required}
        pattern="[6-9]\d{9}"
        title="Enter a valid 10-digit Indian mobile number"
        style={{ border: 'none', outline: 'none', padding: '12px 14px', fontSize: 14, flex: 1, fontFamily: 'inherit' }}
      />
    </div>
  );
}
