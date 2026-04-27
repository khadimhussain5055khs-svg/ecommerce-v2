import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-3 text-3xl font-bold">Access denied</h1>
        <p className="text-gray-600">
          This page is only available for the website owner (admin account).
        </p>
      </div>
    );
  }

  return <Outlet />;
}
