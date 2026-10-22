import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, Upload, Leaf } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { referenceScrapPrices, tamilNaduLocations } from '../../data/scrapPrices';
import { classifyEWaste } from '../../utils/rulesEngine';

export default function DisposeEWasteModal({ isOpen, onClose, onDisposalCreated }) {
  const { t } = useTranslation();

  const [deviceTitle, setDeviceTitle] = useState('');
  const [selectedScrap, setSelectedScrap] = useState(referenceScrapPrices[0].material);
  const [approxWeightKg, setApproxWeightKg] = useState(3);
  const [pickupAddress, setPickupAddress] = useState('14/2 Gandhi Road, Anna Nagar');
  const [locationCity, setLocationCity] = useState(tamilNaduLocations[0]);
  const [contactPhone, setContactPhone] = useState('+91 98400 11223');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const scrapObj = referenceScrapPrices.find(s => s.material === selectedScrap) || referenceScrapPrices[0];
  const estimatedValue = Math.round((parseFloat(approxWeightKg) || 0) * scrapObj.referencePrice);
  const pointsAwarded = Math.round((parseFloat(approxWeightKg) || 0) * 30);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDisposal = {
      id: `DISP-${Date.now().toString().slice(-6)}`,
      date: "Just now",
      deviceType: deviceTitle || selectedScrap,
      weightKg: parseFloat(approxWeightKg),
      pointsAwarded,
      estimatedValue,
      collectorAssigned: "Apex Scrap Collection (Assigned)",
      lotId: `LOT-EL26-TN-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "In Material Lot",
      co2SavedKg: +(approxWeightKg * 1.5).toFixed(1)
    };

    if (onDisposalCreated) {
      onDisposalCreated(newDisposal);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
      <div className="bg-[#F5FBF7] rounded-lg max-w-lg w-full p-6 sm:p-8 border-2 border-[#D6E8DF] space-y-5 my-auto text-[#222222]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#D6E8DF]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              ♻
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                {t("generatorDisposal")}
              </span>
              <h3 className="text-xl font-bold text-[#222222] mt-1">
                {t("disposeEWaste")}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded text-[#555555] hover:text-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EFF8F2] border-2 border-[#B8D9C8] text-[#1F6F5F] flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <h4 className="text-xl font-bold text-[#222222]">{t("disposalRequestLogged")}</h4>
            <p className="text-xs text-[#555555] max-w-xs mx-auto">
              {t("disposalRequestLoggedDesc")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("eWasteItemDescription")}
              </label>
              <input
                type="text"
                required
                placeholder={t("eWasteItemPlaceholder")}
                value={deviceTitle}
                onChange={(e) => setDeviceTitle(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t("primaryCategory")}
                </label>
                <select
                  value={selectedScrap}
                  onChange={(e) => setSelectedScrap(e.target.value)}
                  className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
                >
                  {referenceScrapPrices.map(s => (
                    <option key={s.id} value={s.material}>{s.icon} {s.material}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t("approxWeightKg")}
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={approxWeightKg}
                  onChange={(e) => setApproxWeightKg(e.target.value)}
                  className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
                />
              </div>
            </div>

            {/* Estimated Value Preview */}
            <div className="bg-[#EFF8F2] p-3 rounded-lg border-2 border-[#D6E8DF] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#555555] font-bold block">{t("estimatedScrapValue")}</span>
                <span className="text-sm font-bold text-[#1F6F5F]">₹{estimatedValue} (@ ₹{scrapObj.referencePrice}/kg)</span>
              </div>
              <div className="text-right">
                <span className="text-[#555555] font-bold block">{t("rewardPoints")}</span>
                <span className="text-sm font-bold text-[#1F6F5F]">+{pointsAwarded} pts 🌟</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t("locationCity")}
                </label>
                <select
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
                >
                  {tamilNaduLocations.map((l, i) => (
                    <option key={i} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t("contactMobile")}
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("pickupAddress")}
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full text-xs bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-[#D6E8DF]">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-bold bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg text-[#555555] hover:border-[#B8D9C8]"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 text-xs font-bold bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg transition flex items-center gap-1.5"
              >
                <span>{t("requestDisposal")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
