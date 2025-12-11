// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0514] to-[#1A0F2E]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their dashboard if they try to access other role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}
