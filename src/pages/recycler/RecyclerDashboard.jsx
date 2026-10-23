import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ShoppingBag, ArrowRight, Truck, Award, 
  Layers, User, CheckCircle2, DollarSign, Calendar, Clock, MapPin
} from 'lucide-react';
import WasteLotCard from '../../components/Cards/WasteLotCard';
import StatusBadge from '../../components/StatusBadge';
import { useTranslation } from '../../i18n';

export default function RecyclerDashboard({ 
  recyclerProfile, 
  materialLots = [], 
  offers = [], 
  transactions = [], 
  onRefreshData 
}) {
  const navigate = useNavigate();
  const { t, tCategory } = useTranslation();

  const isVerified = (
    recyclerProfile?.status || 
    recyclerProfile?.verificationStatus || 
    recyclerProfile?.cpcbStatus || 
    recyclerProfile?.recyclerProfile?.status || 
    recyclerProfile?.recyclerProfile?.verificationStatus || 
    ''
  ).toUpperCase() === 'VERIFIED';

  const availableLots = (materialLots || []).filter(l => 
    ['REGISTERED', 'MATCHED', 'AWAITING_OFFERS', 'AVAILABLE', 'Available', 'SUBMITTED', 'OFFERS_RECEIVED', 'Pending Review', 'PENDING_REVIEW'].includes(l.status) || !l.status
  );
  const activeProcessing = (materialLots || []).filter(l => 
    ['ACCEPTED', 'DISPATCHED', 'OFFER_ACCEPTED', 'PICKUP_SCHEDULED', 'IN_TRANSIT'].includes(l.status)
  );
  const recycledLots = (materialLots || []).filter(l => l.status === 'COMPLETED');

  const totalProcuredKg = (materialLots || [])
    .filter(l => ['ACCEPTED', 'DISPATCHED', 'COMPLETED', 'OFFER_ACCEPTED'].includes(l.status))
    .reduce((sum, l) => sum + (parseFloat(l.quantity || l.totalWeightKg) || 0), 0);

  const totalSpent = (transactions || []).reduce((sum, tx) => sum + (parseFloat(tx.totalValue || tx.amount) || 0), 0);

  const displayName = recyclerProfile?.facilityName || 
    recyclerProfile?.companyName || 
    recyclerProfile?.organizationName || 
    recyclerProfile?.fullName || 
    recyclerProfile?.name || 
    'Recycler Facility';

  return (
    <div className="space-y-8 bg-white text-[#222222]">
      {/* Recycler Welcome Banner */}
      <div className="bg-[#EFF8F2] text-[#222222] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
              {t('recyclerPortal')}
            </span>
            <button
              onClick={() => navigate(isVerified ? '/recycler/compliance' : '/recycler/profile')}
              className={`text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition ${
                isVerified 
                  ? 'text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] hover:border-[#1F6F5F]' 
                  : 'text-amber-800 bg-amber-100 border-2 border-amber-300 hover:border-amber-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isVerified ? t('recStatusVERIFIED', 'VERIFIED') : `STATUS: ${recyclerProfile?.status || 'PENDING'}`}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-3">
            {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1">
            {t('availableRequestsDesc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/recycler/waste-requests')}
            className="px-6 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('availableCollectorRequests')} ({availableLots.length})</span>
          </button>
          <button
            onClick={() => navigate('/recycler/compliance')}
            className="px-4 py-3 bg-white hover:border-[#B8D9C8] text-[#1F6F5F] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('navCompliance')}</span>
          </button>
        </div>
      </div>

      {/* KPI & Metrics Summary Grid - All Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Waste Lots */}
        <div 
          onClick={() => navigate('/recycler/waste-requests?tab=available')}
          className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#1F6F5F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wider">{t('navWasteRequests')}</span>
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center group-hover:bg-[#1F6F5F] group-hover:text-white transition">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#222222]">{availableLots.length}</span>
            <p className="text-[11px] text-[#555555] mt-0.5">Open for Bidding & Take-Back</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D6E8DF] flex items-center justify-between text-xs font-bold text-[#1F6F5F]">
            <span>Browse Available Lots</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Active Pickups & Bids */}
        <div 
          onClick={() => navigate('/recycler/waste-requests?tab=accepted')}
          className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#1F6F5F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wider">Accepted & Logistics</span>
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center group-hover:bg-[#1F6F5F] group-hover:text-white transition">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#222222]">{activeProcessing.length}</span>
            <p className="text-[11px] text-[#555555] mt-0.5">{offers.length} active bids submitted</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D6E8DF] flex items-center justify-between text-xs font-bold text-[#1F6F5F]">
            <span>View Scheduled Pickups</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Total Procured / Transactions */}
        <div 
          onClick={() => navigate('/recycler/transactions')}
          className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#1F6F5F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wider">{t('navTransactions')}</span>
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center group-hover:bg-[#1F6F5F] group-hover:text-white transition">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#222222]">{totalProcuredKg.toLocaleString()} kg</span>
            <p className="text-[11px] text-[#555555] mt-0.5">₹{totalSpent.toLocaleString()} settled value</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D6E8DF] flex items-center justify-between text-xs font-bold text-[#1F6F5F]">
            <span>View Purchase Orders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: CPCB & EPR Compliance */}
        <div 
          onClick={() => navigate('/recycler/compliance')}
          className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#1F6F5F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wider">{t('navCompliance')}</span>
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center group-hover:bg-[#1F6F5F] group-hover:text-white transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-[#1F6F5F] flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#1F6F5F]" />
              <span>{isVerified ? 'VERIFIED' : 'PENDING'}</span>
            </span>
            <p className="text-[11px] text-[#555555] mt-0.5">EPR Form-2 Certified</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D6E8DF] flex items-center justify-between text-xs font-bold text-[#1F6F5F]">
            <span>Audit & Certificates</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-[#EFF8F2] p-4 sm:p-5 rounded-lg border-2 border-[#D6E8DF] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#222222]">Quick Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/recycler/waste-requests?tab=available')}
            className="px-3.5 py-2 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#222222] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>Available Streams</span>
          </button>
          <button
            onClick={() => navigate('/recycler/waste-requests?tab=bids')}
            className="px-3.5 py-2 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#222222] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>My Submitted Bids ({offers.length})</span>
          </button>
          <button
            onClick={() => navigate('/recycler/waste-requests?tab=accepted')}
            className="px-3.5 py-2 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#222222] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>Accepted Pickups ({activeProcessing.length})</span>
          </button>
          <button
            onClick={() => navigate('/recycler/transactions')}
            className="px-3.5 py-2 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#222222] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>Digital Receipts</span>
          </button>
          <button
            onClick={() => navigate('/recycler/profile')}
            className="px-3.5 py-2 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#222222] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>{t('profile')}</span>
          </button>
        </div>
      </div>

      {/* Section 1: Active Pickups & Accepted Batches (if any) */}
      {activeProcessing.length > 0 && (
        <div className="bg-[#EFF8F2] p-6 sm:p-8 rounded-lg border-2 border-[#B8D9C8] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#1F6F5F]" />
              <div>
                <h2 className="text-lg font-bold text-[#222222]">Active Pickups & Logistics ({activeProcessing.length})</h2>
                <p className="text-xs text-[#555555]">Lots where your price offer was accepted and scheduled for intake</p>
              </div>
            </div>
            <Link
              to="/recycler/waste-requests?tab=accepted"
              className="text-xs font-bold text-[#1F6F5F] hover:underline flex items-center gap-1"
            >
              <span>Manage Handover →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProcessing.slice(0, 3).map((lot) => (
              <div
                key={lot.id || lot.lotId}
                className="p-5 bg-white rounded-lg border-2 border-[#D6E8DF] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-[#F5FBF7] border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                        {tCategory(lot.category)}
                      </span>
                      <h4 className="text-sm font-bold text-[#222222] mt-1">{lot.material}</h4>
                      <span className="text-[11px] font-mono text-[#555555]">{lot.id || lot.lotId}</span>
                    </div>
                    <StatusBadge status={lot.status} size="sm" />
                  </div>

                  <div className="space-y-1.5 mt-3 text-xs text-[#555555]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                      <span className="truncate">Node: <strong className="text-[#222222]">{lot.collectionAddress || lot.location || 'Collector Hub'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1F6F5F] shrink-0" />
                      <span>Pickup: <strong className="text-[#222222]">{lot.preferredPickupDate || 'Scheduled within 48h'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t-2 border-[#D6E8DF] flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate('/recycler/waste-requests?tab=accepted&lotId=' + (lot.id || lot.lotId))}
                    className="flex-1 py-1.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg text-xs font-bold transition text-center cursor-pointer"
                  >
                    Logistics & Handover
                  </button>
                  <button
                    onClick={() => navigate('/recycler/transactions')}
                    className="px-3 py-1.5 bg-white hover:border-[#B8D9C8] border-2 border-[#D6E8DF] text-[#1F6F5F] rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Available Lots Ready For Procurement */}
      <div className="bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">{t('availableCollectorRequests')}</h2>
            <p className="text-xs text-[#555555]">{t('requestsAvailableBidding')}</p>
          </div>
          <Link
            to="/recycler/waste-requests"
            className="text-xs font-bold text-[#1F6F5F] hover:underline flex items-center gap-1"
          >
            <span>{t('viewDetails')} ({availableLots.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {availableLots.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border-2 border-[#D6E8DF] space-y-2">
            <ShoppingBag className="w-8 h-8 text-[#555555] mx-auto" />
            <p className="text-xs font-bold text-[#222222]">No Open E-Waste Requests</p>
            <p className="text-[11px] text-[#555555]">All currently registered collector lots have been procured or are undergoing processing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableLots.slice(0, 3).map((lot) => (
              <WasteLotCard
                key={lot.id || lot.lotId}
                lot={lot}
                detailUrl={`/recycler/waste-requests/${lot.id || lot.lotId}`}
                onViewDetails={(selectedLot) => navigate(`/recycler/waste-requests?lotId=${selectedLot.id || selectedLot.lotId}`)}
                onOpenOffers={(selectedLot) => navigate(`/recycler/waste-requests?lotId=${selectedLot.id || selectedLot.lotId}&action=bid`)}
                actionLabel={t('submitPriceOffer', 'Submit Offer')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
