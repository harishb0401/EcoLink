import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

export default function AdminLayout({ currentUser, onLogout, onOpenSearchModal }) {
  // 1. Unauthenticated -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role check -> Admin only
  if (currentUser.role !== 'admin') {
    if (currentUser.role === 'collector') {
      return <Navigate to="/collector/dashboard" replace />;
    } else if (currentUser.role === 'recycler') {
      return <Navigate to="/recycler/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#222222] antialiased font-sans">
      <Navbar 
        isLoggedIn={true} 
        currentRole="admin" 
        userProfile={currentUser}
        onLogout={onLogout}
        onOpenSearchModal={onOpenSearchModal}
      />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
