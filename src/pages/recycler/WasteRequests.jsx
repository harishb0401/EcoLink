import React, { useState } from 'react';
import { 
  Search, Filter, ShoppingBag, DollarSign, ArrowRight, ShieldCheck, 
  CheckCircle2, AlertTriangle, Scale, MapPin, Calendar, Clock, Truck, 
  Send, X, Loader2
} from 'lucide-react';
import { mockWasteLots, mockBenchmarkPrices, mockRecycler } from '../../data/mockData';
import { calculateFairPriceRange } from '../../utils/rulesEngine';
import { useTranslation } from '../../i18n';

export default function WasteRequests({ 
  materialLots = [], 
  onSubmitOffer,
  recyclerProfile
}) {
  const { t, tCategory } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLotForBid, setSelectedLotForBid] = useState(null);
  const [bidRate, setBidRate] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [logisticsNotes, setLogisticsNotes] = useState('Direct factory pickup arranged with certified weighing scales.');
  const [bidSubmitted, setBidSubmitted] = useState(false);

  // Available collector requests
  const availableLots = (materialLots || []).filter(l => 
    ['AWAITING_OFFERS', 'SUBMITTED', 'AVAILABLE', 'REGISTERED', 'OFFERS_RECEIVED', 'OFFER_RECEIVED', 'MATCHED'].includes(l.status)
  );

  const filteredLots = availableLots.filter(lot =>
    (lot.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lot.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lot.material || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lot.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenBid = (lot) => {
    setSelectedLotForBid(lot);
    setBidRate(String(lot.benchmarkPrice || 350));
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 2);
    setPickupDate(defaultDate.toISOString().split('T')[0]);
    setBidSubmitted(false);
  };

  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const handleSendBid = async (e) => {
    e.preventDefault();
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
      {/* Header */}
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

      {/* Grid of Waste Stream Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => {
          const benchmark = lot.benchmarkPrice || 350;
          const fairBand = calculateFairPriceRange(benchmark, 25);
          const qty = lot.quantity || lot.totalWeightKg || 1;
          const unit = lot.unit || 'kg';

          return (
            <div
              key={lot.id}
              className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {tCategory(lot.category)}
                    </span>
                    <h3 className="text-base font-bold text-[#222222] mt-1.5">{lot.material}</h3>
                    <span className="text-xs font-mono text-[#555555]">{lot.id}</span>
                  </div>
                  <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                    {qty} {unit}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#555555]">
                  <p className="flex items-center gap-1.5 text-[#222222] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                    <span className="truncate">{lot.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                    <span>{t('postedDate', 'Posted')}: {lot.collectionDate || lot.createdDate || 'Today'}</span>
                  </p>
                </div>

                {/* Benchmark Band info */}
                <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#555555] uppercase">{t('stateBenchmarkRate', 'State Benchmark Rate')}</span>
                    <span className="font-bold text-[#222222]">₹{benchmark} / {unit}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#555555]">{t('fairRange25', 'Fair Range (±25%)')}</span>
                    <span className="font-bold text-[#1F6F5F]">₹{fairBand.minPrice} – ₹{fairBand.maxPrice} / {unit}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t-2 border-[#D6E8DF]">
                <button
                  onClick={() => handleOpenBid(lot)}
                  className="w-full py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{t('submitPriceOffer', 'Submit Price Offer')}</span>
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
              <div className="p-3.5 bg-white border-2 border-[#D6E8DF] rounded-lg space-y-1 text-[#555555]">
                <p><strong className="text-[#222222]">{t('materialCategory', 'Material')}:</strong> {selectedLotForBid.material}</p>
                <p><strong className="text-[#222222]">{t('weight', 'Weight')}:</strong> {selectedLotForBid.quantity || selectedLotForBid.totalWeightKg} {selectedLotForBid.unit || 'kg'}</p>
                <p><strong className="text-[#222222]">{t('benchmarkPriceLabel', 'Benchmark Rate')}:</strong> ₹{selectedLotForBid.benchmarkPrice || 350} / {selectedLotForBid.unit || 'kg'}</p>
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
