import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Package, DollarSign, Scale, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import StatCard from '../../components/Cards/StatCard';
import { mockCollectors, mockRecyclers, mockWasteLots, mockTransactions } from '../../data/mockData';
import { useTranslation } from '../../i18n';
import adminService from '../../services/adminService';

export default function AdminDashboard({
  collectors = mockCollectors,
  recyclers = mockRecyclers,
  materialLots = mockWasteLots,
  transactions = mockTransactions
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      if (data) setStats(data);
    } catch (err) {
      console.warn('Could not load live admin statistics:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalCollectors = stats?.totalCollectors ?? (collectors || []).length;
  const totalRecyclers = stats?.totalRecyclers ?? (recyclers || []).length;
  const verifiedRecyclers = stats?.verifiedRecyclers ?? (recyclers || []).filter(r => r.cpcbStatus === 'VERIFIED' || r.verificationStatus === 'VERIFIED').length;
  const pendingVerifications = stats?.pendingVerifications ?? (recyclers || []).filter(r => r.cpcbStatus === 'PENDING' || r.verificationStatus === 'PENDING').length;
  const totalWasteKg = stats?.totalWasteKg ?? stats?.totalWasteWeightKg ?? (materialLots || []).reduce((sum, l) => sum + (parseFloat(l.quantity || l.totalWeightKg) || 0), 0);
  const totalTxValue = stats?.totalTxValue ?? stats?.transactionVolume ?? (transactions || []).reduce((sum, t) => sum + (parseFloat(t.amount || t.totalValue) || 0), 0);
  const abnormalOffers = stats?.abnormalOffers ?? 0;

  return (
    <div className="space-y-8 bg-white text-[#222222]">
      {/* Welcome Banner */}
      <div className="bg-[#EFF8F2] text-[#222222] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-3 py-1 rounded">
              {t('stateRegulatoryConsole', 'State Regulatory Console')}
            </span>
            <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
              {t('cpcbMasterAuthority', 'CPCB / TNPCB Master Authority')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-3">
            {t('commandCenterTitle', 'Tamil Nadu E-Waste Command Center')}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1">
            {t('systemWideOversight', 'System-wide oversight for informal collectors, authorized recyclers, price integrity, and CPCB EPR compliance.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/verification')}
            className="px-6 py-3 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('reviewPendingVerifications', 'Review Pending Verifications')} ({pendingVerifications})</span>
          </button>
        </div>
      </div>

      {/* Live Platform KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Collectors"
          value={totalCollectors}
          icon={Users}
          color="emerald"
          subtitle="Informal & MSME Aggregators"
        />
        <StatCard
          title="Authorized Recyclers"
          value={totalRecyclers}
          icon={ShieldCheck}
          color="emerald"
          subtitle={`${verifiedRecyclers} CPCB Certified`}
        />
        <StatCard
          title="Total Waste Volume"
          value={`${totalWasteKg.toLocaleString()} kg`}
          icon={Scale}
          color="emerald"
          subtitle="Declared manifests"
        />
        <StatCard
          title="Simulated Escrow Volume"
          value={`₹${totalTxValue.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          subtitle={`${abnormalOffers} flagged pricing audits`}
        />
      </div>

      {/* Management Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('collectorsTitle', 'Collectors')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('auditRegisteredCollectors', 'Audit registered collector profiles, verify OTP status, and monitor volume throughput.')}
            </p>
          </div>
          <Link
            to="/admin/collectors"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('manageCollectors', 'Manage Collectors')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('recyclersTitle', 'Recyclers')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('verifyCpcbLicenses', 'Verify CPCB licenses, manage processing quotas, and inspect facility capacities.')}
            </p>
          </div>
          <Link
            to="/admin/recyclers"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('manageRecyclers', 'Manage Recyclers')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('wasteLotsTitle', 'Waste Lots')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('inspectActiveDeclarations', 'Inspect active material declarations, tolerance compliance, and verification compliance.')}
            </p>
          </div>
          <Link
            to="/admin/waste-lots"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('auditWasteLots', 'Audit Waste Lots')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">{t('verificationQueue', 'Verification Queue')}</h3>
            <p className="text-xs text-[#555555] mt-1">
              {t('reviewAndApprovePending', 'Review and approve pending recycler credentials and flagged price discrepancy cases.')}
            </p>
          </div>
          <Link
            to="/admin/verification"
            className="text-xs font-bold text-[#1F6F5F] hover:text-[#2FA084] flex items-center gap-1.5 pt-3 border-t-2 border-[#D6E8DF]"
          >
            <span>{t('openQueue', 'Open Queue')} ({pendingVerifications})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
