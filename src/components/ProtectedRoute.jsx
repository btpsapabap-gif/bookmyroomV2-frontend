import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

// Wrap pages that require login. Optionally restrict to a specific role.
export default function ProtectedRoute({ children, requireRole }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (requireRole && profile?.role !== requireRole) return <Navigate to="/dashboard" replace />;

  return children;
}
