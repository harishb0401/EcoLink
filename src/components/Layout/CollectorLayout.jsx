import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useOfflineSession } from '../../hooks/useOfflineSession';
import { AUTH_STATES } from '../../services/offline/offlineSession';
import { WifiOff, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

export default function CollectorLayout({ currentUser, onLogout, onOpenSearchModal }) {
  const navigate = useNavigate();
  const { authState, isOfflineAuthenticated, isOnline: online, offlineUser, isChecking } = useOfflineSession(currentUser);

  // 1. If actively verifying session, show clean subtle loader
  if (isChecking && !currentUser) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center text-[#222222]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1F6F5F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#555555]">Verifying offline collector session...</p>
        </div>
      </div>
    );
  }

  // Determine active user (online user or authenticated offline session)
  const effectiveUser = currentUser || (isOfflineAuthenticated ? offlineUser : null);

  // 2. Offline & Never Authenticated on this device -> Exact required message
  if (!online && (!effectiveUser || authState === AUTH_STATES.NOT_AUTHENTICATED)) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#F5FBF7] p-8 rounded-2xl border-2 border-[#D6E8DF] text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#EFF8F2] border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center mx-auto">
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#222222]">Internet Connection Required</h2>
            <p className="text-xs text-[#555555] mt-2 font-medium leading-relaxed">
              Internet connection is required for your first login.
            </p>
            <p className="text-[11px] text-[#555555] mt-1">
              Once you log in online at least once, you can access your collector workspace offline anytime.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-[#F5FBF7] hover:border-[#B8D9C8] text-[#222222] rounded-lg font-bold text-xs transition border-2 border-[#D6E8DF] cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Offline & Expired Offline Session (exceeded 7 days without reconnect)
  if (!online && authState === AUTH_STATES.SESSION_EXPIRED) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#F5FBF7] p-8 rounded-2xl border-2 border-[#D6E8DF] text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#EFF8F2] border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#222222]">Offline Session Expired</h2>
            <p className="text-xs text-[#555555] mt-2 font-medium leading-relaxed">
              Your offline collector session has expired after 7 days. For security, please connect to the internet to verify your credentials.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Online Authentication</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Online & Unauthenticated -> Redirect to /login
  if (!effectiveUser) {
    return <Navigate to="/login" replace />;
  }

  // 5. Role check -> Collector only
  if (effectiveUser.role !== 'collector') {
    if (effectiveUser.role === 'recycler') {
      return <Navigate to="/recycler/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#222222] antialiased font-sans">
      <Navbar 
        isLoggedIn={true} 
        currentRole="collector" 
        userProfile={effectiveUser}
        onLogout={onLogout}
        onOpenSearchModal={onOpenSearchModal}
      />

      {/* Subtle Offline Notice Banner for Collectors */}
      {!online && (
        <div className="bg-[#EFF8F2] border-b-2 border-[#D6E8DF] px-4 py-2 text-center text-xs font-medium text-[#555555] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6FCF97]" />
          <span>Offline Mode Active — You can declare e-waste and review cached records. Changes will sync automatically upon reconnection.</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-[#FFFFFF]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
