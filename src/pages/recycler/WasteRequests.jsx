import React, { useState } from 'react';
import { 
  Search, Filter, ShoppingBag, DollarSign, ArrowRight, ShieldCheck, 
  CheckCircle2, AlertTriangle, Scale, MapPin, Calendar, Clock, Truck, 
  Send, X, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { calculateFairPriceRange } from '../../utils/rulesEngine';
import { useTranslation } from '../../i18n';

export default function WasteRequests({ 
  materialLots = [], 
  onSubmitOffer,
  recyclerProfile,
  onRefreshData
}) {
  const { t, tCategory } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLotForBid, setSelectedLotForBid] = useState(null);
  const [bidRate, setBidRate] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [logisticsNotes, setLogisticsNotes] = useState('Direct factory pickup arranged with certified weighing scales.');
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Verification status check (supports both root and nested recyclerProfile)
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

  // Available collector requests
  const availableLots = (materialLots || []).filter(l => 
    ['AWAITING_OFFERS', 'SUBMITTED', 'AVAILABLE', 'Available', 'REGISTERED', 'OFFERS_RECEIVED', 'OFFER_RECEIVED', 'MATCHED', 'Pending Review', 'PENDING_REVIEW'].includes(l.status) || !l.status
  );

  const filteredLots = availableLots.filter(lot => {
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
    setBidRate(String(lot.benchmarkPrice || lot.benchmarkRate || 350));
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 2);
    setPickupDate(defaultDate.toISOString().split('T')[0]);
    setBidSubmitted(false);
  };

  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

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
          <span className="px-3 py-1 bg-amber-200 border border-amber-400 font-bold rounded uppercase tracking-wider text-[10px]">
            Read-Only Mode
          </span>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-2">{t('availableCollectorRequests', 'Available Collector Requests')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('availableRequestsDesc', 'Review authenticated e-waste requests declared by registered collectors and submit competitive price offers.')}
          </p>
        </div>

        {onRefreshData && (
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="self-start sm:self-auto px-4 py-2 bg-[#F5FBF7] hover:bg-[#EFF8F2] border-2 border-[#D6E8DF] hover:border-[#B8D9C8] text-[#1F6F5F] font-bold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Requests'}</span>
          </button>
        )}
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
          {t('requestsAvailableBiddingCount', '{count} Requests Available for Bidding', { count: filteredLots.length })}
        </span>
      </div>

      {/* Empty State */}
      {filteredLots.length === 0 && (
        <div className="p-12 text-center bg-[#F5FBF7] border-2 border-[#D6E8DF] rounded-lg space-y-3">
          <ShoppingBag className="w-8 h-8 text-[#555555] mx-auto" />
          <h3 className="text-base font-bold text-[#222222]">No Active Waste Requests Found</h3>
          <p className="text-xs text-[#555555] max-w-md mx-auto">
            There are currently no new waste lots matching your search criteria or accepted categories. Check back shortly as collectors register new materials.
          </p>
        </div>
      )}

      {/* Grid of Waste Stream Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => {
          const benchmark = lot.benchmarkPrice || lot.benchmarkRate || 350;
          const fairBand = calculateFairPriceRange(benchmark, 25);
          const weight = parseFloat(lot.totalWeightKg || lot.quantity) || 1;
          const qty = lot.quantity;
          const unit = lot.unit || 'kg';
          const estimatedValue = lot.estimatedTotalValue || lot.estimatedLotValue || Math.round(benchmark * weight);

          return (
            <div
              key={lot.lotId || lot.id}
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
                      <span className="text-xs font-mono font-bold text-[#1F6F5F]">{lot.lotId || lot.id}</span>
                      {lot.collectorId && (
                        <span className="text-[10px] text-[#555555]">
                          • Collector ID: {lot.collectorId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={lot.status || 'Available'} />
                </div>

                {/* Image & Photo Count */}
                {((lot.imageUrls && lot.imageUrls.length > 0) || lot.imageUrl) && (
                  <div className="relative rounded-lg overflow-hidden border-2 border-[#D6E8DF] h-32 bg-black/5">
                    <img 
                      src={lot.imageUrls?.[0] || lot.imageUrl} 
                      alt={lot.material} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {(lot.imageUrls?.length || 1)} Photo{(lot.imageUrls?.length || 1) > 1 ? 's' : ''}
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

                  <p className="flex items-center gap-1.5 text-[#222222] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                    <span className="truncate">{lot.collectionAddress || lot.location || 'Chennai'}{lot.cityDistrict ? `, ${lot.cityDistrict}` : ''}</span>
                  </p>

                  <p className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                    <span>Submitted: {lot.createdDate || (lot.createdAt ? new Date(lot.createdAt).toLocaleString('en-IN') : 'Recent')}</span>
                  </p>

                  {lot.preferredPickupDate && (
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                      <span>Preferred Pickup: {new Date(lot.preferredPickupDate).toLocaleDateString()}</span>
                    </p>
                  )}

                  {lot.hazardousCondition && (
                    <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded truncate max-w-full">
                      ⚠️ {lot.hazardousCondition}
                    </span>
                  )}
                </div>

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
                      <span className="text-[#555555]">Expected Selling Price:</span>
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

              {/* Action Button */}
              <div className="pt-3 border-t-2 border-[#D6E8DF]">
                <button
                  onClick={() => handleOpenBid(lot)}
                  disabled={!isVerified}
                  className={`w-full py-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 ${
                    isVerified 
                      ? 'bg-[#1F6F5F] hover:bg-[#2FA084] text-white cursor-pointer' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{isVerified ? t('submitPriceOffer', 'Submit Price Offer') : 'Verification Required to Bid'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Bid Modal */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#D6E8DF]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                  {t('submitRecyclerOfferModalTitle', 'Submit Recycler Offer')}
                </span>
                <h3 className="text-xl font-bold text-[#222222] mt-1">{selectedLotForBid.id}</h3>
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
    </div>
  );
}
