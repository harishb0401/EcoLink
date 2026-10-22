import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Search, CheckCircle2, Leaf, ShieldCheck, 
  Users, DollarSign, Cpu, FileCheck2, Building2, BookOpen
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { 
  communityImpactStats, initialRecyclers
} from '../../data/mockData';

export default function Home({ onOpenSearchModal }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-0 text-[#222222] bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24 border-b-2 border-[#D6E8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white text-[#1F6F5F] text-xs font-bold tracking-wider uppercase border-2 border-[#D6E8DF]">
                <Leaf className="w-4 h-4 text-[#1F6F5F]" />
                <span>{t('authorizedEcosystemBadge', 'Authorized E-Waste Ecosystem')}</span>
              </div>

              {/* Section 1 Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#222222] tracking-tight leading-[1.15]">
                {t('heroTitleLine1', 'Connect. Recycle.')} <br />
                <span className="text-[#1F6F5F]">{t('heroTitleLine2', 'Earn. Sustain.')}</span>
              </h1>

              {/* Section 1 Description */}
              <p className="text-base sm:text-lg text-[#555555] max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
                {t('heroDescText', 'A digital platform connecting e-waste collectors with authorized recyclers through transparent pricing, waste classification, and recycler matching.')}
              </p>

              {/* Section 1 Buttons: Get Started & How It Works */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-[#1F6F5F] hover:bg-[#2FA084] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('getStarted', 'Get Started')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/how-it-works')}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[#222222] bg-[#F5FBF7] hover:border-[#B8D9C8] border-2 border-[#D6E8DF] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('navHowItWorks', 'How It Works')}</span>
                </button>
              </div>

              {/* Hero Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-[#222222]">
                <div className="flex items-center gap-2 bg-[#F5FBF7] px-3 py-1.5 rounded-lg border-2 border-[#D6E8DF]">
                  <div className="w-5 h-5 rounded bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center text-[10px] font-bold">♻</div>
                  <span>{communityImpactStats.recycledKg} {t('ewasteProcessedBadge', 'e-waste processed')}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F5FBF7] px-3 py-1.5 rounded-lg border-2 border-[#D6E8DF]">
                  <div className="w-5 h-5 rounded bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center text-[10px] font-bold">✓</div>
                  <span>14 {t('verifiedRecyclersBadge', 'Verified Recyclers')}</span>
                </div>
              </div>

            </div>

            {/* Right Hero Branding Image */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full max-w-md bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] flex flex-col items-center justify-center">
                <img
                  src="/ecolink-logo.png"
                  alt="EcoLink - Recycle Today • A Greener Tomorrow"
                  className="w-full max-h-[340px] object-contain"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. KEY FEATURES */}
      <section className="py-16 bg-white border-b-2 border-[#D6E8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded-lg">
              {t('keyFeaturesBadge', 'KEY FEATURES')}
            </span>
            <h2 className="text-3xl font-bold text-[#222222] tracking-tight">
              {t('designedForTransparencyTitle', 'Designed for Complete Transparency')}
            </h2>
            <p className="text-base text-[#555555]">
              {t('standardizingTransactionsSub', 'Standardizing e-waste transactions with fair pricing, verified participants, and certified recycling.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Transparent Pricing */}
            <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-4 hover:border-[#B8D9C8] transition">
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#222222]">{t('transparentPricing', 'Transparent Pricing')}</h3>
              <ul className="space-y-2 text-xs font-medium text-[#555555]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('viewBenchmarkPricesFeat', 'View benchmark prices for all material categories')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('calcFairPriceRangeFeat', 'Calculate fair price range & validate collector offer')}</span>
                </li>
              </ul>
            </div>

            {/* Card 2: E-Waste Classification */}
            <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-4 hover:border-[#B8D9C8] transition">
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#222222]">{t('eWasteClassificationTitle', 'E-Waste Classification')}</h3>
              <ul className="space-y-2 text-xs font-medium text-[#555555]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('identifyCategoryAutoFeat', 'Identify waste category automatically')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('createDigitalLotsFeat', 'Create digital waste lots with unique Lot IDs')}</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Recycler Matching */}
            <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-4 hover:border-[#B8D9C8] transition">
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#222222]">{t('recyclerMatchingTitle', 'Recycler Matching')}</h3>
              <ul className="space-y-2 text-xs font-medium text-[#555555]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('findRecyclersNearbyFeat', 'Find suitable authorized recyclers nearby')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('matchBasedOnCapacityFeat', 'Match based on waste type, capacity & budget')}</span>
                </li>
              </ul>
            </div>

            {/* Card 4: Certified Recycling */}
            <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-4 hover:border-[#B8D9C8] transition">
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#222222]">{t('certifiedRecyclingTitle', 'Certified Recycling')}</h3>
              <ul className="space-y-2 text-xs font-medium text-[#555555]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('trackHandoverFeat', 'Formal handover from collection to authorized recycler')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('transparentLogsFeat', 'Real-time status updates & transparent settlement logs')}</span>
                </li>
              </ul>
            </div>

            {/* Card 5: Verified Participants */}
            <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-4 sm:col-span-2 lg:col-span-2 hover:border-[#B8D9C8] transition">
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#1F6F5F]" />
              </div>
              <h3 className="text-lg font-bold text-[#222222]">{t('verifiedParticipantsTitle', 'Verified Participants')}</h3>
              <ul className="space-y-2 text-xs font-medium text-[#555555]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('otpVerifiedPhoneCollectorsFeat', 'OTP-verified phone numbers for collectors')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('cpcbTnpcbAuthCheckFeat', 'CPCB & TNPCB authorized certification check for recyclers')}</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS STEP BAR */}
      <section className="py-16 bg-white border-b-2 border-[#D6E8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded-lg">
            {t('howItWorksBadge', 'HOW IT WORKS')}
          </span>
          <h2 className="text-3xl font-bold text-[#222222]">
            {t('workflowFlowTitle', 'Register → Verify → Declare → Lot ID → Price → Select → Handover → Settle')}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { step: '01. Register', desc: 'Collector Registration' },
              { step: '02. Verify', desc: 'Profile Verification' },
              { step: '03. Declare', desc: 'E-Waste Registration' },
              { step: '04. Lot ID', desc: 'Lot Identification' },
              { step: '05. Price', desc: 'Price Estimation' },
              { step: '06. Select', desc: 'Recycler Selection' },
              { step: '07. Handover', desc: 'Waste Handover' },
              { step: '08. Settle', desc: 'Payment & Docs' },
            ].map((s, idx) => (
              <div key={idx} className="bg-[#F5FBF7] p-3 rounded-lg border-2 border-[#D6E8DF] space-y-1">
                <span className="text-xs font-bold text-[#1F6F5F] block">{s.step}</span>
                <span className="text-[11px] text-[#555555] font-medium leading-tight block">{s.desc}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/how-it-works')}
            className="px-5 py-2.5 rounded-lg bg-[#F5FBF7] border-2 border-[#D6E8DF] text-[#222222] font-bold text-xs hover:border-[#B8D9C8] transition cursor-pointer inline-flex items-center gap-2"
          >
            <span>{t('viewComplete8StepProcess', 'View Complete 8-Step Visual Process')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4. BOTTOM SECTIONS */}
      <section className="py-16 bg-white border-b-2 border-[#D6E8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Number of Waste Lots Processed */}
          <div className="p-6 rounded-lg bg-[#EFF8F2] border-2 border-[#D6E8DF] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase text-[#1F6F5F] tracking-wider">{t('platformStatsLabel', 'PLATFORM STATISTICS')}</span>
              <h3 className="text-xl font-bold text-[#222222]">{t('digitalWasteLotsProcessedTitle', '5,820 Digital Waste Lots Processed')}</h3>
              <p className="text-xs text-[#555555]">{t('digitalWasteLotsProcessedSub', 'Over 4,932 successful handovers completed across Tamil Nadu industrial corridors.')}</p>
            </div>
            <button
              onClick={() => navigate('/collector/register-waste')}
              className="px-5 py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
            >
              {t('registerNewWasteLotBtn', 'Register New Waste Lot')} →
            </button>
          </div>

          {/* Recycling Partners */}
          <div className="space-y-4 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#555555]">
              {t('authorizedRecyclingPartnersLabel', 'AUTHORIZED RECYCLING PARTNERS')}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {initialRecyclers.map((r) => (
                <div key={r.id} className="px-3.5 py-2 bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg text-xs font-bold text-[#222222] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{r.companyName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA: Start Recycling */}
          <div className="bg-[#1F6F5F] text-white p-8 sm:p-10 rounded-lg text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t('startRecyclingEWasteTodayTitle', 'Start Recycling E-Waste Today')}</h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto font-normal">
              {t('startRecyclingEWasteTodaySub', 'Join collectors and authorized recyclers building a clean, transparent, and circular e-waste economy.')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 rounded-lg bg-white hover:bg-[#EFF8F2] text-[#1F6F5F] font-bold text-sm transition inline-flex items-center gap-2 cursor-pointer border-2 border-transparent"
            >
              <span>{t('startRecycling', 'Start Recycling')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
