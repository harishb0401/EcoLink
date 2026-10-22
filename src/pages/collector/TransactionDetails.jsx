import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, CheckCircle2, Download, ShieldCheck, FileText, Calendar, Building, MapPin } from 'lucide-react';
import { mockTransactions } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function TransactionDetails({ transactions = mockTransactions }) {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const allTx = transactions || mockTransactions;
  const tx = allTx.find(t => t.id === transactionId) || allTx[0];

  if (!tx) {
    return (
      <div className="bg-[#F5FBF7] p-12 rounded-lg border-2 border-[#D6E8DF] text-center space-y-4">
        <h2 className="text-xl font-bold text-[#222222]">{t('transactionsTitle')}</h2>
        <Link to="/collector/transactions" className="text-xs font-bold text-[#1F6F5F] underline">
          {t('backToDashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white text-[#222222]">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/collector/transactions')}
          className="px-4 py-2 text-xs font-bold text-[#222222] bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg hover:border-[#B8D9C8] transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1F6F5F]" />
          <span>{t('backToDashboard')}</span>
        </button>

        <span className="text-xs font-bold text-[#1F6F5F] bg-[#EFF8F2] border-2 border-[#B8D9C8] px-3 py-1 rounded-md flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
          {t('payStatusPAID')}
        </span>
      </div>

      {/* Invoice Card */}
      <div className="bg-[#F5FBF7] p-6 sm:p-10 rounded-lg border-2 border-[#D6E8DF] space-y-8">
        {/* Header */}
        <div className="border-b-2 border-[#D6E8DF] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
              {t('digitalReceipt')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-2">{tx.id}</h1>
            <p className="text-xs text-[#555555]">{t('collectionDate')}: {tx.date || tx.paymentDate || '2026-03-01'}</p>
          </div>

          <button
            onClick={() => alert(`Downloading Invoice PDF for ${tx.id}...`)}
            className="px-4 py-2.5 bg-white hover:border-[#B8D9C8] text-[#1F6F5F] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>{t('digitalReceipt')} PDF</span>
          </button>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-2">
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('collectorLabel')}</span>
            <h4 className="text-sm font-bold text-[#222222]">{tx.collectorName || tx.collector?.fullName || 'Collector'}</h4>
            <p className="text-[#555555]">{t('storageLocationHub')}: {tx.collectorLocation || tx.location || 'Local Collection Hub'}</p>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-2">
            <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('recyclerLabel')}</span>
            <h4 className="text-sm font-bold text-[#222222]">{tx.recyclerName || tx.recycler?.facilityName || 'Authorized Recycler'}</h4>
            <p className="text-[#555555]">{tx.recyclerRegNo ? `CPCB License: ${tx.recyclerRegNo}` : 'CPCB Registered Facility'}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border-2 border-[#D6E8DF] rounded-lg overflow-hidden text-xs">
          <div className="bg-[#EFF8F2] p-3 font-bold text-[#222222] grid grid-cols-12 border-b-2 border-[#D6E8DF]">
            <span className="col-span-6">{t('materialDescription')}</span>
            <span className="col-span-2 text-right">{t('quantityLabel')}</span>
            <span className="col-span-2 text-right">{t('benchmarkPriceLabel')}</span>
            <span className="col-span-2 text-right">{t('totalValue')}</span>
          </div>

          <div className="p-4 grid grid-cols-12 text-[#222222] font-semibold items-center bg-white">
            <div className="col-span-6">
              <span className="font-bold block">{tx.material || 'Motherboards & PCB Assemblies'}</span>
              <span className="text-[10px] text-[#555555]">Lot Reference: {tx.lotId}</span>
            </div>
            <span className="col-span-2 text-right text-[#555555]">{tx.weightKg || 120} kg</span>
            <span className="col-span-2 text-right text-[#555555]">₹{tx.ratePerKg || 380} / kg</span>
            <span className="col-span-2 text-right font-bold text-[#1F6F5F]">₹{(tx.totalValue || 45600).toLocaleString()}</span>
          </div>

          <div className="bg-[#EFF8F2] p-4 border-t-2 border-[#D6E8DF] flex justify-between items-center font-bold text-sm">
            <span className="text-[#222222]">{t('totalValue')}</span>
            <span className="text-xl text-[#1F6F5F]">₹{(tx.totalValue || 45600).toLocaleString()}</span>
          </div>
        </div>

        {/* CPCB Compliance Badge */}
        <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1F6F5F]" />
            <span className="font-bold text-[#1F6F5F]">{t('cpcbVerified')}</span>
          </div>
          <span className="font-mono text-[10px] text-[#555555]">CERT-EPR-2026-9921</span>
        </div>
      </div>
    </div>
  );
}
