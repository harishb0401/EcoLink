import React, { useState } from 'react';
import { Search, Users, Phone, MapPin, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { mockCollectors } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function Collectors({ collectors = mockCollectors }) {
  const { t } = useTranslation();
  const [collectorList, setCollectorList] = useState(collectors || mockCollectors);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = collectorList.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVerification = (id) => {
    setCollectorList(collectorList.map(c => 
      c.id === id ? { ...c, phone_verified: !c.phone_verified } : c
    ));
  };

  return (
    <div className="space-y-6 bg-white text-[#222222]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('adminCollectorsTitle')}</h1>
        <p className="text-xs sm:text-sm text-[#555555]">
          {t('auditRegisteredCollectors')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F5FBF7] p-4 sm:p-6 rounded-lg border-2 border-[#D6E8DF]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
          />
        </div>
      </div>

      {/* Collectors Table */}
      <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#EFF8F2] text-[#555555] uppercase text-[10px] font-bold border-b-2 border-[#D6E8DF]">
              <tr>
                <th className="p-4 pl-6">{t('collectorLabel')}</th>
                <th className="p-4">{t('phoneNumberLabel')}</th>
                <th className="p-4">{t('storageLocationHub')}</th>
                <th className="p-4">{t('totalWeight')}</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4 pr-6 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#D6E8DF] text-[#222222] font-semibold">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#EFF8F2] transition">
                  <td className="p-4 pl-6">
                    <span className="font-mono text-[10px] text-[#555555] block">{c.id}</span>
                    <strong className="font-bold text-sm text-[#222222]">{c.name}</strong>
                    <span className="text-[11px] text-[#555555] block">{c.company}</span>
                  </td>
                  <td className="p-4 text-[#555555]">{c.phone}</td>
                  <td className="p-4 text-[#555555]">{c.location}</td>
                  <td className="p-4 text-[#222222]">{c.totalVolumeKg || 450} kg</td>
                  <td className="p-4">
                    {c.phone_verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1F6F5F] bg-[#EFF8F2] border-2 border-[#B8D9C8] px-2.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" />
                        {t('phoneVerifiedBadge')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#555555] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3 text-[#555555]" />
                        {t('phoneUnverifiedBadge')}
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => toggleVerification(c.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer border-2 ${
                        c.phone_verified
                          ? 'bg-white text-[#222222] hover:border-[#B8D9C8] border-[#D6E8DF]'
                          : 'bg-[#1F6F5F] text-white hover:bg-[#2FA084] border-[#1F6F5F]'
                      }`}
                    >
                      {c.phone_verified ? t('revokeOtpBtn') : t('verifyNow')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
