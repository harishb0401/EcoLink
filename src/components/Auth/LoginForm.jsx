import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, Truck, ShieldCheck, Shield, AlertCircle, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n';
import authService from '../../services/authService';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getOfflineCollectorSession } from '../../services/offline/offlineSession';

export default function LoginForm({ onLoginSuccess, onSwitchToSignup }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { online } = useOnlineStatus();
  const [selectedRole, setSelectedRole] = useState('collector');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offlineCollector, setOfflineCollector] = useState(null);

  // Check if device already has a validated offline collector session
  useEffect(() => {
    if (!online) {
      getOfflineCollectorSession().then((res) => {
        const isAuthOffline = res?.state === 'AUTHENTICATED_OFFLINE' || res?.status === 'AUTHENTICATED_OFFLINE';
        if (isAuthOffline && res?.user) {
          setOfflineCollector(res.user);
        }
      });
    } else {
      setOfflineCollector(null);
    }
  }, [online]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If offline, check for existing collector session
    if (!online) {
      if (offlineCollector) {
        if (onLoginSuccess) onLoginSuccess(offlineCollector);
        navigate('/collector/dashboard');
        return;
      }
      setErrorMessage('Internet connection is required for your first login.');
      return;
    }

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage(t('enterEmailPhonePassword') || 'Please enter your phone number/email and password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const user = await authService.login(identifier, password, selectedRole);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }

      if (user.role === 'collector') {
        navigate('/collector/dashboard');
      } else if (user.role === 'recycler') {
        navigate('/recycler/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-[#222222]">{t('welcomeBack')}</h3>
        <p className="text-xs text-[#555555]">
          {t('loginSubtitleText')}
        </p>
      </div>

      {/* OFFLINE STATUS NOTICES */}
      {!online && offlineCollector && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#B8D9C8] rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6FCF97]" />
            <span className="text-xs font-bold text-[#222222]">Active Collector Session Detected</span>
          </div>
          <p className="text-xs text-[#555555] font-medium">
            Welcome back, <strong>{offlineCollector.name || 'Collector'}</strong>! You can continue offline on this device.
          </p>
          <button
            type="button"
            onClick={() => {
              if (onLoginSuccess) onLoginSuccess(offlineCollector);
              navigate('/collector/dashboard');
            }}
            className="w-full py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Collector Dashboard (Offline)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!online && !offlineCollector && (
        <div className="p-4 bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-[#222222] font-bold text-xs">
            <WifiOff className="w-4 h-4 text-[#555555]" />
            <span>Offline Mode</span>
          </div>
          <p className="text-xs text-[#555555] leading-relaxed">
            Internet connection is required for your first login.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-[#F5FBF7] hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-[#555555] tracking-wider block">
          {t('selectAccountRole')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('collector');
              setIdentifier('');
            }}
            className={`py-2 px-2 text-xs font-bold rounded-lg border-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'collector'
                ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                : 'bg-white text-[#555555] border-[#D6E8DF] hover:border-[#B8D9C8] hover:text-[#222222]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t('collectorRole')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('recycler');
              setIdentifier('');
            }}
            className={`py-2 px-2 text-xs font-bold rounded-lg border-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'recycler'
                ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                : 'bg-white text-[#555555] border-[#D6E8DF] hover:border-[#B8D9C8] hover:text-[#222222]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('recyclerRole')}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-white border-2 border-[#D6E8DF] text-[#222222] text-xs font-medium rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#555555] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#222222] block mb-1">
            {t('emailOrPhone')}
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or phone number"
              className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#222222] block mb-1">
            {t('password')}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 font-medium text-[#555555] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-[#1F6F5F] focus:ring-[#1F6F5F]"
            />
            <span>{t('rememberMe')}</span>
          </label>

          <button
            type="button"
            onClick={() => alert("Please contact the administrator to reset your password.")}
            className="font-bold text-[#1F6F5F] hover:underline cursor-pointer"
          >
            {t('forgotPassword')}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-[#1F6F5F] hover:bg-[#2FA084] disabled:opacity-60 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('authenticating', 'Authenticating...')}</span>
            </>
          ) : (
            <>
              <span>{t('loginBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="text-center pt-2">
        <p className="text-xs font-medium text-[#555555]">
          {t('dontHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-[#1F6F5F] hover:underline cursor-pointer ml-1"
          >
            {t('navSignUp')}
          </button>
        </p>
      </div>
    </div>
  );
}
