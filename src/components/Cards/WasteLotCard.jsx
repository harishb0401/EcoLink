import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, Scale, Clock, ArrowRight } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { useTranslation } from '../../i18n';

export default function WasteLotCard({ lot, onViewDetails, onOpenOffers }) {
  const { t, tCategory } = useTranslation();
  if (!lot) return null;

  const qty = lot.quantity || lot.totalWeightKg || 1;
  const unit = lot.unit || 'kg';
  const val = lot.agreedTotalValue || lot.estimatedLotValue || (qty * (lot.benchmarkPrice || 350));

  return (
    <div className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition-colors flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded inline-block">
              {tCategory(lot.category)}
            </span>
            <h3 className="text-base font-bold text-[#222222] mt-1.5">{lot.material || lot.category}</h3>
            <span className="text-xs font-mono text-[#555555]">{lot.id}</span>
          </div>
          <StatusBadge status={lot.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-[#555555]">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>{t('quantityLabel')}: <strong className="text-[#222222]">{qty} {unit}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>{t('date')}: <strong className="text-[#222222]">{lot.createdDate || "Recent"}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span className="truncate">{t('nodeLabel')}: <strong className="text-[#222222]">{lot.location || "Chennai SIDCO Hub"}</strong></span>
          </div>
        </div>

        <div className="mt-3 p-2.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center justify-between text-xs font-medium">
          <span className="text-[#555555]">{t('benchmarkPriceLabel')}:</span>
          <span className="text-[#1F6F5F] font-bold">₹{lot.benchmarkPrice || 350}/{unit} (₹{val.toLocaleString()})</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t-2 border-[#D6E8DF]">
        <Link
          to={`/collector/requests/${lot.id}`}
          className="flex-1 py-2 text-center text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] hover:border-[#B8D9C8] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t('viewDetails')}</span>
        </Link>

        {onOpenOffers && (
          <button
            onClick={() => onOpenOffers(lot)}
            className="px-3 py-2 text-xs font-bold text-white bg-[#1F6F5F] hover:bg-[#2FA084] rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <span>{t('statusOFFER_RECEIVED')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
