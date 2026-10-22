import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, ShieldCheck, PackagePlus, Cpu, Calculator, Users, 
  Truck, FileCheck2, ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react';

import { useTranslation } from '../../i18n';

export default function HowItWorks() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      badge: "01",
      title: "Collector Registration",
      subtitle: "Account Setup",
      icon: <UserPlus className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Create an account and enter collector details.",
      details: [
        "Select Collector account type",
        "Enter full name, email, phone number, and password",
        "Set up local collector workspace profile"
      ]
    },
    {
      step: 2,
      badge: "02",
      title: "Profile Verification",
      subtitle: "Identity Validation",
      icon: <ShieldCheck className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Verify submitted information using the methods actually available.",
      details: [
        "Verify phone number using SMS confirmation code",
        "Confirm profile details and contact information",
        "Establish verified collector credentials on the platform"
      ]
    },
    {
      step: 3,
      badge: "03",
      title: "E-Waste Registration",
      subtitle: "Item Declaration",
      icon: <PackagePlus className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Enter waste details, quantity, weight, condition, and photos.",
      details: [
        "Input waste item title and category specification",
        "Specify unit count and estimated total weight (kg)",
        "Document working condition and upload lot images"
      ]
    },
    {
      step: 4,
      badge: "04",
      title: "Waste Lot Identification",
      subtitle: "Lot ID Generation",
      icon: <Cpu className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Save the selected waste category and generate a unique lot ID.",
      details: [
        "Assign standardized e-waste category classification",
        "Generate unique digital tracking ID (e.g. LOT-00125)",
        "Store lot record with offline-first local synchronization"
      ]
    },
    {
      step: 5,
      badge: "05",
      title: "Price Estimation",
      subtitle: "Pricing Rules",
      icon: <Calculator className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Calculate an indicative value using the configured pricing rules.",
      details: [
        "Query benchmark reference rates for the material",
        "Apply configured tolerance thresholds (e.g. ±15% to ±25%)",
        "Display indicative fair price valuation and flag unfair bids"
      ]
    },
    {
      step: 6,
      badge: "06",
      title: "Recycler Selection",
      subtitle: "Offer Review",
      icon: <Users className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Browse suitable recyclers and review their offers.",
      details: [
        "Discover certified recyclers accepting the material category",
        "Compare incoming purchase bids and payment quotations",
        "Select and accept the preferred recycler offer"
      ]
    },
    {
      step: 7,
      badge: "07",
      title: "Waste Handover",
      subtitle: "Physical Collection",
      icon: <Truck className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Coordinate collection and record the handover status.",
      details: [
        "Coordinate pickup schedule, logistics, and location",
        "Verify material weight and condition upon collection",
        "Record and confirm physical handover completion"
      ]
    },
    {
      step: 8,
      badge: "08",
      title: "Payment & Documentation",
      subtitle: "Settlement & Records",
      icon: <FileCheck2 className="w-5 h-5 text-[#1F6F5F]" />,
      summary: "Record settlement details and retain available transaction documents.",
      details: [
        "Record settlement payment details and payout verification",
        "Generate digital transaction manifest and receipt",
        "Retain verifiable compliance and historical audit records"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12 text-[#222222]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-[#1F6F5F] text-xs font-bold uppercase tracking-wider border-2 border-[#D6E8DF]">
            <Sparkles className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>{t('endToEndWorkflowBadge', 'End-to-End Workflow')}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
            {t('howEcoLinkWorksTitle', 'How Eco-Link Works')}
          </h1>
          <p className="text-base text-[#555555] font-normal leading-relaxed">
            {t('howItWorksSubtitle', 'From informal collection to certified industrial recycling — follow the complete 8-step journey built on transparent pricing and certified compliance.')}
          </p>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-[#F5FBF7] p-2 rounded-lg border-2 border-[#D6E8DF] overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-1.5">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer border-2 ${
                  activeStep === s.step
                    ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                    : 'bg-white text-[#555555] border-[#D6E8DF] hover:border-[#B8D9C8] hover:text-[#222222]'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">{s.badge}</span>
                <span className="text-[11px] truncate max-w-[110px] text-center font-medium leading-tight">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Step Spotlight Card */}
        {(() => {
          const stepData = steps.find(s => s.step === activeStep) || steps[0];
          return (
            <div className="bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D6E8DF] pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border-2 border-[#D6E8DF] flex items-center justify-center">
                    {stepData.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#1F6F5F]">
                      {stepData.badge} • {stepData.subtitle}
                    </span>
                    <h2 className="text-2xl font-bold text-[#222222]">{stepData.title}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border-2 border-[#D6E8DF] bg-[#F5FBF7] text-[#555555] hover:border-[#B8D9C8] hover:text-[#222222] disabled:opacity-40 transition cursor-pointer"
                  >
                    ← {t('previous', 'Previous')}
                  </button>
                  <button
                    disabled={activeStep === steps.length}
                    onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1F6F5F] text-white disabled:opacity-40 hover:bg-[#2FA084] transition cursor-pointer"
                  >
                    {t('next', 'Next')} →
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-[#555555] leading-relaxed">
                  {stepData.summary}
                </p>

                <div className="p-5 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] space-y-3">
                  <h4 className="text-xs font-bold uppercase text-[#1F6F5F] tracking-wider">
                    {t('keyActionsValidationRules', 'Key Actions & Validation Rules:')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {stepData.details.map((d, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border-2 border-[#D6E8DF] flex items-start gap-2 text-xs font-medium text-[#222222]">
                        <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        {/* Bottom CTA Banner */}
        <div className="bg-[#1F6F5F] text-white p-8 sm:p-10 rounded-lg text-center space-y-4">
          <h2 className="text-2xl font-bold">{t('readyToStartRecycling', 'Ready to Start Recycling E-Waste?')}</h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto font-normal">
            {t('joinNetworkBannerSub', "Join Tamil Nadu's authorized e-waste network today. Register as a Collector or an Authorized Recycler.")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 rounded-lg bg-white hover:bg-white text-[#1F6F5F] font-bold text-xs transition flex items-center gap-2 cursor-pointer border border-transparent"
            >
              <span>{t('getStartedNow', 'Get Started Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
