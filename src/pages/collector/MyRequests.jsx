import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Package, ArrowRight, Clock, 
  CheckCircle2, DollarSign, Scale, Calendar, Eye, LayoutGrid, ListFilter
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { mockWasteLots, mockOffers } from '../../data/mockData';
import { useTranslation } from '../../i18n';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { syncPendingRecords } from '../../services/offline/syncManager';

export default function MyRequests({ materialLots = mockWasteLots, offers = mockOffers }) {
  const navigate = useNavigate();
  const { t, tCategory, tStatus } = useTranslation();
  const { online } = useOnlineStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const allLots = materialLots || mockWasteLots;
  const allOffers = offers || mockOffers;

  // Filter requests
  const filteredRequests = allLots.filter((lot) => {
    const matchesSearch = 
      (lot.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.material || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || 
      lot.status === statusFilter ||
      (statusFilter === 'AWAITING_OFFERS' && ['AWAITING_OFFERS', 'SUBMITTED', 'AVAILABLE', 'REGISTERED'].includes(lot.status)) ||
      (statusFilter === 'OFFERS_RECEIVED' && ['OFFERS_RECEIVED', 'OFFER_RECEIVED', 'MATCHED'].includes(lot.status)) ||
      (statusFilter === 'OFFER_ACCEPTED' && ['OFFER_ACCEPTED', 'ACCEPTED', 'PICKUP_SCHEDULED'].includes(lot.status)) ||
      (statusFilter === 'IN_TRANSIT' && ['IN_TRANSIT', 'In Transit', 'DISPATCHED', 'HANDED_OVER'].includes(lot.status)) ||
      (statusFilter === 'COMPLETED' && ['COMPLETED', 'PAYMENT_COMPLETED'].includes(lot.status));

    return matchesSearch && matchesStatus;
  });

  // Count helper
  const getOffersForLot = (lotId) => {
    return allOffers.filter(o => o.lotId === lotId);
  };

  const awaitingCount = allLots.filter(l => ['AWAITING_OFFERS', 'SUBMITTED', 'AVAILABLE', 'REGISTERED'].includes(l.status)).length;
  const offersReceivedCount = allLots.filter(l => ['OFFERS_RECEIVED', 'OFFER_RECEIVED', 'MATCHED'].includes(l.status)).length;
  const acceptedCount = allLots.filter(l => ['OFFER_ACCEPTED', 'ACCEPTED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'HANDED_OVER'].includes(l.status)).length;
  const completedCount = allLots.filter(l => ['COMPLETED', 'PAYMENT_COMPLETED'].includes(l.status)).length;

  const pendingLotsCount = allLots.filter(l => l.syncStatus === 'pending').length;
  const failedLotsCount = allLots.filter(l => l.syncStatus === 'failed').length;
  const hasPending = pendingLotsCount > 0 || failedLotsCount > 0;

  return (
    <div className="space-y-6 bg-white text-[#222222]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F6F5F] bg-[#F5FBF7] border-2 border-[#D6E8DF] px-3 py-1 rounded">
              {t('collectorPortal', 'Collector Portal')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-2">{t('myEWasteRequests', 'My E-Waste Requests')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('trackRequestsSubtitle', 'Track your declared e-waste requests, review incoming offers from authorized recyclers, and manage handovers.')}
          </p>
        </div>

        <button
          onClick={() => navigate('/collector/register-waste')}
          className="px-5 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createEWasteRequest', 'Create E-Waste Request')}</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      {hasPending ? (
        <div className="p-4 bg-[#EFF8F2] border-2 border-[#D6E8DF] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F5F] shrink-0" />
            <div>
              <span className="font-bold text-[#222222]">
                {pendingLotsCount} {pendingLotsCount === 1 ? 'record' : 'records'} waiting to sync
              </span>
              <p className="text-[11px] text-[#555555]">
                Data is saved safely offline on this device. It will upload automatically once connection is established.
              </p>
            </div>
          </div>
          {online && (
            <button
              onClick={() => syncPendingRecords()}
              className="px-4 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Sync Now</span>
            </button>
          )}
        </div>
      ) : allLots.length > 0 && (
        <div className="px-4 py-2.5 bg-[#EFF8F2] border-2 border-[#D6E8DF] rounded-lg flex items-center justify-between text-xs text-[#222222] font-bold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
            <span>All records synced</span>
          </span>
          <span className="text-[11px] text-[#555555] font-semibold">Local & cloud database synchronized</span>
        </div>
      )}

      {/* Overview Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('AWAITING_OFFERS')}
          className={`p-4 rounded-lg border-2 transition cursor-pointer ${
            statusFilter === 'AWAITING_OFFERS' 
              ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]' 
              : 'bg-[#F5FBF7] border-[#D6E8DF] hover:border-[#B8D9C8] text-[#222222]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${statusFilter === 'AWAITING_OFFERS' ? 'text-white/80' : 'text-[#555555]'}`}>
            {t('statusAWAITING_OFFERS', 'Awaiting Offers')}
          </span>
          <span className="text-xl font-bold mt-1 block">{awaitingCount}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('OFFERS_RECEIVED')}
          className={`p-4 rounded-lg border-2 transition cursor-pointer ${
            statusFilter === 'OFFERS_RECEIVED' 
              ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]' 
              : 'bg-[#F5FBF7] border-[#D6E8DF] hover:border-[#B8D9C8] text-[#222222]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${statusFilter === 'OFFERS_RECEIVED' ? 'text-white/80' : 'text-[#555555]'}`}>
            {t('statusOFFERS_RECEIVED', 'Offers Received')}
          </span>
          <span className="text-xl font-bold mt-1 block">{offersReceivedCount}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('OFFER_ACCEPTED')}
          className={`p-4 rounded-lg border-2 transition cursor-pointer ${
            statusFilter === 'OFFER_ACCEPTED' 
              ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]' 
              : 'bg-[#F5FBF7] border-[#D6E8DF] hover:border-[#B8D9C8] text-[#222222]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${statusFilter === 'OFFER_ACCEPTED' ? 'text-white/80' : 'text-[#555555]'}`}>
            {t('offerAcceptedInTransit', 'Offer Accepted / In Transit')}
          </span>
          <span className="text-xl font-bold mt-1 block">{acceptedCount}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-4 rounded-lg border-2 transition cursor-pointer ${
            statusFilter === 'COMPLETED' 
              ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]' 
              : 'bg-[#F5FBF7] border-[#D6E8DF] hover:border-[#B8D9C8] text-[#222222]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${statusFilter === 'COMPLETED' ? 'text-white/80' : 'text-[#555555]'}`}>
            {t('statusCOMPLETED', 'Completed')}
          </span>
          <span className="text-xl font-bold mt-1 block">{completedCount}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#F5FBF7] p-4 sm:p-5 rounded-lg border-2 border-[#D6E8DF] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchRequestPlaceholder', 'Search request ID, material, or location...')}
            className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: t('allRequests', 'All Requests') },
            { key: 'AWAITING_OFFERS', label: t('statusAWAITING_OFFERS', 'Awaiting Offers') },
            { key: 'OFFERS_RECEIVED', label: t('statusOFFERS_RECEIVED', 'Offers Received') },
            { key: 'OFFER_ACCEPTED', label: t('statusOFFER_ACCEPTED', 'Offer Accepted') },
            { key: 'IN_TRANSIT', label: t('statusInTransit', 'In Transit') },
            { key: 'COMPLETED', label: t('statusCOMPLETED', 'Completed') }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer border-2 ${
                statusFilter === item.key
                  ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                  : 'bg-white text-[#222222] border-[#D6E8DF] hover:border-[#B8D9C8]'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* View Toggle */}
          <div className="hidden lg:flex items-center bg-white p-1 rounded-lg border-2 border-[#D6E8DF] ml-2">
            <button
              onClick={() => setViewMode('cards')}
              title="Cards View"
              className={`p-1.5 rounded-md transition ${viewMode === 'cards' ? 'bg-[#1F6F5F] text-white' : 'text-[#555555] hover:text-[#222222]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-[#1F6F5F] text-white' : 'text-[#555555] hover:text-[#222222]'}`}
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LISTING CONTENT */}
      {filteredRequests.length > 0 ? (
        viewMode === 'cards' ? (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => {
              const reqOffers = getOffersForLot(request.id);
              const qty = request.quantity || request.totalWeightKg || 1;
              const unit = request.unit || 'kg';
              const benchmark = request.benchmarkPrice || 350;
              const estValue = request.agreedTotalValue || request.estimatedLotValue || (qty * benchmark);

              return (
                <div
                  key={request.id}
                  className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
                          {tCategory(request.category)}
                        </span>
                        <h3 className="text-base font-bold text-[#222222] mt-1.5">{request.material}</h3>
                        <span className="text-xs font-mono text-[#555555]">{request.id}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={request.status} />
                        {request.syncStatus === 'pending' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#555555] border-2 border-[#D6E8DF] inline-flex items-center gap-1">
                            <span>Pending sync</span>
                          </span>
                        ) : request.syncStatus === 'failed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#222222] border-2 border-[#D6E8DF] inline-flex items-center gap-1">
                            <span>Sync failed</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#1F6F5F] border-2 border-[#D6E8DF] inline-flex items-center gap-1">
                            <span>✓ Synced</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#555555]">
                      <div className="p-2.5 bg-white border-2 border-[#D6E8DF] rounded-lg">
                        <span className="text-[10px] text-[#555555] block uppercase font-bold">{t('quantityLabel', 'Quantity')}</span>
                        <span className="text-sm font-bold text-[#222222]">{qty} {unit}</span>
                      </div>

                      <div className="p-2.5 bg-white border-2 border-[#D6E8DF] rounded-lg">
                        <span className="text-[10px] text-[#555555] block uppercase font-bold">{t('submissionDate', 'Submission Date')}</span>
                        <span className="text-xs font-bold text-[#222222]">{request.collectionDate || request.createdDate || 'Today'}</span>
                      </div>
                    </div>

                    {/* Offers Status Highlight */}
                    <div className="p-3 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#555555] block">{t('receivedOffers', 'Received Offers')}</span>
                        <span className="font-bold text-[#222222]">
                          {reqOffers.length > 0 ? (
                            <span className="text-[#1F6F5F] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {reqOffers.length} {reqOffers.length === 1 ? t('offerCountOne', 'Offer') : t('offerCountMany', 'Offers')} {t('received', 'Received')}
                            </span>
                          ) : (
                            <span className="text-[#555555] font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {t('awaitingRecyclerOffers', 'Awaiting Recycler Offers')}
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-[#555555] block">{t('benchmarkPriceLabel', 'Benchmark')}</span>
                        <span className="font-bold text-[#1F6F5F]">₹{benchmark}/{unit}</span>
                      </div>
                    </div>

                    {/* Recycler Assigned Banner (if accepted) */}
                    {request.selectedRecyclerName && (
                      <div className="p-2.5 bg-[#EFF8F2] border-2 border-[#D6E8DF] rounded-lg text-xs text-[#1F6F5F] font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
                        <span className="truncate">{t('acceptedRecycler', 'Accepted: {name}', { name: request.selectedRecyclerName })}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t-2 border-[#D6E8DF] flex items-center justify-between">
                    <span className="text-[11px] text-[#555555] font-semibold truncate max-w-[140px]">
                      {request.location}
                    </span>

                    <button
                      onClick={() => navigate(`/collector/requests/${request.id}`)}
                      className="px-4 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t('viewDetails', 'View Details')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFF8F2] border-b-2 border-[#D6E8DF] text-[#222222] font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t('requestIdCol', 'Request ID')}</th>
                    <th className="px-6 py-4">{t('wasteMaterialCol', 'Waste Material')}</th>
                    <th className="px-6 py-4">{t('quantityLabel', 'Quantity')}</th>
                    <th className="px-6 py-4">{t('submissionDate', 'Submission Date')}</th>
                    <th className="px-6 py-4">{t('status', 'Status')}</th>
                    <th className="px-6 py-4">{t('offersReceived', 'Offers Received')}</th>
                    <th className="px-6 py-4 text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#D6E8DF] font-semibold text-[#222222]">
                  {filteredRequests.map((request) => {
                    const reqOffers = getOffersForLot(request.id);
                    const qty = request.quantity || request.totalWeightKg || 1;
                    const unit = request.unit || 'kg';

                    return (
                      <tr key={request.id} className="hover:bg-[#EFF8F2] transition">
                        <td className="px-6 py-4 font-mono font-bold text-[#222222]">
                          {request.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#222222]">{request.material}</div>
                          <div className="text-[11px] text-[#555555]">{tCategory(request.category)}</div>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {qty} {unit}
                        </td>
                        <td className="px-6 py-4 text-[#555555]">
                          {request.collectionDate || request.createdDate || 'Today'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <StatusBadge status={request.status} size="sm" />
                            {request.syncStatus === 'pending' ? (
                              <span className="text-[10px] font-bold text-[#555555] bg-white px-2 py-0.5 rounded border-2 border-[#D6E8DF]">
                                Pending sync
                              </span>
                            ) : request.syncStatus === 'failed' ? (
                              <span className="text-[10px] font-bold text-[#222222] bg-white px-2 py-0.5 rounded border-2 border-[#D6E8DF]">
                                Sync failed
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#1F6F5F] bg-white px-2 py-0.5 rounded border-2 border-[#D6E8DF]">
                                ✓ Synced
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {reqOffers.length > 0 ? (
                            <span className="px-2.5 py-1 bg-white text-[#1F6F5F] border-2 border-[#D6E8DF] rounded font-bold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {reqOffers.length} {reqOffers.length === 1 ? t('offerCountOne', 'Offer') : t('offerCountMany', 'Offers')}
                            </span>
                          ) : (
                            <span className="text-[#555555] text-[11px] italic">0 ({t('awaiting', 'Awaiting')})</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/collector/requests/${request.id}`)}
                            className="px-3.5 py-1.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{t('viewDetails', 'View Details')}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-[#F5FBF7] p-12 rounded-lg border-2 border-[#D6E8DF] text-center space-y-4">
          <div className="w-16 h-16 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center mx-auto font-bold text-xl">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#222222]">{t('noEWasteRequestsFound', 'No E-Waste Requests Found')}</h3>
          <p className="text-xs text-[#555555] max-w-sm mx-auto">
            {searchQuery 
              ? t('noRequestsMatchedQuery', 'No requests matched your filter parameters. Try clearing your search query.') 
              : t('noRequestsSubmittedYet', 'You have not submitted any e-waste requests yet. Create a new request to notify authorized recyclers in your area.')}
          </p>
          <button
            onClick={() => navigate('/collector/register-waste')}
            className="px-6 py-2.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition cursor-pointer"
          >
            {t('createFirstEWasteRequest', 'Create First E-Waste Request')}
          </button>
        </div>
      )}
    </div>
  );
}
