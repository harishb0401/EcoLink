import React, { useState } from 'react';
import { 
  X, CheckCircle2, XCircle, ShieldCheck, DollarSign, 
  Clock, MapPin, Calendar, ArrowRight, AlertTriangle, Scale, Award
} from 'lucide-react';
import { useTranslation, useLanguage } from '../../i18n';

export default function CompareOffersModal({ 
  isOpen, 
  onClose, 
  lot, 
  offers = [], 
  onAcceptOffer, 
  onRejectOffer 
}) {
  const { t } = useTranslation();
  const { tCategory, tStatus } = useLanguage();
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  if (!isOpen || !lot) return null;

  const lotOffers = offers.filter(o => o.lotId === lot.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
      <div className="bg-[#F5FBF7] rounded-lg max-w-3xl w-full p-6 sm:p-8 border-2 border-[#D6E8DF] space-y-6 my-auto text-[#222222] max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                {t('offerComparisonBadge', 'OFFER COMPARISON & SETTLEMENT')}
              </span>
              <h3 className="text-xl font-bold text-[#222222] mt-1">
                {t("compareOffersTitle")}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded text-[#555555] hover:text-[#222222] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lot Overview Strip */}
        <div className="bg-[#EFF8F2] p-4 rounded-lg border-2 border-[#D6E8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-[#555555]">{lot.id}</span>
            <h4 className="text-base font-bold text-[#222222]">{tCategory(lot.category)} - {lot.material}</h4>
            <span className="text-xs text-[#555555]">{lot.quantity} {lot.unit || 'kg'} · {lot.location}</span>
          </div>

          <div className="bg-[#F5FBF7] px-4 py-2 rounded-lg border-2 border-[#D6E8DF] text-center shrink-0">
            <span className="text-[10px] text-[#555555] font-bold block">{t("fairPriceRangeLabel")}</span>
            <span className="text-sm font-bold text-[#1F6F5F]">₹{lot.lowerLimit}–₹{lot.upperLimit}/kg</span>
          </div>
        </div>

        {/* Offers List / Comparison Cards */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
            {t("offersReceived")} ({lotOffers.length})
          </h4>

          {lotOffers.length === 0 ? (
            <div className="p-8 bg-white rounded-lg border-2 border-[#D6E8DF] text-center text-[#555555] text-xs font-bold">
              {t('noRecyclerOffersYet', 'No recycler offers received yet for this lot. Recyclers in proximity have been notified.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lotOffers.map((offer) => {
                const isAccepted = offer.status === 'ACCEPTED';
                const isRejected = offer.status === 'REJECTED';
                const isBelowFair = offer.fairPriceStatus === 'BELOW_FAIR_RANGE';

                return (
                  <div
                    key={offer.id}
                    className={`rounded-lg p-5 border-2 transition space-y-4 flex flex-col justify-between ${
                      isAccepted
                        ? 'bg-[#EFF8F2] border-[#B8D9C8]'
                        : isRejected
                        ? 'bg-white border-[#D6E8DF] opacity-60'
                        : 'bg-white border-[#D6E8DF] hover:border-[#B8D9C8]'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Recycler Header & Verification */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-sm text-[#222222]">{offer.recyclerName}</h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-[#1F6F5F] bg-white border-2 border-[#B8D9C8] px-2 py-0.5 rounded flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[#1F6F5F]" />
                              {t("verifiedRecyclerBadge")}
                            </span>
                            <span className="text-[10px] text-[#555555] font-semibold">{offer.distanceKm} km {t('away', 'away')}</span>
                          </div>
                        </div>

                        {/* Fair Price Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border-2 bg-white ${
                          isBelowFair 
                            ? 'text-[#555555] border-[#D6E8DF]' 
                            : 'text-[#1F6F5F] border-[#B8D9C8]'
                        }`}>
                          {offer.fairPriceBadge || 'FAIR ✓'}
                        </span>
                      </div>

                      {/* Offer Rates & Totals */}
                      <div className="grid grid-cols-2 gap-2 bg-[#EFF8F2] p-3 rounded-lg border-2 border-[#D6E8DF] text-center">
                        <div>
                          <span className="text-[10px] text-[#555555] font-bold block">{t("agreedPrice")}</span>
                          <span className="text-base font-bold text-[#222222]">₹{offer.pricePerUnit}/kg</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#555555] font-bold block">{t("totalValue")}</span>
                          <span className="text-base font-bold text-[#1F6F5F]">₹{offer.totalPrice?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Pickup Date & Notes */}
                      <div className="text-xs text-[#555555] space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[#222222]">
                          <Calendar className="w-3.5 h-3.5 text-[#1F6F5F]" />
                          <span>{t('proposedPickup', 'Proposed Pickup')}: <strong>{offer.proposedPickupDate || 'Within 2 days'}</strong></span>
                        </div>
                        <p className="text-[11px] text-[#555555] line-clamp-2 italic">
                          "{offer.notes}"
                        </p>
                      </div>

                    </div>

                    {/* Offer Actions */}
                    <div className="pt-3 border-t-2 border-[#D6E8DF] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#555555] font-mono">
                        {offer.id} · {offer.timestamp}
                      </span>

                      {isAccepted ? (
                        <span className="px-3 py-1 bg-white border-2 border-[#B8D9C8] text-[#1F6F5F] text-xs font-bold rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("offerStatusACCEPTED")}
                        </span>
                      ) : isRejected ? (
                        <span className="px-3 py-1 bg-white border-2 border-[#D6E8DF] text-[#555555] text-xs font-bold rounded">
                          {t("offerStatusREJECTED")}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onRejectOffer && onRejectOffer(offer.id)}
                            className="px-3 py-1.5 text-xs font-bold text-[#555555] bg-[#F5FBF7] hover:border-[#B8D9C8] border-2 border-[#D6E8DF] rounded-lg transition cursor-pointer"
                          >
                            {t("rejectOffer")}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onAcceptOffer) onAcceptOffer(offer, lot);
                              onClose();
                            }}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-[#1F6F5F] hover:bg-[#2FA084] rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t("acceptOffer")}</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="pt-2 flex justify-end border-t-2 border-[#D6E8DF]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-[#222222] bg-[#F5FBF7] hover:border-[#B8D9C8] border-2 border-[#D6E8DF] rounded-lg transition cursor-pointer"
          >
            {t("close")}
          </button>
        </div>

      </div>
    </div>
  );
}
