import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import TransactionCard from '../../components/Cards/TransactionCard';
import { mockTransactions } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function Transactions({ transactions = mockTransactions }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const txList = transactions || mockTransactions;

  const filteredTx = txList.filter(tx => 
    (tx.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.lotId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.recyclerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSettled = txList.reduce((sum, tx) => sum + (tx.totalValue || 0), 0);

  return (
    <div className="space-y-6 bg-white text-[#222222]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('transactionsTitle')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('transactionsSubtitle')}
          </p>
        </div>

        <div className="p-4 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] flex items-center justify-center text-[#1F6F5F]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('totalEarnings')}</span>
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
            placeholder={t('search')}
            className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTx.map((tx) => (
          <TransactionCard
            key={tx.id}
            transaction={tx}
            onViewDetails={() => navigate(`/collector/transactions/${tx.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
