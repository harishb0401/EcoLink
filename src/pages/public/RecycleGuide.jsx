import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, XCircle, MapPin, ArrowRight, BookOpen, Cpu, Smartphone, Laptop, HardDrive, Monitor, Tv, Printer, Battery, Cable, Layers } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function RecycleGuide({ onOpenSearchModal }) {
  const { t, tCategory } = useTranslation();
  const navigate = useNavigate();
  const [guideSearch, setGuideSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('mobiles');

  // Exact 10 Categories from Section 3 Specification
  const guideCategories = [
    {
      id: 'mobiles',
      name: 'Mobile phones',
      icon: <Smartphone className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgMobWhatIsIt', 'Old, unused, or damaged mobile phones, smartphones, and cellular devices.'),
      components: [
        t('rgMobComp1', 'Printed Circuit Boards (PCBs)'),
        t('rgMobComp2', 'Precious Metals (Gold, Silver, Copper)'),
        t('rgMobComp3', 'Polycarbonate Plastics'),
        t('rgMobComp4', 'Lithium-ion Battery')
      ],
      dos: [
        t('rgMobDo1', 'Remove all personal data and perform a factory reset'),
        t('rgMobDo2', 'Keep batteries safely separated where applicable'),
        t('rgMobDo3', 'Hand over to authorized recycling channels')
      ],
      donts: [
        t('rgMobDont1', 'Do not throw electronics into regular waste bins'),
        t('rgMobDont2', 'Do not puncture or damage lithium batteries'),
        t('rgMobDont3', 'Do not burn electronic components or wires')
      ]
    },
    {
      id: 'laptops',
      name: 'Laptops',
      icon: <Laptop className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgLapWhatIsIt', 'Portable notebook computers, ultrabooks, and laptop chargers.'),
      components: [
        t('rgLapComp1', 'Motherboards & RAM Chips'),
        t('rgLapComp2', 'Aluminum & Magnesium Alloy Casing'),
        t('rgLapComp3', 'LCD/OLED Display Panels'),
        t('rgLapComp4', 'Lithium-Polymer Batteries')
      ],
      dos: [
        t('rgLapDo1', 'Back up and erase hard disk drive data prior to disposal'),
        t('rgLapDo2', 'Detach external chargers and cables for separate processing'),
        t('rgLapDo3', 'Hand over intact to CPCB verified recyclers')
      ],
      donts: [
        t('rgLapDont1', 'Do not dismantle display screens manually'),
        t('rgLapDont2', 'Do not expose damaged laptop batteries to heat'),
        t('rgLapDont3', 'Do not crush or incinerate laptop bodies')
      ]
    },
    {
      id: 'computers',
      name: 'Computers',
      icon: <HardDrive className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgCompWhatIsIt', 'Desktop PC towers, workstations, power supply units (PSUs), and internal drives.'),
      components: [
        t('rgCompComp1', 'High-Grade Motherboards'),
        t('rgCompComp2', 'Copper Heat Sinks & Wiring'),
        t('rgCompComp3', 'Steel/Iron Chassis'),
        t('rgCompComp4', 'Power Transformers')
      ],
      dos: [
        t('rgCompDo1', 'Remove data drives or execute cryptographic wipe'),
        t('rgCompDo2', 'Sort ferrous steel casing from sensitive electronics'),
        t('rgCompDo3', 'Safely bundle all peripheral cables together')
      ],
      donts: [
        t('rgCompDont1', 'Do not open CRT monitors or high-voltage transformers'),
        t('rgCompDont2', 'Do not release cooling liquids or hazardous lubricants'),
        t('rgCompDont3', 'Do not discard desktop components into landfill waste')
      ]
    },
    {
      id: 'monitors',
      name: 'Monitors & screens',
      icon: <Monitor className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgMonWhatIsIt', 'LCD/LED monitors, CRT computer screens, display panels, and digital signage.'),
      components: [
        t('rgMonComp1', 'Lead Glass (in CRTs)'),
        t('rgMonComp2', 'Mercury Vapor Tubes (in CCFL Backlights)'),
        t('rgMonComp3', 'Indium Tin Oxide Glass'),
        t('rgMonComp4', 'Circuit Boards & Transformers')
      ],
      dos: [
        t('rgMonDo1', 'Keep glass screens intact to avoid hazardous dust emission'),
        t('rgMonDo2', 'Handle CCFL backlit units carefully to avoid mercury vapor release'),
        t('rgMonDo3', 'Transport screens upright and securely cushioned')
      ],
      donts: [
        t('rgMonDont1', 'Do not break or shatter glass display panels'),
        t('rgMonDont2', 'Do not expose internal phosphor coatings'),
        t('rgMonDont3', 'Do not scavenge circuit boards using backyard methods')
      ]
    },
    {
      id: 'televisions',
      name: 'Televisions',
      icon: <Tv className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgTvWhatIsIt', 'Smart TVs, flat panel LED/OLED televisions, and older box CRT televisions.'),
      components: [
        t('rgTvComp1', 'High-Lead Funnel Glass'),
        t('rgTvComp2', 'Copper Deflection Yokes'),
        t('rgTvComp3', 'Internal Power Boards'),
        t('rgTvComp4', 'Flame-Retardant Plastic Casings')
      ],
      dos: [
        t('rgTvDo1', 'Keep televisions intact without cracking glass funnels'),
        t('rgTvDo2', 'Keep remote controls and cords together with unit'),
        t('rgTvDo3', 'Hand over to authorized e-waste aggregators')
      ],
      donts: [
        t('rgTvDont1', 'Do not break vacuum tubes which risk implosion'),
        t('rgTvDont2', 'Do not dump old CRT televisions in water bodies'),
        t('rgTvDont3', 'Do not open high-voltage flyback transformers')
      ]
    },
    {
      id: 'printers',
      name: 'Printers & scanners',
      icon: <Printer className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgPrintWhatIsIt', 'Laser printers, inkjet multifunction devices, copiers, and flatbed scanners.'),
      components: [
        t('rgPrintComp1', 'Toner Cartridges with Carbon Black / Microplastics'),
        t('rgPrintComp2', 'Stepper Motors & Brass Gears'),
        t('rgPrintComp3', 'Scanning Optics & Sensor Arrays'),
        t('rgPrintComp4', 'ABS Plastic Outer Casings')
      ],
      dos: [
        t('rgPrintDo1', 'Remove toner and ink cartridges before dispatch'),
        t('rgPrintDo2', 'Recycle toner cartridges through authorized take-back programs'),
        t('rgPrintDo3', 'Keep glass platen unscratched for optimal parts recovery')
      ],
      donts: [
        t('rgPrintDont1', 'Do not inhale fine particulate toner powder during handling'),
        t('rgPrintDont2', 'Do not dump empty toner cartridges in general garbage'),
        t('rgPrintDont3', 'Do not pour liquid ink residues into drains')
      ]
    },
    {
      id: 'batteries',
      name: 'Batteries',
      icon: <Battery className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgBatWhatIsIt', 'Rechargeable Lithium-ion, Lead-Acid UPS, and Nickel-Metal Hydride battery packs.'),
      components: [
        t('rgBatComp1', 'Cobalt, Nickel & Manganese Cathodes'),
        t('rgBatComp2', 'Lithium Salts & Electrolyte Solvents'),
        t('rgBatComp3', 'Lead Plates & Sulfuric Acid'),
        t('rgBatComp4', 'Copper & Aluminum Current Collectors')
      ],
      dos: [
        t('rgBatDo1', 'Insulate exposed battery terminals with non-conductive tape'),
        t('rgBatDo2', 'Store in cool, dry containment away from direct sunlight'),
        t('rgBatDo3', 'Hand over directly to authorized battery recyclers')
      ],
      donts: [
        t('rgBatDont1', 'Do not short-circuit positive and negative terminals'),
        t('rgBatDont2', 'Do not expose damaged battery packs to water or flame'),
        t('rgBatDont3', 'Do not dispose of lead-acid batteries with regular trash')
      ]
    },
    {
      id: 'cables',
      name: 'Cables & chargers',
      icon: <Cable className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgCabWhatIsIt', 'Copper electrical wires, power adapters, HDMI cables, and charging leads.'),
      components: [
        t('rgCabComp1', 'High-Purity Copper Core'),
        t('rgCabComp2', 'PVC/Rubber Insulation'),
        t('rgCabComp3', 'Gold-plated Terminals'),
        t('rgCabComp4', 'Ferrite Beads')
      ],
      dos: [
        t('rgCabDo1', 'Bundle and tie wires together by material type'),
        t('rgCabDo2', 'Keep copper wiring dry to preserve recycling grade'),
        t('rgCabDo3', 'Use mechanical granulators rather than burning')
      ],
      donts: [
        t('rgCabDont1', 'NEVER open-burn wire bundles to strip plastic insulation'),
        t('rgCabDont2', 'Do not inhale toxic dioxins produced from burning PVC'),
        t('rgCabDont3', 'Do not cut live electrical cables')
      ]
    },
    {
      id: 'circuit-boards',
      name: 'Circuit boards',
      icon: <Cpu className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgPcbWhatIsIt', 'High-grade telecommunication PCBs, motherboard cards, and controller boards.'),
      components: [
        t('rgPcbComp1', 'Gold Bonding Wires & Gold Finger Plating'),
        t('rgPcbComp2', 'Palladium & Tantalum Capacitors'),
        t('rgPcbComp3', 'Tin/Lead Solder Points'),
        t('rgPcbComp4', 'Fiberglass Substrates')
      ],
      dos: [
        t('rgPcbDo1', 'Store PCBs in electrostatic-safe dry bins'),
        t('rgPcbDo2', 'Sort PCBs by grade (High-grade telecom vs Low-grade brown board)'),
        t('rgPcbDo3', 'Transfer to authorized smelting and recovery plants')
      ],
      donts: [
        t('rgPcbDont1', 'Do not use dangerous backyard acid baths (aqua regia)'),
        t('rgPcbDont2', 'Do not burn fiberglass substrates to extract metals'),
        t('rgPcbDont3', 'Do not dump acidic tailings into local water tables')
      ]
    },
    {
      id: 'other-electronics',
      name: 'Other electronics',
      icon: <Layers className="w-5 h-5 text-[#1F6F5F]" />,
      whatIsIt: t('rgOthWhatIsIt', 'Microwaves, routers, set-top boxes, smart gadgets, and medical electronics.'),
      components: [
        t('rgOthComp1', 'Small Transformers & Relays'),
        t('rgOthComp2', 'Plastic & Metal Housings'),
        t('rgOthComp3', 'Low-Grade PCBs & Displays'),
        t('rgOthComp4', 'Power Supply Units')
      ],
      dos: [
        t('rgOthDo1', 'Check device label for hazardous material warnings'),
        t('rgOthDo2', 'Separate heavy metal transformers from electronics'),
        t('rgOthDo3', 'Declare on Eco-Link platform for verified classification')
      ],
      donts: [
        t('rgOthDont1', 'Do not puncture sealed cooling coils or vacuum components'),
        t('rgOthDont2', 'Do not dispose of medical sensors in general trash'),
        t('rgOthDont3', 'Do not leave e-waste in vacant public lands')
      ]
    }
  ];

  const filteredCategories = guideCategories.filter(c => 
    c.name.toLowerCase().includes(guideSearch.toLowerCase()) ||
    c.whatIsIt.toLowerCase().includes(guideSearch.toLowerCase()) ||
    c.components.some(comp => comp.toLowerCase().includes(guideSearch.toLowerCase()))
  );

  const activeCategory = guideCategories.find(c => c.id === selectedCatId) || guideCategories[0];

  return (
    <div className="min-h-screen bg-white py-12 text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-[#1F6F5F] text-xs font-bold uppercase tracking-wider border-2 border-[#D6E8DF]">
            <BookOpen className="w-3.5 h-3.5 text-[#1F6F5F]" /> {t('cpcbRecyclingGuideBadge', 'CPCB STANDARDIZED RECYCLING GUIDE')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
            {t('guideMainHeading', 'How to Recycle Your E-Waste')}
          </h1>
          <p className="text-base text-[#555555]">
            {t('guideSubHeading', 'Learn proper classification, valuable component recovery, and safe handling guidelines for 10 electronic waste categories.')}
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={guideSearch}
              onChange={(e) => setGuideSearch(e.target.value)}
              placeholder={t('searchGuidePlaceholder', 'Search category, e.g. Mobile, Laptop, PCB, Battery, Cables...')}
              className="w-full bg-white border-2 border-[#D6E8DF] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-[#222222] placeholder:text-[#555555] focus:border-[#B8D9C8] focus:outline-none"
            />
          </div>
        </div>

        {/* 10 Category Selection Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-2 ${
                selectedCatId === cat.id
                  ? 'bg-[#1F6F5F] text-white border-[#1F6F5F]'
                  : 'bg-[#F5FBF7] text-[#555555] border-[#D6E8DF] hover:border-[#B8D9C8] hover:text-[#222222]'
              }`}
            >
              <span>{tCategory(cat.name)}</span>
            </button>
          ))}
        </div>

        {/* Detailed Category View Card */}
        {activeCategory && (
          <div className="bg-[#F5FBF7] p-6 sm:p-8 rounded-lg border-2 border-[#D6E8DF] space-y-6">
            
            {/* Header with Title & Icon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D6E8DF] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#D6E8DF] flex items-center justify-center">
                  {activeCategory.icon}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#1F6F5F]">
                    {t('cpcbClassificationBadge', 'CPCB E-WASTE CLASSIFICATION')}
                  </span>
                  <h2 className="text-2xl font-bold text-[#222222]">{tCategory(activeCategory.name)}</h2>
                </div>
              </div>

              <button
                onClick={() => navigate('/locations')}
                className="px-4 py-2 bg-white hover:border-[#B8D9C8] text-[#222222] font-bold text-xs rounded-lg border-2 border-[#D6E8DF] transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <MapPin className="w-3.5 h-3.5 text-[#1F6F5F]" />
                <span>{t('findDropPoints', 'Find Drop Points')}</span>
              </button>
            </div>

            {/* WHAT IS IT */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase text-[#1F6F5F] tracking-wider">
                {t('whatIsItLabel', 'What is it?')}
              </h3>
              <p className="text-sm font-normal text-[#222222] leading-relaxed">
                {activeCategory.whatIsIt}
              </p>
            </div>

            {/* VALUABLE COMPONENTS / MATERIALS */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-[#1F6F5F] tracking-wider">
                {t('valuableComponentsLabel', 'Valuable Components & Recyclable Materials:')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {activeCategory.components.map((comp, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border-2 border-[#D6E8DF] text-xs font-medium text-[#222222] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F5F]"></span>
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Column Grid: DO vs DON'T */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* DO SECTION */}
              <div className="p-5 bg-[#EFF8F2] rounded-lg border-2 border-[#B8D9C8] space-y-3">
                <h3 className="text-xs font-bold text-[#1F6F5F] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F5F]" />
                  <span>{t('doLabel', 'Do')}</span>
                </h3>
                <ul className="space-y-2">
                  {activeCategory.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-normal text-[#222222]">
                      <span className="w-3.5 h-3.5 rounded bg-white border-2 border-[#B8D9C8] text-[#1F6F5F] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DON'T SECTION */}
              <div className="p-5 bg-white rounded-lg border-2 border-[#D6E8DF] space-y-3">
                <h3 className="text-xs font-bold text-[#555555] uppercase tracking-wider flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#555555]" />
                  <span>{t('dontLabel', "Don't")}</span>
                </h3>
                <ul className="space-y-2">
                  {activeCategory.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-normal text-[#222222]">
                      <span className="w-3.5 h-3.5 rounded bg-white border-2 border-[#D6E8DF] text-[#555555] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t-2 border-[#D6E8DF] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#555555]">
                {t('haveEWasteToDisposeText', 'Have e-waste of this category to dispose? Register a digital lot to get benchmark prices.')}
              </span>
              <button
                onClick={() => navigate('/collector/register-waste')}
                className="px-5 py-2 bg-[#1F6F5F] hover:bg-[#2FA084] text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                {t('registerEWasteLotBtn', 'Register E-Waste Lot →')}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
