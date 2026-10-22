import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Package, ShoppingBag, DollarSign, Scale, RefreshCw, ArrowRight, CheckCircle2, Clock, Award } from 'lucide-react';
import StatCard from '../../components/Cards/StatCard';
import WasteLotCard from '../../components/Cards/WasteLotCard';
import { mockWasteLots, mockTransactions } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function RecyclerDashboard({ recyclerProfile, materialLots = [] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const availableLots = (materialLots || []).filter(l => ['REGISTERED', 'MATCHED', 'AWAITING_OFFERS', 'AVAILABLE'].includes(l.status));
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
            <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F6F5F]" />
              {t('recStatusVERIFIED')}
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
            <span>{t('availableCollectorRequests')}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('navWasteRequests')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('availableRequestsDesc')}
            </p>
          </div>
          <Link
            to="/recycler/waste-requests"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('availableCollectorRequests')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('transactionsTitle')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('transactionsSubtitle')}
            </p>
          </div>
          <Link
            to="/recycler/transactions"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('navTransactions')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('navCompliance')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('cpcbVerifLayerSub')}
            </p>
          </div>
          <Link
            to="/recycler/compliance"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('navCompliance')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
