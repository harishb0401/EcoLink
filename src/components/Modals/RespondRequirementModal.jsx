import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldAlert, ArrowRight, Calculator } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { referenceScrapPrices } from '../../data/scrapPrices';
import { calculateReferenceValue, calculateAverageReferenceRate, checkPriceWarning } from '../../utils/rulesEngine';

export default function RespondRequirementModal({ 
  isOpen, 
  onClose, 
  requirement, 
  onSubmitResponse,
  collectorProfile
}) {
  const { t } = useTranslation();

  const [items, setItems] = useState([
    { id: "item-1", material: "Laptop / Notebook", weightKg: 5, referencePrice: 300 },
    { id: "item-2", material: "Mobile Phones & Tablets", weightKg: 2, referencePrice: 500 },
    { id: "item-3", material: "Printers & Scanners", weightKg: 3, referencePrice: 200 }
  ]);

  const [collectorName, setCollectorName] = useState(
    collectorProfile?.fullName || collectorProfile?.name || 'Registered Collector'
  );
  const [askingPricePerKg, setAskingPricePerKg] = useState(310);
  const [notes, setNotes] = useState('Items tested, batteries safely packed in non-conductive crate.');

  if (!isOpen || !requirement) return null;

  const totalWeightKg = items.reduce((sum, item) => sum + (parseFloat(item.weightKg) || 0), 0);
  const estimatedRefValue = calculateReferenceValue(items);
  const averageRefRate = calculateAverageReferenceRate(items);
  const collectorLotValue = Math.round(totalWeightKg * (parseFloat(askingPricePerKg) || 0));

  const handleAddItem = () => {
    const defaultMat = referenceScrapPrices[0];
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        material: defaultMat.material,
        weightKg: 2,
        referencePrice: defaultMat.referencePrice
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const handleMaterialChange = (id, newMaterial) => {
    const scrapObj = referenceScrapPrices.find(s => s.material === newMaterial) || { referencePrice: 250 };
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          material: newMaterial,
          referencePrice: scrapObj.referencePrice
        };
      }
      return item;
    }));
  };

  const handleWeightChange = (id, val) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          weightKg: parseFloat(val) || 0
        };
      }
      return item;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const priceWarning = checkPriceWarning(
      askingPricePerKg, 
      requirement.referenceMin || 280, 
      requirement.referenceMax || 330
    );

    const responsePayload = {
      requirementId: requirement.id,
      collectorName,
      items,
      totalWeightKg,
      askingPricePerKg: parseFloat(askingPricePerKg),
      estimatedLotValue: estimatedRefValue,
      collectorLotValue,
      averageRefRate,
      notes,
      priceWarning
    };

    onSubmitResponse(responsePayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
      <div className="bg-[#F5FBF7] rounded-lg max-w-2xl w-full p-6 sm:p-8 border-2 border-[#D6E8DF] space-y-6 my-auto text-[#222222]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
              {t("collectorDeclaration")}
            </span>
            <h3 className="text-xl font-bold text-[#222222] mt-1">
              Respond to: {requirement.recyclerName}
            </h3>
            <p className="text-xs text-[#555555]">
              Target: {requirement.category} · {requirement.requiredQuantityKg} kg required · Target: ₹{requirement.targetPricePerKg}/kg
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded text-[#555555] hover:text-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Declared Materials List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                {t("declaredMaterialItems")}
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1 bg-white border-2 border-[#D6E8DF] px-2.5 py-1 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("addItem")}</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
                  <div className="flex-1">
                    <select
                      value={item.material}
                      onChange={(e) => handleMaterialChange(item.id, e.target.value)}
                      className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#B8D9C8]"
                    >
                      {referenceScrapPrices.map(sp => (
                        <option key={sp.id} value={sp.material}>
                          {sp.icon} {sp.material} (Ref: ₹{sp.referencePrice}/kg)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <div className="relative">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={item.weightKg}
                        onChange={(e) => handleWeightChange(item.id, e.target.value)}
                        className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-2.5 py-2 text-right pr-7 focus:outline-none focus:border-[#B8D9C8]"
                        placeholder="kg"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-[#555555] font-bold">kg</span>
                    </div>
                  </div>

                  <div className="w-20 text-right">
                    <span className="text-[11px] font-bold text-[#555555] block">{t("subtotal")}</span>
                    <span className="text-xs font-bold text-[#1F6F5F]">
                      ₹{Math.round(item.weightKg * item.referencePrice)}
                    </span>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-[#555555] hover:text-[#222222] rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Calculation Summary Box (Rule-Based) */}
          <div className="bg-[#EFF8F2] rounded-lg p-4 border-2 border-[#D6E8DF] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#222222]">
              <Calculator className="w-4 h-4 text-[#1F6F5F]" />
              <span>{t("ruleBasedCalculation")}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF]">
                <span className="text-[10px] text-[#555555] font-bold block">{t("totalWeight")}</span>
                <span className="text-base font-bold text-[#222222]">{totalWeightKg} kg</span>
              </div>
              <div className="bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF]">
                <span className="text-[10px] text-[#555555] font-bold block">{t("avgRefRate")}</span>
                <span className="text-base font-bold text-[#222222]">₹{averageRefRate}/kg</span>
              </div>
              <div className="bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF]">
                <span className="text-[10px] text-[#555555] font-bold block">{t("estimatedLotValueLabel")}</span>
                <span className="text-base font-bold text-[#1F6F5F]">₹{estimatedRefValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Asking Price Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1.5">
                {t("askingPricePerKg")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-[#555555]">₹</span>
                <input
                  type="number"
                  required
                  min="50"
                  max="2000"
                  value={askingPricePerKg}
                  onChange={(e) => setAskingPricePerKg(e.target.value)}
                  className="w-full text-sm font-bold bg-white border-2 border-[#D6E8DF] rounded-lg pl-8 pr-12 py-2 text-[#222222] focus:outline-none focus:border-[#B8D9C8]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#555555] font-bold">/ kg</span>
              </div>
              <span className="text-[11px] text-[#555555] mt-1 block">
                Reference range: ₹{requirement.referenceMin || 280}–₹{requirement.referenceMax || 330}/kg
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1.5">
                {t("collectorOrgName")}
              </label>
              <input
                type="text"
                required
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 text-[#222222] focus:outline-none focus:border-[#B8D9C8]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-[#D6E8DF]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 text-xs font-bold bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg text-[#555555] hover:border-[#B8D9C8]"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 text-xs font-bold bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t("submitResponse")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
