import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ShieldCheck, Phone, Mail, MapPin, CheckCircle2, Edit3, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n';
import authService from '../../services/authService';
import recyclerService from '../../services/recyclerService';

export default function RecyclerProfile({ currentUser, onProfileUpdated }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    companyName: currentUser?.recyclerProfile?.facilityName || currentUser?.recyclerProfile?.companyName || currentUser?.organizationName || currentUser?.fullName || '',
    cpcbRegistrationNo: currentUser?.recyclerProfile?.cpcbRegistrationNo || currentUser?.recyclerProfile?.cpcbRegistrationNumber || currentUser?.recyclerProfile?.registrationNumber || '',
    contactPerson: currentUser?.fullName || currentUser?.name || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || currentUser?.address || currentUser?.recyclerProfile?.facilityAddress || '',
    email: currentUser?.email || '',
    isVerified: currentUser?.recyclerProfile?.status === 'VERIFIED' || currentUser?.recyclerProfile?.isVerified || false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const [freshUser, recRes] = await Promise.all([
          authService.fetchCurrentUser().catch(() => null),
          recyclerService.getProfile().catch(() => null)
        ]);

        if (isMounted) {
          const recData = recRes?.data || freshUser?.recyclerProfile || {};
          const userObj = freshUser || currentUser || {};
          setProfile({
            companyName: recData.facilityName || recData.companyName || recData.organizationName || userObj.fullName || '',
            cpcbRegistrationNo: recData.cpcbRegistrationNo || recData.cpcbRegistrationNumber || recData.registrationNumber || '',
            contactPerson: userObj.fullName || userObj.name || recData.contactPerson || '',
            phone: userObj.phone || recData.phone || '',
            location: userObj.location || userObj.address || recData.facilityAddress || recData.location || '',
            email: userObj.email || '',
            isVerified: recData.cpcbStatus === 'VERIFIED' || recData.isVerified || recData.status === 'VERIFIED' || false
          });
        }
      } catch (err) {
        console.warn('Could not load live recycler profile:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfileData();
    return () => { isMounted = false; };
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update recycler facility details
      await recyclerService.updateProfile({
        facilityName: profile.companyName,
        organizationName: profile.companyName,
        cpcbRegistrationNo: profile.cpcbRegistrationNo,
        cpcbRegistrationNumber: profile.cpcbRegistrationNo,
        facilityAddress: profile.location,
        location: profile.location,
        phone: profile.phone,
        fullName: profile.contactPerson,
        contactPerson: profile.contactPerson
      });

      // 2. Update user profile
      const updatedUser = await authService.updateProfile({
        fullName: profile.contactPerson,
        phone: profile.phone,
        location: profile.location
      });

      if (onProfileUpdated && updatedUser) {
        onProfileUpdated(updatedUser);
      }

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const src = profile.companyName || profile.contactPerson || profile.email || 'RC';
    const parts = src.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return src.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white text-[#222222]">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/recycler/dashboard')}
          className="px-4 py-2 text-xs font-bold text-[#222222] bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg hover:border-[#B8D9C8] transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1F6F5F]" />
          <span>{t('backToDashboard', 'Back to Dashboard')}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#1F6F5F]" />
          <span>{isEditing ? t('cancel') : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Header Info */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('navProfile')}</h1>
        <p className="text-xs sm:text-sm text-[#555555]">
          {t('cpcbVerifLayerSub')}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#D6E8DF] text-[#1F6F5F] rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1F6F5F]" />
          <span>Profile saved successfully! ✓</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-[#F5FBF7] p-6 sm:p-10 rounded-lg border-2 border-[#D6E8DF] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D6E8DF] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold text-2xl">
              {getInitials()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#222222]">{profile.companyName || profile.contactPerson || 'Recycler Facility'}</h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 bg-[#EFF8F2] border-2 ${
                  profile.isVerified 
                    ? 'text-[#1F6F5F] border-[#B8D9C8]' 
                    : 'text-[#555555] border-[#D6E8DF]'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-[#1F6F5F]" />
                  {profile.isVerified ? t('recStatusVERIFIED') : 'Pending Verification'}
                </span>
              </div>
              <p className="text-xs text-[#555555] mt-0.5">
                Reg No: {profile.cpcbRegistrationNo ? profile.cpcbRegistrationNo : '—'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('accountType')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                placeholder="Facility / Company Name"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('cpcbTnpcbReg')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.cpcbRegistrationNo}
                onChange={(e) => setProfile({ ...profile, cpcbRegistrationNo: e.target.value })}
                placeholder="CPCB / TNPCB Reg Number"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('fullName')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.contactPerson}
                onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                placeholder="Contact Person Full Name"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('phoneNumber')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Phone Number"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#222222] block mb-1">{t('storageLocationHub')}</label>
            <input
              type="text"
              disabled={!isEditing}
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Facility Address / Location"
              className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
            />
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : t('save')}</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
