import React, { useState, useEffect } from 'react';
import { 
  X, PlusCircle, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, 
  ArrowRight, Upload, Calculator, Camera, Layers, MapPin, Tag, FileText
} from 'lucide-react';
import { structuredEWasteCategories, tamilNaduLocations } from '../../data/scrapPrices';
import { calculateFairPriceRange, classifyEWaste, createTraceabilityEvent } from '../../utils/rulesEngine';
import { useTranslation, useLanguage } from '../../i18n';

export default function AddWasteModal({ 
  isOpen, 
  onClose, 
  collectorProfile,
  onAddLot,
  onOpenPhoneVerification
}) {
  const { t } = useTranslation();
  const { tCategory, tCondition } = useLanguage();

  const defaultCategory = structuredEWasteCategories[0];
  const [selectedCategoryName, setSelectedCategoryName] = useState(defaultCategory.name);
  const [material, setMaterial] = useState("High-Grade Motherboards & Server Cards");
  const [quantity, setQuantity] = useState(20);
  const [unit, setUnit] = useState("kg");
  const [condition, setCondition] = useState("Non-working / Scrap");
  const [location, setLocation] = useState(tamilNaduLocations[0]);
  const [collectionDate, setCollectionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("Safely stored and segregated in anti-static crates.");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop");
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiDetectedMessage, setAiDetectedMessage] = useState("");

  // Current category object & fair price calculations
  const selectedCatObj = structuredEWasteCategories.find(c => c.name === selectedCategoryName) || defaultCategory;
  const fairPricing = calculateFairPriceRange(selectedCatObj.benchmarkPrice, selectedCatObj.tolerance, quantity);

  // Restore draft from localStorage if present
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem('ecolink_lot_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.selectedCategoryName) setSelectedCategoryName(parsed.selectedCategoryName);
          if (parsed.material) setMaterial(parsed.material);
          if (parsed.quantity) setQuantity(parsed.quantity);
          if (parsed.condition) setCondition(parsed.condition);
          if (parsed.notes) setNotes(parsed.notes);
        }
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [isOpen]);

  // Auto-save draft on changes
  useEffect(() => {
    if (isOpen) {
      try {
        const draft = { selectedCategoryName, material, quantity, condition, notes };
        localStorage.setItem('ecolink_lot_draft', JSON.stringify(draft));
      } catch (e) {
        // ignore
      }
    }
  }, [selectedCategoryName, material, quantity, condition, notes, isOpen]);

  if (!isOpen) return null;

  // AI Classification Simulation
  const handleAiClassify = () => {
    setIsAiScanning(true);
    setTimeout(() => {
      const detected = classifyEWaste(material || notes);
      setSelectedCategoryName(detected.category);
      setAiDetectedMessage(`AI Classification Match: "${detected.category}" (Benchmark ₹${detected.benchmarkPrice}/kg)`);
      setIsAiScanning(false);
    }, 600);
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategoryName(catName);
    const cat = structuredEWasteCategories.find(c => c.name === catName);
    if (cat) {
      setCondition(cat.defaultCondition || "Non-working / Scrap");
    }
    setAiDetectedMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if collector is verified
    if (collectorProfile && !collectorProfile.phone_verified) {
      alert(t("phoneVerificationNotice"));
      if (onOpenPhoneVerification) {
        onClose();
        onOpenPhoneVerification();
      }
      return;
    }

    const newLotId = `LOT-EL26-TN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const createdDateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                                now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newLot = {
      id: newLotId,
      collectorId: collectorProfile?.id || collectorProfile?._id || "",
      collectorName: collectorProfile?.fullName || collectorProfile?.name || "Registered Collector",
      collectorPhone: collectorProfile?.phone || "",
      category: selectedCatObj.name,
      material: material.trim() || selectedCatObj.name,
      quantity: parseFloat(quantity) || 1,
      unit: unit || "kg",
      condition,
      location,
      collectionDate,
      createdDate: createdDateFormatted,
      imageUrl,
      notes,
      benchmarkPrice: selectedCatObj.benchmarkPrice,
      tolerance: selectedCatObj.tolerance,
      lowerLimit: fairPricing.lowerLimit,
      upperLimit: fairPricing.upperLimit,
      estimatedLotValue: fairPricing.estimatedLotValue,
      minEstimatedValue: fairPricing.minEstimatedValue,
      maxEstimatedValue: fairPricing.maxEstimatedValue,
      status: "AVAILABLE",
      timeline: [
        createTraceabilityEvent("Phone Verified", "Collector", "Completed", { phone: collectorProfile?.phone || "" }),
        createTraceabilityEvent("Waste Added", "Collector", "Completed", { quantity: `${quantity} ${unit}`, material }),
        createTraceabilityEvent("Waste Classified", "Collector", "Completed", { category: selectedCatObj.name }),
        createTraceabilityEvent("Digital Lot Created", "System", "Completed", { lotId: newLotId }),
        createTraceabilityEvent("Fair Price Calculated", "Rules Engine", "Completed", { 
          benchmark: `₹${selectedCatObj.benchmarkPrice}/${unit}`,
          fairRange: `₹${fairPricing.lowerLimit}–₹${fairPricing.upperLimit}/${unit}`,
          estimatedValue: `₹${fairPricing.estimatedLotValue}`
        })
      ]
    };

    // Clear draft
    try {
      localStorage.removeItem('ecolink_lot_draft');
    } catch (e) {}

    if (onAddLot) {
      onAddLot(newLot);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 overflow-y-auto">
      <div className="bg-[#F5FBF7] rounded-lg max-w-2xl w-full p-6 sm:p-8 border-2 border-[#D6E8DF] space-y-6 my-auto text-[#222222] max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                {t('collectorManifestWorkflowBadge', 'COLLECTOR MANIFEST WORKFLOW')}
              </span>
              <h3 className="text-xl font-bold text-[#222222] mt-1">
                {t("addEWaste")}
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

        {/* Collector Phone Verification Status Banner */}
        {collectorProfile && !collectorProfile.phone_verified && (
          <div className="p-3.5 bg-[#EFF8F2] border-2 border-[#B8D9C8] rounded-lg flex items-center justify-between gap-3 text-[#222222] text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#555555] shrink-0" />
              <span>{t("phoneVerificationRequired")} - You must verify before lot creation.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenPhoneVerification) onOpenPhoneVerification();
              }}
              className="px-3 py-1 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer"
            >
              {t("verifyNow")}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Step 1: Structured Waste Classification Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider">
                1. {t("category")} / {t("wasteCategory")}
              </label>

              <button
                type="button"
                onClick={handleAiClassify}
                disabled={isAiScanning}
                className="text-[11px] font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] hover:border-[#B8D9C8] px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1F6F5F]" />
                <span>{isAiScanning ? 'Classifying...' : t("smartClassifyBtn")}</span>
              </button>
            </div>

            {aiDetectedMessage && (
              <div className="p-2 bg-white border-2 border-[#B8D9C8] rounded-lg text-xs font-bold text-[#1F6F5F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                <span>{aiDetectedMessage}</span>
              </div>
            )}

            {/* Grid of 10 structured categories */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {structuredEWasteCategories.map((cat) => {
                const isSelected = selectedCategoryName === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`p-2.5 rounded-lg border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                        : 'bg-white text-[#222222] border-[#D6E8DF] hover:border-[#B8D9C8]'
                    }`}
                  >
                    <span className="text-xl mb-1">{cat.icon}</span>
                    <span className="text-[11px] font-bold leading-tight line-clamp-2">
                      {tCategory(cat.name)}
                    </span>
                    <span className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-white' : 'text-[#1F6F5F]'}`}>
                      ₹{cat.benchmarkPrice}/kg
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Specific Material & Condition Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("materialCategory")} / Item Specifics
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder={t("addWastePlaceholderDescription")}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("conditionLabel")}
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              >
                <option value="Non-working / Scrap">{tCondition("Non-working / Scrap")}</option>
                <option value="Mixed Condition">{tCondition("Mixed Condition")}</option>
                <option value="Working / Repairable">{tCondition("Working / Repairable")}</option>
              </select>
            </div>
          </div>

          {/* Step 3: Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("quantityLabel")} ({unit})
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("unitLabel")}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
              >
                <option value="kg">{t('unitKg', 'kg (Kilograms)')}</option>
                <option value="units">{t('unitUnits', 'units (Items)')}</option>
                <option value="tons">{t('unitTons', 'tons (Metric Tons)')}</option>
              </select>
            </div>
          </div>

          {/* Step 4: Location & Collection Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t("locationLabel")}
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
                {t("collectionDateLabel")}
              </label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full text-xs font-bold bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#B8D9C8]"
                required
              />
            </div>
          </div>

          {/* Step 5: Live Fair Price Calculation Preview Box */}
          <div className="bg-[#EFF8F2] p-4 sm:p-5 rounded-lg border-2 border-[#D6E8DF] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#D6E8DF] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#222222]">
                <Calculator className="w-4 h-4 text-[#1F6F5F]" />
                <span>{t("fairPriceRangeLabel")} & Valuation</span>
              </div>
              <span className="text-[10px] font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                {t("toleranceLabel")}: ±{fairPricing.tolerancePercent}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF]">
                <span className="text-[10px] text-[#555555] font-bold block">{t("benchmarkPriceLabel")}</span>
                <span className="text-sm font-bold text-[#222222]">₹{fairPricing.benchmarkPrice}/{unit}</span>
              </div>

              <div className="bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF]">
                <span className="text-[10px] text-[#555555] font-bold block">{t("lowerLimitLabel")}</span>
                <span className="text-sm font-bold text-[#1F6F5F]">₹{fairPricing.lowerLimit}/{unit}</span>
              </div>

              <div className="bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF]">
                <span className="text-[10px] text-[#555555] font-bold block">{t("upperLimitLabel")}</span>
                <span className="text-sm font-bold text-[#2FA084]">₹{fairPricing.upperLimit}/{unit}</span>
              </div>

              <div className="bg-[#F5FBF7] p-2.5 rounded-lg border-2 border-[#D6E8DF]">
                <span className="text-[10px] text-[#555555] font-bold block">{t("estimatedLotValueLabel")}</span>
                <span className="text-sm font-bold text-[#1F6F5F]">₹{fairPricing.estimatedLotValue.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#555555] text-center">
              {t("fairPriceExplanation")}
            </p>
          </div>

          {/* Notes & Optional Image */}
          <div>
            <label className="block text-xs font-bold text-[#222222] mb-1">
              {t("notesLabel")}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("addWastePlaceholderStorage")}
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
              className="px-6 py-3 text-xs font-bold text-white bg-[#1F6F5F] hover:bg-[#2FA084] rounded-lg transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t("createDigitalLotBtn")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
