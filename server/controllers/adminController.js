import { supabase } from '../config/supabase.js';
import { verifyRecyclerFacility, rejectRecyclerFacility } from '../services/verificationService.js';

/**
 * Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */
export async function getDashboardStats(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    // 1. Collectors count
    const { count: totalCollectors } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'collector');

    // 2. Recyclers count
    const { count: totalRecyclers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'recycler');

    // 3. Verified recyclers count
    const { count: verifiedRecyclers } = await supabase
      .from('recycler_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'VERIFIED');

    // 4. Pending verifications count
    const { count: pendingVerifications } = await supabase
      .from('recycler_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    // 5. Active lots count
    const { count: activeLots } = await supabase
      .from('waste_lots')
      .select('*', { count: 'exact', head: true })
      .in('status', ['AWAITING_OFFERS', 'OFFERS_RECEIVED', 'OFFER_ACCEPTED', 'PICKUP_SCHEDULED']);

    // 6. Completed lots count
    const { count: completedLots } = await supabase
      .from('waste_lots')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');

    // 7. Total waste weight
    const { data: lotsWeightData } = await supabase
      .from('waste_lots')
      .select('quantity');

    const totalWasteKg = (lotsWeightData || []).reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);

    // 8. Total transaction volume
    const { data: txAmountData } = await supabase
      .from('transactions')
      .select('amount');

    const totalTxVolume = (txAmountData || []).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    // 9. Abnormal / flagged offers count
    const { count: abnormalOffersCount } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .in('price_status', ['BELOW_FAIR_RANGE', 'ABOVE_FAIR_RANGE']);

    return res.status(200).json({
      success: true,
      data: {
        totalCollectors: totalCollectors || 0,
        totalRecyclers: totalRecyclers || 0,
        verifiedRecyclers: verifiedRecyclers || 0,
        pendingVerifications: pendingVerifications || 0,
        activeLots: activeLots || 0,
        completedLots: completedLots || 0,
        totalWasteWeightKg: totalWasteKg,
        totalWasteKg: totalWasteKg,
        transactionVolume: totalTxVolume,
        totalTxValue: totalTxVolume,
        abnormalOffers: abnormalOffersCount || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get All Collectors (Admin only)
 * GET /api/admin/collectors
 */
export async function getCollectors(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const { data: collectors, error: colErr } = await supabase
      .from('profiles')
      .select(`
        *,
        waste_lots(id, quantity, status)
      `)
      .eq('role', 'collector')
      .order('created_at', { ascending: false });

    if (colErr) throw new Error(colErr.message);

    const formatted = (collectors || []).map(c => {
      const lots = c.waste_lots || [];
      const totalVolume = lots.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);
      return {
        id: c.id,
        name: c.full_name,
        company: c.full_name,
        email: c.email,
        phone: c.phone,
        location: (c.location && c.location !== 'Chennai Hub') ? c.location : 'Not Specified',
        totalLotsDeclared: lots.length,
        volumeDeclared: `${totalVolume} kg`,
        volumeDeclaredKg: totalVolume,
        phone_verified: true,
        phoneVerified: true,
        isActive: c.is_active,
        createdAt: c.created_at
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
 * Get All Recyclers (Admin only)
 * GET /api/admin/recyclers
 */
export async function getRecyclers(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const { data: recyclers, error: recErr } = await supabase
      .from('recycler_profiles')
      .select(`
        *,
        profile:profiles!recycler_profiles_user_id_fkey(full_name, email, phone, location, is_active)
      `)
      .order('created_at', { ascending: false });

    if (recErr) throw new Error(recErr.message);

    const formatted = (recyclers || []).map(r => ({
      id: r.user_id || r.id,
      dbId: r.id,
      userId: r.user_id,
      name: r.facility_name,
      companyName: r.facility_name,
      contactPerson: r.profile?.full_name || 'Authorized Representative',
      email: r.profile?.email,
      phone: r.profile?.phone,
      location: r.facility_address || r.profile?.location || 'Tamil Nadu',
      registrationNumber: r.cpcb_reg_number,
      cpcbRegistrationNo: r.cpcb_reg_number,
      cpcbRegistrationNumber: r.cpcb_reg_number,
      cpcbStatus: r.status,
      verificationStatus: r.status,
      isPlatformVerified: r.status === 'VERIFIED',
      acceptedCategories: r.categories || [],
      monthlyCapacity: `${r.monthly_capacity_kg || 0} kg/mo`,
      capacityUtilization: 0,
      createdAt: r.created_at
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Verification Queue & Flagged Offers
 * GET /api/admin/verifications
 */
export async function getVerifications(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    // 1. Pending recycler applications
    const { data: pendingRecyclers, error: pErr } = await supabase
      .from('recycler_profiles')
      .select(`
        *,
        profile:profiles!recycler_profiles_user_id_fkey(full_name, email, phone, location)
      `)
      .eq('status', 'PENDING');

    if (pErr) throw new Error(pErr.message);

    // 2. Flagged abnormal offers
    const { data: flaggedOffers, error: fErr } = await supabase
      .from('offers')
      .select(`
        *,
        waste_lots(lot_id, category, material_type),
        recycler:profiles!offers_recycler_id_fkey(
          full_name, 
          recycler_profiles(facility_name)
        )
      `)
      .in('price_status', ['BELOW_FAIR_RANGE', 'ABOVE_FAIR_RANGE'])
      .eq('status', 'PENDING');

    if (fErr) throw new Error(fErr.message);

    const formattedPendingRecyclers = (pendingRecyclers || []).map(r => ({
      id: r.user_id,
      companyName: r.facility_name,
      contactPerson: r.profile?.full_name,
      phone: r.profile?.phone,
      email: r.profile?.email,
      location: r.facility_address || r.profile?.location || 'Tamil Nadu',
      cpcbRegistrationNo: r.cpcb_reg_number,
      cpcbStatus: r.status,
      verificationStatus: r.status
    }));

    const formattedFlaggedOffers = (flaggedOffers || []).map(f => {
      const orgName = f.recycler?.recycler_profiles?.[0]?.organization_name || f.recycler?.full_name || 'Recycler';
      return {
        id: f.offer_id || f.id,
        dbId: f.id,
        lotId: f.waste_lots?.lot_id,
        recyclerName: orgName,
        material: f.waste_lots?.material_type || f.waste_lots?.category,
        offeredPricePerKg: f.rate_per_kg,
        benchmarkRate: f.benchmark_price,
        minFairPrice: f.lower_limit,
        maxFairPrice: f.upper_limit,
        priceStatus: f.price_status,
        issue: f.price_status === 'BELOW_FAIR_RANGE'
          ? `Offer (₹${f.rate_per_kg}/kg) is below minimum fair threshold of ₹${f.lower_limit}/kg`
          : `Offer (₹${f.rate_per_kg}/kg) is above maximum fair threshold of ₹${f.upper_limit}/kg`
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        pendingRecyclers: formattedPendingRecyclers,
        flaggedOffers: formattedFlaggedOffers
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify Recycler Facility (Admin only)
 * POST /api/admin/recyclers/:id/verify
 */
export async function verifyRecycler(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const result = await verifyRecyclerFacility({
      recyclerUserId: id,
      adminId
    });

    return res.status(200).json({
      success: true,
      message: 'Recycler facility approved and verified successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reject Recycler Facility (Admin only)
 * POST /api/admin/recyclers/:id/reject
 */
export async function rejectRecycler(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { reason } = req.body;

    const result = await rejectRecyclerFacility({
      recyclerUserId: id,
      adminId,
      reason
    });

    return res.status(200).json({
      success: true,
      message: 'Recycler application rejected.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel/Reject Abnormal Offer (Admin only)
 * POST /api/admin/offers/:id/cancel
 */
export async function cancelAbnormalOffer(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database client is unavailable' });

    const { id } = req.params;

    let query = supabase.from('offers').update({ status: 'CANCELLED', updated_at: new Date().toISOString() });
    if (id.startsWith('OFF-')) {
      query = query.eq('offer_id', id);
    } else {
      query = query.or(`id.eq.${id},offer_id.eq.${id}`);
    }

    const { data: cancelledOffer, error: cErr } = await query.select().single();
    if (cErr) throw new Error(cErr.message);

    return res.status(200).json({
      success: true,
      message: 'Flagged offer has been cancelled by administrator.',
      data: cancelledOffer
    });
  } catch (err) {
    next(err);
  }
}
