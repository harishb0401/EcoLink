import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, AlertCircle, Edit3, Save, Loader2, Navigation } from 'lucide-react';
import { useTranslation } from '../../i18n';
import authService from '../../services/authService';

export default function CollectorProfile({ currentUser = null, collectorProfile = null, onProfileUpdated = null }) {
  const { t } = useTranslation();
  const initialUser = currentUser || collectorProfile || authService.getCurrentUser() || {};

  const cleanInitialLocation = (loc) => {
    if (!loc || loc === 'Chennai Hub') return '';
    return loc;
  };
  
  const [profile, setProfile] = useState({
    fullName: initialUser.fullName || initialUser.name || '',
    name: initialUser.fullName || initialUser.name || '',
    company: initialUser.company || initialUser.facility_name || '',
    phone: initialUser.phone || '',
    email: initialUser.email || '',
    location: cleanInitialLocation(initialUser.location || initialUser.address),
    phone_verified: !!initialUser.phone_verified || !!initialUser.phone
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Fetch fresh profile from database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFreshProfile() {
      try {
        const freshUser = await authService.fetchCurrentUser();
        if (isMounted && freshUser) {
          setProfile({
            fullName: freshUser.fullName || freshUser.name || '',
            name: freshUser.fullName || freshUser.name || '',
            company: freshUser.company || freshUser.facility_name || '',
            phone: freshUser.phone || '',
            email: freshUser.email || '',
            location: cleanInitialLocation(freshUser.location || freshUser.address),
            phone_verified: !!freshUser.phone_verified || !!freshUser.phone
          });
        }
      } catch (err) {
        console.warn('Could not refresh profile from server:', err.message);
      }
    }
    loadFreshProfile();
    return () => { isMounted = false; };
  }, []);

  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please type your address manually.");
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const gpsTag = `Pickup Hub (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;
        setProfile(prev => ({
          ...prev,
          location: prev.location ? `${prev.location.trim()} [GPS: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E]` : gpsTag
        }));
        setIsLocatingGps(false);
      },
      (err) => {
        console.warn('GPS location error:', err.message);
        alert('Could not detect GPS location. Please enter your address manually.');
        setIsLocatingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      const updatedUser = await authService.updateProfile({
        fullName: profile.fullName || profile.name,
        name: profile.fullName || profile.name,
        phone: profile.phone,
        location: profile.location.trim()
      });

      if (updatedUser) {
        setProfile({
          fullName: updatedUser.fullName || updatedUser.name || '',
          name: updatedUser.fullName || updatedUser.name || '',
          company: updatedUser.company || updatedUser.facility_name || '',
          phone: updatedUser.phone || '',
          email: updatedUser.email || '',
          location: cleanInitialLocation(updatedUser.location || updatedUser.address),
          phone_verified: !!updatedUser.phone_verified || !!updatedUser.phone
        });

        if (onProfileUpdated) {
          onProfileUpdated(updatedUser);
        }
      }

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile.fullName || profile.name || profile.email || '—';
  const displayInitials = displayName !== '—'
    ? displayName.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
    : 'U';

  const hasConfiguredAddress = Boolean(profile.location && profile.location.trim() !== '');

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white text-[#222222]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('navProfile')}</h1>
        <p className="text-xs sm:text-sm text-[#555555]">
          Manage your personal details, phone verification, and default collection pickup address.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#D6E8DF] text-[#1F6F5F] rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1F6F5F]" />
          <span>Profile and pickup address saved successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#D6E8DF] text-[#222222] rounded-lg text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#555555]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Address Missing Notice */}
      {!hasConfiguredAddress && (
        <div className="p-4 bg-[#FFF8E6] border-2 border-[#FFE082] text-[#855B00] rounded-lg text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#E68A00] shrink-0" />
            <div>
              <strong className="font-bold block text-sm text-[#222222]">Collection Pickup Address Not Set</strong>
              <span className="text-[#555555]">
                Please enter your collection address below so recyclers know where to collect your waste. It will auto-fill whenever you declare new waste lots.
              </span>
            </div>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer self-start sm:self-auto transition"
            >
              Set Address Now
            </button>
          )}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-[#F5FBF7] p-6 sm:p-10 rounded-lg border-2 border-[#D6E8DF] space-y-8">
        
        {/* User Identity Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D6E8DF] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold text-2xl">
              {displayInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#222222]">{displayName}</h2>
                {profile.phone_verified && (
                  <span className="text-[10px] font-bold text-[#1F6F5F] bg-[#EFF8F2] border-2 border-[#B8D9C8] px-2.5 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" />
                    {t('verifiedCollectorBadge')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#555555] mt-0.5">
                {profile.location ? profile.location : (profile.company || 'Individual Collector')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>{isEditing ? t('cancel') : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('fullName')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.fullName || profile.name || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value, name: e.target.value })}
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('emailAddress')}</label>
              <input
                type="email"
                disabled={true}
                value={profile.email || ''}
                className="w-full bg-white opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#555555] focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('phoneNumber')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">Company / Organization (Optional)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.company || ''}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                placeholder="e.g. Apex Scrap Collection"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>

          {/* Dedicated Collection Pickup Address Field */}
          <div className="space-y-1.5 pt-2 border-t border-[#D6E8DF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#222222] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#1F6F5F]" />
                <span>Collector Pickup & Storage Address</span>
                <span className="text-red-500">*</span>
              </label>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleDetectGpsLocation}
                  disabled={isLocatingGps}
                  className="text-[11px] font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1 cursor-pointer"
                >
                  {isLocatingGps ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3 h-3" />
                      <span>Auto-detect GPS Location</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <textarea
              rows="3"
              disabled={!isEditing}
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Enter your street address, industrial estate / yard details, city, district & PIN code (e.g. Plot 14, SIDCO Industrial Estate, Kappalur, Madurai - 625008)"
              className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg p-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
            />
            <p className="text-[11px] text-[#555555]">
              Recyclers will view this location for collection and logistics pickup. This address will automatically pre-fill whenever you declare new waste lots.
            </p>
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
