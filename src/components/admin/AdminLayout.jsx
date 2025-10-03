// Admin Layout Component
import React from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="bg-gray-800 rounded-lg p-6 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
