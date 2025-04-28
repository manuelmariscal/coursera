import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Component to protect routes that require authentication
export const ProtectedRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected content
  return <Outlet />;
};

// Component to protect routes that require admin privileges
export const AdminRoute = () => {
  const { currentUser, loading, isAdmin } = useContext(AuthContext);
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if authenticated but not admin
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  // Render the admin content
  return <Outlet />;
}; 