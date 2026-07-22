import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth }  from '../hooks/useAuth';
import { Role }     from '../types/auth.types';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Props { allowedRoles?: Role[]; }

const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner fullPage tip="Authenticating..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};
export default ProtectedRoute;