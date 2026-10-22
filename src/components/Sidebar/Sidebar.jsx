import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Package, DollarSign, 
  Truck, ShieldCheck, Award, User, Bell, 
  Layers, Users, CheckCircle2, FileText, Settings
} from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function Sidebar({ role = 'collector', userProfile }) {
  const { t } = useTranslation();
  const location = useLocation();

  const collectorLinks = [
    { to: '/collector/dashboard', key: 'navDashboard', icon: LayoutDashboard },
    { to: '/collector/register-waste', key: 'navRegisterEWaste', icon: PlusCircle },
    { to: '/collector/requests', key: 'navMyWasteLots', icon: Package },
    { to: '/collector/transactions', key: 'navTransactions', icon: Award },
    { to: '/collector/profile', key: 'navProfile', icon: User },
    { to: '/collector/notifications', key: 'navNotifications', icon: Bell },
  ];

  const recyclerLinks = [
    { to: '/recycler/dashboard', key: 'navDashboard', icon: LayoutDashboard },
    { to: '/recycler/waste-requests', key: 'navWasteRequests', icon: Layers },
    { to: '/recycler/transactions', key: 'navTransactions', icon: Award },
    { to: '/recycler/profile', key: 'navProfile', icon: User },
    { to: '/recycler/notifications', key: 'navNotifications', icon: Bell },
  ];

  const links = role === 'recycler' ? recyclerLinks : collectorLinks;

  const displayName = userProfile?.name || userProfile?.companyName || (role === 'recycler' ? t('recyclerRole') : t('collectorRole'));

  return (
    <aside className="w-64 bg-[#F5FBF7] border-r-2 border-[#D6E8DF] p-5 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* User Card */}
        <div className="p-3.5 bg-white rounded-lg border-2 border-[#D6E8DF] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1F6F5F] text-white flex items-center justify-center font-bold text-sm">
            {displayName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#222222] truncate">{displayName}</h4>
            <span className="text-[10px] font-medium text-[#1F6F5F] bg-[#F5FBF7] border-2 border-[#D6E8DF] px-2 py-0.5 rounded inline-block mt-0.5">
              {role === 'recycler' ? t('recyclerRole') : t('collectorRole')}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link, idx) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <NavLink
                key={idx}
                to={link.to}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive 
                    ? 'bg-[#1F6F5F] text-white' 
                    : 'text-[#555555] hover:text-[#1F6F5F]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(link.key)}</span>
              </NavLink>
            );
          })}
        </nav>

      </div>

      {/* Footer info in sidebar */}
      <div className="pt-4 border-t-2 border-[#D6E8DF] text-[11px] text-[#555555] font-medium text-center">
        Eco-Link v2.6.0 · {t('eprCompliant')}
      </div>
    </aside>
  );
}
