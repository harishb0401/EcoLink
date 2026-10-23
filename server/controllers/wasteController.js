import { supabase } from '../config/supabase.js';
import { generateLotId, generateEventId } from '../utils/generateId.js';
import { classifyEWaste, calculateFairPriceRange } from '../services/pricingService.js';
import { matchLotsToRecycler } from '../services/matchingService.js';

/**
 * Upload Waste Image to Supabase Storage
 * POST /api/waste/upload-image
 */
export async function uploadWasteImage(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database/Storage client is unavailable' });

    const collectorId = req.user.id;
    const { imageBase64, filename, contentType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const detectedType = (contentType || 'image/jpeg').toLowerCase();
    if (!allowedTypes.includes(detectedType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.' 
      });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image size exceeds the 5MB limit.' 
      });
    }

    const ext = detectedType === 'image/png' ? 'png' : detectedType === 'image/webp' ? 'webp' : 'jpg';
    const cleanName = (filename || 'image').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `${collectorId}/${Date.now()}_${cleanName}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('waste-images')
      .upload(filePath, buffer, {
        contentType: detectedType,
        upsert: true
      });

    if (uploadErr) {
      throw new Error(`Supabase Storage upload failed: ${uploadErr.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('waste-images')
      .getPublicUrl(filePath);

    return res.status(200).json({
      success: true,
      data: {
        path: filePath,
        url: publicData.publicUrl,
        filename: `${cleanName}.${ext}`
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Waste Lot (Collector only)
 * POST /api/waste
 */
export async function createWasteLot(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const collectorId = req.user.id;
    const {
      clientOperationId,
      category,
      categoryOther,
      material,
      materialType,
      description,
      quantity,
      unit = 'kg',
      totalWeightKg,
      condition = 'Non-working / Scrap',
      notes,
      location,
      locationText,
      collectionAddress,
      cityDistrict,
      storageCondition,
      storageConditionDetails,
      hazardousCondition,
      hazardousConditionDetails,
      hazardousAssessmentStatus,
      batteryPhysicalState,
      batteryType,
      expectedPrice,
      preferredPickupDate,
      imageUrls = [],
      latitude,
      longitude
    } = req.body;

    const isMarketBidsMode = req.body.isOpenToMarket === true || req.body.pricingMode === 'MARKET_BIDS';

    // Quantity is optional (fill if needed, not compulsory)
    const parsedQuantity = (quantity !== undefined && quantity !== null && quantity !== '')
      ? parseFloat(quantity)
      : null;
    if (parsedQuantity !== null && (isNaN(parsedQuantity) || parsedQuantity <= 0)) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0 if provided' });
    }

    // Total weight is separate and required
    const parsedWeight = parseFloat(totalWeightKg) || (parsedQuantity !== null ? parsedQuantity : 0);
    if (!parsedWeight || parsedWeight <= 0) {
      return res.status(400).json({ success: false, message: 'Total weight is required and must be greater than 0' });
    }

    const parsedExpectedPrice = (expectedPrice !== undefined && expectedPrice !== null && expectedPrice !== '')
      ? parseFloat(expectedPrice)
      : null;

    if (!isMarketBidsMode && (parsedExpectedPrice !== null && parsedExpectedPrice < 0)) {
      return res.status(400).json({ success: false, message: 'Expected price cannot be negative' });
    }

    const finalCategory = (category === 'Other' && categoryOther) ? categoryOther : (category || 'Other');
    const finalMaterial = material || categoryOther || finalCategory;

    let finalAddress = collectionAddress || locationText || location || '';
    if (!finalAddress && collectorId) {
      try {
        const { data: userProfile } = await supabase.from('profiles').select('location').eq('id', collectorId).maybeSingle();
        if (userProfile?.location && userProfile.location !== 'Chennai Hub') {
          finalAddress = userProfile.location;
        }
      } catch (err) {
        console.warn('Could not query collector profile location:', err.message);
      }
    }
    const finalLocation = (cityDistrict && finalAddress) ? `${finalAddress}, ${cityDistrict}` : (finalAddress || cityDistrict || 'Location Pending');

    // 1. Authoritative server-side classification and pricing calculation
    const classification = classifyEWaste(finalMaterial || finalCategory);
    const clientBenchmark = parseFloat(req.body.benchmarkPrice);
    const clientTolerance = parseFloat(req.body.tolerance);
    const resolvedBenchmark = (clientBenchmark && clientBenchmark > 0) ? clientBenchmark : (classification.benchmarkPrice || 350);
    const resolvedTolerance = (clientTolerance && clientTolerance > 0) ? (clientTolerance > 1 ? clientTolerance / 100 : clientTolerance) : (classification.tolerance || 0.25);
    const pricingRange = calculateFairPriceRange(resolvedBenchmark, resolvedTolerance, parsedWeight);
    const calculatedEstimatedValue = Math.round(resolvedBenchmark * parsedWeight);

    const minTotalVal = Math.round(pricingRange.lowerLimit * parsedWeight);
    const maxTotalVal = Math.round(pricingRange.upperLimit * parsedWeight);

    // STRICT PRICE VALIDATION (Collector Expected Selling Price)
    if (!isMarketBidsMode) {
      if (parsedExpectedPrice === null || isNaN(parsedExpectedPrice)) {
        return res.status(400).json({
          success: false,
          message: `Your expected selling price must be between ₹${minTotalVal.toLocaleString()} and ₹${maxTotalVal.toLocaleString()} to register this waste lot.`
        });
      }

      if (parsedExpectedPrice < minTotalVal || parsedExpectedPrice > maxTotalVal) {
        return res.status(400).json({
          success: false,
          message: `Your expected selling price must be between ₹${minTotalVal.toLocaleString()} and ₹${maxTotalVal.toLocaleString()} to register this waste lot.`,
          error: 'PRICE_OUTSIDE_PERMITTED_RANGE',
          allowedPriceRange: {
            minPrice: pricingRange.lowerLimit,
            maxPrice: pricingRange.upperLimit,
            minTotalVal,
            maxTotalVal
          }
        });
      }
    }

    const finalStoredPrice = isMarketBidsMode ? 0 : parsedExpectedPrice;

    // Structured description incorporating all details
    const detailLines = [
      description ? description.trim() : null,
      notes ? `[Notes: ${notes.trim()}]` : null,
      category === 'Other' && categoryOther ? `[Custom Item Type: ${categoryOther}]` : null,
      storageCondition ? `[Storage: ${storageCondition}${storageConditionDetails ? ` - ${storageConditionDetails}` : ''}]` : null,
      hazardousCondition ? `[Hazardous Assessment: ${hazardousCondition}${hazardousConditionDetails ? ` | ${hazardousConditionDetails}` : ''}]` : null,
      hazardousAssessmentStatus ? `[Hazard Verification: ${hazardousAssessmentStatus}]` : null,
      isMarketBidsMode ? '[Pricing Mode: Open to Market Bids]' : `[Expected Price: ₹${finalStoredPrice}]`,
      preferredPickupDate ? `[Preferred Pickup: ${preferredPickupDate}]` : null,
      clientOperationId ? `[OpId: ${clientOperationId}]` : null
    ].filter(Boolean);
    const finalDescription = detailLines.join('\n');

    const sanitizedImages = Array.isArray(imageUrls)
      ? imageUrls.filter(url => typeof url === 'string' && url.trim().length > 0)
      : [];

    // Idempotency check: if clientOperationId provided, check if this lot was already synced
    if (clientOperationId) {
      const { data: existingLot } = await supabase
        .from('waste_lots')
        .select('*')
        .eq('collector_id', collectorId)
        .ilike('description', `%[OpId: ${clientOperationId}]%`)
        .maybeSingle();

      if (existingLot) {
        const isLotMarket = existingLot.expected_price === 0 || (existingLot.description && existingLot.description.includes('Open to Market Bids'));
        return res.status(200).json({
          success: true,
          message: 'Lot already synchronized (idempotent)',
          data: {
            ...existingLot,
            id: existingLot.id,
            lotId: existingLot.lot_id,
            material: existingLot.material_type,
            location: existingLot.location,
            locationText: existingLot.location,
            totalWeightKg: existingLot.total_weight_kg || existingLot.quantity,
            benchmarkPrice: existingLot.benchmark_rate,
            estimatedLotValue: isLotMarket ? Math.round((existingLot.benchmark_rate || 0) * (existingLot.quantity || 0)) : (existingLot.expected_price || Math.round((existingLot.benchmark_rate || 0) * (existingLot.quantity || 0))),
            collectionAddress: existingLot.collection_address || existingLot.location,
            cityDistrict: existingLot.city_district || '',
            storageCondition: existingLot.storage_condition || 'Indoor storage',
            hazardousCondition: existingLot.hazardous_condition || 'No known batteries or hazardous materials',
            expectedPrice: isLotMarket ? 0 : (existingLot.expected_price !== undefined && existingLot.expected_price !== null ? parseFloat(existingLot.expected_price) : 0),
            isOpenToMarket: isLotMarket,
            preferredPickupDate: existingLot.preferred_pickup_date || existingLot.pickup_date,
            imageUrls: existingLot.image_urls || [],
            notes: existingLot.notes || ''
          }
        });
      }
    }

    // 2. Generate unique collision-safe Lot ID (format: EWL-2026-XXXXXX)
    let lotId = generateLotId();
    let collisionChecks = 0;
    while (collisionChecks < 5) {
      const { data: existingWithId } = await supabase
        .from('waste_lots')
        .select('id')
        .eq('lot_id', lotId)
        .maybeSingle();
      if (!existingWithId) break;
      lotId = generateLotId();
      collisionChecks++;
    }

    // Determine initial status:
    // Conforms to database enum lot_status ('AWAITING_OFFERS' represents available open lots)
    const initialStatus = 'AWAITING_OFFERS';

    // 3. Prepare Payloads (Base Schema + Extended Schema fallback)
    const basePayload = {
      lot_id: lotId,
      collector_id: collectorId,
      category: classification.category || finalCategory,
      material_type: finalMaterial,
      description: finalDescription,
      quantity: parsedQuantity !== null ? parsedQuantity : parsedWeight,
      unit: unit || 'kg',
      condition: condition || 'Non-working / Scrap',
      location: finalLocation,
      latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
      longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
      benchmark_rate: resolvedBenchmark,
      min_fair_price: pricingRange.lowerLimit,
      max_fair_price: pricingRange.upperLimit,
      expected_price: finalStoredPrice,
      status: initialStatus,
      image_urls: sanitizedImages,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const extendedPayload = {
      ...basePayload,
      total_weight_kg: parsedWeight,
      estimated_total_value: isMarketBidsMode ? calculatedEstimatedValue : finalStoredPrice,
      collection_address: finalAddress,
      city_district: cityDistrict || '',
      storage_condition: storageCondition || 'Indoor storage',
      hazardous_condition: hazardousCondition || 'Electronic components may contain hazardous substances; physical verification is required.',
      hazardous_condition_details: hazardousConditionDetails || '',
      hazardous_assessment_status: hazardousAssessmentStatus || 'REQUIRES_PHYSICAL_VERIFICATION',
      expected_price: finalStoredPrice,
      preferred_pickup_date: preferredPickupDate ? new Date(preferredPickupDate).toISOString() : null,
      notes: notes || ''
    };

    let newLot;
    const { data: extLot, error: extErr } = await supabase
      .from('waste_lots')
      .insert([extendedPayload])
      .select()
      .single();

    if (extErr) {
      // If error is due to missing columns before Supabase SQL migration is run, fallback to base columns
      if (extErr.code === 'PGRST204' || extErr.message?.includes('column')) {
        const { data: fallbackLot, error: fbErr } = await supabase
          .from('waste_lots')
          .insert([basePayload])
          .select()
          .single();
        if (fbErr) throw new Error(fbErr.message);
        newLot = { ...fallbackLot, ...extendedPayload };
      } else {
        throw new Error(extErr.message);
      }
    } else {
      newLot = extLot;
    }

    // 4. Insert timeline event
    await supabase.from('lot_timeline').insert([
      {
        lot_id: newLot.id,
        event_type: 'CREATED',
        title: 'Waste Lot Registered',
        description: `${parsedQuantity || parsedWeight} ${unit} (${parsedWeight} kg) ${finalMaterial} declared. Benchmark ₹${resolvedBenchmark}/${unit} (Fair Range ₹${pricingRange.lowerLimit}–₹${pricingRange.upperLimit}/${unit}). Expected: ${isMarketBidsMode ? 'Open to Market Bids' : `₹${finalStoredPrice}`}.`,
        created_at: new Date().toISOString()
      },
      {
        lot_id: newLot.id,
        event_type: 'CLASSIFIED',
        title: 'Automatic Material Classification',
        description: `Categorized as ${finalCategory} (${classification.hazardLevel || 'Medium'} Hazard Level)`,
        created_at: new Date().toISOString()
      }
    ]);

    return res.status(201).json({
      success: true,
      data: {
        ...newLot,
        id: newLot.id,
        lotId: newLot.lot_id,
        material: newLot.material_type,
        location: newLot.location,
        locationText: newLot.location,
        totalWeightKg: newLot.total_weight_kg || parsedWeight,
        benchmarkPrice: newLot.benchmark_rate,
        estimatedLotValue: isMarketBidsMode ? Math.round((newLot.benchmark_rate || 0) * (parsedWeight || 0)) : finalStoredPrice,
        collectionAddress: newLot.collection_address || finalAddress,
        cityDistrict: newLot.city_district || cityDistrict || '',
        storageCondition: newLot.storage_condition || storageCondition || 'Indoor storage',
        hazardousCondition: newLot.hazardous_condition || hazardousCondition || 'No known batteries or hazardous materials',
        expectedPrice: isMarketBidsMode ? 0 : (newLot.expected_price !== undefined && newLot.expected_price !== null ? parseFloat(newLot.expected_price) : finalStoredPrice),
        isOpenToMarket: isMarketBidsMode,
        preferredPickupDate: newLot.preferred_pickup_date || preferredPickupDate,
        imageUrls: newLot.image_urls || sanitizedImages,
        notes: newLot.notes || notes || '',
        allowedPriceRange: {
          minPrice: newLot.min_fair_price,
          maxPrice: newLot.max_fair_price,
          minTotalVal,
          maxTotalVal,
          rangeLabel: `₹${newLot.min_fair_price}–₹${newLot.max_fair_price}/${newLot.unit}`
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get My Waste Lots (Collector only)
 * GET /api/waste/my
 */
export async function getMyWasteLots(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const collectorId = req.user.id;

    // Fetch lots along with offers and timeline
    const { data: lots, error: lotsErr } = await supabase
      .from('waste_lots')
      .select(`
        *,
        lot_timeline(*),
        offers(*)
      `)
      .eq('collector_id', collectorId)
      .order('created_at', { ascending: false });

    if (lotsErr) throw new Error(lotsErr.message);

    // Format for frontend consumption
    const formattedLots = (lots || []).map(lot => {
      const activeOffers = (lot.offers || []).filter(o => o.status !== 'CANCELLED');
      const benchmark = lot.benchmark_rate || 350;
      const weight = parseFloat(lot.total_weight_kg || lot.quantity) || 1;
      const isMarket = lot.expected_price === 0 || (lot.description && lot.description.includes('Open to Market Bids'));
      const storedPrice = lot.expected_price !== undefined && lot.expected_price !== null ? parseFloat(lot.expected_price) : 0;
      const estimatedVal = lot.estimated_total_value !== undefined && lot.estimated_total_value !== null
        ? lot.estimated_total_value
        : (isMarket ? Math.round(benchmark * weight) : (storedPrice > 0 ? storedPrice : Math.round(benchmark * weight)));

      return {
        ...lot,
        id: lot.lot_id, // Frontend uses lot_id (e.g. EWL-2026-XXXXXX) as primary id for routing
        dbId: lot.id,
        lotId: lot.lot_id,
        collectorId: lot.collector_id,
        material: lot.material_type || lot.category,
        location: lot.location,
        locationText: lot.location,
        quantity: lot.quantity,
        unit: lot.unit || 'kg',
        totalWeightKg: lot.total_weight_kg || lot.quantity,
        benchmarkPrice: benchmark,
        benchmarkRate: benchmark,
        estimatedLotValue: estimatedVal,
        estimatedTotalValue: estimatedVal,
        collectionAddress: lot.collection_address || lot.location,
        cityDistrict: lot.city_district || '',
        storageCondition: lot.storage_condition || 'Indoor storage',
        hazardousCondition: lot.hazardous_condition || 'No known batteries or hazardous materials',
        expectedPrice: storedPrice,
        isOpenToMarket: isMarket,
        preferredPickupDate: lot.preferred_pickup_date || lot.pickup_date,
        imageUrls: lot.image_urls || [],
        notes: lot.notes || '',
        status: lot.status,
        createdAt: lot.created_at,
        createdDate: lot.created_at ? new Date(lot.created_at).toLocaleString('en-IN') : 'Recent',
        allowedPriceRange: {
          minPrice: lot.min_fair_price,
          maxPrice: lot.max_fair_price,
          rangeLabel: `₹${lot.min_fair_price}–₹${lot.max_fair_price}/${lot.unit || 'kg'}`
        },
        offersCount: activeOffers.length,
        offers: activeOffers,
        timeline: (lot.lot_timeline || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedLots
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Available Waste Lots for Recyclers
 * GET /api/waste/available
 */
export async function getAvailableWasteLots(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    // Fetch recycler profile
    let recyclerProfile = null;
    const { data: recData } = await supabase
      .from('recycler_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    recyclerProfile = recData;

    // Query native database lot_status enum values for open collector requests
    const eligibleStatuses = ['AWAITING_OFFERS', 'OFFERS_RECEIVED'];

    // Attempt select with profiles join; fallback to plain query if foreign-key alias fails
    let openLots = [];
    const queryWithJoin = await supabase
      .from('waste_lots')
      .select(`
        *,
        profiles!waste_lots_collector_id_fkey(full_name, phone, location)
      `)
      .in('status', eligibleStatuses)
      .order('created_at', { ascending: false });

    if (queryWithJoin.error) {
      console.warn('Joined query note (using direct query fallback):', queryWithJoin.error.message);
      const queryDirect = await supabase
        .from('waste_lots')
        .select('*')
        .in('status', eligibleStatuses)
        .order('created_at', { ascending: false });

      if (queryDirect.error) throw new Error(queryDirect.error.message);
      openLots = queryDirect.data || [];
    } else {
      openLots = queryWithJoin.data || [];
    }

    // Run matching engine
    const matchedLots = matchLotsToRecycler(openLots || [], recyclerProfile);

    // Format for frontend
    const formatted = matchedLots.map(lot => {
      const benchmark = lot.benchmark_rate || 350;
      const weight = parseFloat(lot.total_weight_kg || lot.quantity) || 1;
      const isMarket = lot.expected_price === 0 || (lot.description && lot.description.includes('Open to Market Bids'));
      const storedPrice = lot.expected_price !== undefined && lot.expected_price !== null ? parseFloat(lot.expected_price) : 0;
      const estimatedVal = lot.estimated_total_value !== undefined && lot.estimated_total_value !== null
        ? lot.estimated_total_value
        : (isMarket ? Math.round(benchmark * weight) : (storedPrice > 0 ? storedPrice : Math.round(benchmark * weight)));

      return {
        ...lot,
        id: lot.lot_id,
        dbId: lot.id,
        lotId: lot.lot_id,
        collectorId: lot.collector_id,
        category: lot.category,
        material: lot.material_type || lot.category,
        location: lot.location,
        locationText: lot.location,
        quantity: lot.quantity,
        unit: lot.unit || 'kg',
        totalWeightKg: lot.total_weight_kg || lot.quantity,
        benchmarkPrice: benchmark,
        benchmarkRate: benchmark,
        estimatedLotValue: estimatedVal,
        estimatedTotalValue: estimatedVal,
        expectedPrice: storedPrice,
        isOpenToMarket: isMarket,
        collectionAddress: lot.collection_address || lot.location,
        cityDistrict: lot.city_district || '',
        storageCondition: lot.storage_condition || 'Indoor storage',
        hazardousCondition: lot.hazardous_condition || 'Electronic components may contain hazardous substances; physical verification is required.',
        hazardousConditionDetails: lot.hazardous_condition_details || '',
        hazardousAssessmentStatus: lot.hazardous_assessment_status || 'REQUIRES_PHYSICAL_VERIFICATION',
        preferredPickupDate: lot.preferred_pickup_date || lot.pickup_date,
        imageUrls: lot.image_urls || [],
        notes: lot.notes || '',
        status: lot.status,
        createdAt: lot.created_at,
        createdDate: lot.created_at ? new Date(lot.created_at).toLocaleString('en-IN') : 'Recent',
        collectorName: lot.profiles?.full_name || 'Registered Collector',
        collectorPhone: lot.profiles?.phone
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Specific Waste Lot by ID
 * GET /api/waste/:lotId
 */
export async function getWasteLotById(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const { lotId } = req.params;

    // Support lookup by UUID or human lot_id (EWL-... or REQ-...)
    let query = supabase
      .from('waste_lots')
      .select(`
        *,
        lot_timeline(*),
        offers(*),
        profiles!waste_lots_collector_id_fkey(full_name, email, phone, location)
      `);

    const isHumanId = lotId.includes('-') && (lotId.startsWith('REQ-') || lotId.startsWith('EWL-'));
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lotId);

    if (isHumanId) {
      query = query.eq('lot_id', lotId);
    } else if (isUUID) {
      query = query.or(`id.eq.${lotId},lot_id.eq.${lotId}`);
    } else {
      query = query.eq('lot_id', lotId);
    }

    const { data: lot, error: lotErr } = await query.maybeSingle();

    if (lotErr || !lot) {
      return res.status(404).json({ success: false, message: 'Waste lot not found' });
    }

    // Role verification: Collectors can only view their own lots
    if (req.user.role === 'collector' && lot.collector_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access restricted to lot owner' });
    }

    const benchmark = lot.benchmark_rate || 350;
    const weight = parseFloat(lot.total_weight_kg || lot.quantity) || 1;
    const isMarket = lot.expected_price === 0 || (lot.description && lot.description.includes('Open to Market Bids'));
    const storedPrice = lot.expected_price !== undefined && lot.expected_price !== null ? parseFloat(lot.expected_price) : 0;
    const estimatedVal = lot.estimated_total_value !== undefined && lot.estimated_total_value !== null
      ? lot.estimated_total_value
      : (isMarket ? Math.round(benchmark * weight) : (storedPrice > 0 ? storedPrice : Math.round(benchmark * weight)));

    const formatted = {
      ...lot,
      id: lot.lot_id,
      dbId: lot.id,
      lotId: lot.lot_id,
      collectorId: lot.collector_id,
      material: lot.material_type || lot.category,
      category: lot.category,
      location: lot.location,
      locationText: lot.location,
      quantity: lot.quantity,
      unit: lot.unit || 'kg',
      totalWeightKg: lot.total_weight_kg || lot.quantity,
      benchmarkPrice: benchmark,
      benchmarkRate: benchmark,
      estimatedLotValue: estimatedVal,
      estimatedTotalValue: estimatedVal,
      expectedPrice: storedPrice,
      isOpenToMarket: isMarket,
      collectionAddress: lot.collection_address || lot.location,
      cityDistrict: lot.city_district || '',
      storageCondition: lot.storage_condition || 'Indoor storage',
      hazardousCondition: lot.hazardous_condition || 'Electronic components may contain hazardous substances; physical verification is required.',
      hazardousConditionDetails: lot.hazardous_condition_details || '',
      hazardousAssessmentStatus: lot.hazardous_assessment_status || 'REQUIRES_PHYSICAL_VERIFICATION',
      preferredPickupDate: lot.preferred_pickup_date || lot.pickup_date,
      imageUrls: lot.image_urls || [],
      notes: lot.notes || '',
      status: lot.status,
      createdAt: lot.created_at,
      createdDate: lot.created_at ? new Date(lot.created_at).toLocaleString('en-IN') : 'Recent',
      collectorName: lot.profiles?.full_name,
      allowedPriceRange: {
        minPrice: lot.min_fair_price,
        maxPrice: lot.max_fair_price,
        rangeLabel: `₹${lot.min_fair_price}–₹${lot.max_fair_price}/${lot.unit || 'kg'}`
      },
      timeline: (lot.lot_timeline || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      offers: (lot.offers || [])
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Offers for a specific Waste Lot (Collector only)
 * GET /api/waste/:lotId/offers
 */
export async function getWasteLotOffers(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const { lotId } = req.params;

    // Find the lot
    let lotQuery = supabase.from('waste_lots').select('id, lot_id, collector_id');
    if (lotId.startsWith('REQ-') || lotId.startsWith('EWL-')) {
      lotQuery = lotQuery.eq('lot_id', lotId);
    } else {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lotId);
      if (isUUID) {
        lotQuery = lotQuery.or(`id.eq.${lotId},lot_id.eq.${lotId}`);
      } else {
        lotQuery = lotQuery.eq('lot_id', lotId);
      }
    }

    const { data: lot, error: lotErr } = await lotQuery.maybeSingle();
    if (lotErr || !lot) {
      return res.status(404).json({ success: false, message: 'Waste lot not found' });
    }

    // Check ownership
    if (lot.collector_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the lot owner can view these offers' });
    }

    // Fetch offers with recycler profile
    const { data: offers, error: offersErr } = await supabase
      .from('offers')
      .select(`
        *,
        profiles!offers_recycler_id_fkey(
          full_name,
          email,
          phone,
          recycler_profiles(organization_name, cpcb_status, registration_number, cpcb_registration_number)
        )
      `)
      .eq('lot_id', lot.id)
      .order('created_at', { ascending: false });

    if (offersErr) throw new Error(offersErr.message);

    const formattedOffers = (offers || []).map(o => {
      const recProfile = o.profiles?.recycler_profiles?.[0] || o.profiles?.recycler_profiles;
      return {
        id: o.offer_id || o.id,
        dbId: o.id,
        offerId: o.offer_id,
        lotId: lot.lot_id,
        recyclerId: o.recycler_id,
        recyclerName: recProfile?.organization_name || o.profiles?.full_name || 'Verified Recycler',
        cpcbStatus: recProfile?.cpcb_status || 'VERIFIED',
        ratePerKg: o.rate_per_kg,
        pricePerUnit: o.rate_per_kg,
        totalPrice: o.total_amount,
        totalAmount: o.total_amount,
        pickupDate: o.pickup_date,
        proposedPickupDate: o.pickup_date ? new Date(o.pickup_date).toLocaleDateString() : 'Within 48h',
        priceStatus: o.price_status,
        distanceKm: o.distance_km,
        notes: o.notes,
        status: o.status,
        createdAt: o.created_at
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedOffers
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel Waste Lot (Collector only)
 * POST /api/waste/:lotId/cancel
 */
export async function cancelWasteLot(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const { lotId } = req.params;

    let lotQuery = supabase.from('waste_lots').select('*');
    if (lotId.startsWith('REQ-')) {
      lotQuery = lotQuery.eq('lot_id', lotId);
    } else {
      lotQuery = lotQuery.or(`id.eq.${lotId},lot_id.eq.${lotId}`);
    }

    const { data: lot, error: lotErr } = await lotQuery.maybeSingle();
    if (lotErr || !lot) {
      return res.status(404).json({ success: false, message: 'Waste lot not found' });
    }

    if (lot.collector_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this lot' });
    }

    if (['COLLECTED', 'COMPLETED'].includes(lot.status)) {
      return res.status(400).json({ success: false, message: 'Completed waste lots cannot be cancelled' });
    }

    const { data: updatedLot, error: updateErr } = await supabase
      .from('waste_lots')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', lot.id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    await supabase.from('lot_timeline').insert([
      {
        lot_id: lot.id,
        event: 'CANCELLED',
        role: req.user.role,
        details: 'Waste lot request was cancelled by user',
        created_at: new Date().toISOString()
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Waste lot successfully cancelled',
      data: updatedLot
    });
  } catch (err) {
    next(err);
  }
}
