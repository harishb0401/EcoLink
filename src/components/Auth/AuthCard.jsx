import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useTranslation } from '../../i18n';

export default function AuthCard({ initialTab = 'login', onLoginSuccess }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="w-full max-w-[460px] mx-auto bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="w-10 h-10 rounded-lg bg-[#1F6F5F] text-white mx-auto flex items-center justify-center font-bold text-lg">
          ♻
        </div>
        <h2 className="text-2xl font-bold text-[#222222]">
          Eco-<span className="text-[#1F6F5F]">Link</span>
        </h2>
      </div>

      {/* Segmented Tab Switch: [ LOGIN ] [ SIGN UP ] */}
      <div className="flex bg-white p-1 rounded-lg border-2 border-[#D6E8DF]">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
            activeTab === 'login'
              ? 'bg-[#1F6F5F] text-white'
              : 'text-[#555555] hover:text-[#222222]'
          }`}
        >
          {t('navLogin', 'Login')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('signup')}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
            activeTab === 'signup'
              ? 'bg-[#1F6F5F] text-white'
              : 'text-[#555555] hover:text-[#222222]'
          }`}
        >
          {t('navSignUp', 'Sign Up')}
        </button>
      </div>

      {/* Form Content */}
      {activeTab === 'login' ? (
        <LoginForm
          onLoginSuccess={onLoginSuccess}
          onSwitchToSignup={() => setActiveTab('signup')}
        />
      ) : (
        <SignupForm
          onSignupSuccess={onLoginSuccess}
          onSwitchToLogin={() => setActiveTab('login')}
        />
      )}
    </div>
  );
}
