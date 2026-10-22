import React, { useState } from 'react';
import { Bell, ShieldCheck, AlertTriangle, Building, Clock, Users } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function AdminNotifications() {
  const { t } = useTranslation();
  const [list, setList] = useState([
    {
      id: 'NOTIF-ADM-1',
      title: 'New Recycler Facility Pending Verification',
      message: 'GreenMat Eco-Processing Center submitted CPCB documentation for approval.',
      type: 'VERIFICATION',
      time: '10 mins ago',
      unread: true
    },
    {
      id: 'NOTIF-ADM-2',
      title: 'Pricing Rule Flagged Below-Tolerance Offer',
      message: 'Bid on Lot EW-2026-001247 was submitted at -21.4% below state benchmark.',
      type: 'FLAG',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 'NOTIF-ADM-3',
      title: 'Monthly EPR Quota Report Ready',
      message: 'Tamil Nadu aggregated e-waste compliance volume crossed 44,000 kg.',
      type: 'COMPLIANCE',
      time: 'Today, 8:00 AM',
      unread: false
    }
  ]);

  const markAllRead = () => {
    setList(list.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white text-[#222222]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('navNotifications')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('systemWideOversight')}
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2 bg-[#F5FBF7] hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition cursor-pointer self-start sm:self-auto"
        >
          {t('unreadNotifications')}
        </button>
      </div>

      <div className="space-y-3">
        {list.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-lg border-2 transition flex items-start gap-4 ${
              item.unread
                ? 'bg-[#EFF8F2] border-[#B8D9C8]'
                : 'bg-[#F5FBF7] border-[#D6E8DF]'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-white border-2 border-[#D6E8DF] shrink-0 mt-0.5 text-[#1F6F5F]">
              {item.type === 'FLAG' ? <AlertTriangle className="w-4 h-4 text-[#555555]" /> : <ShieldCheck className="w-4 h-4 text-[#1F6F5F]" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#222222]">{t(item.title)}</h3>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#1F6F5F]" />
                  )}
                </div>
                <span className="text-[11px] text-[#555555] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">{t(item.message)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
