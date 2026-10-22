import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function RecyclerCard({ recycler, onSelect, showActions = true }) {
  const { t } = useTranslation();
  if (!recycler) return null;

  const isVerified = recycler.verificationStatus === 'VERIFIED';

  return (
    <div className="bg-[#F5FBF7] p-5 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition-colors space-y-4">
      <div className="flex items-start justify-between gap-3 border-b-2 border-[#D6E8DF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#222222]">{recycler.companyName}</h3>
            {isVerified && (
              <span className="text-[10px] font-medium text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#1F6F5F]" /> {t("cpcbVerifiedBadge")}
              </span>
            )}
          </div>
          <p className="text-xs text-[#555555] mt-0.5">{recycler.contactPerson || "Authorized Facility Manager"}</p>
          <span className="text-[11px] font-mono text-[#555555]">{recycler.cpcbRegistrationNo}</span>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-[#222222] bg-white px-2 py-0.5 rounded border-2 border-[#D6E8DF]">
            ★ {recycler.rating || 4.9}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-[#555555]">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#1F6F5F]" />
          <span>{recycler.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-[#1F6F5F]" />
          <span>{recycler.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-[#1F6F5F]" />
          <span>{recycler.email}</span>
        </div>
      </div>

      <div className="pt-2 border-t-2 border-[#D6E8DF]">
        <span className="text-[10px] font-bold uppercase text-[#555555] block mb-1.5">{t("authorizedMaterials")}</span>
        <div className="flex flex-wrap gap-1.5">
          {(recycler.acceptedCategories || []).map((cat, idx) => (
            <span key={idx} className="text-[10px] font-medium bg-white text-[#222222] px-2 py-0.5 rounded border-2 border-[#D6E8DF]">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
