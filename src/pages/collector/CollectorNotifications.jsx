import React, { useState } from 'react';
import { Bell, CheckCircle2, ShieldCheck, AlertCircle, DollarSign, Package, Clock } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';
import { useTranslation } from '../../i18n';

export default function CollectorNotifications({ notifications = mockNotifications }) {
  const { t } = useTranslation();
  const [list, setList] = useState(notifications || mockNotifications);

  const markAllRead = () => {
    setList(list.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
      case 'PAYMENT':
        return <DollarSign className="w-4 h-4 text-[#1F6F5F]" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-[#555555]" />;
      case 'MATCH':
        return <ShieldCheck className="w-4 h-4 text-[#2FA084]" />;
      default:
        return <Package className="w-4 h-4 text-[#1F6F5F]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-white text-[#222222]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">{t('navNotifications')}</h1>
          <p className="text-xs sm:text-sm text-[#555555]">
            {t('collectorNotifSubtitle')}
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2 bg-[#F5FBF7] hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] rounded-lg font-bold text-xs transition cursor-pointer self-start sm:self-auto"
        >
          {t('unreadNotifications')}
        </button>
      </div>

      {/* Notifications List */}
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
            <div className="p-2.5 rounded-lg bg-white border-2 border-[#D6E8DF] shrink-0 mt-0.5">
              {getIcon(item.type)}
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
                  {item.time || item.timestamp || 'Just now'}
                </span>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">{t(item.message || item.desc)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
