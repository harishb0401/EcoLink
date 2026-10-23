import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, ArrowRight, Truck, ShieldCheck, Check, AlertCircle, CheckCircle2, Loader2, Building, MapPin, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import authService from '../../services/authService';

export default function SignupForm({ onSignupSuccess, onSwitchToLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [signupRole, setSignupRole] = useState('collector'); // 'collector' | 'recycler'
  const [fullName, setFullName] = useState('');
  const [collectorLocation, setCollectorLocation] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Recycler registration verification states
  const [isFetchingReg, setIsFetchingReg] = useState(false);
  const [regVerificationStatus, setRegVerificationStatus] = useState('idle'); // 'idle' | 'checking' | 'verified' | 'duplicate' | 'not_found' | 'error'
  const [regVerificationMessage, setRegVerificationMessage] = useState('');
  const [regVerifiedData, setRegVerifiedData] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debounced auto-fetch for Official Recycler Registration Number
  useEffect(() => {
    if (signupRole !== 'recycler') {
      return;
    }

    const trimmedReg = registrationNumber.trim().toUpperCase();

    if (!trimmedReg || trimmedReg.length < 3) {
      setOrganizationName('');
      setRegVerificationStatus('idle');
      setRegVerificationMessage('');
      setRegVerifiedData(null);
      setIsFetchingReg(false);
      return;
    }

    setIsFetchingReg(true);
    setRegVerificationStatus('checking');

    const timeoutId = setTimeout(async () => {
      try {
        const res = await authService.verifyRegistration(trimmedReg);

        if (res?.success && res?.data) {
          // Successfully verified and available
          setOrganizationName(res.data.businessName || '');
          setRegVerificationStatus('verified');
          setRegVerifiedData(res.data);
          const authority = res.data.issuingAuthority ? ` • ${res.data.issuingAuthority}` : '';
          setRegVerificationMessage(`Authorized: ${res.data.businessName}${authority}`);
          setErrorMessage('');
        } else if (res?.alreadyRegistered) {
          // Registration number or business/facility name is already registered by another user
          setOrganizationName(res.businessName || '');
          setRegVerificationStatus('duplicate');
          setRegVerifiedData(null);
          const duplicateMsg = res.message || `Facility "${res.businessName}" is already registered to an existing account. Only a single user can sign up per Authorized Business / Facility.`;
          setRegVerificationMessage(duplicateMsg);
          setErrorMessage(duplicateMsg);
        } else if (res?.found === false) {
          // Not found in official registry
          setOrganizationName('');
          setRegVerificationStatus('not_found');
          setRegVerifiedData(null);
          setRegVerificationMessage(res.message || `Registration number "${trimmedReg}" was not found in the authorized CPCB/SPCB registry.`);
        } else {
          // Inactive, expired or other regulatory flag
          setOrganizationName(res?.businessName || '');
          setRegVerificationStatus('error');
          setRegVerifiedData(null);
          setRegVerificationMessage(res?.message || 'Registration number could not be validated against official records.');
          setErrorMessage(res?.message || '');
        }
      } catch (err) {
        setOrganizationName('');
        setRegVerificationStatus('error');
        setRegVerifiedData(null);
        setRegVerificationMessage(err.message || 'Error connecting to registration registry.');
      } finally {
        setIsFetchingReg(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [registrationNumber, signupRole]);

  // Role change handler
  const handleRoleChange = (role) => {
    setSignupRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'collector') {
      setRegVerificationStatus('idle');
      setRegVerificationMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !signupPhone.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage(t('fillAllRequired') || 'Please fill out all required fields.');
      return;
    }

    if (signupRole === 'recycler') {
      if (!registrationNumber.trim()) {
        setErrorMessage('Official Recycler Registration Number is required.');
        return;
      }

      if (isFetchingReg || regVerificationStatus === 'checking') {
        setErrorMessage('Please wait while your registration number is being verified against the registry.');
        return;
      }

      if (regVerificationStatus === 'duplicate') {
        setErrorMessage(regVerificationMessage || 'This Authorized Business / Facility is already registered to an existing user. A single user is permitted per facility.');
        return;
      }

      if (regVerificationStatus === 'not_found') {
        setErrorMessage(regVerificationMessage || 'Registration number was not found in the official authorized recycler registry.');
        return;
      }

      if (regVerificationStatus !== 'verified' || !organizationName.trim()) {
        setErrorMessage(regVerificationMessage || 'A valid, pre-authorized Recycler Registration Number is required to sign up as a recycler.');
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
        organizationName: signupRole === 'recycler' ? organizationName.trim() : undefined,
        facilityName: signupRole === 'recycler' ? organizationName.trim() : undefined,
        registrationNumber: signupRole === 'recycler' ? registrationNumber.trim().toUpperCase() : undefined,
        cpcbRegistrationNumber: signupRole === 'recycler' ? registrationNumber.trim().toUpperCase() : undefined,
        locationText: signupRole === 'collector' ? (collectorLocation.trim() || undefined) : undefined,
        location: signupRole === 'collector' ? (collectorLocation.trim() || undefined) : undefined
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

  const isSubmitDisabled = isLoading || (signupRole === 'recycler' && (
    isFetchingReg || 
    regVerificationStatus === 'checking' || 
    regVerificationStatus === 'duplicate' || 
    regVerificationStatus === 'not_found' || 
    regVerificationStatus === 'error' ||
    !organizationName.trim() ||
    !registrationNumber.trim()
  ));

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
            onClick={() => handleRoleChange('collector')}
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
            onClick={() => handleRoleChange('recycler')}
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
        <div className="p-3 bg-red-50 border-2 border-red-300 text-red-700 text-xs font-medium rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
        {signupRole === 'recycler' ? (
          <>
            {/* 1. Official Recycler Registration Number AT THE FIRST */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#222222]">
                  Official Recycler Registration Number *
                </label>
                {isFetchingReg ? (
                  <span className="text-[10px] text-[#1F6F5F] font-bold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#1F6F5F]" />
                    Searching Registry...
                  </span>
                ) : regVerificationStatus === 'verified' ? (
                  <span className="text-[10px] text-[#1F6F5F] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" />
                    Verified Pre-Authorized
                  </span>
                ) : regVerificationStatus === 'duplicate' ? (
                  <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    Already Registered
                  </span>
                ) : regVerificationStatus === 'not_found' ? (
                  <span className="text-[10px] text-red-600 font-bold">
                    Not in Registry
                  </span>
                ) : (
                  <span className="text-[10px] text-[#1F6F5F] font-bold">
                    CPCB/SPCB Verified
                  </span>
                )}
              </div>
              <div className="relative">
                <ShieldCheck
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    regVerificationStatus === 'verified'
                      ? 'text-[#1F6F5F]'
                      : regVerificationStatus === 'duplicate' || regVerificationStatus === 'not_found' || regVerificationStatus === 'error'
                      ? 'text-red-500'
                      : 'text-[#1F6F5F]'
                  }`}
                />
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. CPCB-TN-1374, CPCB-RECY-2026-001"
                  className={`w-full bg-[#F5FBF7] border-2 rounded-lg pl-10 pr-10 py-2 text-xs font-mono font-bold text-[#222222] placeholder:font-sans placeholder:font-normal placeholder:text-[#555555] focus:outline-none uppercase ${
                    regVerificationStatus === 'verified'
                      ? 'border-[#1F6F5F] bg-[#EFF8F2]'
                      : regVerificationStatus === 'duplicate' || regVerificationStatus === 'not_found' || regVerificationStatus === 'error'
                      ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                      : 'border-[#D6E8DF] focus:border-[#B8D9C8]'
                  }`}
                />
                {isFetchingReg && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1F6F5F] absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
                {!isFetchingReg && regVerificationStatus === 'verified' && (
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
                {!isFetchingReg && (regVerificationStatus === 'duplicate' || regVerificationStatus === 'not_found' || regVerificationStatus === 'error') && (
                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>
              <p className="text-[10px] text-[#555555] mt-1">
                Enter your official registration ID. The system will automatically fetch and lock your registered business facility.
              </p>
            </div>

            {/* 2. Authorized Business / Facility Name (AUTO-FETCHED AUTOMATICALLY) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#222222]">
                  Authorized Business / Facility Name *
                </label>
                {organizationName && regVerificationStatus === 'verified' && (
                  <span className="text-[10px] text-[#1F6F5F] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#1F6F5F]" />
                    Auto-Fetched from Registry
                  </span>
                )}
              </div>
              <div className="relative">
                <Building className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  readOnly
                  value={organizationName}
                  placeholder={
                    isFetchingReg
                      ? "Fetching registered facility name..."
                      : "Auto-fetched from Official Recycler Registration Number"
                  }
                  className={`w-full border-2 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none ${
                    organizationName
                      ? regVerificationStatus === 'duplicate'
                        ? 'bg-red-50 border-red-300 text-red-900 cursor-not-allowed'
                        : 'bg-[#EFF8F2] border-[#B8D9C8] text-[#1F6F5F]'
                      : 'bg-[#F2F5F3] border-[#D6E8DF] text-[#777777] cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Single User per Facility Warning Alert */}
              {regVerificationStatus === 'duplicate' && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-red-50 border border-red-300 text-red-700 text-[11px] font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Facility Already Registered</span>
                  </div>
                  <p className="pl-5 leading-relaxed">
                    The facility <strong>"{organizationName}"</strong> is already associated with an active recycler account. Under regulatory rules, only a single user is allowed to sign up per Authorized Business / Facility.
                  </p>
                </div>
              )}

              {/* Verification Confirmation */}
              {regVerificationStatus === 'verified' && regVerificationMessage && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#1F6F5F] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                  <span>{regVerificationMessage}</span>
                </div>
              )}

              {/* Registry Not Found Notice */}
              {regVerificationStatus === 'not_found' && (
                <p className="text-[10px] text-red-600 font-medium mt-1">
                  {regVerificationMessage}
                </p>
              )}
            </div>

            {/* 3. Contact Person Name */}
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">
                {t('contactPersonName') || 'Contact Person Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter contact person's full name"
                  className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>
            </div>
          </>
        ) : (
          /* Collector Role: Full Name is the first field */
          <div>
            <label className="text-xs font-bold text-[#222222] block mb-1">
              {`${t('fullName')} *`}
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
        )}

        {signupRole === 'collector' && (
          <div>
            <label className="text-xs font-bold text-[#222222] block mb-1">
              Collection Pickup Address (Optional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={collectorLocation}
                onChange={(e) => setCollectorLocation(e.target.value)}
                placeholder="e.g. Plot 14, SIDCO, Madurai (or provide in profile)"
                className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-[#555555] mt-1">
              Used as your default pickup location. You can configure or change this anytime in your Profile.
            </p>
          </div>
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
          disabled={isSubmitDisabled}
          className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 mt-3 ${
            isSubmitDisabled
              ? 'bg-[#B8D9C8] text-[#555555] cursor-not-allowed opacity-75'
              : 'bg-[#1F6F5F] hover:bg-[#2FA084] text-white cursor-pointer shadow-sm'
          }`}
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
