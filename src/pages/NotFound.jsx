import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-white text-[#222222]">
      <div className="max-w-md w-full text-center space-y-6 bg-[#F5FBF7] p-8 sm:p-12 rounded-lg border-2 border-[#D6E8DF]">
        <div className="w-16 h-16 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center mx-auto text-2xl font-bold">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('pageNotFound')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('pageNotFoundSub')}
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('returnToHome')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
