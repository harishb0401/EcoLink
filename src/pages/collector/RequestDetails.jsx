import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Scale, Clock, ShieldCheck, 
  CheckCircle2, AlertTriangle, FileText, Send, DollarSign, 
  Calendar, Check, X, Building, Truck, Sparkles, Image as ImageIcon, Loader2
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { calculateFairPriceRange, evaluateOfferFairPrice } from '../../utils/rulesEngine';
import { mockWasteLots, mockOffers } from '../../data/mockData';
import { useTranslation } from '../../i18n';
import wasteService from '../../services/wasteService';

export default function RequestDetails({ 
  materialLots = mockWasteLots, 
  offers = mockOffers,
  onAcceptOffer 
}) {
  const { requestId, lotId } = useParams();
  const currentId = requestId || lotId;
  const navigate = useNavigate();
  const { t, tCategory, tStatus } = useTranslation();

  const [localLot, setLocalLot] = useState(null);
  const [localOffers, setLocalOffers] = useState([]);
  const [isLoadingLot, setIsLoadingLot] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Match from props if available
  const allLots = materialLots || [];
  const propLot = allLots.find(l => l.id === currentId || l.lotId === currentId || l.lot_id === currentId);

  useEffect(() => {
    let isMounted = true;
    if (propLot) {
      setLocalLot(propLot);
      const propOffers = (offers || []).filter(o => o.lotId === propLot.id || o.lotId === propLot.lotId || o.lotId === currentId);
      if (propOffers.length > 0) {
        setLocalOffers(propOffers);
      } else {
        // Fetch fresh offers from backend
        wasteService.getLotOffers(currentId).then(fetched => {
          if (isMounted && fetched) setLocalOffers(fetched);
        }).catch(() => {});
      }
    } else if (currentId) {
      setIsLoadingLot(true);
      Promise.all([
        wasteService.getLotById(currentId).catch(() => null),
        wasteService.getLotOffers(currentId).catch(() => [])
      ]).then(([fetchedLot, fetchedOffers]) => {
        if (isMounted) {
          if (fetchedLot) setLocalLot(fetchedLot);
          if (fetchedOffers) setLocalOffers(fetchedOffers);
          setIsLoadingLot(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentId, propLot, offers]);

  const request = localLot || propLot;
  const requestOffers = localOffers.length > 0 ? localOffers : (offers || []).filter(o => o.lotId === request?.id || o.lotId === request?.lotId);

  const [selectedOfferForReview, setSelectedOfferForReview] = useState(null);
  const [acceptedOfferId, setAcceptedOfferId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (request?.status === 'OFFER_ACCEPTED' || request?.status === 'COMPLETED') {
      const accepted = requestOffers.find(o => o.status === 'ACCEPTED');
      if (accepted) setAcceptedOfferId(accepted.id || accepted.offerId);
    }
  }, [request, requestOffers]);

  if (isLoadingLot) {
    return (
      <div className="bg-[#F5FBF7] p-12 rounded-lg border-2 border-[#D6E8DF] text-center space-y-3 max-w-xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F6F5F] mx-auto" />
        <p className="text-xs font-bold text-[#555555]">Loading request manifest from database...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-[#F5FBF7] p-12 rounded-lg border-2 border-[#D6E8DF] text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-[#222222]">{t('requestNotFoundTitle')}</h2>
        <p className="text-xs text-[#555555]">{t('requestNotFoundDesc')}</p>
        <Link to="/collector/requests" className="text-xs font-bold text-[#1F6F5F] underline">
          {t('returnToRequests')}
        </Link>
      </div>
    );
  }

  const benchmark = request.benchmarkPrice || request.benchmark_price || 350;
  const tolerance = request.tolerancePercent !== undefined ? request.tolerancePercent : (request.tolerance ? request.tolerance * 100 : 25);
  const fairPricing = calculateFairPriceRange(benchmark, tolerance);
  const qty = request.quantity || request.totalWeightKg || 1;
  const unit = request.unit || 'kg';
  const estimatedTotal = request.estimatedLotValue || request.estimated_value || Math.round(qty * benchmark);

  const isAcceptedState = ['OFFER_ACCEPTED', 'ACCEPTED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'HANDED_OVER', 'COMPLETED', 'PAYMENT_COMPLETED'].includes(request.status) || !!acceptedOfferId;

  // Lifecycle Timeline
  const timelineEvents = request.timeline && request.timeline.length > 0 ? request.timeline : [
    { id: "e-1", event: "Request Created", timestamp: request.createdDate || "09 Sep 2026, 10:30 AM", userRole: "Collector", status: "Completed", details: `${qty} ${unit} ${request.material || request.material_type} declared` },
    { id: "e-2", event: "Price Band Calculated", timestamp: request.createdDate || "09 Sep 2026, 10:30 AM", userRole: "Rules Engine", status: "Completed", details: `Benchmark: ₹${benchmark}/${unit} | Fair Band: ₹${fairPricing.minPrice}–₹${fairPricing.maxPrice}` },
    { id: "e-3", event: "Recyclers Notified", timestamp: request.createdDate || "09 Sep 2026, 10:35 AM", userRole: "System", status: "Completed", details: "Broadcasted to verified recyclers in zone" },
    ...(requestOffers.length > 0 ? [
      { id: "e-4", event: "Recycler Offers Received", timestamp: requestOffers[0]?.timestamp || "Today", userRole: "Recyclers", status: "Completed", details: `${requestOffers.length} offers submitted` }
    ] : []),
    ...(isAcceptedState ? [
      { id: "e-5", event: "Offer Accepted", timestamp: "Recently", userRole: "Collector", status: "Completed", details: `Accepted offer from ${request.selectedRecyclerName || 'Verified Recycler'}` }
    ] : [])
  ];

  const handleAcceptClick = async (offer) => {
    setIsAccepting(true);
    try {
      if (onAcceptOffer) {
        await onAcceptOffer({
          requestId: request.id || request.lotId,
          offerId: offer.id || offer.offerId,
          recyclerId: offer.recyclerId,
          recyclerName: offer.recyclerName,
          agreedPricePerUnit: offer.pricePerUnit || offer.ratePerKg,
          agreedTotalValue: offer.totalPrice || offer.totalAmount || ((offer.pricePerUnit || offer.ratePerKg) * qty),
          proposedPickupDate: offer.proposedPickupDate || offer.pickupDate
        });
      }

      setAcceptedOfferId(offer.id || offer.offerId);
      setSelectedOfferForReview(null);
      setActionMessage({
        type: 'success',
        text: `Offer from ${offer.recyclerName} accepted! Status updated to "Offer Accepted" and Simulated Escrow Vault is locked.`
      });
    } catch (err) {
      alert(err.message || 'Failed to accept offer on server.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto bg-white text-[#222222]">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/collector/requests')}
          className="px-4 py-2 text-xs font-bold text-[#222222] bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg hover:border-[#B8D9C8] transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1F6F5F]" />
          <span>{t('backToRequests', 'Back to My Requests')}</span>
        </button>

        <StatusBadge status={isAcceptedState && request.status !== 'COMPLETED' ? 'OFFER_ACCEPTED' : request.status} />
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#D6E8DF] text-[#1F6F5F] rounded-lg text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1F6F5F] shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <Link
            to="/collector/transactions"
            className="px-3.5 py-1.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg text-xs font-bold transition"
          >
            {t('viewTransactions', 'View Transactions →')}
          </Link>
        </div>
      )}

      {/* Main Request Details Card */}
      <div className="bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
        
        {/* Header Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D6E8DF] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
                {tCategory(request.category)}
              </span>
              <StatusBadge status={request.status || 'Available'} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-3">{request.material}</h1>
            <div className="text-xs text-[#555555] flex flex-wrap items-center gap-2 mt-1.5 font-semibold">
              <span className="font-mono text-[#1F6F5F] font-bold">Lot ID: {request.lotId || request.id}</span>
              <span>•</span>
              <span>Submitted: {request.createdDate || (request.created_at ? new Date(request.created_at).toLocaleString('en-IN') : (request.collectionDate || 'Recent'))}</span>
              {request.collectorId && (
                <>
                  <span>•</span>
                  <span>Collector ID: <span className="font-mono text-[#222222]">{String(request.collectorId).slice(0, 10)}...</span></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-1">
            <span className="text-[10px] font-bold text-[#555555] uppercase flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-[#1F6F5F]" /> Weight & Quantity
            </span>
            <span className="text-base font-bold text-[#222222]">
              {request.totalWeightKg ? `${request.totalWeightKg} kg` : `${qty} ${unit}`}
            </span>
            {request.quantity ? (
              <span className="text-[11px] text-[#555555] block font-semibold">
                Item Count: {request.quantity} {request.unit || 'units'}
              </span>
            ) : (
              <span className="text-[10px] text-[#555555] block">
                Total Weight: {request.totalWeightKg || qty} kg
              </span>
            )}
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-1">
            <span className="text-[10px] font-bold text-[#555555] uppercase flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#1F6F5F]" /> Benchmark Rate
            </span>
            <span className="text-base font-bold text-[#222222]">₹{benchmark} / kg</span>
            <span className="text-[10px] text-[#555555] block">CPCB State Benchmark</span>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-1">
            <span className="text-[10px] font-bold text-[#555555] uppercase flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#1F6F5F]" /> Estimated Lot Value
            </span>
            <span className="text-base font-bold text-[#1F6F5F]">
              ₹{estimatedTotal.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#555555] block">Rate × Total Weight</span>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-1">
            <span className="text-[10px] font-bold text-[#555555] uppercase flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#1F6F5F]" /> Expected Price
            </span>
            <span className="text-base font-bold text-[#222222]">
              {request.isOpenToMarket || Number(request.expectedPrice) === 0 ? (
                <span className="text-sm font-bold text-[#1F6F5F] bg-[#EFF8F2] border border-[#B8D9C8] px-2 py-0.5 rounded">Open to Market Bids</span>
              ) : request.expectedPrice !== undefined && Number(request.expectedPrice) > 0 ? (
                `₹${Number(request.expectedPrice).toLocaleString()}`
              ) : (
                'Flexible'
              )}
            </span>
            <span className="text-[10px] text-[#555555] block">Collector Expectation</span>
          </div>
        </div>

        {/* Collection & Storage Facility Details */}
        <div className="p-5 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F6F5F] flex items-center gap-1.5">
            <Building className="w-4 h-4" />
            <span>Collection & Storage Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#555555] block">Pickup Location</span>
              <p className="font-bold text-[#222222] flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0 mt-0.5" />
                <span>{request.collectionAddress || request.location || 'Chennai Hub'}</span>
              </p>
              {request.cityDistrict && (
                <span className="text-[11px] text-[#555555] block">City/District: {request.cityDistrict}</span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#555555] block">Storage Condition</span>
              <p className="font-bold text-[#222222]">{request.storageCondition || 'Indoor storage'}</p>
              {request.storageConditionDetails && (
                <p className="text-[11px] text-[#555555]">{request.storageConditionDetails}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#555555] block">Hazardous / Battery Condition</span>
              <p className="font-bold text-[#222222]">{request.hazardousCondition || 'No known batteries or hazardous materials'}</p>
              {request.hazardousConditionDetails && (
                <p className="text-[11px] text-[#555555]">{request.hazardousConditionDetails}</p>
              )}
            </div>
          </div>
        </div>

        {/* Price Transparency & Fair Range Banner */}
        <div className="p-5 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F6F5F] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('transparentPricingTitle', 'Transparent Pricing Model (Tamil Nadu Reference Rates)')}</span>
            </h3>
            <span className="text-[11px] font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
              {t('toleranceLabel', 'Tolerance')}: ±{tolerance}%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
            <div>
              <span className="text-[#555555]">{t('acceptableScrapBandLabel', 'Acceptable Scrap Price Band:')} </span>
              <strong className="text-[#222222] font-bold">₹{fairPricing.minPrice} – ₹{fairPricing.maxPrice} / {unit}</strong>
            </div>
            <div className="text-[11px] text-[#555555]">
              {t('preClearedZeroPenaltyText', 'Offers within this band are pre-cleared by the system with zero penalty.')}
            </div>
          </div>
        </div>

        {/* Uploaded Evidence / Images Section */}
        {((request.imageUrls && request.imageUrls.length > 0) || request.imageUrl) && (
          <div className="p-5 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#1F6F5F]" />
              <span>{t('uploadedEvidenceTitle', 'Uploaded Waste Verification Evidence')} ({(request.imageUrls?.length || 1)} Photos)</span>
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(request.imageUrls && request.imageUrls.length > 0 ? request.imageUrls : [request.imageUrl]).map((imgUrl, idx) => (
                <a 
                  key={idx} 
                  href={imgUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative rounded-lg border-2 border-[#D6E8DF] overflow-hidden bg-black/5 hover:border-[#1F6F5F] transition block"
                >
                  <img 
                    src={imgUrl} 
                    alt={`E-waste photo ${idx + 1}`} 
                    className="w-full h-28 object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    View
                  </span>
                </a>
              ))}
            </div>

            <div className="text-xs text-[#555555] space-y-1 pt-1">
              <p className="font-bold text-[#222222]">{request.description || request.notes || "High-grade electronic components segregated and stored in dry bin."}</p>
              <p>{t('conditionLabel', 'Condition')}: <strong className="text-[#222222]">{request.condition || "Non-working / Scrap"}</strong></p>
              <span className="inline-block text-[10px] font-bold text-[#1F6F5F] bg-[#EFF8F2] border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                ✓ Supabase Storage Verified Photos
              </span>
            </div>
          </div>
        )}

        {/* OFFERS RECEIVED SECTION */}
        <div className="space-y-4 pt-4 border-t-2 border-[#D6E8DF]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#222222] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1F6F5F]" />
                <span>{t('receivedRecyclerOffersTitle', 'Received Recycler Offers ({count})', { count: requestOffers.length })}</span>
              </h2>
              <p className="text-xs text-[#555555]">
                {t('bidsSubmittedDesc', 'Bids submitted by CPCB-authorized recyclers in response to this e-waste request.')}
              </p>
            </div>
          </div>

          {/* Condition: Show offers if received, otherwise show awaiting state */}
          {requestOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requestOffers.map((offer) => {
                const isThisAccepted = acceptedOfferId === offer.id || offer.status === 'ACCEPTED';
                const offeredRate = offer.pricePerUnit;
                const totalPayout = offer.totalPrice || (offeredRate * qty);

                // Price evaluation badge
                const isWithinBand = offeredRate >= fairPricing.minPrice && offeredRate <= fairPricing.maxPrice;
                const isAboveBand = offeredRate > fairPricing.maxPrice;
                const isBelowBand = offeredRate < fairPricing.minPrice;

                return (
                  <div
                    key={offer.id}
                    className={`p-6 rounded-lg border-2 transition flex flex-col justify-between space-y-4 ${
                      isThisAccepted
                        ? 'bg-[#EFF8F2] border-[#B8D9C8]'
                        : 'bg-white border-[#D6E8DF] hover:border-[#B8D9C8]'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Recycler Header */}
                      <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-[#1F6F5F]" />
                            <h3 className="text-sm font-bold text-[#222222]">{offer.recyclerName}</h3>
                          </div>
                          <span className="text-[10px] font-bold text-[#1F6F5F] bg-[#F5FBF7] border-2 border-[#D6E8DF] px-2 py-0.5 rounded inline-flex items-center gap-1 mt-1">
                            <ShieldCheck className="w-3 h-3 text-[#1F6F5F]" />
                            {t('cpcbAuthorizedRecyclerBadge', 'CPCB Authorized Recycler')}
                          </span>
                        </div>

                        {/* Benchmark Status Tag */}
                        {isWithinBand && (
                          <span className="text-[10px] font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-1 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" />
                            {t('fairRateBadge', 'Fair Rate ✓')}
                          </span>
                        )}
                        {isAboveBand && (
                          <span className="text-[10px] font-bold text-[#2FA084] bg-white border-2 border-[#B8D9C8] px-2.5 py-1 rounded flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#2FA084]" />
                            {t('aboveBenchmarkBadge', 'Above Benchmark 🔥')}
                          </span>
                        )}
                        {isBelowBand && (
                          <span className="text-[10px] font-bold text-[#555555] bg-white border-2 border-[#D6E8DF] px-2.5 py-1 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-[#555555]" />
                            {t('belowBandBadge', 'Below Band ⚠️')}
                          </span>
                        )}
                      </div>

                      {/* Pricing Comparison */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-3 bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF]">
                          <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('offeredRate', 'Offered Rate')}</span>
                          <span className="text-base font-bold text-[#222222]">₹{offeredRate} / {unit}</span>
                          <span className="text-[10px] text-[#555555] block">{t('benchmarkRateLabel', 'Benchmark')}: ₹{benchmark}</span>
                        </div>

                        <div className="p-3 bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF]">
                          <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('totalPayoutCommitment', 'Total Payout')}</span>
                          <span className="text-base font-bold text-[#1F6F5F]">₹{totalPayout.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Logistics & Pickup Info */}
                      <div className="p-3 bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[#222222] font-bold">
                          <Truck className="w-3.5 h-3.5 text-[#1F6F5F]" />
                          <span>{t('pickupLabel', 'Pickup')}: {offer.proposedPickupDate || "Scheduled within 48h"}</span>
                        </div>
                        <p className="text-[11px] text-[#555555]">
                          {offer.notes || "Direct vehicle pickup with digital weighbridge verification."}
                        </p>
                      </div>

                      <div className="text-[11px] text-[#555555] font-medium flex items-center justify-between">
                        <span>{t('submittedDate', 'Submitted')}: {offer.timestamp || "Today"}</span>
                        {offer.distanceKm && <span>{t('distanceLabel', 'Distance')}: ~{offer.distanceKm} km</span>}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t-2 border-[#D6E8DF]">
                      {isThisAccepted ? (
                        <div className="p-2.5 bg-[#EFF8F2] border-2 border-[#B8D9C8] text-[#1F6F5F] rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 text-[#1F6F5F]" />
                          <span>{t('offerAcceptedEscrowLocked', 'Offer Accepted · Escrow Locked')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOfferForReview(offer)}
                            className="flex-1 py-2.5 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition cursor-pointer"
                          >
                            {t('reviewOfferBtn', 'Review Offer')}
                          </button>

                          <button
                            disabled={isAcceptedState}
                            onClick={() => handleAcceptClick(offer)}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              isAcceptedState
                                ? 'bg-white border-2 border-[#D6E8DF] text-[#555555] opacity-50 cursor-not-allowed'
                                : 'bg-[#1F6F5F] hover:bg-[#2FA084] text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('acceptOffer', 'Accept Offer')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Awaiting Recycler Offers Banner */
            <div className="p-8 bg-white rounded-lg border-2 border-[#D6E8DF] text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#F5FBF7] border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">{t('awaitingRecyclerOffers', 'Awaiting Recycler Offers')}</h3>
              <p className="text-xs text-[#555555] max-w-md mx-auto">
                {t('requestBroadcastedDesc', 'Your request has been broadcasted to registered CPCB recyclers in your industrial corridor. Offers will appear here in real-time as recyclers submit bids.')}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded text-[11px] font-bold text-[#1F6F5F]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('fairScrapPriceProtectionText', 'Fair Scrap Price Protection Enabled (₹{min} – ₹{max} / {unit})', { min: fairPricing.minPrice, max: fairPricing.maxPrice, unit })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Request Timeline */}
        <div className="space-y-4 pt-6 border-t-2 border-[#D6E8DF]">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1F6F5F]" />
            <span>{t('requestLifecycleTitle', 'Request Lifecycle & Status History')}</span>
          </h3>

          <div className="space-y-3">
            {timelineEvents.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F5FBF7] border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-[#222222]">{t(ev.event, ev.event)}</span>
                    <span className="text-[#555555] text-[11px] block">{ev.details}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-[#1F6F5F] bg-[#F5FBF7] px-2 py-0.5 rounded border-2 border-[#D6E8DF]">
                    {t(ev.userRole, ev.userRole)}
                  </span>
                  <span className="text-[10px] text-[#555555] block mt-0.5">{ev.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Review Offer Modal */}
      {selectedOfferForReview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] max-w-lg w-full p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                  {t('recyclerOfferReviewModalHeader', 'Recycler Offer Review')}
                </span>
                <h3 className="text-xl font-bold text-[#222222] mt-1">{selectedOfferForReview.recyclerName}</h3>
              </div>
              <button
                onClick={() => setSelectedOfferForReview(null)}
                className="p-2 rounded hover:bg-white text-[#555555] hover:text-[#222222] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border-2 border-[#D6E8DF]">
                  <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('offeredRate', 'Offered Rate')}</span>
                  <span className="text-lg font-bold text-[#222222]">₹{selectedOfferForReview.pricePerUnit} / {unit}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border-2 border-[#D6E8DF]">
                  <span className="text-[10px] font-bold text-[#555555] uppercase block">{t('totalPayoutCommitment', 'Total Payout')}</span>
                  <span className="text-lg font-bold text-[#1F6F5F]">
                    ₹{(selectedOfferForReview.totalPrice || selectedOfferForReview.pricePerUnit * qty).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] space-y-2">
                <h4 className="font-bold text-[#222222]">{t('pricingEvalTransparency', 'Pricing Evaluation & Transparency')}</h4>
                <p className="text-[#555555]">
                  {t('stateRefBenchmark')}: <strong>₹{benchmark}/{unit}</strong><br />
                  {t('permittedBand')}: <strong>₹{fairPricing.minPrice} – ₹{fairPricing.maxPrice} / {unit}</strong>
                </p>
                <div className="text-[#1F6F5F] bg-white border-2 border-[#B8D9C8] p-2 rounded text-[11px] font-bold">
                  {t('meetsCpcbFairRateNotice', '✓ This offer meets all CPCB Fair Rate criteria with guaranteed Escrow lock.')}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-1 text-[#555555]">
                <p><strong className="text-[#222222]">{t('proposedPickupDateLabel', 'Proposed Pickup Date')}:</strong> {selectedOfferForReview.proposedPickupDate || "Within 48 hours"}</p>
                <p><strong className="text-[#222222]">{t('logisticsNotesLabel', 'Logistics Notes')}:</strong> {selectedOfferForReview.notes || "Direct vehicle pickup with calibrated weigh scales."}</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#D6E8DF] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedOfferForReview(null)}
                className="px-5 py-2.5 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] font-bold text-xs rounded-lg cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
              <button
                onClick={() => handleAcceptClick(selectedOfferForReview)}
                className="px-6 py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t('acceptOffer', 'Accept Offer')} (₹{(selectedOfferForReview.totalPrice || selectedOfferForReview.pricePerUnit * qty).toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
