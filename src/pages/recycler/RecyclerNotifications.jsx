import React, { useState } from 'react';
import { Bell, ShoppingBag, ShieldCheck, DollarSign, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function RecyclerNotifications() {
  const { t } = useTranslation();
  const [list, setList] = useState([
    {
      id: 'NOTIF-REC-1',
      title: 'New Waste Lot Available in Chennai',
      message: '120 kg of Motherboards & PCB Assemblies registered in Guindy by Apex Scrap.',
      type: 'STREAM',
      time: '15 mins ago',
      unread: true
    },
    {
      id: 'NOTIF-REC-2',
      title: 'Price Offer Accepted by Collector',
      message: 'Your bid of ₹380/kg on Lot EW-2026-001245 has been accepted. Escrow ₹45,600 locked.',
      type: 'MATCH',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 'NOTIF-REC-3',
      title: 'Form-2 Manifest Ready for Download',
      message: 'Automated CPCB Form-2 manifest compiled for dispatch batch #DSP-401.',
      type: 'COMPLIANCE',
      time: 'Yesterday',
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
            {t('availableRequestsDesc')}
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
              {item.type === 'MATCH' ? <ShieldCheck className="w-4 h-4" /> : item.type === 'COMPLIANCE' ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
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
