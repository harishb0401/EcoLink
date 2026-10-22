import React, { useState } from 'react';
import { Search, Package, Filter, ShieldCheck } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { mockWasteLots } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function AdminWasteLots({ materialLots = mockWasteLots }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { t, tCategory, tStatus } = useTranslation();

  const lots = materialLots || mockWasteLots;

  const filtered = lots.filter(lot => {
    const matchesSearch = (lot.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lot.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lot.material || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lot.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 bg-white text-[#222222]">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('regulatedWasteLotsTitle', 'Regulated Waste Lots')}</h1>
        <p className="text-xs sm:text-sm text-[#555555]">
          {t('regulatedWasteLotsSub', 'Live state-wide registry of all declared material lots, benchmark values, and verification statuses.')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#F5FBF7] p-4 sm:p-6 rounded-lg border-2 border-[#D6E8DF] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchLotPlaceholder', 'Search lot ID, material, location...')}
            className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'REGISTERED', 'MATCHED', 'DISPATCHED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap border-2 ${
                statusFilter === st
                  ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                  : 'bg-white text-[#222222] border-[#D6E8DF] hover:border-[#B8D9C8]'
              }`}
            >
              {st === 'ALL' ? t('allLots', 'All Lots') : tStatus(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#EFF8F2] text-[#555555] uppercase text-[10px] font-bold border-b-2 border-[#D6E8DF]">
              <tr>
                <th className="p-4 pl-6">{t('lotIdentifierCol', 'Lot Identifier')}</th>
                <th className="p-4">{t('catAndMaterialCol', 'Category & Material')}</th>
                <th className="p-4">{t('quantityLabel', 'Quantity')}</th>
                <th className="p-4">{t('benchmarkRateCol', 'Benchmark Rate')}</th>
                <th className="p-4">{t('locationHubCol', 'Location Hub')}</th>
                <th className="p-4 pr-6 text-right">{t('lifecycleStatusCol', 'Lifecycle Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#D6E8DF] text-[#222222] font-semibold bg-white">
              {filtered.map((lot) => (
                <tr key={lot.id} className="hover:bg-[#EFF8F2] transition">
                  <td className="p-4 pl-6">
                    <strong className="font-mono text-xs text-[#1F6F5F] block">{lot.id}</strong>
                    <span className="text-[10px] text-[#555555]">{lot.createdDate || 'Recent'}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold block text-[#222222]">{tCategory(lot.category)}</span>
                    <span className="text-[11px] text-[#555555]">{lot.material}</span>
                  </td>
                  <td className="p-4 font-bold text-[#222222]">{lot.quantity || lot.totalWeightKg} {lot.unit || 'kg'}</td>
                  <td className="p-4 text-[#555555]">₹{lot.benchmarkPrice || 350} / kg</td>
                  <td className="p-4 text-[#555555]">{lot.location}</td>
                  <td className="p-4 pr-6 text-right">
                    <StatusBadge status={lot.status} />
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
