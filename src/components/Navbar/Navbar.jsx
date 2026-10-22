import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ArrowRight, User, Bell, 
  CheckCircle2, LogOut, Settings, ShieldCheck, 
  ChevronDown
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import OfflineIndicator from '../OfflineIndicator';

export default function Navbar({ 
  onOpenSearchModal,
  isLoggedIn = false,
  currentRole = 'public',
  userProfile = null,
  onLogout = null
}) {
  const { t, lang, setLang } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on route change or outside click
  useEffect(() => {
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  // Determine user display info
  const isCollector = isLoggedIn && currentRole === 'collector';
  const isRecycler = isLoggedIn && currentRole === 'recycler';

  const rawName = userProfile?.fullName || userProfile?.name || userProfile?.facilityName || userProfile?.facility_name || userProfile?.organizationName || userProfile?.email;
  const displayName = rawName || (isCollector ? t("collectorRole") : 
       isRecycler ? t("recyclerRole") : t("guestRole"));

  const displayRoleTitle = isCollector ? t("collectorRole") : 
    isRecycler ? t("recyclerRole") : t("publicRole");

  const profilePath = isCollector ? '/collector/profile' : '/recycler/profile';
  const notifPath = isCollector ? '/collector/notifications' : '/recycler/notifications';

  // Notifications Mock Data based on role
  const notifications = isCollector ? [
    { id: 1, title: "Offer Received: ₹670/kg", desc: "GreenCycle submitted an offer on LOT-00125", time: "5m ago", unread: true },
    { id: 2, title: "Phone Verified ✓", desc: "Your mobile number +91 98401 23456 is verified", time: "1h ago", unread: false },
    { id: 3, title: "Handover Scheduled", desc: "Pickup driver assigned for LOT-00124", time: "Yesterday", unread: false }
  ] : [
    { id: 1, title: "New Matching Lot", desc: "30 kg Copper wiring available in Guindy", time: "12m ago", unread: true },
    { id: 2, title: "Offer Accepted", desc: "Collector accepted your bid of ₹670/kg", time: "2h ago", unread: true },
    { id: 3, title: "CPCB Audit Verified", desc: "EPR Compliance status: Active & Certified", time: "3d ago", unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNavLinkClass = (path, exact = false) => {
    const isActive = exact 
      ? location.pathname === path 
      : (location.pathname === path || (path !== '/' && location.pathname.startsWith(path)));
    
    return `px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer ${
      isActive 
        ? 'bg-[#1F6F5F] text-white' 
        : 'text-[#555555] hover:text-[#1F6F5F]'
    }`;
  };

  const getMobileNavLinkClass = (path, exact = false) => {
    const isActive = exact 
      ? location.pathname === path 
      : (location.pathname === path || (path !== '/' && location.pathname.startsWith(path)));
    
    return `text-left px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
      isActive ? 'bg-[#1F6F5F] text-white' : 'text-[#555555] hover:text-[#1F6F5F]'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-[#D6E8DF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo: Eco-Link */}
          <Link 
            to={isLoggedIn ? (isCollector ? '/collector/dashboard' : '/recycler/dashboard') : '/'} 
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F5FBF7] border-2 border-[#D6E8DF] flex items-center justify-center p-1">
              <img 
                src="/ecolink-logo.png" 
                alt="EcoLink" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#222222]">
              Eco-<span className="text-[#1F6F5F]">Link</span>
            </span>
          </Link>

          {/* ========================================================= */}
          {/* 1. PUBLIC (UNAUTHENTICATED) DESKTOP NAVIGATION            */}
          {/* ========================================================= */}
          {!isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-1 bg-[#F5FBF7] p-1 rounded-lg border-2 border-[#D6E8DF]">
              <Link to="/" className={getNavLinkClass('/', true)}>
                {t("navHome")}
              </Link>
              <Link to="/how-it-works" className={getNavLinkClass('/how-it-works')}>
                {t("navHowItWorks")}
              </Link>
              <Link to="/about" className={getNavLinkClass('/about')}>
                {t("navAbout")}
              </Link>
            </nav>
          )}

          {/* ========================================================= */}
          {/* 2. COLLECTOR LOGGED-IN DESKTOP NAVIGATION                 */}
          {/* ========================================================= */}
          {isCollector && (
            <nav className="hidden lg:flex items-center gap-1 bg-[#F5FBF7] p-1 rounded-lg border-2 border-[#D6E8DF]">
              <Link to="/collector/dashboard" className={getNavLinkClass('/collector/dashboard', true)}>
                {t("navDashboard")}
              </Link>
              <Link to="/collector/register-waste" className={getNavLinkClass('/collector/register-waste')}>
                {t("navRegisterEWaste")}
              </Link>
              <Link to="/collector/requests" className={getNavLinkClass('/collector/requests')}>
                {t("navMyWasteLots")}
              </Link>
              <Link to="/collector/transactions" className={getNavLinkClass('/collector/transactions')}>
                {t("navTransactions")}
              </Link>
            </nav>
          )}

          {/* ========================================================= */}
          {/* 3. RECYCLER LOGGED-IN DESKTOP NAVIGATION                  */}
          {/* ========================================================= */}
          {isRecycler && (
            <nav className="hidden lg:flex items-center gap-1 bg-[#F5FBF7] p-1 rounded-lg border-2 border-[#D6E8DF]">
              <Link to="/recycler/dashboard" className={getNavLinkClass('/recycler/dashboard', true)}>
                {t("navDashboard")}
              </Link>
              <Link to="/recycler/waste-requests" className={getNavLinkClass('/recycler/waste-requests')}>
                {t("navWasteRequests")}
              </Link>
              <Link to="/recycler/transactions" className={getNavLinkClass('/recycler/transactions')}>
                {t("navTransactions")}
              </Link>
              <Link to="/recycler/compliance" className={getNavLinkClass('/recycler/compliance')}>
                {t("navCompliance")}
              </Link>
            </nav>
          )}

          {/* ========================================================= */}
          {/* RIGHT SIDE TOOLS: PUBLIC VS LOGGED-IN                     */}
          {/* ========================================================= */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher: EN | தமிழ் */}
            <div className="flex items-center bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg p-0.5">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  lang === 'en' 
                    ? 'bg-[#1F6F5F] text-white' 
                    : 'text-[#555555] hover:text-[#222222]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  lang === 'ta' 
                    ? 'bg-[#1F6F5F] text-white' 
                    : 'text-[#555555] hover:text-[#222222]'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Online / Offline Status Indicator */}
            <OfflineIndicator currentRole={currentRole} />

            {/* STATE 1: PUBLIC RIGHT SIDE -> [ Login / Signup ] */}
            {!isLoggedIn && (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer bg-[#1F6F5F] hover:bg-[#2FA084] text-white"
                >
                  {t("loginSignupBtn")}
                </Link>
              </div>
            )}

            {/* STATE 2: LOGGED IN -> [ 🔔 Notifications ] [ 👤 Profile ] */}
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                
                {/* 🔔 Notifications Button & Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    title={t("notifications")}
                    className="p-2 rounded-lg text-[#555555] hover:text-[#1F6F5F] bg-[#F5FBF7] border-2 border-[#D6E8DF] relative transition cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#1F6F5F]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2FA084] rounded-full"></span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] py-3 z-50">
                      <div className="px-4 pb-2 border-b-2 border-[#D6E8DF] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#222222]">{t("notifications")}</span>
                        <Link to={notifPath} className="text-[10px] font-bold text-[#1F6F5F] hover:underline">
                          {t("viewAll")}
                        </Link>
                      </div>

                      <div className="divide-y-2 divide-[#D6E8DF] max-h-64 overflow-y-auto">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => navigate(notifPath)}
                            className="p-3 text-xs hover:bg-[#EFF8F2] transition cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#222222]">{t(n.title)}</span>
                              <span className="text-[10px] text-[#555555]">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-[#555555] mt-0.5">{t(n.desc)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 px-3 border-t-2 border-[#D6E8DF] text-center">
                        <Link to={notifPath} className="text-[11px] font-bold text-[#1F6F5F] hover:underline">
                          {t("openNotificationsCenter")} →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* 👤 Profile Avatar & Dropdown Menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-[#F5FBF7] border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-[#1F6F5F] text-white flex items-center justify-center font-bold text-xs">
                      {displayName.charAt(0)}
                    </div>
                    <div className="text-left hidden md:block">
                      <span className="text-xs font-bold text-[#222222] block truncate max-w-[110px] leading-tight">
                        {displayName.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-medium text-[#555555] block leading-none">
                        {displayRoleTitle}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#555555]" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] py-3 z-50">
                      {/* Dropdown Header */}
                      <div className="px-4 pb-3 border-b-2 border-[#D6E8DF]">
                        <h4 className="text-sm font-bold text-[#222222] truncate">{displayName}</h4>
                        <span className="text-[11px] font-medium text-[#1F6F5F] border-2 border-[#D6E8DF] bg-white px-2 py-0.5 rounded inline-block mt-1">
                          {displayRoleTitle}
                        </span>
                      </div>

                      {/* Dropdown Links */}
                      <div className="py-2 text-xs font-medium text-[#222222]">
                        <Link
                          to={profilePath}
                          className="w-full text-left px-4 py-2 hover:text-[#1F6F5F] transition flex items-center gap-2.5 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-[#1F6F5F]" />
                          <span>{t("profile")}</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            alert("Account preferences & notification settings saved.");
                          }}
                          className="w-full text-left px-4 py-2 hover:text-[#1F6F5F] transition flex items-center gap-2.5 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-[#555555]" />
                          <span>{t("settings")}</span>
                        </button>
                      </div>

                      {/* Divider & Logout */}
                      <div className="pt-2 border-t-2 border-[#D6E8DF] px-2">
                        <button
                          onClick={handleLogoutClick}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-[#555555] hover:text-[#222222] rounded-lg transition flex items-center gap-2.5 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t("logout")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#222222] hover:text-[#1F6F5F] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE RESPONSIVE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b-2 border-[#D6E8DF] bg-[#F5FBF7] px-4 pt-3 pb-6 space-y-3">
          
          {/* Language & Connectivity in Mobile Drawer */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#D6E8DF]">
            <div className="flex items-center bg-white border-2 border-[#D6E8DF] rounded-lg p-0.5">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md ${lang === 'en' ? 'bg-[#1F6F5F] text-white' : 'text-[#555555]'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-3 py-1 text-xs font-bold rounded-md ${lang === 'ta' ? 'bg-[#1F6F5F] text-white' : 'text-[#555555]'}`}
              >
                தமிழ்
              </button>
            </div>

            <OfflineIndicator currentRole={currentRole} />
          </div>

          {/* 1. PUBLIC MOBILE NAV */}
          {!isLoggedIn && (
            <div className="flex flex-col space-y-1">
              <Link to="/" className={getMobileNavLinkClass('/', true)}>
                {t("navHome")}
              </Link>
              <Link to="/how-it-works" className={getMobileNavLinkClass('/how-it-works')}>
                {t("navHowItWorks")}
              </Link>
              <Link to="/about" className={getMobileNavLinkClass('/about')}>
                {t("navAbout")}
              </Link>

              <div className="pt-3 border-t-2 border-[#D6E8DF]">
                <Link
                  to="/login"
                  className="block w-full py-2.5 text-xs font-bold text-white bg-[#1F6F5F] hover:bg-[#2FA084] rounded-lg text-center"
                >
                  {t("navLogin")} / {t("navSignUp")}
                </Link>
              </div>
            </div>
          )}

          {/* 2. COLLECTOR LOGGED IN MOBILE NAV */}
          {isCollector && (
            <div className="flex flex-col space-y-1">
              <div className="p-3 bg-white rounded-lg border-2 border-[#D6E8DF] mb-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#222222] block">{displayName}</span>
                  <span className="text-[10px] font-bold text-[#1F6F5F] border-2 border-[#D6E8DF] px-2 py-0.5 rounded inline-block mt-0.5">{t("collectorRole")}</span>
                </div>
                <Link to="/collector/profile" className="text-xs font-bold text-[#1F6F5F] underline">{t("navProfile")}</Link>
              </div>

              <Link to="/collector/dashboard" className={getMobileNavLinkClass('/collector/dashboard', true)}>
                {t("navDashboard")}
              </Link>
              <Link to="/collector/register-waste" className={getMobileNavLinkClass('/collector/register-waste')}>
                {t("navRegisterEWaste")}
              </Link>
              <Link to="/collector/requests" className={getMobileNavLinkClass('/collector/requests')}>
                {t("navMyWasteLots")}
              </Link>
              <Link to="/collector/transactions" className={getMobileNavLinkClass('/collector/transactions')}>
                {t("navTransactions")}
              </Link>
              <Link to="/collector/notifications" className={getMobileNavLinkClass('/collector/notifications')}>
                {t("navNotifications")} ({unreadCount})
              </Link>

              <div className="pt-2 border-t-2 border-[#D6E8DF]">
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-3.5 py-2 text-sm font-bold text-[#555555] hover:text-[#222222] rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("navLogout")}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. RECYCLER LOGGED IN MOBILE NAV */}
          {isRecycler && (
            <div className="flex flex-col space-y-1">
              <div className="p-3 bg-white rounded-lg border-2 border-[#D6E8DF] mb-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#222222] block">{displayName}</span>
                  <span className="text-[10px] font-bold text-[#1F6F5F] border-2 border-[#D6E8DF] px-2 py-0.5 rounded inline-block mt-0.5">{t("recyclerRole")}</span>
                </div>
                <Link to="/recycler/profile" className="text-xs font-bold text-[#1F6F5F] underline">{t("navProfile")}</Link>
              </div>

              <Link to="/recycler/dashboard" className={getMobileNavLinkClass('/recycler/dashboard', true)}>
                {t("navDashboard")}
              </Link>
              <Link to="/recycler/waste-requests" className={getMobileNavLinkClass('/recycler/waste-requests')}>
                {t("navWasteRequests")}
              </Link>
              <Link to="/recycler/transactions" className={getMobileNavLinkClass('/recycler/transactions')}>
                {t("navTransactions")}
              </Link>
              <Link to="/recycler/compliance" className={getMobileNavLinkClass('/recycler/compliance')}>
                {t("navCompliance")}
              </Link>
              <Link to="/recycler/notifications" className={getMobileNavLinkClass('/recycler/notifications')}>
                {t("navNotifications")} ({unreadCount})
              </Link>

              <div className="pt-2 border-t-2 border-[#D6E8DF]">
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-3.5 py-2 text-sm font-bold text-[#555555] hover:text-[#222222] rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("navLogout")}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
