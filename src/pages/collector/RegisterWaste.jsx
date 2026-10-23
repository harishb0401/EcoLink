import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Scale, DollarSign, CheckCircle2, XCircle, 
  AlertTriangle, ShieldCheck, RefreshCw, MapPin, Loader2, 
  Navigation, Clock, Upload, Trash2, Image as ImageIcon, 
  Calendar, AlertOctagon, Box, FileText, Info
} from 'lucide-react';
import { structuredEWasteCategories } from '../../data/scrapPrices';
import { calculateFairPriceRange } from '../../utils/rulesEngine';
import { getHazardousAssessment } from '../../utils/hazardousAssessment';
import { mockBenchmarkPrices } from '../../data/mockData';
import { validateQuotedPriceBackend } from '../../services/pricingService';
import wasteService from '../../services/wasteService';
import { useTranslation } from '../../i18n';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getCategoryPrice, getCachedSafetyGuidance } from '../../services/offline/offlineContentService';

export default function RegisterWaste({ 
  benchmarkPrices = mockBenchmarkPrices, 
  onLotCreated, 
  collectorProfile = null 
}) {
  const navigate = useNavigate();
  const { t, tCategory, tCondition } = useTranslation();
  const { online } = useOnlineStatus();
  const fileInputRef = useRef(null);

  // ==========================================
  // SECTION 1: WASTE INFORMATION STATE
  // ==========================================
  // 1. Waste Category / Item Type
  const [category, setCategory] = useState(structuredEWasteCategories[0].name);
  const [categoryOther, setCategoryOther] = useState('');
  
  // 2. Waste Description
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState(structuredEWasteCategories[0].description || structuredEWasteCategories[0].name);

  // 3. Quantity (Optional - not compulsory)
  const [quantity, setQuantity] = useState('');

  // 4. Unit (Pieces, Kilograms, Boxes, Lots)
  const [unit, setUnit] = useState('Pieces');

  // 5. Total Weight (kg) - Separate from quantity
  const [totalWeightKg, setTotalWeightKg] = useState('25');

  // 6. Waste Condition (Working, Partially Working, Damaged, Non-functional, Mixed)
  const [condition, setCondition] = useState('Non-functional');

  // ==========================================
  // SECTION 2: COLLECTION AND STORAGE DETAILS
  // ==========================================
  // 8. Collection Address
  const rawProfileAddr = (collectorProfile?.address || collectorProfile?.location || '').trim();
  const initialProfileAddr = rawProfileAddr === 'Chennai Hub' ? '' : rawProfileAddr;
  const [collectionAddress, setCollectionAddress] = useState(initialProfileAddr);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState('');

  // 9. City / District (No hardcoded Chennai default)
  const [cityDistrict, setCityDistrict] = useState(
    collectorProfile?.city || collectorProfile?.district || ''
  );

  // Synchronize collection address and city when collectorProfile is loaded or updated
  useEffect(() => {
    if (collectorProfile) {
      const pAddr = (collectorProfile.address || collectorProfile.location || '').trim();
      const cleanAddr = pAddr === 'Chennai Hub' ? '' : pAddr;
      if (cleanAddr && (!collectionAddress || collectionAddress === 'Chennai Hub')) {
        setCollectionAddress(cleanAddr);
      }
      const pCity = (collectorProfile.city || collectorProfile.district || '').trim();
      if (pCity && !cityDistrict) {
        setCityDistrict(pCity);
      } else if (!cityDistrict && cleanAddr) {
        const parts = cleanAddr.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length > 1) {
          setCityDistrict(parts[parts.length - 1]);
        }
      }
    }
  }, [collectorProfile]);

  // 10. Storage Condition
  const [storageCondition, setStorageCondition] = useState('Indoor storage');
  const [storageConditionDetails, setStorageConditionDetails] = useState('');

  // 11. Battery / Hazardous Material Condition (Auto-populated from Category)
  const initialHazardInfo = getHazardousAssessment(structuredEWasteCategories[0].name);
  const [hazardousCondition, setHazardousCondition] = useState(initialHazardInfo.assessment);
  const [hazardousAssessmentStatus, setHazardousAssessmentStatus] = useState(initialHazardInfo.verificationStatus || 'Requires Verification');
  const [batteryPhysicalState, setBatteryPhysicalState] = useState(initialHazardInfo.defaultBatteryState);
  const [batteryType, setBatteryType] = useState('Not Specified / Unknown');
  const [hazardousConditionDetails, setHazardousConditionDetails] = useState('');

  // ==========================================
  // SECTION 3: PRICING AND PICKUP DETAILS
  // ==========================================
  // 12. Expected Selling Price (₹)
  const [expectedPrice, setExpectedPrice] = useState(() => {
    const defaultCat = structuredEWasteCategories[0];
    const defaultBenchmark = defaultCat?.benchmarkPrice || 650;
    return String(Math.round(defaultBenchmark * 25)); // 16,250 baseline for 25kg PCB
  });
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [isOpenToMarket, setIsOpenToMarket] = useState(false);

  // 13. Preferred Pickup Date / Time
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    return tomorrow.toISOString().slice(0, 16);
  };
  const [preferredPickupDate, setPreferredPickupDate] = useState(getDefaultDateTime());

  // ==========================================
  // SECTION 4: IMAGES AND ADDITIONAL NOTES
  // ==========================================
  // 7. Waste Images / Photos
  const [images, setImages] = useState([]); // Array of { id, url, name, size, isUploading, error }
  const [imageUploadError, setImageUploadError] = useState('');

  // 14. Additional Notes
  const [notes, setNotes] = useState('');

  // ==========================================
  // SUBMISSION & VALIDATION STATES
  // ==========================================
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [offlinePriceInfo, setOfflinePriceInfo] = useState({ isOffline: false, lastUpdated: null });
  const [safetyGuidance, setSafetyGuidance] = useState(null);
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);

  // Selected Category Benchmark & Tolerance
  const isOtherCategory = category === 'Other';
  const selectedCatData = structuredEWasteCategories.find(c => c.name === category);
  const benchmarkRate = isOtherCategory 
    ? 250 
    : ((benchmarkPrices || []).find(p => p.category === category)?.referencePrice || selectedCatData?.benchmarkPrice || 350);
  const tolerance = isOtherCategory 
    ? 25 
    : ((benchmarkPrices || []).find(p => p.category === category)?.tolerancePercent !== undefined 
      ? (benchmarkPrices || []).find(p => p.category === category).tolerancePercent 
      : (selectedCatData?.tolerance ? selectedCatData.tolerance * 100 : 25));

  // Backend pricing validation state
  const [backendValidation, setBackendValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Load offline cached prices and safety guidelines
  useEffect(() => {
    if (!isOtherCategory) {
      getCategoryPrice(category).then(info => {
        setOfflinePriceInfo(info);
      });
      getCachedSafetyGuidance(category).then(guide => {
        setSafetyGuidance(guide);
      });
    }
  }, [category, online, isOtherCategory]);

  // Handle Category Change
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);

    // Automatically update Battery / Hazardous Material Condition from centralized mapping
    const hazardInfo = getHazardousAssessment(newCat);
    setHazardousCondition(hazardInfo.assessment);
    setHazardousAssessmentStatus(hazardInfo.verificationStatus || 'Requires Verification');
    setBatteryPhysicalState(hazardInfo.defaultBatteryState);

    // Clear stale battery chemistry when changing to categories where batteries are unlikely
    if (hazardInfo.batteryLikelihood === 'Unlikely') {
      setBatteryType('Not Specified / Unknown');
    }

    if (newCat === 'Other') {
      setMaterial('Custom / Other E-Waste Stream');
      if (!isCustomPrice && !isOpenToMarket) {
        const w = parseFloat(totalWeightKg) || 1;
        setExpectedPrice(String(Math.round(250 * w)));
      }
    } else {
      const matched = structuredEWasteCategories.find(c => c.name === newCat);
      if (matched) {
        setMaterial(matched.description || matched.name);
        const newBenchmark = (benchmarkPrices || []).find(p => p.category === newCat)?.referencePrice || matched.benchmarkPrice || 350;
        if (!isCustomPrice && !isOpenToMarket) {
          const w = parseFloat(totalWeightKg) || 1;
          setExpectedPrice(String(Math.round(newBenchmark * w)));
        }
      }
    }
  };

  // Quantity Change Handler - Completely separate from Total Weight
  const handleQuantityChange = (val) => {
    setQuantity(val);
  };

  // Unit Change Handler - Completely separate from Total Weight
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
  };

  // Total Weight Change Handler - Completely separate from Quantity
  const handleWeightChange = (val) => {
    setTotalWeightKg(val);
    if (!isCustomPrice && !isOpenToMarket) {
      const num = parseFloat(val) || 0;
      setExpectedPrice(String(Math.round(benchmarkRate * num)));
    }
  };

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please enter address manually.");
      return;
    }

    setIsLocating(true);
    setLocationSuccess('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setLocationSuccess(`GPS detected: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
        if (!collectionAddress) {
          setCollectionAddress(`Pickup Hub (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not access GPS location. Please type your collection address manually.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Image Upload Handlers
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageUploadError('');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setImageUploadError('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are supported.');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError(`File "${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      const tempId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);

      // Add to list with uploading status
      setImages(prev => [...prev, {
        id: tempId,
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        url: previewUrl,
        isUploading: true,
        error: null
      }]);

      try {
        const uploadRes = await wasteService.uploadImage(file);
        setImages(prev => prev.map(img => 
          img.id === tempId ? {
            ...img,
            url: uploadRes.url || previewUrl,
            storagePath: uploadRes.path,
            isUploading: false
          } : img
        ));
      } catch (err) {
        console.error('Image upload failed:', err);
        setImages(prev => prev.map(img => 
          img.id === tempId ? {
            ...img,
            isUploading: false,
            error: 'Upload to Supabase Storage failed. Will use offline preview.'
          } : img
        ));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imgId) => {
    setImages(prev => prev.filter(img => img.id !== imgId));
  };

  // Fair price calculations & backend pricing validation
  const parsedWeight = parseFloat(totalWeightKg) || 0;
  const parsedPrice = parseFloat(expectedPrice) || 0;
  const unitRate = parsedWeight > 0 ? (parsedPrice / parsedWeight) : benchmarkRate;

  useEffect(() => {
    let isCurrent = true;
    setIsValidating(true);

    const tolFraction = tolerance > 1 ? tolerance / 100 : tolerance;

    validateQuotedPriceBackend({
      category: isOtherCategory ? (categoryOther || 'Other E-Waste') : category,
      material: (description || material || '').trim() || category,
      lotWeight: parsedWeight,
      quotedPrice: unitRate,
      benchmarkPrice: benchmarkRate,
      tolerance: tolFraction,
      unit: 'kg'
    }).then((res) => {
      if (isCurrent) {
        setBackendValidation(res);
        setIsValidating(false);
      }
    }).catch((err) => {
      if (isCurrent) {
        setIsValidating(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [category, categoryOther, isOtherCategory, description, material, parsedWeight, unitRate, benchmarkRate, tolerance]);

  const fallbackRange = calculateFairPriceRange(benchmarkRate, tolerance > 1 ? tolerance / 100 : tolerance, parsedWeight);
  const minPrice = backendValidation?.allowedPriceRange?.minPrice ?? fallbackRange.lowerLimit;
  const maxPrice = backendValidation?.allowedPriceRange?.maxPrice ?? fallbackRange.upperLimit;
  const displayBenchmark = backendValidation?.benchmarkRate ?? benchmarkRate;
  const displayTolerance = backendValidation?.tolerancePercent ?? Math.round(tolerance);

  const minTotalVal = Math.round(minPrice * parsedWeight);
  const maxTotalVal = Math.round(maxPrice * parsedWeight);

  // Strict fair price validation checks (inclusive boundaries)
  const hasEnteredPrice = expectedPrice !== '' && !isNaN(parsedPrice);
  const isPriceValid = isOpenToMarket 
    ? true 
    : (hasEnteredPrice && parsedPrice >= minTotalVal && parsedPrice <= maxTotalVal);

  const isPriceBelowMin = !isOpenToMarket && hasEnteredPrice && parsedPrice < minTotalVal;
  const isPriceAboveMax = !isOpenToMarket && hasEnteredPrice && parsedPrice > maxTotalVal;
  const isPriceInvalid = !isOpenToMarket && (
    !hasEnteredPrice || 
    parsedPrice < minTotalVal || 
    parsedPrice > maxTotalVal
  );
  const isPriceCleared = isPriceValid;

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (isOtherCategory && !categoryOther.trim()) {
      errors.categoryOther = 'Please specify the custom e-waste item type.';
    }
    if (!description.trim()) {
      errors.description = 'Please provide a waste description with item details.';
    }
    // Quantity is optional (not compulsory)
    if (quantity !== undefined && quantity !== null && String(quantity).trim() !== '') {
      const q = parseFloat(quantity);
      if (isNaN(q) || q <= 0) {
        errors.quantity = 'Quantity must be a positive number greater than 0 if provided.';
      }
    }
    const w = parseFloat(totalWeightKg);
    if (!w || w <= 0) {
      errors.totalWeightKg = 'Total weight is required and must be greater than 0 kg.';
    }
    if (!collectionAddress.trim()) {
      errors.collectionAddress = 'Collection pickup address is required.';
    }
    if (!cityDistrict.trim()) {
      errors.cityDistrict = 'City / District is required.';
    }
    
    // Validate collector expected selling price against EcoLink Fair Pricing Reference Engine
    if (!isOpenToMarket) {
      const p = parseFloat(expectedPrice);
      if (isNaN(p) || expectedPrice.trim() === '') {
        errors.expectedPrice = `Please enter an expected selling price between ₹${minTotalVal.toLocaleString()} and ₹${maxTotalVal.toLocaleString()}.`;
      } else if (p < minTotalVal || p > maxTotalVal) {
        errors.expectedPrice = `Your expected selling price must be between ₹${minTotalVal.toLocaleString()} and ₹${maxTotalVal.toLocaleString()} to register this waste lot.`;
      }
    }

    if (!preferredPickupDate) {
      errors.preferredPickupDate = 'Please select a preferred pickup date and time.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Hard block if price is outside the permitted fair range
    if (!isOpenToMarket && isPriceInvalid) {
      setSubmitError(`Price Outside Permitted Range: Your expected selling price must be between ₹${minTotalVal.toLocaleString()} and ₹${maxTotalVal.toLocaleString()} to register this waste lot.`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCategory = isOtherCategory ? `Other: ${categoryOther.trim()}` : category;
      const imageUrlsList = images.map(img => img.url);
      const parsedQty = (quantity !== undefined && quantity !== null && String(quantity).trim() !== '')
        ? parseFloat(quantity)
        : null;

      const exactEnteredPrice = isOpenToMarket ? 0 : parsedPrice;

      const payload = {
        category: finalCategory,
        categoryOther: isOtherCategory ? categoryOther.trim() : null,
        description: description.trim(),
        material: (description || material || '').trim(),
        quantity: parsedQty,
        unit,
        totalWeightKg: parseFloat(totalWeightKg),
        condition,
        imageUrls: imageUrlsList,
        collectionAddress: collectionAddress.trim(),
        cityDistrict: cityDistrict.trim(),
        location: collectionAddress.trim(),
        latitude,
        longitude,
        storageCondition,
        storageConditionDetails: storageConditionDetails.trim(),
        hazardousCondition,
        hazardousConditionDetails: [
          batteryPhysicalState !== 'Unconfirmed / Pending Physical Manifest' && batteryPhysicalState !== 'No Batteries Applicable for Item' ? `[Battery State: ${batteryPhysicalState}]` : null,
          batteryType !== 'Not Specified / Unknown' ? `[Battery Type: ${batteryType}]` : null,
          hazardousConditionDetails.trim() || null
        ].filter(Boolean).join('; '),
        hazardousAssessmentStatus,
        batteryPhysicalState,
        batteryType,
        expectedPrice: exactEnteredPrice,
        isOpenToMarket,
        pricingMode: isOpenToMarket ? 'MARKET_BIDS' : 'FIXED_EXPECTED',
        quotedPrice: isOpenToMarket ? displayBenchmark : unitRate,
        benchmarkPrice: displayBenchmark,
        tolerance: displayTolerance,
        preferredPickupDate,
        collectionDate: preferredPickupDate.split('T')[0],
        notes: notes.trim(),
        estimatedLotValue: isOpenToMarket ? Math.round(displayBenchmark * parseFloat(totalWeightKg)) : exactEnteredPrice,
        isPreCleared: isPriceCleared,
        clearanceBadge: isOpenToMarket ? 'MARKET BIDS ⚖️' : (isPriceCleared ? 'PRE-CLEARED ✅' : 'NOT CLEARED ❌'),
        allowedPriceRange: {
          minPrice,
          maxPrice,
          minTotalVal,
          maxTotalVal,
          rangeLabel: `₹${minPrice} – ₹${maxPrice} / kg`
        }
      };

      if (onLotCreated) {
        await onLotCreated(payload);
      } else {
        await wasteService.createLot(payload);
      }

      navigate('/collector/requests');
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError(err.message || 'Failed to register e-waste manifest. Please check your data and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white text-[#222222]">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/collector/dashboard')}
          className="px-4 py-2 text-xs font-bold text-[#222222] bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg hover:border-[#B8D9C8] transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1F6F5F]" />
          <span>{t('backToDashboard', 'Back to Dashboard')}</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#F5FBF7] p-6 sm:p-10 rounded-lg border-2 border-[#D6E8DF] space-y-8">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#1F6F5F] tracking-widest bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
            {t('pricingAndValidationEngine', 'E-Waste Manifest & Supabase Integration')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-3">
            {t('collectorWasteRegistration', 'Collector E-Waste Registration')}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1">
            Register e-waste batches with complete specifications, upload verification photos to Supabase Storage, and evaluate fair benchmark pricing.
          </p>
        </div>

        {submitError && (
          <div className="p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-lg text-xs font-bold flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">Registration Failed</p>
              <p className="font-normal text-[11px] text-red-700">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ======================================================== */}
          {/* SECTION 1: WASTE INFORMATION */}
          {/* ======================================================== */}
          <div className="bg-white p-6 rounded-lg border-2 border-[#D6E8DF] space-y-5">
            <div className="flex items-center gap-2 border-b-2 border-[#D6E8DF] pb-3">
              <span className="w-6 h-6 rounded-full bg-[#1F6F5F] text-white flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="text-base font-bold text-[#222222]">Waste Information</h2>
            </div>

            {/* 1. Category & Custom Item Type (if Other) */}
            <div className={isOtherCategory ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
              <div>
                <label className="text-xs font-bold text-[#222222] block mb-1">
                  Waste Category / Item Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                >
                  {structuredEWasteCategories.map((c, i) => (
                    <option key={i} value={c.name}>{tCategory(c.name)}</option>
                  ))}
                  <option value="Other">Other (Specify Custom Item Type)</option>
                </select>
              </div>

              {isOtherCategory && (
                <div>
                  <label className="text-xs font-bold text-[#222222] block mb-1">
                    Specify Custom Item Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryOther}
                    onChange={(e) => setCategoryOther(e.target.value)}
                    placeholder="e.g. Telecom Satellite Transceivers"
                    className={`w-full bg-white border-2 ${fieldErrors.categoryOther ? 'border-red-400' : 'border-[#D6E8DF]'} rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none`}
                  />
                  {fieldErrors.categoryOther && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.categoryOther}</p>
                  )}
                </div>
              )}
            </div>

            {/* 2. Waste Description */}
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">
                Waste Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe electronic items, brand, model, quantity breakdown, intactness, and key components..."
                className={`w-full bg-white border-2 ${fieldErrors.description ? 'border-red-400' : 'border-[#D6E8DF]'} rounded-lg p-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none`}
              />
              {fieldErrors.description && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.description}</p>
              )}
            </div>

            {/* 3, 4, 5: Quantity (Optional), Unit, Total Weight (kg) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#222222] block mb-1">
                  Quantity <span className="text-[11px] font-normal text-[#555555]">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="e.g. 10 (optional count)"
                  className={`w-full bg-white border-2 ${fieldErrors.quantity ? 'border-red-400' : 'border-[#D6E8DF]'} rounded-lg px-4 py-3 text-xs font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none`}
                />
                {fieldErrors.quantity && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.quantity}</p>
                )}
                <p className="text-[10px] text-[#555555] mt-1">
                  Item count if known. Not compulsory.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#222222] block mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Kilograms">Kilograms</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Lots">Lots</option>
                </select>
                <p className="text-[10px] text-[#555555] mt-1">
                  Packaging/packaging unit type.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#222222] block mb-1">
                  Total Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={totalWeightKg}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="e.g. 25.5"
                  className={`w-full bg-white border-2 ${fieldErrors.totalWeightKg ? 'border-red-400' : 'border-[#D6E8DF]'} rounded-lg px-4 py-3 text-xs font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none`}
                />
                {fieldErrors.totalWeightKg && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.totalWeightKg}</p>
                )}
                <p className="text-[10px] text-[#555555] mt-1">
                  Required total net weight in kilograms.
                </p>
              </div>
            </div>

            {/* 6. Waste Condition */}
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">
                Waste Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              >
                <option value="Working">Working</option>
                <option value="Partially Working">Partially Working</option>
                <option value="Damaged">Damaged</option>
                <option value="Non-functional">Non-functional</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: COLLECTION AND STORAGE DETAILS */}
          {/* ======================================================== */}
          <div className="bg-white p-6 rounded-lg border-2 border-[#D6E8DF] space-y-5">
            <div className="flex items-center gap-2 border-b-2 border-[#D6E8DF] pb-3">
              <span className="w-6 h-6 rounded-full bg-[#1F6F5F] text-white flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="text-base font-bold text-[#222222]">Collection and Storage Details</h2>
            </div>

            {/* 8. Collection Address with GPS & Profile Sync */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#222222]">
                    Collection Pickup Address <span className="text-red-500">*</span>
                  </label>
                  {(collectorProfile?.location || collectorProfile?.address) && 
                   (collectorProfile.location !== 'Chennai Hub' && collectorProfile.address !== 'Chennai Hub') && (
                    <span className="text-[10px] text-[#1F6F5F] font-bold bg-[#EFF8F2] px-2 py-0.5 rounded border border-[#B8D9C8]">
                      Defaulted from Profile
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/collector/profile')}
                    className="text-[11px] font-bold text-[#555555] hover:text-[#1F6F5F] underline cursor-pointer"
                  >
                    Edit in Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-[11px] font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1 cursor-pointer"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3" />
                        <span>Auto-detect GPS Location</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                rows="2"
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
                placeholder="Full street address, building/plot number, loading dock, landmark (e.g. Plot 14, SIDCO Industrial Estate)..."
                className={`w-full bg-white border-2 ${fieldErrors.collectionAddress ? 'border-red-400' : 'border-[#D6E8DF]'} rounded-lg p-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none`}
              />
              {(!collectorProfile?.location && !collectorProfile?.address) && (
                <p className="text-[11px] text-[#555555] mt-1">
                  💡 Tip: You can set your default address in your <button type="button" onClick={() => navigate('/collector/profile')} className="text-[#1F6F5F] font-bold underline cursor-pointer">Profile</button> so all new requests will automatically pre-fill your pickup location.
                </p>
              )}
              {locationSuccess && (
                <p className="text-[10px] font-bold text-[#1F6F5F] mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{locationSuccess}</span>
                </p>
              )}
              {fieldErrors.collectionAddress && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.collectionAddress}</p>
              )}
            </div>

            {/* 9. City / District */}
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">
                City / District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cityDistrict}
                onChange={(e) => setCityDistrict(e.target.value)}
                placeholder="e.g. Chennai, Coimbatore, Kanchipuram"
                className={`w-full bg-white border-2 ${fieldErrors.cityDistrict ? 'border-red-400' : 'border-[#D6E8DF]'} rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none`}
              />
              {fieldErrors.cityDistrict && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.cityDistrict}</p>
              )}
            </div>

            {/* 10. Storage Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#222222] block mb-1">
                  Storage Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                >
                  <option value="Indoor storage">Indoor storage</option>
                  <option value="Outdoor storage">Outdoor storage</option>
                  <option value="Covered storage">Covered storage</option>
                  <option value="Uncovered storage">Uncovered storage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#222222] block mb-1">
                  Storage Facility Details (Optional)
                </label>
                <input
                  type="text"
                  value={storageConditionDetails}
                  onChange={(e) => setStorageConditionDetails(e.target.value)}
                  placeholder="e.g. Ventilated warehouse shelf, palletized, dry bin"
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>
            </div>

            {/* 11. Battery / Hazardous Material Condition (Auto-Assessed from Category) */}
            <div className="space-y-4 pt-3 border-t-2 border-[#D6E8DF]">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#222222]">
                      Battery / Hazardous Material Condition <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FCD34D] px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-[#B45309]" />
                      Requires Verification
                    </span>
                  </div>
                  <span className="text-[10px] text-[#555555] font-semibold bg-[#EFF8F2] border border-[#B8D9C8] px-2 py-0.5 rounded">
                    Inferred from Category: <strong>{category}</strong>
                  </span>
                </div>

                {/* Read-Only Automatically Generated Assessment */}
                <div className="relative">
                  <textarea
                    rows="2"
                    readOnly
                    value={hazardousCondition}
                    className="w-full bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg p-3 pr-28 text-xs font-semibold text-[#222222] cursor-not-allowed focus:outline-none"
                  />
                  <span className="absolute right-3 top-3 text-[10px] font-bold uppercase text-[#1F6F5F] bg-[#EFF8F2] border border-[#B8D9C8] px-2 py-0.5 rounded pointer-events-none">
                    Auto-Generated
                  </span>
                </div>
                <p className="text-[11px] text-[#555555] mt-1">
                  Category selection generates this inferred assessment. It does not certify that the lot is free of hazards.
                </p>
              </div>

              {/* Separate Confirmation Fields for Actual Battery / Physical State */}
              <div className="p-4 bg-[#F9FCFA] border-2 border-[#D6E8DF] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#222222] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1F6F5F]" />
                    <span>Physical Confirmation & Battery Details</span>
                  </h4>
                  <span className="text-[10px] text-[#555555]">Optional / Fill if known</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#222222] block mb-1">
                      Actual Battery Presence & Physical State
                    </label>
                    <select
                      value={batteryPhysicalState}
                      onChange={(e) => setBatteryPhysicalState(e.target.value)}
                      className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                    >
                      <option value="Unconfirmed / Pending Physical Manifest">Unconfirmed / Pending Physical Manifest</option>
                      <option value="Batteries Intact (Securely enclosed)">Batteries Intact (Securely enclosed)</option>
                      <option value="Batteries Removed (No batteries in lot)">Batteries Removed (No batteries in lot)</option>
                      <option value="Damaged / Swollen / Leaking Cells">Damaged / Swollen / Leaking Cells (Hazardous)</option>
                      <option value="No Batteries Applicable for Item">No Batteries Applicable for Item</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#222222] block mb-1">
                      Battery Chemistry / Type (If known)
                    </label>
                    <select
                      value={batteryType}
                      onChange={(e) => setBatteryType(e.target.value)}
                      className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                    >
                      <option value="Not Specified / Unknown">Not Specified / Unknown</option>
                      <option value="Lithium-Ion (Li-ion)">Lithium-Ion (Li-ion / Li-Po)</option>
                      <option value="Lead-Acid (SLA / Wet Cell)">Lead-Acid (SLA / Wet Cell)</option>
                      <option value="Nickel-Metal Hydride (NiMH)">Nickel-Metal Hydride (NiMH)</option>
                      <option value="Nickel-Cadmium (NiCad)">Nickel-Cadmium (NiCad)</option>
                      <option value="Alkaline / Button RTC Cells">Alkaline / Button RTC Cells</option>
                      <option value="Other / Mixed Chemistry">Other / Mixed Chemistry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#222222] block mb-1">
                    Specific Hazardous & Handling Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={hazardousConditionDetails}
                    onChange={(e) => setHazardousConditionDetails(e.target.value)}
                    placeholder="e.g. Battery terminals taped, acid caps sealed, capacitors discharged, stored in insulated bins..."
                    className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Regulatory disclaimer box */}
              <div className="p-3 bg-[#EFF8F2] border-2 border-[#D6E8DF] rounded-lg text-[11px] text-[#555555] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#1F6F5F] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#222222]">Safety Protocol Notice:</strong> Automatically inferred category assessments do not constitute certified non-hazardous declarations. All waste lots undergo physical manifest verification by certified CPCB recyclers prior to loading.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: PRICING AND PICKUP SCHEDULE */}
          {/* ======================================================== */}
          <div className="bg-white p-6 rounded-lg border-2 border-[#D6E8DF] space-y-5">
            <div className="flex items-center gap-2 border-b-2 border-[#D6E8DF] pb-3">
              <span className="w-6 h-6 rounded-full bg-[#1F6F5F] text-white flex items-center justify-center text-xs font-bold">3</span>
              <h2 className="text-base font-bold text-[#222222]">Pricing and Pickup Schedule</h2>
            </div>

            {/* 12. Expected Selling Price & Benchmark */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label htmlFor="expected-price-input" className="text-xs font-bold text-[#222222] block">
                    Collector's Expected Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-[#555555]">
                    Enter your total expected selling price for the whole batch. Must be within the permitted fair range (₹{minTotalVal.toLocaleString()} – ₹{maxTotalVal.toLocaleString()}).
                  </p>
                </div>
                <button
                  type="button"
                  id="set-fair-baseline-btn"
                  onClick={() => {
                    const fairEstimate = Math.round(displayBenchmark * parsedWeight);
                    setExpectedPrice(String(fairEstimate));
                    setIsOpenToMarket(false);
                    setIsCustomPrice(false);
                  }}
                  className="text-[11px] font-bold text-[#1F6F5F] hover:text-[#2FA084] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Set Fair Baseline (₹{Math.round(displayBenchmark * parsedWeight).toLocaleString()})</span>
                </button>
              </div>

              {/* Open to Market Bids option */}
              <div className="flex items-center gap-2.5 p-3 bg-gray-50 border-2 border-[#D6E8DF] rounded-lg">
                <input
                  id="open-to-market-checkbox"
                  type="checkbox"
                  checked={isOpenToMarket}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsOpenToMarket(checked);
                    if (checked) {
                      setIsCustomPrice(true);
                    }
                  }}
                  className="w-4 h-4 text-[#1F6F5F] border-2 border-[#D6E8DF] rounded focus:ring-[#1F6F5F] cursor-pointer"
                />
                <label htmlFor="open-to-market-checkbox" className="text-xs font-bold text-[#222222] cursor-pointer select-none">
                  Open to Market Bids <span className="text-[11px] font-normal text-[#555555]">(Allow authorized recyclers to submit competitive offers without an asking price)</span>
                </label>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#555555]">₹</span>
                <input
                  id="expected-price-input"
                  type="number"
                  min={minTotalVal}
                  max={maxTotalVal}
                  step="any"
                  disabled={isOpenToMarket}
                  value={isOpenToMarket ? '' : expectedPrice}
                  placeholder={isOpenToMarket ? 'Open to Market Bids mode active' : `Enter amount between ₹${minTotalVal.toLocaleString()} and ₹${maxTotalVal.toLocaleString()}`}
                  onChange={(e) => {
                    setExpectedPrice(e.target.value);
                    setIsCustomPrice(true);
                  }}
                  className={`w-full bg-white border-2 ${
                    isOpenToMarket
                      ? 'border-[#D6E8DF] bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isPriceInvalid
                        ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500'
                        : 'border-[#6FCF97] focus:border-[#1F6F5F] ring-1 ring-[#6FCF97]'
                  } rounded-lg pl-8 pr-4 py-3 text-sm font-bold text-[#222222] focus:outline-none transition-colors`}
                />
              </div>

              {/* Immediate Validation Messages */}
              {!isOpenToMarket && isPriceInvalid && (
                <div id="price-validation-error" className="flex items-start gap-1.5 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-xs font-bold text-red-700">
                  <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Price Outside Permitted Range: Your expected selling price must be between ₹{minTotalVal.toLocaleString()} and ₹{maxTotalVal.toLocaleString()} to register this waste lot.</p>
                    <p className="text-[11px] font-normal text-red-600 mt-0.5">
                      {isPriceBelowMin 
                        ? `Entered amount ₹${parsedPrice.toLocaleString()} is below the minimum permitted price of ₹${minTotalVal.toLocaleString()}.` 
                        : isPriceAboveMax 
                          ? `Entered amount ₹${parsedPrice.toLocaleString()} is above the maximum permitted price of ₹${maxTotalVal.toLocaleString()}.`
                          : `Please enter a valid price within the fair benchmark range.`}
                    </p>
                  </div>
                </div>
              )}

              {!isOpenToMarket && isPriceValid && (
                <div id="price-validation-success" className="flex items-center gap-1.5 p-3 bg-green-50 border-2 border-[#6FCF97] rounded-lg text-xs font-bold text-[#1F6F5F]">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
                  <span>Price Accepted: Your expected selling price is within the permitted fair range (₹{minTotalVal.toLocaleString()} – ₹{maxTotalVal.toLocaleString()}).</span>
                </div>
              )}

              {isOpenToMarket && (
                <div id="price-validation-market" className="flex items-center gap-1.5 p-3 bg-[#EFF8F2] border-2 border-[#B8D9C8] rounded-lg text-xs font-bold text-[#1F6F5F]">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
                  <span>Open to Market Bids: This lot will be listed without a fixed price, allowing verified recyclers to submit competitive market bids.</span>
                </div>
              )}

              {fieldErrors.expectedPrice && !isPriceInvalid && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.expectedPrice}</p>
              )}

              {/* Fair Benchmark Transparency Cards */}
              <div className="p-4 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F6F5F] flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> EcoLink Fair Pricing Reference Engine
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] px-2 py-0.5 rounded">
                    Tolerance: ±{displayTolerance}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border-2 border-[#D6E8DF]">
                    <span className="text-[10px] uppercase font-bold text-[#555555] block">CPCB Reference Rate</span>
                    <span className="text-sm font-bold text-[#222222]">₹{displayBenchmark} / kg</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border-2 border-[#D6E8DF]">
                    <span className="text-[10px] uppercase font-bold text-[#555555] block">Fair Range (Total)</span>
                    <span className="text-sm font-bold text-[#1F6F5F]">₹{minTotalVal.toLocaleString()} – ₹{maxTotalVal.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border-2 border-[#D6E8DF]">
                    <span className="text-[10px] uppercase font-bold text-[#555555] block">Effective Unit Rate</span>
                    <span className="text-sm font-bold text-[#222222]">
                      {isOpenToMarket 
                        ? 'Market Bids' 
                        : `₹${parsedWeight > 0 && hasEnteredPrice ? (parsedPrice / parsedWeight).toFixed(1) : '0'} / kg`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border-2 border-[#D6E8DF] text-xs">
                  <span className="font-bold text-[#222222]">Expected Price Status:</span>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold border-2 ${
                    isOpenToMarket
                      ? 'border-[#1F6F5F] text-[#1F6F5F] bg-[#EFF8F2]'
                      : isPriceValid 
                        ? 'border-[#6FCF97] text-[#1F6F5F] bg-green-50' 
                        : 'border-red-400 text-red-700 bg-red-50'
                  }`}>
                    {isOpenToMarket 
                      ? 'OPEN TO MARKET BIDS' 
                      : isPriceValid 
                        ? 'PRICE ACCEPTED (Within Fair Range) ✅' 
                        : 'PRICE OUTSIDE PERMITTED RANGE ❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* 13. Preferred Pickup Date / Time */}
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">
                Preferred Pickup Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                min={getMinDateTime()}
                value={preferredPickupDate}
                onChange={(e) => setPreferredPickupDate(e.target.value)}
                className={`w-full bg-white border-2 ${fieldErrors.preferredPickupDate ? 'border-red-400' : 'border-[#D6E8DF]'} rounded-lg px-4 py-3 text-xs font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none`}
              />
              {fieldErrors.preferredPickupDate && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.preferredPickupDate}</p>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: IMAGES AND ADDITIONAL NOTES */}
          {/* ======================================================== */}
          <div className="bg-white p-6 rounded-lg border-2 border-[#D6E8DF] space-y-5">
            <div className="flex items-center gap-2 border-b-2 border-[#D6E8DF] pb-3">
              <span className="w-6 h-6 rounded-full bg-[#1F6F5F] text-white flex items-center justify-center text-xs font-bold">4</span>
              <h2 className="text-base font-bold text-[#222222]">Images and Additional Notes</h2>
            </div>

            {/* 7. Waste Images Upload Dropzone */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#222222] block">
                Waste Images / Verification Photos
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D6E8DF] hover:border-[#1F6F5F] transition rounded-lg p-6 bg-[#F5FBF7] text-center cursor-pointer space-y-2"
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#222222]">
                    Click or drag & drop photos here to upload
                  </p>
                  <p className="text-[11px] text-[#555555]">
                    Supports JPG, JPEG, PNG, WEBP (Max 5MB per image)
                  </p>
                </div>
              </div>

              {imageUploadError && (
                <p className="text-xs text-red-600 font-bold">{imageUploadError}</p>
              )}

              {/* Thumbnails preview list */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img) => (
                    <div 
                      key={img.id}
                      className="relative rounded-lg border-2 border-[#D6E8DF] overflow-hidden bg-white p-1.5 group"
                    >
                      <img 
                        src={img.url} 
                        alt={img.name} 
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="p-1 text-[10px] truncate text-[#555555] font-semibold">
                        {img.name} ({img.size} MB)
                      </div>

                      {img.isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Uploading...</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md shadow transition cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 14. Additional Notes */}
            <div>
              <label className="text-xs font-bold text-[#222222] block mb-1">
                Additional Notes / Special Instructions
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention loading dock clearance, packaging details, forklift requirement, or gate pass instructions..."
                className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg p-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t-2 border-[#D6E8DF] flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/collector/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-[#555555] hover:text-[#222222] transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="register-waste-submit-btn"
              disabled={isSubmitting || (!isOpenToMarket && isPriceInvalid)}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1F6F5F] hover:bg-[#2FA084] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Waste Batch in Supabase...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register Waste Batch & Broadcast to Recyclers</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
