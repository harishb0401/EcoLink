import React, { useState } from 'react';
import { Search, DollarSign, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { mockTransactions } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function AdminTransactions({ transactions = mockTransactions }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const txList = transactions || mockTransactions;

  const filtered = txList.filter(tx =>
    (tx.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.lotId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.collectorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.recyclerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSettled = txList.reduce((sum, tx) => sum + (tx.totalValue || 0), 0);

  return (
    <div className="space-y-6 bg-white text-[#222222]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('adminTransactionsTitle', 'Platform Transactions Ledger')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('transactionsSubtitle', 'State-wide escrow settlements, direct UPI disbursements, and GST compliance logs.')}
          </p>
        </div>

        <div className="p-4 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('cumulativePayoutsLabel', 'Cumulative Platform Payouts')}</span>
            <span className="text-xl font-bold text-[#1F6F5F]">₹{totalSettled.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F5FBF7] p-4 sm:p-6 rounded-lg border-2 border-[#D6E8DF]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchTransactionsPlaceholder', 'Search invoice ID, lot ID, party...')}
            className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#EFF8F2] text-[#555555] uppercase text-[10px] font-bold border-b-2 border-[#D6E8DF]">
              <tr>
                <th className="p-4 pl-6">{t('invoiceNumCol', 'Invoice #')}</th>
                <th className="p-4">{t('lotReferenceCol', 'Lot Reference')}</th>
                <th className="p-4">{t('collectorBeneficiaryCol', 'Collector (Beneficiary)')}</th>
                <th className="p-4">{t('recyclerPayerCol', 'Recycler (Payer)')}</th>
                <th className="p-4">{t('weightAndRateCol', 'Weight & Rate')}</th>
                <th className="p-4">{t('totalAmountCol', 'Total Amount')}</th>
                <th className="p-4 pr-6 text-right">{t('escrowStatusCol', 'Escrow Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#D6E8DF] text-[#222222] font-semibold">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#EFF8F2] transition">
                  <td className="p-4 pl-6">
                    <strong className="font-mono text-xs text-[#1F6F5F] block">{tx.id}</strong>
                    <span className="text-[10px] text-[#555555]">{tx.date || tx.paymentDate || '2026-03-01'}</span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-[#555555]">{tx.lotId}</td>
                  <td className="p-4 font-bold text-[#222222]">{tx.collectorName}</td>
                  <td className="p-4 text-[#555555]">{tx.recyclerName}</td>
                  <td className="p-4 text-[#555555]">{tx.weightKg || 120} kg @ ₹{tx.ratePerKg || 380}/kg</td>
                  <td className="p-4 font-bold text-[#1F6F5F] text-sm">₹{(tx.totalValue || 45600).toLocaleString()}</td>
                  <td className="p-4 pr-6 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1F6F5F] bg-[#EFF8F2] border-2 border-[#B8D9C8] px-2.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" />
                      {tx.status || 'SETTLED'}
                    </span>
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
