import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Clock, ShieldCheck, ArrowRight, Navigation } from 'lucide-react';
import { mockRecyclers } from '../../data/mockData';
import { structuredEWasteCategories } from '../../data/scrapPrices';
import { useTranslation } from '../../i18n';

export default function Locations() {
  const navigate = useNavigate();
  const { t, tCategory } = useTranslation();
  const [wasteTypeFilter, setWasteTypeFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [distanceFilter, setDistanceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecycler, setSelectedRecycler] = useState(null);

  // Locations mock list with distance and contact
  const recyclerLocations = (mockRecyclers || []).map((r, idx) => ({
    ...r,
    distanceKm: [4.2, 12.8, 8.5, 18.0, 25.4][idx % 5],
    operatingHours: t('monSatHours', 'Mon – Sat: 9:00 AM – 6:00 PM'),
    contactPhone: r.phone || "+91 94441 23456",
    contactEmail: r.email || "info@recycler.com",
    authorizationStatus: r.verificationStatus === 'VERIFIED' ? `✓ ${t('authorizedCpcbFacility', 'Authorized CPCB Facility')}` : `⏳ ${t('pendingAuthorization', 'Pending Authorization')}`,
    isAuthorized: r.verificationStatus === 'VERIFIED',
  }));

  const locationsList = ['ALL', 'Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tirunelveli'];

  // Apply Filters
  const filteredRecyclers = recyclerLocations.filter(r => {
    const matchesSearch = (r.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWasteType = wasteTypeFilter === 'ALL' || 
                             (r.acceptedCategories && r.acceptedCategories.some(c => c.toLowerCase().includes(wasteTypeFilter.toLowerCase())));

    const matchesLocation = locationFilter === 'ALL' || (r.location || '').toLowerCase().includes(locationFilter.toLowerCase());

    const matchesDistance = distanceFilter === 'ALL' || 
                             (distanceFilter === '10' && r.distanceKm <= 10) ||
                             (distanceFilter === '20' && r.distanceKm <= 20);

    return matchesSearch && matchesWasteType && matchesLocation && matchesDistance;
  });

  return (
    <div className="min-h-screen bg-white py-12 text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-[#1F6F5F] text-xs font-bold uppercase tracking-wider border-2 border-[#D6E8DF]">
            <MapPin className="w-3.5 h-3.5" /> {t('recyclingPointsDirectoryBadge', 'RECYCLING POINTS DIRECTORY')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
            {t('findAuthorizedPointsTitle', 'Find Authorized Recycling Points')}
          </h1>
          <p className="text-base text-[#555555]">
            {t('findAuthorizedPointsSub', 'Locate CPCB & TNPCB verified e-waste collection hubs and material recovery facilities near you.')}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchFacilityPlaceholder', 'Search by facility name or area...')}
              className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">{t('wasteTypeMaterialLabel', 'Waste Type / Material')}</label>
              <select
                value={wasteTypeFilter}
                onChange={(e) => setWasteTypeFilter(e.target.value)}
                className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 text-xs font-medium text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              >
                <option value="ALL">{t('allMaterials', 'All Materials')}</option>
                {structuredEWasteCategories && structuredEWasteCategories.map((c, i) => (
                  <option key={i} value={c.name}>{tCategory(c.name)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">{t('locationDistrictLabel', 'Location / District')}</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 text-xs font-medium text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              >
                {locationsList.map((loc, i) => (
                  <option key={i} value={loc}>{loc === 'ALL' ? t('allDistricts', 'All Districts') : loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">{t('distanceRadiusLabel', 'Distance Radius')}</label>
              <select
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value)}
                className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg px-3 py-2 text-xs font-medium text-[#222222] focus:border-[#B8D9C8] focus:outline-none"
              >
                <option value="ALL">{t('anyDistance', 'Any Distance')}</option>
                <option value="10">{t('within10km', 'Within 10 km')}</option>
                <option value="20">{t('within20km', 'Within 20 km')}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">{t('authorizationLabel', 'Authorization')}</label>
              <div className="flex items-center gap-1.5 pt-2 text-xs font-medium text-[#1F6F5F]">
                <ShieldCheck className="w-4 h-4 text-[#1F6F5F]" />
                <span>{t('cpcbVerifiedOnly', 'CPCB Verified Only')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column: Map Graphic View + Recycling Point Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Simulated Visual Map Area */}
          <div className="lg:col-span-5 bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#D6E8DF]">
                <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('interactiveMapView', 'Interactive Map View')}</span>
                </h3>
                <span className="text-[10px] font-medium text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                  {t('facilitiesFoundCount', '{count} Facilities Found', { count: filteredRecyclers.length })}
                </span>
              </div>

              {/* Map Graphic Canvas */}
              <div className="mt-4 h-72 rounded-lg bg-[#EFF8F2] border-2 border-[#D6E8DF] relative overflow-hidden flex items-center justify-center">
                {filteredRecyclers.map((r, idx) => (
                  <button
                    key={r.id || idx}
                    onClick={() => setSelectedRecycler(r)}
                    style={{ top: `${20 + (idx * 18) % 60}%`, left: `${15 + (idx * 25) % 70}%` }}
                    className="absolute p-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white rounded-full transition-colors cursor-pointer"
                    title={r.companyName}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                ))}

                <div className="bg-white px-4 py-1.5 rounded-lg border-2 border-[#D6E8DF] text-xs font-bold text-[#222222] pointer-events-none">
                  {t('tnRecyclingMapGrid', 'Tamil Nadu Recycling Map Grid')}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-[#D6E8DF] text-xs text-[#555555]">
              <strong className="text-[#222222] font-bold block mb-1">{t('authorizationNoticeLabel', 'Authorization Notice:')}</strong>
              {t('authorizationNoticeText', 'All points listed comply with Central Pollution Control Board (CPCB) Extended Producer Responsibility rules.')}
            </div>
          </div>

          {/* Cards List */}
          <div className="lg:col-span-7 space-y-4">
            {filteredRecyclers.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#F5FBF7] p-6 rounded-lg border-2 border-[#D6E8DF] hover:border-[#B8D9C8] transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#D6E8DF] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#222222]">{rec.companyName}</h3>
                      {rec.isAuthorized && (
                        <span className="text-[10px] font-medium text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#1F6F5F]" />
                          <span>{t('authorizedBadge', 'Authorized')}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#555555] font-normal flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1F6F5F]" />
                      <span>{rec.location}</span>
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2.5 py-1 rounded self-start sm:self-auto">
                    {rec.distanceKm} km {t('away', 'away')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#555555]">{t('acceptedWasteTypesLabel', 'Accepted Waste Types:')}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(rec.acceptedCategories || []).map((cat, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 bg-white border-2 border-[#D6E8DF] text-[#222222] rounded text-[10px] font-medium">
                          {tCategory(cat)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#555555]">
                      <Clock className="w-3.5 h-3.5 text-[#1F6F5F]" />
                      <span className="font-normal text-[11px]">{rec.operatingHours}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#555555]">
                      <Phone className="w-3.5 h-3.5 text-[#1F6F5F]" />
                      <span className="font-normal text-[11px]">{rec.contactPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#D6E8DF] flex items-center justify-between">
                  <span className="text-[11px] text-[#555555]">
                    Reg No: {rec.cpcbRegistrationNo}
                  </span>
                  <button
                    onClick={() => setSelectedRecycler(rec)}
                    className="px-4 py-2 rounded-lg bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{t('viewDetails', 'View Details')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Recycler Details Modal */}
        {selectedRecycler && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-[#F5FBF7] rounded-lg border-2 border-[#D6E8DF] max-w-lg w-full p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#D6E8DF]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#1F6F5F] bg-white border-2 border-[#D6E8DF] px-2 py-0.5 rounded">
                    {t('recyclerDetailsTitle', 'RECYCLER DETAILS')}
                  </span>
                  <h3 className="text-lg font-bold text-[#222222] mt-1">{selectedRecycler.companyName}</h3>
                </div>
                <button
                  onClick={() => setSelectedRecycler(null)}
                  className="p-1.5 rounded-lg text-[#555555] hover:text-[#222222] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-[#222222]">
                <p><strong>{t('locationLabel', 'Location')}:</strong> {selectedRecycler.location}</p>
                <p><strong>{t('authorizationStatusLabel', 'Authorization Status')}:</strong> {selectedRecycler.authorizationStatus}</p>
                <p><strong>{t('regNoLabel', 'Registration No')}:</strong> {selectedRecycler.cpcbRegistrationNo}</p>
                <p><strong>{t('contactPersonLabel', 'Contact Person')}:</strong> {selectedRecycler.contactPerson}</p>
                <p><strong>{t('phoneLabel', 'Phone')}:</strong> {selectedRecycler.contactPhone}</p>
                <p><strong>{t('emailLabel', 'Email')}:</strong> {selectedRecycler.contactEmail}</p>
                <p><strong>{t('operatingHoursLabel', 'Operating Hours')}:</strong> {selectedRecycler.operatingHours}</p>
                <div>
                  <strong>{t('acceptedMaterialsLabel', 'Accepted Materials')}:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedRecycler.acceptedCategories || []).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border-2 border-[#D6E8DF] rounded text-[10px] font-medium text-[#222222]">
                        {tCategory(c)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-[#D6E8DF] flex justify-end gap-2.5">
                <button
                  onClick={() => setSelectedRecycler(null)}
                  className="px-4 py-2 bg-[#F5FBF7] border-2 border-[#D6E8DF] hover:border-[#B8D9C8] text-[#555555] hover:text-[#222222] font-bold text-xs rounded-lg cursor-pointer"
                >
                  {t('close', 'Close')}
                </button>
                <button
                  onClick={() => {
                    setSelectedRecycler(null);
                    navigate('/login');
                  }}
                  className="px-4 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  {t('matchWasteLotWithRecycler', 'Match Waste Lot with this Recycler')} →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
