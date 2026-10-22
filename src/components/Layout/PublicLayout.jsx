import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

export default function PublicLayout({ onOpenSearchModal }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#222222] antialiased font-sans">
      <Navbar 
        isLoggedIn={false} 
        currentRole="public" 
        onOpenSearchModal={onOpenSearchModal} 
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
