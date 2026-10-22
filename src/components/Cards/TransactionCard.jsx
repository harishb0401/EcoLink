import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function TransactionCard({ tx, detailUrl }) {
  const { t } = useTranslation();
  if (!tx) return null;

  const url = detailUrl || `/collector/transactions/${tx.id}`;

  return (
    <div className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition-colors flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded inline-block">
              {t('eprCompliant')}
            </span>
            <h3 className="text-base font-bold text-[#222222] mt-1.5 font-mono">{tx.id}</h3>
            <p className="text-xs text-[#555555]">{t('lotLabel')}: <strong className="text-[#222222]">{tx.lotId}</strong></p>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" /> {t('payStatusPAID')}
          </span>
        </div>

        <div className="space-y-2 mt-4 text-xs text-[#555555]">
          <div className="flex justify-between">
            <span>{t('collectorLabel')}:</span>
            <strong className="text-[#222222]">{tx.collectorName}</strong>
          </div>
          <div className="flex justify-between">
            <span>{t('recyclerLabel')}:</span>
            <strong className="text-[#222222]">{tx.recyclerName}</strong>
          </div>
          <div className="flex justify-between">
            <span>{t('quantityLabel')}:</span>
            <strong className="text-[#222222]">{tx.quantity} {tx.unit || 'kg'}</strong>
          </div>
          <div className="flex justify-between p-2.5 bg-white rounded-lg border-2 border-[#D6E8DF]">
            <span className="text-[#222222]">{t('totalValue')}:</span>
            <span className="text-[#1F6F5F] font-bold text-sm">₹{tx.totalValue?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t-2 border-[#D6E8DF]">
        <Link
          to={url}
          className="w-full py-2 text-center text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] hover:border-[#B8D9C8] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t('digitalReceipt')}</span>
        </Link>
      </div>
    </div>
  );
}
