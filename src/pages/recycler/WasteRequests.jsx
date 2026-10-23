import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ShoppingBag, DollarSign, ArrowRight, ShieldCheck, 
  CheckCircle2, AlertTriangle, Scale, MapPin, Calendar, Clock, Truck, 
  Send, X, Loader2, RefreshCw, AlertCircle, Eye, FileText, Check, Award
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { calculateFairPriceRange } from '../../utils/rulesEngine';
import { useTranslation } from '../../i18n';

export default function WasteRequests({ 
  materialLots = [], 
  offers = [],
  onSubmitOffer,
  recyclerProfile,
  onRefreshData
}) {
  const { t, tCategory } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'available';
  const lotIdParam = searchParams.get('lotId');
  const actionParam = searchParams.get('action');

  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedLotForBid, setSelectedLotForBid] = useState(null);
  const [selectedLotForDetails, setSelectedLotForDetails] = useState(null);
  const [selectedLotForPickup, setSelectedLotForPickup] = useState(null);
  
  // Bid Form state
  const [bidRate, setBidRate] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [logisticsNotes, setLogisticsNotes] = useState('Direct factory pickup arranged with certified weighing scales.');
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pickup Scheduling state
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledVehicleNotes, setScheduledVehicleNotes] = useState('Standard certified e-waste logistics vehicle.');
  const [pickupSavedNotice, setPickupSavedNotice] = useState(false);

  // Hidden/passed lots
  const [dismissedLotIds, setDismissedLotIds] = useState(new Set());

  // Synchronize activeTab with URL tab param
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Handle lotIdParam and actionParam deep-linking
  useEffect(() => {
    if (lotIdParam && materialLots.length > 0) {
      const match = materialLots.find(l => (l.id === lotIdParam || l.lotId === lotIdParam || l.lot_id === lotIdParam));
      if (match) {
        if (actionParam === 'bid') {
          handleOpenBid(match);
        } else {
          setSelectedLotForDetails(match);
        }
      }
    }
  }, [lotIdParam, actionParam, materialLots]);

  // Verification status check
  const recStatus = (
    recyclerProfile?.status || 
    recyclerProfile?.verificationStatus || 
    recyclerProfile?.cpcbStatus || 
    recyclerProfile?.recyclerProfile?.status || 
    recyclerProfile?.recyclerProfile?.verificationStatus || 
    recyclerProfile?.recyclerProfile?.cpcbStatus || 
    ''
  ).toUpperCase();
  const isVerified = recStatus === 'VERIFIED';

  // Segment lots by tabs
  const availableLots = (materialLots || []).filter(l => 
    !dismissedLotIds.has(l.id || l.lotId) &&
    (['AWAITING_OFFERS', 'SUBMITTED', 'AVAILABLE', 'Available', 'REGISTERED', 'OFFERS_RECEIVED', 'OFFER_RECEIVED', 'MATCHED', 'Pending Review', 'PENDING_REVIEW'].includes(l.status) || !l.status)
  );

  const biddedLots = (materialLots || []).filter(l => {
    const lotId = l.id || l.lotId;
    return (offers || []).some(o => (o.lotId === lotId || o.lot_id === lotId));
  });

  const acceptedLots = (materialLots || []).filter(l => 
    ['ACCEPTED', 'OFFER_ACCEPTED', 'DISPATCHED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'HANDED_OVER'].includes(l.status)
  );

  const completedLots = (materialLots || []).filter(l => 
    ['COMPLETED', 'PAYMENT_COMPLETED'].includes(l.status)
  );

  // Determine lots to display for current tab
  let currentTabLots = availableLots;
  if (activeTab === 'bids') currentTabLots = biddedLots;
  else if (activeTab === 'accepted') currentTabLots = acceptedLots;
  else if (activeTab === 'completed') currentTabLots = completedLots;
  else if (activeTab === 'all') currentTabLots = materialLots;

  const filteredLots = currentTabLots.filter(lot => {
    const q = searchQuery.toLowerCase();
    return (
      (lot.lotId || lot.id || '').toLowerCase().includes(q) ||
      (lot.category || '').toLowerCase().includes(q) ||
      (lot.material || '').toLowerCase().includes(q) ||
      (lot.location || '').toLowerCase().includes(q) ||
      (lot.cityDistrict || '').toLowerCase().includes(q) ||
      (lot.collectorName || '').toLowerCase().includes(q)
    );
  });

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handleManualRefresh = async () => {
    if (onRefreshData) {
      setIsRefreshing(true);
      try {
        await onRefreshData();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const handleOpenBid = (lot) => {
    setSelectedLotForBid(lot);
    // If offer already submitted by this recycler, pre-fill that rate
    const existingOffer = (offers || []).find(o => o.lotId === (lot.id || lot.lotId));
    setBidRate(String(existingOffer?.pricePerUnit || existingOffer?.ratePerKg || lot.benchmarkPrice || lot.benchmarkRate || 350));
    
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 2);
    setPickupDate(existingOffer?.pickupDate || existingOffer?.proposedPickupDate || defaultDate.toISOString().split('T')[0]);
    setLogisticsNotes(existingOffer?.notes || 'Direct factory pickup arranged with certified weighing scales.');
    setBidSubmitted(false);
  };

  const handleDismissLot = (lotId) => {
    setDismissedLotIds(prev => new Set(prev).add(lotId));
  };

  const handleSendBid = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert("Only verified recyclers with an authorized CPCB/SPCB registration can submit offers.");
      return;
    }

    const rate = parseFloat(bidRate);
    if (!rate || rate <= 0) {
      alert("Please enter a valid positive bid rate.");
      return;
    }

    const qty = selectedLotForBid.quantity || selectedLotForBid.totalWeightKg || 1;
    const total = Math.round(rate * qty);

    if (onSubmitOffer) {
      setIsSubmittingBid(true);
      try {
        const recyclerFacilityName = recyclerProfile?.facilityName || 
          recyclerProfile?.organizationName || 
          recyclerProfile?.companyName || 
          recyclerProfile?.fullName || 
          recyclerProfile?.name || 
          "Authorized Recycler";

        await onSubmitOffer({
          lotId: selectedLotForBid.lotId || selectedLotForBid.id,
          recyclerId: recyclerProfile?.id || recyclerProfile?._id || "",
          recyclerName: recyclerFacilityName,
          recyclerVerified: true,
          pricePerUnit: rate,
          ratePerKg: rate,
          totalPrice: total,
          proposedPickupDate: pickupDate,
          notes: logisticsNotes,
          timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
        setBidSubmitted(true);
        setTimeout(() => {
          setSelectedLotForBid(null);
          setBidSubmitted(false);
        }, 1200);
      } catch (err) {
        alert(err.message || "Failed to submit offer to server.");
      } finally {
        setIsSubmittingBid(false);
      }
    }
  };

  const handleOpenPickupSchedule = (lot) => {
    setSelectedLotForPickup(lot);
    setScheduledDate(lot.preferredPickupDate || new Date().toISOString().split('T')[0]);
    setScheduledVehicleNotes('Logistics truck scheduled with digital on-site weighing equipment.');
    setPickupSavedNotice(false);
  };

  const handleSavePickupSchedule = (e) => {
    e.preventDefault();
    setPickupSavedNotice(true);
    setTimeout(() => {
      setSelectedLotForPickup(null);
      setPickupSavedNotice(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 bg-white text-[#222222]">
      {/* Verification Status Warning if Pending or Unverified */}
      {!isVerified && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Recycler Account Verification Status: {recStatus || 'PENDING'}</p>
              <p className="text-[11px] text-amber-800">
                Official registry authorization is required to submit binding price offers. Once your registration is validated, bidding is automatically unlocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/recycler/profile')}
            className="px-3 py-1 bg-amber-200 border border-amber-400 font-bold rounded uppercase tracking-wider text-[10px] hover:bg-amber-300 transition cursor-pointer"
          >
            Update Profile
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-[#F5FBF7] border-2 border-[#D6E8DF] px-3 py-1 rounded">
              {t('recyclerIntakePipeline', 'Recycler Intake Pipeline')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-2">
            {activeTab === 'available' ? t('availableCollectorRequests', 'Available Collector Requests') :
             activeTab === 'bids' ? 'My Submitted Price Bids' :
             activeTab === 'accepted' ? 'Accepted Lots & Scheduled Logistics' :
             activeTab === 'completed' ? 'Completed & Processed Streams' : 'All Waste Requests'}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('availableRequestsDesc', 'Review authenticated e-waste requests declared by registered collectors and submit competitive price offers.')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefreshData && (
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-[#F5FBF7] hover:bg-[#EFF8F2] border-2 border-[#D6E8DF] hover:border-[#B8D9C8] text-[#1F6F5F] font-bold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
          <button
            onClick={() => navigate('/recycler/transactions')}
            className="px-4 py-2 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#222222] font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>{t('navTransactions')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#D6E8DF] pb-3">
        <button
          onClick={() => handleTabChange('available')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'available'
              ? 'bg-[#1F6F5F] text-white shadow-sm'
              : 'bg-[#F5FBF7] text-[#555555] hover:text-[#1F6F5F] border-2 border-[#D6E8DF]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Available Streams ({availableLots.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('bids')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'bids'
              ? 'bg-[#1F6F5F] text-white shadow-sm'
              : 'bg-[#F5FBF7] text-[#555555] hover:text-[#1F6F5F] border-2 border-[#D6E8DF]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>My Submitted Bids ({biddedLots.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('accepted')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'accepted'
              ? 'bg-[#1F6F5F] text-white shadow-sm'
              : 'bg-[#F5FBF7] text-[#555555] hover:text-[#1F6F5F] border-2 border-[#D6E8DF]'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Accepted & Pickups ({acceptedLots.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('completed')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-[#1F6F5F] text-white shadow-sm'
              : 'bg-[#F5FBF7] text-[#555555] hover:text-[#1F6F5F] border-2 border-[#D6E8DF]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({completedLots.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F5FBF7] p-4 sm:p-5 rounded-lg border-2 border-[#D6E8DF] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchRecyclerRequestsPlaceholder', 'Search material category, request ID, or location...')}
            className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
          />
        </div>

        <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3.5 py-1.5 rounded-lg self-start md:self-auto">
          Showing {filteredLots.length} lot{filteredLots.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Empty State */}
      {filteredLots.length === 0 && (
        <div className="p-12 text-center bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg space-y-3">
          <ShoppingBag className="w-8 h-8 text-[#555555] mx-auto" />
          <h3 className="text-base font-bold text-[#222222]">
            {activeTab === 'bids' ? 'No Bids Submitted Yet' :
             activeTab === 'accepted' ? 'No Accepted Pickups Yet' :
             activeTab === 'completed' ? 'No Completed Lots Yet' :
             'No Matching Waste Requests Found'}
          </h3>
          <p className="text-xs text-[#555555] max-w-md mx-auto">
            {activeTab === 'bids' ? 'Browse open available waste lots and submit competitive price offers to begin procurement.' :
             activeTab === 'accepted' ? 'When collectors accept your bids, the lots will appear here for pickup scheduling and logistics.' :
             'Check back shortly as collectors register new materials across your state zone.'}
          </p>
          {activeTab !== 'available' && (
            <button
              onClick={() => handleTabChange('available')}
              className="px-4 py-2 bg-[#1F6F5F] text-white rounded-lg text-xs font-bold transition hover:bg-[#2FA084] cursor-pointer"
            >
              Browse Available Lots
            </button>
          )}
        </div>
      )}

      {/* Grid of Waste Stream Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => {
          const lotId = lot.lotId || lot.id;
          const benchmark = lot.benchmarkPrice || lot.benchmarkRate || 350;
          const fairBand = calculateFairPriceRange(benchmark, 25);
          const weight = parseFloat(lot.totalWeightKg || lot.quantity) || 1;
          const qty = lot.quantity;
          const unit = lot.unit || 'kg';
          const estimatedValue = lot.estimatedTotalValue || lot.estimatedLotValue || Math.round(benchmark * weight);

          // Check if this recycler has an offer on this lot
          const myOffer = (offers || []).find(o => o.lotId === lotId || o.lot_id === lotId);
          const isAccepted = ['ACCEPTED', 'OFFER_ACCEPTED', 'PICKUP_SCHEDULED', 'IN_TRANSIT'].includes(lot.status);

          return (
            <div
              key={lotId}
              className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {tCategory(lot.category)}
                    </span>
                    <h3 className="text-base font-bold text-[#222222] mt-1.5">{lot.material || lot.category}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-bold text-[#1F6F5F]">{lotId}</span>
                      {lot.collectorId && (
                        <span className="text-[10px] text-[#555555]">
                          • Node: {String(lot.collectorId).slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={lot.status || 'Available'} />
                </div>

                {/* Image & Photo Count */}
                {((lot.imageUrls && lot.imageUrls.length > 0) || lot.imageUrl) && (
                  <div 
                    onClick={() => setSelectedLotForDetails(lot)}
                    className="relative rounded-lg overflow-hidden border-2 border-[#D6E8DF] h-32 bg-black/5 cursor-pointer group"
                  >
                    <img 
                      src={lot.imageUrls?.[0] || lot.imageUrl} 
                      alt={lot.material} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{(lot.imageUrls?.length || 1)} Photo{(lot.imageUrls?.length || 1) > 1 ? 's' : ''}</span>
                    </span>
                  </div>
                )}

                {/* Weight, Condition & Address Specs */}
                <div className="space-y-2 text-xs text-[#555555]">
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-white border border-[#D6E8DF] rounded-lg">
                    <div>
                      <span className="text-[10px] text-[#555555] uppercase block font-bold">Total Weight</span>
                      <strong className="text-[#222222] text-sm">{weight} kg</strong>
                      {qty && <span className="text-[10px] text-[#555555] block">Count: {qty} {unit}</span>}
                    </div>
                    <div>
                      <span className="text-[10px] text-[#555555] uppercase block font-bold">Condition</span>
                      <strong className="text-[#222222] text-xs">{lot.condition || 'Scrap'}</strong>
                      <span className="text-[10px] text-[#555555] block">Storage: {lot.storageCondition || 'Indoor'}</span>
                    </div>
                  </div>

                  {lot.hazardousCondition && (
                    <div className="p-2.5 bg-[#F9FCFA] border border-[#D6E8DF] rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[#555555] uppercase">Hazard Assessment:</span>
                        <span className="text-[9px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FCD34D] px-1.5 py-0.5 rounded">
                          {lot.hazardousAssessmentStatus || 'Requires Verification'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#222222] font-semibold leading-tight">{lot.hazardousCondition}</p>
                    </div>
                  )}

                  <p className="flex items-center gap-1.5 text-[#222222] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                    <span className="truncate">{lot.collectionAddress || lot.location || 'Location Not Specified'}{lot.cityDistrict ? `, ${lot.cityDistrict}` : ''}</span>
                  </p>

                  <p className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                    <span>Submitted: {lot.createdDate || (lot.createdAt ? new Date(lot.createdAt).toLocaleDateString() : 'Recent')}</span>
                  </p>

                  {lot.preferredPickupDate && (
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#1F6F5F]" />
                      <span>Preferred Pickup: {new Date(lot.preferredPickupDate).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>

                {/* My Offer Banner if already placed */}
                {myOffer && (
                  <div className="p-3 bg-[#EFF8F2] border-2 border-[#B8D9C8] rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#1F6F5F]">Your Submitted Offer:</span>
                      <span className="font-bold text-[#1F6F5F] bg-white px-2 py-0.5 rounded border border-[#B8D9C8] text-[10px]">
                        ₹{myOffer.pricePerUnit || myOffer.ratePerKg} / {unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#555555]">
                      Total: ₹{(myOffer.totalPrice || ((myOffer.pricePerUnit || myOffer.ratePerKg) * weight)).toLocaleString()} · Pickup: {myOffer.proposedPickupDate || myOffer.pickupDate || 'Flexible'}
                    </p>
                  </div>
                )}

                {/* Benchmark Band & Values */}
                <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#555555] uppercase">{t('stateBenchmarkRate', 'State Benchmark Rate')}</span>
                    <span className="font-bold text-[#222222]">₹{benchmark} / kg</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#555555]">Estimated Total Value:</span>
                    <span className="font-bold text-[#1F6F5F]">₹{estimatedValue.toLocaleString()}</span>
                  </div>
                  {lot.isOpenToMarket || Number(lot.expectedPrice) === 0 ? (
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#D6E8DF]">
                      <span className="text-[#555555]">Expected Price:</span>
                      <span className="font-bold text-[#1F6F5F] bg-[#EFF8F2] border border-[#B8D9C8] px-2 py-0.5 rounded text-[10px]">Open to Market Bids</span>
                    </div>
                  ) : lot.expectedPrice !== undefined && Number(lot.expectedPrice) > 0 ? (
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#D6E8DF]">
                      <span className="text-[#555555]">Collector's Expected Price:</span>
                      <span className="font-bold text-[#222222]">₹{Number(lot.expectedPrice).toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons Hub */}
              <div className="pt-3 border-t-2 border-[#D6E8DF] space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedLotForDetails(lot)}
                    className="flex-1 py-2 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#1F6F5F] rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('viewDetails')}</span>
                  </button>

                  {isAccepted ? (
                    <button
                      onClick={() => handleOpenPickupSchedule(lot)}
                      className="flex-1 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Logistics</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenBid(lot)}
                      disabled={!isVerified}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 ${
                        isVerified 
                          ? 'bg-[#1F6F5F] hover:bg-[#2FA084] text-white cursor-pointer' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{myOffer ? 'Update Bid' : t('submitPriceOffer', 'Submit Offer')}</span>
                    </button>
                  )}
                </div>

                {activeTab === 'available' && !myOffer && (
                  <button
                    onClick={() => handleDismissLot(lotId)}
                    className="w-full text-center text-[11px] text-[#555555] hover:text-[#222222] font-semibold py-1 hover:underline cursor-pointer"
                  >
                    Pass on this stream
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Full Lot Details Modal */}
      {selectedLotForDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                  {tCategory(selectedLotForDetails.category)}
                </span>
                <h3 className="text-xl font-bold text-[#222222] mt-1">{selectedLotForDetails.material || selectedLotForDetails.category}</h3>
                <span className="text-xs font-mono text-[#555555]">Lot ID: {selectedLotForDetails.lotId || selectedLotForDetails.id}</span>
              </div>
              <button
                onClick={() => setSelectedLotForDetails(null)}
                className="p-2 rounded hover:bg-white text-[#555555] hover:text-[#222222] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Photo Evidence */}
              {((selectedLotForDetails.imageUrls && selectedLotForDetails.imageUrls.length > 0) || selectedLotForDetails.imageUrl) && (
                <div>
                  <h4 className="font-bold text-[#222222] mb-2">Verified Photos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(selectedLotForDetails.imageUrls || [selectedLotForDetails.imageUrl]).map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border-2 border-[#D6E8DF] h-28 bg-black/5">
                        <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-white border-2 border-[#D6E8DF] rounded-lg">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#555555] block">Total Weight</span>
                  <span className="text-base font-bold text-[#222222]">{selectedLotForDetails.totalWeightKg || selectedLotForDetails.quantity} {selectedLotForDetails.unit || 'kg'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#555555] block">State Reference Rate</span>
                  <span className="text-base font-bold text-[#1F6F5F]">₹{selectedLotForDetails.benchmarkPrice || 350} / kg</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#555555] block">Physical Condition</span>
                  <span className="font-bold text-[#222222]">{selectedLotForDetails.condition || 'Scrap / Electronic Components'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#555555] block">Storage Environment</span>
                  <span className="font-bold text-[#222222]">{selectedLotForDetails.storageCondition || 'Indoor Segregated'}</span>
                </div>
              </div>

              {/* Location & Hazardous */}
              <div className="p-3.5 bg-white border-2 border-[#D6E8DF] rounded-lg space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#555555] block">Collection Node</span>
                  <p className="font-bold text-[#222222]">{selectedLotForDetails.collectionAddress || selectedLotForDetails.location || 'Collector Hub'}</p>
                </div>
                {selectedLotForDetails.hazardousCondition && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#B45309] block">Hazardous / Battery Assessment</span>
                    <p className="font-semibold text-[#222222]">{selectedLotForDetails.hazardousCondition}</p>
                    {selectedLotForDetails.hazardousConditionDetails && (
                      <p className="text-[11px] text-[#555555] italic">{selectedLotForDetails.hazardousConditionDetails}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#D6E8DF] flex justify-end gap-3">
              <button
                onClick={() => setSelectedLotForDetails(null)}
                className="px-5 py-2.5 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] font-bold text-xs rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedLotForDetails;
                  setSelectedLotForDetails(null);
                  handleOpenBid(target);
                }}
                disabled={!isVerified}
                className="px-6 py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>Submit Price Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Submit Bid Modal */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                  {t('submitRecyclerOfferModalTitle', 'Submit Recycler Offer')}
                </span>
                <h3 className="text-xl font-bold text-[#222222] mt-1">{selectedLotForBid.id || selectedLotForBid.lotId}</h3>
              </div>
              <button
                onClick={() => setSelectedLotForBid(null)}
                className="p-2 rounded hover:bg-white text-[#555555] hover:text-[#222222] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBid} className="space-y-4 text-xs">
              <div className="p-3.5 bg-white border-2 border-[#D6E8DF] rounded-lg space-y-1.5 text-[#555555]">
                <p><strong className="text-[#222222]">{t('materialCategory', 'Material')}:</strong> {selectedLotForBid.material}</p>
                <p><strong className="text-[#222222]">{t('weight', 'Weight')}:</strong> {selectedLotForBid.quantity || selectedLotForBid.totalWeightKg} {selectedLotForBid.unit || 'kg'}</p>
                <p><strong className="text-[#222222]">{t('benchmarkPriceLabel', 'Benchmark Rate')}:</strong> ₹{selectedLotForBid.benchmarkPrice || 350} / {selectedLotForBid.unit || 'kg'}</p>
                <div className="pt-1.5 border-t border-[#D6E8DF] flex justify-between items-center text-xs">
                  <strong className="text-[#222222]">Collector's Expected Price:</strong>
                  {selectedLotForBid.isOpenToMarket || Number(selectedLotForBid.expectedPrice) === 0 ? (
                    <span className="font-bold text-[#1F6F5F] bg-[#EFF8F2] border border-[#B8D9C8] px-2 py-0.5 rounded text-[10px]">Open to Market Bids</span>
                  ) : (
                    <span className="font-bold text-[#222222] text-sm">₹{Number(selectedLotForBid.expectedPrice).toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#222222] block mb-1">
                  {t('yourOfferedPrice', 'Your Offered Price per Unit (₹)')} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bidRate}
                  onChange={(e) => setBidRate(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-sm font-bold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#222222] block mb-1">
                  {t('proposedPickupDateLabel', 'Proposed Pickup Date')} *
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#222222] block mb-1">
                  {t('logisticsWeighingTerms', 'Logistics & Weighing Terms')}
                </label>
                <input
                  type="text"
                  value={logisticsNotes}
                  onChange={(e) => setLogisticsNotes(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-[#EFF8F2] rounded-lg border-2 border-[#D6E8DF] flex justify-between items-center">
                <span className="font-bold text-[#555555]">{t('totalPayoutCommitment', 'Total Payout Commitment')}:</span>
                <span className="text-base font-bold text-[#1F6F5F]">
                  ₹{(Math.round((parseFloat(bidRate) || 0) * (selectedLotForBid.quantity || selectedLotForBid.totalWeightKg || 0))).toLocaleString()}
                </span>
              </div>

              {bidSubmitted && (
                <div className="p-3.5 bg-[#EFF8F2] border-2 border-[#B8D9C8] text-[#1F6F5F] rounded-lg font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1F6F5F]" />
                  <span>{t('offerDispatchedNotice', 'Offer dispatched! Collector has been notified.')}</span>
                </div>
              )}

              <div className="pt-4 border-t-2 border-[#D6E8DF] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLotForBid(null)}
                  className="px-5 py-2.5 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] font-bold rounded-lg cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={bidSubmitted || isSubmittingBid}
                  className="px-6 py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('confirmSubmitOffer', 'Confirm & Submit Offer')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Logistics & Pickup Scheduling Modal */}
      {selectedLotForPickup && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                  Logistics & Pickup Management
                </span>
                <h3 className="text-xl font-bold text-[#222222] mt-1">{selectedLotForPickup.id || selectedLotForPickup.lotId}</h3>
              </div>
              <button
                onClick={() => setSelectedLotForPickup(null)}
                className="p-2 rounded hover:bg-white text-[#555555] hover:text-[#222222] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePickupSchedule} className="space-y-4 text-xs">
              <div className="p-3.5 bg-white border-2 border-[#D6E8DF] rounded-lg space-y-1 text-[#555555]">
                <p><strong className="text-[#222222]">Pickup Location:</strong> {selectedLotForPickup.collectionAddress || selectedLotForPickup.location || 'Collector Hub'}</p>
                <p><strong className="text-[#222222]">Material & Quantity:</strong> {selectedLotForPickup.material} ({selectedLotForPickup.quantity || selectedLotForPickup.totalWeightKg} {selectedLotForPickup.unit || 'kg'})</p>
                <p><strong className="text-[#222222]">Agreed Status:</strong> {selectedLotForPickup.status}</p>
              </div>

              <div>
                <label className="font-bold text-[#222222] block mb-1">
                  Confirmed Dispatch / Pickup Date *
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#222222] block mb-1">
                  Vehicle & Calibrated Scale Specifications
                </label>
                <input
                  type="text"
                  value={scheduledVehicleNotes}
                  onChange={(e) => setScheduledVehicleNotes(e.target.value)}
                  className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-4 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
                />
              </div>

              {pickupSavedNotice && (
                <div className="p-3 bg-[#EFF8F2] border-2 border-[#B8D9C8] text-[#1F6F5F] rounded-lg font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>Pickup logistics confirmed and dispatched to collector!</span>
                </div>
              )}

              <div className="pt-4 border-t-2 border-[#D6E8DF] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLotForPickup(null)}
                  className="px-5 py-2.5 bg-white hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] font-bold rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Confirm Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
