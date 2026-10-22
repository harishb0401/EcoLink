import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, ArrowRight, Truck, ShieldCheck, Check, AlertCircle, CheckCircle2, Loader2, Building } from 'lucide-react';
import { useTranslation } from '../../i18n';
import authService from '../../services/authService';

export default function SignupForm({ onSignupSuccess, onSwitchToLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [signupRole, setSignupRole] = useState('collector'); // 'collector' | 'recycler'
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !signupPhone.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage(t('fillAllRequired') || 'Please fill out all required fields.');
      return;
    }

    if (signupRole === 'recycler') {
      if (!organizationName.trim()) {
        setErrorMessage('Authorized Business / Facility Name is required.');
        return;
      }
      if (!registrationNumber.trim()) {
        setErrorMessage('Official Recycler Registration Number is required.');
        return;
      }
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatch') || 'Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const user = await authService.register({
        fullName: fullName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
        role: signupRole,
        organizationName: signupRole === 'recycler' ? (organizationName.trim() || fullName.trim()) : undefined,
        facilityName: signupRole === 'recycler' ? (organizationName.trim() || fullName.trim()) : undefined,
        registrationNumber: signupRole === 'recycler' ? registrationNumber.trim().toUpperCase() : undefined,
        cpcbRegistrationNumber: signupRole === 'recycler' ? registrationNumber.trim().toUpperCase() : undefined,
        locationText: 'Chennai Hub'
      });

      setSuccessMessage('Account created successfully! Redirecting...');

      if (onSignupSuccess) {
        onSignupSuccess(user);
      }

      setTimeout(() => {
        if (signupRole === 'collector') {
          navigate('/collector/dashboard');
        } else {
          navigate('/recycler/dashboard');
        }
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-[#222222]">{t('createYourAccount')}</h3>
        <p className="text-xs text-[#555555]">
          {t('joinEcosystem')}
        </p>
      </div>

      {/* Role selection / Account Type */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-[#555555] tracking-wider block">
          {t('accountType')}
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setSignupRole('collector')}
            className={`p-3 rounded-lg border-2 transition flex items-center justify-between cursor-pointer ${
              signupRole === 'collector'
                ? 'bg-[#EFF8F2] border-[#B8D9C8] text-[#1F6F5F]'
                : 'bg-white border-[#D6E8DF] text-[#555555] hover:border-[#B8D9C8] hover:text-[#222222]'
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              <div className="w-7 h-7 rounded bg-white border-2 border-[#D6E8DF] flex items-center justify-center font-bold text-xs text-[#1F6F5F]">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#222222] block">{t('collectorRole')}</span>
                <span className="text-[10px] text-[#555555] block">{t('registerLotsAndEarn') || 'Register lots & earn'}</span>
              </div>
            </div>
            {signupRole === 'collector' && <Check className="w-4 h-4 text-[#1F6F5F]" />}
          </button>

          <button
            type="button"
            onClick={() => setSignupRole('recycler')}
            className={`p-3 rounded-lg border-2 transition flex items-center justify-between cursor-pointer ${
              signupRole === 'recycler'
                ? 'bg-[#EFF8F2] border-[#B8D9C8] text-[#1F6F5F]'
                : 'bg-white border-[#D6E8DF] text-[#555555] hover:border-[#B8D9C8] hover:text-[#222222]'
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              <div className="w-7 h-7 rounded bg-white border-2 border-[#D6E8DF] flex items-center justify-center font-bold text-xs text-[#1F6F5F]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F6F5F]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#222222] block">{t('recyclerRole')}</span>
                <span className="text-[10px] text-[#555555] block">{t('procureAndRecycle') || 'Procure & recycle'}</span>
              </div>
            </div>
            {signupRole === 'recycler' && <Check className="w-4 h-4 text-[#1F6F5F]" />}
          </button>
        </div>
      </div>

      {/* Error / Success Notifications */}
      {errorMessage && (
        <div className="p-3 bg-white border-2 border-[#D6E8DF] text-[#222222] text-xs font-medium rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#555555] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-[#EFF8F2] border-2 border-[#B8D9C8] text-[#1F6F5F] text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold text-[#222222] block mb-1">
            {signupRole === 'recycler' ? (t('contactPersonName') || 'Contact Person Name *') : `${t('fullName')} *`}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
            />
          </div>
        </div>

        {signupRole === 'recycler' && (
          <>
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">
                Authorized Business / Facility Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. GreenTech Recyclers Pvt Ltd"
                  className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#222222]">
                  Official Recycler Registration Number *
                </label>
                <span className="text-[10px] text-[#1F6F5F] font-bold">
                  Verified against Registry
                </span>
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#1F6F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. CPCB-TN-1374, CPCB-RECY-2026-001"
                  className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-mono font-bold text-[#222222] placeholder:font-sans placeholder:font-normal placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none uppercase"
                />
              </div>
              <p className="text-[10px] text-[#555555] mt-1">
                Must match an authorized record maintained in the official CPCB/SPCB recycler registry.
              </p>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#222222] block mb-1">
              {t('phoneNumber')} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#222222] block mb-1">
              {t('emailAddress')} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#222222] block mb-1">
              {t('password')} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#222222] block mb-1">
              {t('confirmPassword')} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-[#1F6F5F] hover:bg-[#2FA084] disabled:opacity-60 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('creatingAccount', 'Creating Account...')}</span>
            </>
          ) : (
            <>
              <span>{t('createAccountBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2">
        <p className="text-xs font-medium text-[#555555]">
          {t('alreadyHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#1F6F5F] hover:underline cursor-pointer ml-1"
          >
            {t('navLogin')}
          </button>
        </p>
      </div>
    </div>
  );
}
