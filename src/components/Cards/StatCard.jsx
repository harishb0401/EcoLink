import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge }) {
  return (
    <div className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-[#222222]">{value}</span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border-2 border-[#D6E8DF] text-[#1F6F5F] bg-white">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-[#555555] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
