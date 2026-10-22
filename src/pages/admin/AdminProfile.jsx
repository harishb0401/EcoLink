import React, { useState, useEffect } from 'react';
import { Shield, Mail, Phone, MapPin, CheckCircle2, Save, Edit3, Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';
import authService from '../../services/authService';

export default function AdminProfile({ currentUser, onProfileUpdated }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    name: currentUser?.fullName || currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || currentUser?.location || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const freshUser = await authService.fetchCurrentUser();
        if (isMounted && freshUser) {
          setProfile({
            name: freshUser.fullName || freshUser.name || '',
            email: freshUser.email || '',
            phone: freshUser.phone || '',
            department: freshUser.location || freshUser.department || ''
          });
        }
      } catch (err) {
        console.warn('Could not fetch live admin profile:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        fullName: profile.name,
        phone: profile.phone,
        location: profile.department
      });

      if (onProfileUpdated && updatedUser) {
        onProfileUpdated(updatedUser);
      }

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to update admin profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white text-[#222222]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('navProfile')}</h1>
        <p className="text-xs sm:text-sm text-[#555555]">
          {t('systemWideOversight')}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#D6E8DF] text-[#1F6F5F] rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1F6F5F]" />
          <span>{t('save')} ✓</span>
        </div>
      )}

      <div className="bg-[#F5FBF7] p-6 sm:p-10 rounded-lg border-2 border-[#D6E8DF] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D6E8DF] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold text-2xl">
              <Shield className="w-8 h-8 text-[#1F6F5F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#222222]">{profile.name || 'System Admin'}</h2>
                <span className="text-[10px] font-bold text-[#1F6F5F] bg-[#EFF8F2] border-2 border-[#B8D9C8] px-2.5 py-0.5 rounded">
                  {t('cpcbMasterAuthority')}
                </span>
              </div>
              <p className="text-xs text-[#555555] mt-0.5">{profile.department ? profile.department : t('tnpcbBoard')}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>{isEditing ? t('cancel') : t('editPrice')}</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('fullName')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Admin Full Name"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('emailAddress')}</label>
              <input
                type="email"
                disabled={true}
                value={profile.email}
                placeholder="Email Address"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#555555] focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">{t('accountType')}</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                placeholder="Department / Wing"
                className="w-full bg-white disabled:opacity-80 border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
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
