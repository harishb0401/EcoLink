import React, { useState } from 'react';
import { Search, ShieldCheck, Building, CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';
import { mockRecyclers } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function Recyclers({ recyclers = mockRecyclers }) {
  const { t, tCategory } = useTranslation();
  const [recyclerList, setRecyclerList] = useState(recyclers || mockRecyclers);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = recyclerList.filter(r =>
    (r.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.cpcbRegistrationNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStatus = (id, newStatus) => {
    setRecyclerList(recyclerList.map(r => 
      r.id === id ? { ...r, verificationStatus: newStatus } : r
    ));
  };

  return (
    <div className="space-y-6 bg-white text-[#222222]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('adminRecyclersTitle')}</h1>
        <p className="text-xs sm:text-sm text-[#555555]">
          {t('verifyCpcbLicenses')}
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

      {/* Recyclers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((r) => {
          const isVerified = r.verificationStatus === 'VERIFIED';

          return (
            <div
              key={r.id}
              className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#222222]">{r.companyName}</h3>
                    <p className="text-xs text-[#555555] mt-0.5">{r.location}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1 border-2 ${
                    isVerified ? 'text-[#1F6F5F] bg-[#EFF8F2] border-[#B8D9C8]' : 'text-[#555555] bg-white border-[#D6E8DF]'
                  }`}>
                    {isVerified ? <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" /> : <AlertTriangle className="w-3 h-3 text-[#555555]" />}
                    {isVerified ? t('recStatusVERIFIED') : t('recStatusPENDING')}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-[#555555]">
                  <p><strong className="text-[#222222]">{t('cpcbRegNoLabel')}:</strong> <span className="font-mono text-[11px] text-[#222222]">{r.cpcbRegistrationNo}</span></p>
                  <p><strong className="text-[#222222]">{t('contactPersonLabel')}:</strong> {r.contactPerson} ({r.phone})</p>
                  <p><strong className="text-[#222222]">{t('monthlyCapacityLabel')}:</strong> {(r.capacityMonthlyKg || 50000).toLocaleString()} kg / mo</p>
                  <div>
                    <strong className="block mb-1 text-[#222222]">{t('acceptedCategoriesLabel')}:</strong>
                    <div className="flex flex-wrap gap-1">
                      {(r.acceptedCategories || []).map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border-2 border-[#D6E8DF] rounded text-[10px] font-bold text-[#1F6F5F]">
                          {tCategory(cat)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t-2 border-[#D6E8DF] flex items-center justify-end gap-2">
                {isVerified ? (
                  <button
                    onClick={() => updateStatus(r.id, 'SUSPENDED')}
                    className="px-3 py-1.5 bg-white hover:border-[#B8D9C8] text-[#222222] font-bold text-xs rounded-lg border-2 border-[#D6E8DF] transition cursor-pointer"
                  >
                    {t('suspendAccountBtn')}
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(r.id, 'VERIFIED')}
                    className="px-4 py-1.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    {t('approveVerificationBtn')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
