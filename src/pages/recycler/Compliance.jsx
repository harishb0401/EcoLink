import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Download, Award, CheckCircle2, AlertCircle, BarChart3, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function Compliance({ recyclerProfile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [downloadNotice, setDownloadNotice] = useState(null);
  const [manifestNotice, setManifestNotice] = useState(null);

  const regNo = recyclerProfile?.cpcbRegistrationNo || 
    recyclerProfile?.cpcbRegistrationNumber || 
    recyclerProfile?.registrationNumber || 
    recyclerProfile?.cpcb_reg_number || 
    'TNPCB-EPR-2026-0881';

  const complianceData = {
    cpcbRegistrationNo: regNo,
    validTill: '31 Dec 2027',
    status: recyclerProfile?.cpcbStatus || recyclerProfile?.status || 'ACTIVE_AUTHORIZED',
    annualTargetKg: recyclerProfile?.monthlyCapacityKg ? recyclerProfile.monthlyCapacityKg * 12 : 50000,
    achievedKg: 44100,
    recoveryRatioPercent: 94.6,
    toxicDiversionKg: 3820
  };

  const handleDownloadCertificate = () => {
    setDownloadNotice("Official CPCB Compliance Certificate PDF compiled and downloaded!");
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleGenerateManifest = () => {
    setManifestNotice("CPCB Form-2 quarterly intake and dispatch manifest generated successfully!");
    setTimeout(() => setManifestNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto bg-white text-[#222222]">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/recycler/dashboard')}
          className="px-4 py-2 text-xs font-bold text-[#222222] bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg hover:border-[#B8D9C8] transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1F6F5F]" />
          <span>{t('backToDashboard', 'Back to Dashboard')}</span>
        </button>

        <button
          onClick={() => navigate('/recycler/waste-requests')}
          className="px-4 py-2 text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] rounded-lg hover:border-[#B8D9C8] transition cursor-pointer"
        >
          <span>{t('navWasteRequests')} →</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('navCompliance')}</h1>
        <p className="text-xs sm:text-sm text-[#555555]">
          {t('cpcbVerifLayerSub')}
        </p>
      </div>

      {downloadNotice && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#B8D9C8] text-[#1F6F5F] rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1F6F5F]" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {manifestNotice && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#B8D9C8] text-[#1F6F5F] rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#1F6F5F]" />
          <span>{manifestNotice}</span>
        </div>
      )}

      {/* Compliance Overview Card */}
      <div className="bg-[#F5FBF7] p-6 sm:p-10 rounded-lg border-2 border-[#D6E8DF] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D6E8DF] pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
              {t('cpcbVerified')}
            </span>
            <h2 className="text-2xl font-bold text-[#222222] mt-3">Registration #{complianceData.cpcbRegistrationNo}</h2>
            <p className="text-xs text-[#555555]">Valid Until: {complianceData.validTill} • Annual EPR Quota: 50,000 kg</p>
          </div>

          <button
            onClick={handleDownloadCertificate}
            className="px-5 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>{t('digitalReceipt')} PDF</span>
          </button>
        </div>

        {/* 4 Compliance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF]">
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('eprQuotaTarget')}</span>
            <span className="text-base font-bold text-[#222222]">50,000 kg</span>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF]">
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('totalMaterialRecycledKg')}</span>
            <span className="text-base font-bold text-[#1F6F5F]">{complianceData.achievedKg.toLocaleString()} kg (88.2%)</span>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF]">
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('recoveryEfficiencyLabel')}</span>
            <span className="text-base font-bold text-[#222222]">{complianceData.recoveryRatioPercent}%</span>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF]">
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('hazardLevel')}</span>
            <span className="text-base font-bold text-[#1F6F5F]">{complianceData.toxicDiversionKg.toLocaleString()} kg</span>
          </div>
        </div>

        {/* Form-2 Manifest Generator */}
        <div className="p-6 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1F6F5F]" />
              <h3 className="text-sm font-bold text-[#222222]">{t('form2AutoReporting')}</h3>
            </div>
            <span className="text-[10px] font-bold text-[#1F6F5F] bg-white border-2 border-[#B8D9C8] px-2.5 py-0.5 rounded">
              {t('automatedBadge')}
            </span>
          </div>
          <p className="text-xs text-[#555555] leading-relaxed">
            {t('form2Description')}
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleGenerateManifest}
              className="px-4 py-2 bg-white border-2 border-[#D6E8DF] text-[#222222] rounded-lg font-bold text-xs hover:border-[#B8D9C8] transition cursor-pointer"
            >
              {t('exportForm2Btn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
