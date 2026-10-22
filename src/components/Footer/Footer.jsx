import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#F5FBF7] text-[#555555] pt-12 pb-8 border-t-2 border-[#D6E8DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b-2 border-[#D6E8DF]">
          
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#D6E8DF] flex items-center justify-center text-[#1F6F5F] font-bold text-base">
                ♻
              </div>
              <span className="text-xl font-bold tracking-tight text-[#222222]">
                Eco-<span className="text-[#1F6F5F]">Link</span>
              </span>
            </Link>
            
            <p className="text-[#555555] text-xs max-w-sm leading-relaxed">
              {t("platformSubtitle")}
            </p>

            <div className="flex items-center gap-1.5 text-xs font-medium text-[#1F6F5F] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#1F6F5F]" />
              <span>{t("cpcbVerified")} · EPR Compliance Layer</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#555555]">
          <p>© {new Date().getFullYear()} Eco-Link Platform. {t("allRightsReserved")}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#1F6F5F] transition cursor-pointer">{t("privacyPolicy", "Privacy Policy")}</span>
            <span>·</span>
            <span className="hover:text-[#1F6F5F] transition cursor-pointer">{t("termsOfService", "Terms of Service")}</span>
            <span>·</span>
            <span className="hover:text-[#1F6F5F] transition cursor-pointer">{t("security", "Security")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
