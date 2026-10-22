import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Building, FileText, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { mockRecyclers } from '../../data/mockData';
import { useTranslation } from '../../i18n';
import adminService from '../../services/adminService';

export default function Verification({ recyclers = mockRecyclers }) {
  const { t } = useTranslation();
  const [pendingRecyclers, setPendingRecyclers] = useState([]);
  const [flaggedOffers, setFlaggedOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState(null);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getVerifications();
      if (data) {
        setPendingRecyclers(data.pendingRecyclers || []);
        setFlaggedOffers(data.flaggedOffers || []);
      }
    } catch (err) {
      console.warn('Could not fetch live verifications:', err.message);
      setPendingRecyclers((recyclers || []).filter(r => r.cpcbStatus === 'PENDING' || r.verificationStatus === 'PENDING'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApproveRecycler = async (id) => {
    try {
      await adminService.verifyRecycler(id);
      setPendingRecyclers(prev => prev.filter(r => r.id !== id && r.userId !== id));
      setActionAlert({
        type: 'success',
        text: `Facility approved! CPCB credentials verified and status updated to VERIFIED in Supabase.`
      });
    } catch (err) {
      alert(err.message || 'Failed to approve recycler on server.');
    }
  };

  const handleRejectRecycler = async (id) => {
    const reason = prompt('Please enter the regulatory rejection reason:', 'Facility documentation does not meet regulatory CPCB threshold');
    if (reason === null) return;

    try {
      await adminService.rejectRecycler(id, reason);
      setPendingRecyclers(prev => prev.filter(r => r.id !== id && r.userId !== id));
      setActionAlert({
        type: 'error',
        text: `Facility application rejected and logged in verification records.`
      });
    } catch (err) {
      alert(err.message || 'Failed to reject recycler on server.');
    }
  };

  const handleResolveFlag = async (id, action) => {
    try {
      if (action === 'dismissed') {
        await adminService.cancelOffer(id);
        setActionAlert({
          type: 'error',
          text: `Flagged offer ${id} was cancelled by administrator.`
        });
      } else {
        setActionAlert({
          type: 'success',
          text: `Flagged offer ${id} was reviewed and approved for transaction.`
        });
      }
      setFlaggedOffers(prev => prev.filter(f => f.id !== id && f.offerId !== id));
    } catch (err) {
      alert(err.message || 'Failed to update flagged offer.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto bg-white text-[#222222]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('verificationQueue', 'Verification & Compliance Queue')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('reviewAndApprovePending', 'Review pending recycler CPCB licenses and investigate rule-engine flagged pricing offers.')}
          </p>
        </div>

        <button
          onClick={fetchVerifications}
          className="px-4 py-2 bg-[#F5FBF7] border-2 border-[#D6E8DF] text-xs font-bold text-[#222222] rounded-lg hover:border-[#B8D9C8] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t('refreshQueue', 'Refresh Queue')}</span>
        </button>
      </div>

      {/* Action Banner */}
      {actionAlert && (
        <div className={`p-4 rounded-lg text-xs font-bold flex items-center justify-between border-2 ${
          actionAlert.type === 'success' ? 'bg-[#EFF8F2] border-[#B8D9C8] text-[#1F6F5F]' : 'bg-[#EFF8F2] border-[#D6E8DF] text-[#222222]'
        }`}>
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#1F6F5F] shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-[#555555] shrink-0" />
            )}
            <span>{actionAlert.text}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-xs font-bold text-[#555555] hover:text-[#222222]">
            Dismiss
          </button>
        </div>
      )}

      {/* Pending Facilities Section */}
      <div className="bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#D6E8DF] pb-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#1F6F5F]" />
            <h2 className="text-lg font-bold text-[#222222]">{t('pendingRecyclerRegistrations')}</h2>
          </div>
          <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
            {pendingRecyclers.length} {t('awaitingReview')}
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-[#555555]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1F6F5F] mb-2" />
            <p className="text-xs font-bold">Loading pending facility applications...</p>
          </div>
        ) : pendingRecyclers.length > 0 ? (
          <div className="space-y-4">
            {pendingRecyclers.map((rec) => (
              <div
                key={rec.id || rec.userId}
                className="p-5 rounded-lg bg-white border-2 border-[#D6E8DF] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <h3 className="text-base font-bold text-[#222222]">{rec.companyName || rec.organizationName}</h3>
                  <p className="text-[#555555]">{t('locationLabel', 'Location')}: {rec.location} • {t('contactLabel', 'Contact')}: {rec.contactPerson} ({rec.phone || 'N/A'})</p>
                  <p className="text-[#555555]">{t('cpcbRegLabel', 'CPCB Reg')}: <span className="font-mono font-bold text-[#222222]">{rec.cpcbRegistrationNo || rec.cpcbRegistrationNumber || 'PENDING'}</span></p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRejectRecycler(rec.id || rec.userId)}
                    className="px-4 py-2 bg-white hover:border-[#B8D9C8] text-[#222222] font-bold text-xs rounded-lg border-2 border-[#D6E8DF] transition cursor-pointer"
                  >
                    {t('reject')}
                  </button>
                  <button
                    onClick={() => handleApproveRecycler(rec.id || rec.userId)}
                    className="px-5 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('approveCpcbFacility')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#555555] text-center py-4">{t('allApplicationsCleared')}</p>
        )}
      </div>

      {/* Flagged Pricing Offers Section */}
      <div className="bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#D6E8DF] pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#555555]" />
            <h2 className="text-lg font-bold text-[#222222]">{t('ruleEngineFlaggedBids')}</h2>
          </div>
          <span className="text-xs font-bold text-[#555555] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
            {flaggedOffers.length} {t('flaggedCases')}
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-[#555555]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1F6F5F] mb-2" />
            <p className="text-xs font-bold">Scanning flagged pricing bids...</p>
          </div>
        ) : flaggedOffers.length > 0 ? (
          <div className="space-y-4">
            {flaggedOffers.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-lg bg-white border-2 border-[#D6E8DF] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#222222]">{item.id}</span>
                    <strong className="text-sm font-bold text-[#222222]">{item.recyclerName}</strong>
                  </div>
                  <p className="text-[#555555]">Lot: {item.lotId} ({item.material})</p>
                  <p className="text-[#555555] font-semibold">{item.issue}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveFlag(item.id, 'dismissed')}
                    className="px-4 py-2 bg-white hover:border-[#B8D9C8] text-[#222222] font-bold text-xs rounded-lg border-2 border-[#D6E8DF] cursor-pointer"
                  >
                    {t('cancelBid')}
                  </button>
                  <button
                    onClick={() => handleResolveFlag(item.id, 'cleared')}
                    className="px-5 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {t('overrideAllowBid')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#555555] text-center py-4">{t('noPriceAnomalyFlags')}</p>
        )}
      </div>
    </div>
  );
}
