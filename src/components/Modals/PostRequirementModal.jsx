import React, { useState } from 'react';
import { X, Plus, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation, useLanguage } from '../../i18n';
import { ewasteCategoriesList, tamilNaduLocations } from '../../data/scrapPrices';

export default function PostRequirementModal({ 
  isOpen, 
  onClose, 
  onAddRequirement,
  recyclerProfile
}) {
  const { t } = useTranslation();
  const { tCategory } = useLanguage();

  const [category, setCategory] = useState(ewasteCategoriesList[0]);
  const [requiredQuantityKg, setRequiredQuantityKg] = useState(50);
  const [preferredCondition, setPreferredCondition] = useState('Mixed Condition');
  const [targetPricePerKg, setTargetPricePerKg] = useState(300);
  const [location, setLocation] = useState(tamilNaduLocations[0]);
  const [expiresInDays, setExpiresInDays] = useState(4);
  const [notes, setNotes] = useState('Requires complete computer motherboards & telecom components for material extraction.');

  if (!isOpen) return null;

  const recyclerName = recyclerProfile?.facilityName || 
    recyclerProfile?.organizationName || 
    recyclerProfile?.companyName || 
    recyclerProfile?.fullName || 
    recyclerProfile?.name || 
    'Authorized Recycler';

  const cpcbRegNo = recyclerProfile?.cpcbRegistrationNo || 
    recyclerProfile?.cpcbRegistrationNumber || 
    recyclerProfile?.registrationNumber || 
    recyclerProfile?.cpcb_reg_number || 
    'CPCB Verified';

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      recyclerId: recyclerProfile?.id || recyclerProfile?._id || "",
      recyclerName: recyclerName,
      cpcbRegistrationNo: cpcbRegNo,
      isCpcbVerified: true,
      isPlatformVerified: true,
      category,
      requiredQuantityKg: parseFloat(requiredQuantityKg),
      currentReceivedKg: 0,
      preferredCondition,
      targetPricePerKg: parseFloat(targetPricePerKg),
      referenceMin: Math.round(targetPricePerKg * 0.9),
      referenceMax: Math.round(targetPricePerKg * 1.1),
      location,
      postedDate: "Today",
      expiresInDays: parseInt(expiresInDays),
      status: "Active",
      notes
    };

    onAddRequirement(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
      <div className="bg-[#F5FBF7] rounded-lg max-w-xl w-full p-6 sm:p-8 border-2 border-[#D6E8DF] space-y-6 my-auto text-[#222222]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                {t("intakeDemand")}
              </span>
              <h3 className="text-xl font-bold text-[#222222] mt-1">
                {t("postRequirement")}
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

        {/* CPCB Verified Notice */}
        <div className="bg-[#EFF8F2] rounded-lg p-3.5 border-2 border-[#B8D9C8] flex items-center gap-2.5 text-xs text-[#1F6F5F]">
          <ShieldCheck className="w-5 h-5 text-[#1F6F5F] shrink-0" />
          <span>{t("postingAs", { name: recyclerName, reg: cpcbRegNo })}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("materialCategory")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              >
                {ewasteCategoriesList.map((cat, i) => (
                  <option key={i} value={cat}>{tCategory(cat)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("requiredQuantity")}
              </label>
              <input
                type="number"
                min="5"
                step="5"
                required
                value={requiredQuantityKg}
                onChange={(e) => setRequiredQuantityKg(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("preferredCondition")}
              </label>
              <select
                value={preferredCondition}
                onChange={(e) => setPreferredCondition(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              >
                <option value="Working / Repairable">{t("conditionWorking")}</option>
                <option value="Non-working / Scrap">{t("conditionNonWorking")}</option>
                <option value="Mixed Condition">{t("conditionMixed")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("targetPricePerKg")}
              </label>
              <input
                type="number"
                min="50"
                step="10"
                required
                value={targetPricePerKg}
                onChange={(e) => setTargetPricePerKg(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("targetLocation")}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              >
                {tamilNaduLocations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("expiryDays")}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222222] mb-1">
              {t("processingNotes")}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-white border-2 border-[#D6E8DF] rounded-lg p-2.5 focus:outline-none focus:border-[#B8D9C8]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#D6E8DF]">
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
              <span>{t("postRequirement")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
