import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Scale, FileCheck2, Building2, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white py-12 text-[#222222]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-[#1F6F5F] text-xs font-bold uppercase tracking-wider border-2 border-[#D6E8DF]">
            <Leaf className="w-3.5 h-3.5 text-[#1F6F5F]" /> {t('aboutEcoLinkBadge', 'ABOUT ECO-LINK')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
            {t('aboutMainTitle', 'Digital E-Waste Infrastructure for Tamil Nadu')}
          </h1>
          <p className="text-base text-[#555555] font-normal leading-relaxed">
            {t('aboutSubTitle', 'Eco-Link bridges informal collectors and CPCB-authorized recyclers through transparent pricing benchmark models, structured classification, and recycler matching engines.')}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#222222]">{t('pillarTransparentPricing', 'Transparent Pricing')}</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              {t('pillarTransparentPricingDesc', 'Eliminating exploitation in the informal scrap trade by establishing transparent benchmark pricing models based on real secondary metal market rates and acceptable tolerance ranges.')}
            </p>
          </div>

          <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#222222]">{t('pillarCpcbCompliance', 'CPCB Compliance & Verification')}</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              {t('pillarCpcbComplianceDesc', 'Every recycler on Eco-Link undergo strict verification of their CPCB license, processing capacity, and environmental safety protocols to ensure compliance with EPR directives.')}
            </p>
          </div>

          <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#222222]">{t('pillarCertifiedRecycling', 'Certified Recycling & Handover')}</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              {t('pillarCertifiedRecyclingDesc', 'Material lots are formally handed over to authorized recycling facilities with verified weighing, transparent pricing records, and certified environmental compliance.')}
            </p>
          </div>

          <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#222222]">{t('pillarCircularImpact', 'Circular Economy Impact')}</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              {t('pillarCircularImpactDesc', 'Diverting toxic e-waste materials (lead, mercury, cadmium) from landfills while recovering critical secondary raw materials like gold, copper, aluminum, and rare earth metals.')}
            </p>
          </div>

        </div>

        {/* Platform Architecture Overview */}
        <div className="bg-[#EFF8F2] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
          <h2 className="text-xl font-bold text-[#222222]">{t('corePlatformFeaturesTitle', 'Core Platform Features')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-medium text-[#222222]">
            <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
              <span>{t('featMultiRoleAccess', 'Multi-Role Access (Collector, Recycler, Admin)')}</span>
            </div>
            <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
              <span>{t('featRuleBasedWarning', 'Rule-Based Price Warning Engine')}</span>
            </div>
            <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
              <span>{t('featOtpVerification', 'OTP Phone Number Verification')}</span>
            </div>
            <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
              <span>{t('featGeographicMatching', 'Geographic Recycler Matching Engine')}</span>
            </div>
            <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
              <span>{t('featEnvReports', 'Environmental & Material Reports')}</span>
            </div>
            <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
              <span>{t('featBilingualSupport', 'Bilingual Support (English & தமிழ்)')}</span>
            </div>
          </div>
        </div>

        {/* Action CTA */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-lg bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs transition inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{t('registerOnEcoLinkBtn', 'Register on Eco-Link')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
