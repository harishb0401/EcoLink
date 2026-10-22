import React from 'react';
import { AlertTriangle, Edit3, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function PriceWarningModal({ 
  isOpen, 
  onClose, 
  warningData, 
  onEditPrice, 
  onContinueAnyway 
}) {
  const { t } = useTranslation();

  if (!isOpen || !warningData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-[#F5FBF7] rounded-lg max-w-lg w-full p-6 sm:p-8 border-2 border-[#D6E8DF] space-y-6 text-[#222222]">
        
        {/* Header Alert Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#555555] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#555555] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded">
              {t("priceWarningTitle")}
            </span>
            <h3 className="text-xl font-bold text-[#222222] mt-1">
              {t("askingPriceExceedsRange")}
            </h3>
          </div>
        </div>

        {/* Warning Details Box */}
        <div className="bg-[#EFF8F2] rounded-lg p-5 border-2 border-[#D6E8DF] space-y-3">
          <p className="text-sm text-[#555555] leading-relaxed">
            {t("priceWarningDesc")}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#F5FBF7] p-3 rounded-lg border-2 border-[#D6E8DF]">
              <span className="text-xs text-[#555555] block font-semibold">{t("yourAskingPrice")}</span>
              <span className="text-xl font-bold text-[#222222]">₹{warningData.askingPrice}/kg</span>
            </div>
            <div className="bg-[#F5FBF7] p-3 rounded-lg border-2 border-[#D6E8DF]">
              <span className="text-xs text-[#555555] block font-semibold">{t("referenceRange")}</span>
              <span className="text-xl font-bold text-[#1F6F5F]">₹{warningData.referenceMin}–₹{warningData.referenceMax}/kg</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#555555] pt-1">
            <ShieldAlert className="w-4 h-4 text-[#555555] shrink-0" />
            <span>Calculated via Rule-Based Scrap Pricing Engine (+{warningData.percentAbove}% above reference max)</span>
          </div>
        </div>

        {/* Information note */}
        <p className="text-xs text-[#555555] leading-relaxed">
          <strong className="text-[#222222]">{t("ruleBasedPolicyLabel")}:</strong> {t("ruleBasedPolicyDesc")}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t-2 border-[#D6E8DF]">
          <button
            type="button"
            onClick={onEditPrice}
            className="w-full sm:flex-1 py-3 px-4 rounded-lg text-sm font-bold bg-[#F5FBF7] hover:border-[#B8D9C8] text-[#222222] border-2 border-[#D6E8DF] transition flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-[#1F6F5F]" />
            <span>{t("editPrice")}</span>
          </button>
          
          <button
            type="button"
            onClick={onContinueAnyway}
            className="w-full sm:flex-1 py-3 px-4 rounded-lg text-sm font-bold bg-[#1F6F5F] hover:bg-[#2FA084] text-white transition flex items-center justify-center gap-2"
          >
            <span>{t("continueAnyway")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
