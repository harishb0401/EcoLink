import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import WasteLotCard from '../../components/Cards/WasteLotCard';
import { mockWasteLots } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function RecyclerDashboard({ recyclerProfile, materialLots = [], onRefreshData }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
  const activeProcessing = (materialLots || []).filter(l => ['ACCEPTED', 'DISPATCHED', 'OFFER_ACCEPTED'].includes(l.status));
  const recycledLots = (materialLots || []).filter(l => l.status === 'COMPLETED');

  const totalProcuredKg = (materialLots || [])
    .filter(l => ['ACCEPTED', 'DISPATCHED', 'COMPLETED', 'OFFER_ACCEPTED'].includes(l.status))
    .reduce((sum, l) => sum + (parseFloat(l.quantity || l.totalWeightKg) || 0), 0);

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
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1 ${
              isVerified 
                ? 'text-[#1F6F5F] bg-white border-2 border-[#D6E8DF]' 
                : 'text-amber-800 bg-amber-100 border-2 border-amber-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {isVerified ? t('recStatusVERIFIED', 'VERIFIED') : `STATUS: ${recyclerProfile?.status || 'PENDING'}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-3">
            {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1">
            {t('availableRequestsDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recycler/waste-requests')}
            className="px-6 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('availableCollectorRequests')} ({availableLots.length})</span>
          </button>
        </div>
      </div>

      {/* Available Lots Ready For Procurement */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableLots.slice(0, 3).map((lot) => (
            <WasteLotCard
              key={lot.id}
              lot={lot}
              onViewDetails={() => navigate('/recycler/waste-requests')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
