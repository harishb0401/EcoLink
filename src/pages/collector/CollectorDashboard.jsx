import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, ArrowRight, Package, DollarSign, Scale, ShieldCheck, 
  CheckCircle2, Clock, Sparkles, Inbox, Award
} from 'lucide-react';
import StatCard from '../../components/Cards/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { mockWasteLots, mockOffers, mockTransactions } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function CollectorDashboard({ 
  materialLots = mockWasteLots, 
  offers = mockOffers,
  transactions = mockTransactions, 
  collectorProfile = null 
}) {
  const navigate = useNavigate();
  const { t, tCategory } = useTranslation();

  const myLots = materialLots || mockWasteLots;
  const allOffers = offers || mockOffers;

  const activeRequests = myLots.filter(l => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(l.status));
  const awaitingOffersCount = myLots.filter(l => ['AWAITING_OFFERS', 'SUBMITTED', 'AVAILABLE', 'REGISTERED'].includes(l.status)).length;
  const totalWeight = myLots.reduce((acc, l) => acc + (parseFloat(l.quantity || l.totalWeightKg) || 0), 0);
  const totalEarnings = (transactions || []).reduce((acc, tx) => acc + (tx.totalValue || 0), 0) + 
                        myLots.filter(l => l.status === 'COMPLETED').reduce((s, l) => s + (l.agreedTotalValue || l.estimatedLotValue || 0), 0);

  return (
    <div className="space-y-8 bg-white text-[#222222]">
      {/* Welcome Banner - Highlighted Section */}
      <div className="bg-[#EFF8F2] text-[#222222] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
              {t('collectorPortal')}
            </span>
            {collectorProfile?.phone_verified && (
              <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#6FCF97] px-2.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#1F6F5F]" />
                {t('phoneVerifiedBadge')}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-3">
            {t('goodMorningUser', { name: collectorProfile?.fullName || collectorProfile?.name || collectorProfile?.email || 'Collector' })}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1">
            {t('eWasteManifestSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/collector/register-waste')}
            className="px-6 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createEWasteRequest')}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Cards (Request-Driven Flow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Create Request */}
        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-3 flex flex-col justify-between hover:border-[#B8D9C8] transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('createEWasteRequest')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('addEWasteSubtitle')}
            </p>
          </div>
          <Link
            to="/collector/register-waste"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('navRegisterEWaste')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: My Requests */}
        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-3 flex flex-col justify-between hover:border-[#B8D9C8] transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('myDeclaredLots')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('availableRequestsDesc')}
            </p>
          </div>
          <Link
            to="/collector/requests"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Transactions */}
        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-3 flex flex-col justify-between hover:border-[#B8D9C8] transition">
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
            to="/collector/transactions"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('navTransactions')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent E-Waste Requests Section */}
      <div className="bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">{t('myDeclaredLots')}</h2>
            <p className="text-xs text-[#555555]">{t('availableRequestsDesc')}</p>
          </div>
          <Link
            to="/collector/requests"
            className="text-xs font-bold text-[#1F6F5F] hover:underline flex items-center gap-1"
          >
            <span>{t('viewDetails')} ({myLots.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myLots.slice(0, 3).map((lot) => {
            const reqOffers = allOffers.filter(o => o.lotId === lot.id);
            const qty = lot.quantity || lot.totalWeightKg || 1;
            const unit = lot.unit || 'kg';

            return (
              <div
                key={lot.id}
                className="p-5 bg-white rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-[#F5FBF7] border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                        {tCategory(lot.category)}
                      </span>
                      <h4 className="text-sm font-bold text-[#222222] mt-1">{lot.material}</h4>
                      <span className="text-[11px] font-mono text-[#555555]">{lot.id}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={lot.status} size="sm" />
                      {lot.syncStatus === 'pending' ? (
                        <span className="text-[10px] font-bold text-[#555555] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                          Pending sync
                        </span>
                      ) : lot.syncStatus === 'failed' ? (
                        <span className="text-[10px] font-bold text-[#222222] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                          Sync failed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                          ✓ Synced
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-[#555555]">
                    <div>
                      <span className="text-[10px] block uppercase font-bold">{t('quantityLabel')}</span>
                      <strong className="text-[#222222]">{qty} {unit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] block uppercase font-bold">{t('statusOFFER_RECEIVED')}</span>
                      <strong className="text-[#1F6F5F]">
                        {reqOffers.length > 0 ? `${reqOffers.length} Received` : t('statusAWAITING_OFFERS')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t-2 border-[#D6E8DF] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1F6F5F]">
                    {t('benchmarkPriceLabel')}: ₹{lot.benchmarkPrice || 350}/{unit}
                  </span>
                  <button
                    onClick={() => navigate(`/collector/requests/${lot.id}`)}
                    className="px-3 py-1.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('viewDetails')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
