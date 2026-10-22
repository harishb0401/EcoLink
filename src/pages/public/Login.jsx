import React from 'react';
import AuthCard from '../../components/Auth/AuthCard';

export default function Login({ initialTab = "login", onLoginSuccess }) {
  return (
    <div className="min-h-[85vh] bg-[#FFFFFF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#222222]">
      <AuthCard initialTab={initialTab} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
