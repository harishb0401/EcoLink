import React, { useState } from 'react';
import { X, DollarSign, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight, Calendar, Calculator, MapPin, Scale } from 'lucide-react';
import { evaluateOfferFairPrice } from '../../utils/rulesEngine';
import { useTranslation, useLanguage } from '../../i18n';

export default function SubmitOfferModal({ 
  isOpen, 
  onClose, 
  lot, 
  currentRecycler,
  onSubmitOffer 
}) {
  const { t } = useTranslation();
  const { tCategory, tCondition } = useLanguage();

  const [pricePerUnit, setPricePerUnit] = useState(() => lot ? lot.benchmarkPrice : 650);
  const [proposedPickupDate, setProposedPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState("Direct intake at licensed facility with certified weight bridge.");

  if (!isOpen || !lot) return null;

  const numericPrice = parseFloat(pricePerUnit) || 0;
  const quantity = parseFloat(lot.quantity) || 1;
  const totalOfferedPrice = Math.round(numericPrice * quantity);

  // Evaluate against fair price limits
  const evaluation = evaluateOfferFairPrice(numericPrice, lot.benchmarkPrice, lot.tolerance || 0.25);

  const handleSubmit = (e) => {
    e.preventDefault();

    const recyclerFacilityName = currentRecycler?.facilityName || 
      currentRecycler?.companyName || 
      currentRecycler?.organizationName || 
      currentRecycler?.fullName || 
      currentRecycler?.name || 
      "Authorized Recycler";

    const newOffer = {
      id: `OFF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      lotId: lot.id,
      recyclerId: currentRecycler?.id || currentRecycler?._id || "",
      recyclerName: recyclerFacilityName,
      recyclerVerified: true,
      pricePerUnit: numericPrice,
      totalPrice: totalOfferedPrice,
      fairPriceStatus: evaluation.status,
      fairPriceBadge: evaluation.label,
      status: evaluation.isFlagged ? "FLAGGED" : "PENDING",
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                 new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      proposedPickupDate,
      location: currentRecycler?.location || currentRecycler?.address || "",
      distanceKm: 8.5,
      notes
    };

    if (onSubmitOffer) {
      onSubmitOffer(newOffer);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
      <div className="bg-[#F5FBF7] rounded-lg max-w-xl w-full p-6 sm:p-8 border-2 border-[#D6E8DF] space-y-6 my-auto text-[#222222]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                {t("recyclerBiddingWorkflow")}
              </span>
              <h3 className="text-xl font-bold text-[#222222] mt-1">
                {t("submitOffer")}
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

        {/* Lot Details Summary Card */}
        <div className="bg-[#EFF8F2] p-4 rounded-lg border-2 border-[#D6E8DF] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#555555]">{lot.id}</span>
              <h4 className="text-sm font-bold text-[#222222]">{tCategory(lot.category)} - {lot.material}</h4>
            </div>
            <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-1 rounded">
              {lot.quantity} {lot.unit || 'kg'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF] text-center text-xs">
            <div>
              <span className="text-[10px] text-[#555555] block font-bold">{t("conditionLabel")}</span>
              <span className="font-bold text-[#222222]">{tCondition(lot.condition)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#555555] block font-bold">{t("benchmarkPriceLabel")}</span>
              <span className="font-bold text-[#222222]">₹{lot.benchmarkPrice}/kg</span>
            </div>
            <div>
              <span className="text-[10px] text-[#555555] block font-bold">{t("fairPriceRangeLabel")}</span>
              <span className="font-bold text-[#1F6F5F]">₹{lot.lowerLimit}–₹{lot.upperLimit}/kg</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Price per unit & calculated total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("offerPricePerUnit")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-[#555555]">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg focus:outline-none focus:border-[#B8D9C8]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("totalOfferedPrice")} ({lot.quantity} {lot.unit})
              </label>
              <div className="px-3.5 py-2 bg-[#EFF8F2] border-2 border-[#D6E8DF] rounded-lg text-sm font-bold text-[#1F6F5F] flex items-center justify-between">
                <span>₹{totalOfferedPrice.toLocaleString()}</span>
                <span className="text-[10px] text-[#555555]">({lot.quantity} × ₹{numericPrice})</span>
              </div>
            </div>
          </div>

          {/* Live Fair Price Comparison Result */}
          <div className={`p-3.5 rounded-lg border-2 bg-white flex items-center justify-between gap-3 text-xs font-bold ${
            evaluation.isFlagged ? 'border-[#D6E8DF] text-[#555555]' : 'border-[#B8D9C8] text-[#1F6F5F]'
          }`}>
            <div className="flex items-center gap-2">
              {evaluation.isFlagged ? (
                <AlertTriangle className="w-4 h-4 text-[#555555] shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
              )}
              <span>{evaluation.message}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white border-2 border-current text-[11px] font-bold shrink-0">
              {evaluation.label}
            </span>
          </div>

          {/* Proposed Pickup Date & Notes */}
          <div>
            <label className="block text-xs font-bold text-[#222222] mb-1">
              {t("proposedPickupDate")}
            </label>
            <input
              type="date"
              value={proposedPickupDate}
              onChange={(e) => setProposedPickupDate(e.target.value)}
              className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#B8D9C8]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222222] mb-1">
              {t("offerNotes")}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("offerNotesPlaceholder")}
              className="w-full text-xs bg-white border-2 border-[#D6E8DF] rounded-lg p-3 focus:outline-none focus:border-[#B8D9C8]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t-2 border-[#D6E8DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-[#555555] bg-[#F5FBF7] hover:border-[#B8D9C8] border-2 border-[#D6E8DF] rounded-lg transition cursor-pointer"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#1F6F5F] hover:bg-[#2FA084] rounded-lg transition flex items-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>{t("submitOffer")}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
