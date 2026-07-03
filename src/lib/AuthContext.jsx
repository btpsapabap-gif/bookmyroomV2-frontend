import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentProfile, getToken } from './auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    if (!getToken()) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const p = await fetchCurrentProfile();
    setProfile(p);
    setLoading(false);
  }

  useEffect(() => {
    refreshProfile();
  }, []);

  // session is just "do we have a logged-in profile" — kept as a name
  // for compatibility with ProtectedRoute's existing checks.
  return (
    <AuthContext.Provider value={{ session: profile, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
