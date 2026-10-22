import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, CheckCircle2, AlertTriangle, ArrowRight, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { searchableMaterials } from '../../mockData';
import { useTranslation, useLanguage } from '../../i18n';

export default function CanIRecycleModal({ isOpen, onClose, setActiveView }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tCategory } = useLanguage();

  if (!isOpen) return null;

  const [query, setQuery] = useState('pizza box');
  const [result, setResult] = useState(searchableMaterials[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchTerm = query.trim().toLowerCase();
    const found = searchableMaterials.find(m => 
      m.keywords.some(k => k.includes(searchTerm) || searchTerm.includes(k)) ||
      m.item.toLowerCase().includes(searchTerm)
    );

    if (found) {
      setResult(found);
    } else {
      // Fallback generic result
      setResult({
        item: query,
        isRecyclable: true,
        category: "General Household Recyclable",
        icon: "📦",
        prep: "Ensure item is clean, dry, and free of food or chemical residue before placing in bin.",
        badge: "Check Local Guidelines 📄"
      });
    }
  };

  const popularChips = ["pizza box", "plastic bottle", "bubble wrap", "aluminum can", "battery", "glass bottle"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-[#F5FBF7] rounded-lg max-w-xl w-full border-2 border-[#D6E8DF] overflow-hidden flex flex-col text-[#222222]">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#EFF8F2] border-b-2 border-[#D6E8DF] text-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] text-[#1F6F5F] flex items-center justify-center font-bold text-xl">
              ♻
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#222222]">{t("searchModalTitle")}</h3>
              <p className="text-xs text-[#555555]">{t("searchModalSub")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#555555] hover:text-[#222222] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Search Bar Input */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchModalPlaceholder")}
              className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-11 pr-24 py-3 text-xs font-semibold text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
            />
            <Search className="w-5 h-5 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#1F6F5F] hover:bg-[#2FA084] text-white text-xs font-bold rounded-md transition cursor-pointer"
            >
              {t("navSearchPlaceholder")}
            </button>
          </form>

          {/* Popular Search Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wider block">
              {t("popularSearches")}
            </span>
            <div className="flex flex-wrap gap-2">
              {popularChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(chip);
                    const found = searchableMaterials.find(m => m.item.toLowerCase() === chip);
                    if (found) setResult(found);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-2 ${
                    query.toLowerCase() === chip
                      ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                      : 'bg-white text-[#222222] border-[#D6E8DF] hover:border-[#B8D9C8]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Card */}
          {result && (
            <div className="bg-[#EFF8F2] p-5 rounded-lg border-2 border-[#D6E8DF] space-y-4">
              
              {/* Item Icon */}
              <div className="w-12 h-12 rounded-lg bg-white border-2 border-[#D6E8DF] flex items-center justify-center">
                <span className="text-xl">{result.icon || '📦'}</span>
              </div>

              {/* Item Title & Category */}
              <div>
                <h4 className="text-lg font-bold text-[#222222]">{result.item}</h4>
                <span className="inline-block text-xs font-semibold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-0.5 rounded mt-1">
                  ♻ {tCategory(result.badge || result.category)}
                </span>
              </div>

              {/* Instructions */}
              <div className="p-3.5 rounded-lg bg-white text-xs text-[#555555] space-y-1 font-medium border-2 border-[#D6E8DF] whitespace-pre-line">
                <span className="font-bold text-[#222222] block">{t("howToPrepare")}</span>
                {result.prep}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    navigate('/locations');
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t("findNearbyLocation")}</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
