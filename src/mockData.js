import { structuredEWasteCategories, referenceScrapPrices } from './data/scrapPrices';
import { calculateFairPriceRange, createTraceabilityEvent } from './utils/rulesEngine';

/**
 * 1. Community & Platform Aggregate Stats
 */
export const communityImpactStats = {
  recycledKg: "38,650 kg",
  co2SavedKg: "24,800 kg",
  goldRecoveredGrams: "482.5 g",
  copperRecoveredKg: "3,820 kg",
  verifiedRecyclers: "14",
  activeCollectors: "86",
  monthlyGrowthPercent: "24%"
};

/**
 * 2. Recyclers Master Database (with Verification Statuses)
 * Verification Statuses: PENDING_VERIFICATION, VERIFIED, REJECTED, SUSPENDED
 */
export const initialRecyclers = [
  {
    id: "REC-TN-01",
    companyName: "GreenCycle Material Recovery Ltd",
    contactPerson: "Dr. K. Senthil Nathan",
    cpcbRegistrationNo: "TN-EPR-2026-8821 (Verified)",
    verificationStatus: "VERIFIED",
    isCpcbVerified: true,
    isPlatformVerified: true,
    phone: "+91 94441 23456",
    email: "procurement@greencycle.in",
    location: "Chennai - Ambattur Industrial Estate",
    capacityMonthlyKg: 50000,
    currentIntakeKg: 28400,
    acceptedCategories: [
      "PCB / Electronic Components",
      "Computer Equipment",
      "Mobile / Small Electronics",
      "Copper",
      "Aluminium"
    ],
    rating: 4.95,
    auditDate: "15 Jan 2026",
    recoveryTech: "Hydrometallurgy & Mechanical Separation"
  },
  {
    id: "REC-TN-02",
    companyName: "Madurai CleanMetals Eco-Processing",
    contactPerson: "A. Muthuvel",
    cpcbRegistrationNo: "TN-EPR-2026-4412 (Verified)",
    verificationStatus: "VERIFIED",
    isCpcbVerified: true,
    isPlatformVerified: true,
    phone: "+91 94432 11223",
    email: "intake@maduraicleanmetals.com",
    location: "Madurai - Kappalur SIDCO",
    capacityMonthlyKg: 40000,
    currentIntakeKg: 19500,
    acceptedCategories: [
      "Batteries",
      "Copper",
      "Cables / Wires",
      "Ferrous Metals"
    ],
    rating: 4.88,
    auditDate: "02 Feb 2026",
    recoveryTech: "Secondary Smelting & Battery Pyrolysis"
  },
  {
    id: "REC-TN-03",
    companyName: "Kongu Circular Resource Node",
    contactPerson: "P. Vignesh",
    cpcbRegistrationNo: "TN-EPR-2026-9055 (Verified)",
    verificationStatus: "VERIFIED",
    isCpcbVerified: true,
    isPlatformVerified: true,
    phone: "+91 98422 77889",
    email: "operations@kongucircular.org",
    location: "Coimbatore - Peelamedu Industrial Corridor",
    capacityMonthlyKg: 60000,
    currentIntakeKg: 34100,
    acceptedCategories: [
      "PCB / Electronic Components",
      "Computer Equipment",
      "Plastics",
      "Aluminium"
    ],
    rating: 4.92,
    auditDate: "20 Feb 2026",
    recoveryTech: "Printed Circuit Board Refining & Granulation"
  },
  {
    id: "REC-TN-04",
    companyName: "Salem Electro-Smelt Solutions",
    contactPerson: "S. Rajendran",
    cpcbRegistrationNo: "TN-EPR-2026-PENDING",
    verificationStatus: "PENDING_VERIFICATION",
    isCpcbVerified: false,
    isPlatformVerified: false,
    phone: "+91 97880 44556",
    email: "compliance@salemelectrosmelt.com",
    location: "Salem - Steel Plant Road",
    capacityMonthlyKg: 25000,
    currentIntakeKg: 0,
    acceptedCategories: [
      "Ferrous Metals",
      "Copper",
      "Cables / Wires"
    ],
    rating: 4.2,
    auditDate: "Under Review",
    recoveryTech: "Thermal Smelting"
  },
  {
    id: "REC-TN-05",
    companyName: "Tirunelveli Eco-Refining Corp",
    contactPerson: "G. Paulraj",
    cpcbRegistrationNo: "TN-EPR-2025-REVOKED",
    verificationStatus: "SUSPENDED",
    isCpcbVerified: false,
    isPlatformVerified: false,
    phone: "+91 94420 99881",
    email: "admin@tveco.in",
    location: "Tirunelveli - Gangaikondan SIPCOT",
    capacityMonthlyKg: 20000,
    currentIntakeKg: 0,
    acceptedCategories: ["Batteries"],
    rating: 3.1,
    auditDate: "Suspended 12 Aug 2026",
    recoveryTech: "Unlicensed Storage"
  }
];

/**
 * 3. Registered Collectors Database (with Phone Verification status)
 */
export const initialCollectors = [
  {
    id: "COL-TN-101",
    name: "Ramesh Kumar",
    company: "Apex Scrap Collection",
    phone: "+91 98401 23456",
    phone_verified: true,
    location: "Chennai - Guindy Industrial Estate",
    materials: ["PCB / Electronic Components", "Computer Equipment", "Cables / Wires"],
    availableWeightKg: 45,
    askingPricePerKg: 650,
    reliabilityScore: 4.9,
    lotsCompleted: 28,
    totalEarnings: 84500
  },
  {
    id: "COL-TN-102",
    name: "Velu Pandian",
    company: "Madurai Urban Collectors",
    phone: "+91 94432 87654",
    phone_verified: true,
    location: "Madurai - Kappalur SIDCO",
    materials: ["Batteries", "Copper", "Ferrous Metals"],
    availableWeightKg: 60,
    askingPricePerKg: 450,
    reliabilityScore: 4.7,
    lotsCompleted: 14,
    totalEarnings: 42300
  },
  {
    id: "COL-TN-103",
    name: "Karthik Raja",
    company: "Citywide Tech Recyclers",
    phone: "+91 97890 54321",
    phone_verified: true,
    location: "Chennai - Ambattur Industrial Estate",
    materials: ["Computer Equipment", "Mobile / Small Electronics"],
    availableWeightKg: 35,
    askingPricePerKg: 320,
    reliabilityScore: 4.8,
    lotsCompleted: 19,
    totalEarnings: 61200
  },
  {
    id: "COL-TN-104",
    name: "Murugan Selvam",
    company: "Trichy Green Scraps",
    phone: "+91 98940 11223",
    phone_verified: false, // Demo unverified collector
    location: "Tiruchirappalli - Thuvakudi SIDCO",
    materials: ["Other E-Waste", "Plastics"],
    availableWeightKg: 20,
    askingPricePerKg: 160,
    reliabilityScore: 4.3,
    lotsCompleted: 2,
    totalEarnings: 3200
  }
];

/**
 * 4. Digital Lots Database (The central entity supporting all 12 statuses)
 * Statuses:
 * DRAFT, AVAILABLE, MATCHED, OFFER_RECEIVED, OFFER_ACCEPTED,
 * PICKUP_SCHEDULED, HANDED_OVER, PAYMENT_COMPLETED, COMPLETED, REJECTED, CANCELLED, UNDER_REVIEW
 */
export const initialMaterialLots = [
  {
    id: "LOT-EL26-TN-00125",
    collectorId: "COL-TN-101",
    collectorName: "Ramesh Kumar (Apex Scrap Collection)",
    collectorPhone: "+91 98401 23456",
    category: "PCB / Electronic Components",
    material: "High-Grade PCB Circuit Boards",
    quantity: 20,
    unit: "kg",
    condition: "Non-working / Scrap",
    location: "Chennai - Guindy Industrial Estate",
    collectionDate: "09 Sep 2026",
    createdDate: "09 Sep 2026, 10:30 AM",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop",
    notes: "Telecom motherboards and gold-plated server interface cards carefully packed.",
    benchmarkPrice: 650,
    tolerance: 0.25,
    lowerLimit: 488,
    upperLimit: 813,
    estimatedLotValue: 13000,
    minEstimatedValue: 9760,
    maxEstimatedValue: 16260,
    status: "OFFER_ACCEPTED",
    agreedPricePerUnit: 670,
    agreedTotalValue: 13400,
    selectedRecyclerId: "REC-TN-01",
    selectedRecyclerName: "GreenCycle Material Recovery Ltd",
    timeline: [
      { id: "e-1", event: "Phone Verified", timestamp: "08 Sep 2026, 09:00 AM", userRole: "Collector", status: "Completed", details: "Phone +91 98401 23456 verified via OTP" },
      { id: "e-2", event: "Waste Added", timestamp: "09 Sep 2026, 10:15 AM", userRole: "Collector", status: "Completed", details: "20 kg PCB Scrap declared" },
      { id: "e-3", event: "Waste Classified", timestamp: "09 Sep 2026, 10:20 AM", userRole: "Collector", status: "Completed", details: "Category: PCB / Electronic Components" },
      { id: "e-4", event: "Digital Lot Created", timestamp: "09 Sep 2026, 10:30 AM", userRole: "System", status: "Completed", details: "Assigned ID LOT-EL26-TN-00125" },
      { id: "e-5", event: "Fair Price Calculated", timestamp: "09 Sep 2026, 10:30 AM", userRole: "Rules Engine", status: "Completed", details: "Benchmark: ₹650/kg | Fair Range: ₹488–₹813/kg" },
      { id: "e-6", event: "Recycler Matched", timestamp: "09 Sep 2026, 11:00 AM", userRole: "Rules Engine", status: "Completed", details: "Matched with GreenCycle Material Recovery Ltd" },
      { id: "e-7", event: "Offer Received", timestamp: "09 Sep 2026, 01:30 PM", userRole: "Recycler", status: "Completed", details: "Offer submitted: ₹670/kg (Total: ₹13,400) - Status: FAIR ✓" },
      { id: "e-8", event: "Offer Accepted", timestamp: "09 Sep 2026, 03:00 PM", userRole: "Collector", status: "Completed", details: "Collector accepted GreenCycle offer" },
      { id: "e-9", event: "Pickup Scheduled", timestamp: "10 Sep 2026, 09:00 AM", userRole: "Logistics", status: "Active", details: "Scheduled for 11 Sep 2026 with GreenCycle fleet" }
    ]
  },
  {
    id: "LOT-EL26-TN-00124",
    collectorId: "COL-TN-102",
    collectorName: "Velu Pandian (Madurai Urban Collectors)",
    collectorPhone: "+91 94432 87654",
    category: "Batteries",
    material: "Lithium-Ion Battery Packs",
    quantity: 25,
    unit: "kg",
    condition: "Non-working / Scrap",
    location: "Madurai - Kappalur SIDCO",
    collectionDate: "07 Sep 2026",
    createdDate: "07 Sep 2026, 02:15 PM",
    imageUrl: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=500&auto=format&fit=crop",
    notes: "Laptop battery packs with non-conductive insulation on terminals.",
    benchmarkPrice: 450,
    tolerance: 0.25,
    lowerLimit: 338,
    upperLimit: 563,
    estimatedLotValue: 11250,
    minEstimatedValue: 8450,
    maxEstimatedValue: 14075,
    status: "COMPLETED",
    agreedPricePerUnit: 460,
    agreedTotalValue: 11500,
    selectedRecyclerId: "REC-TN-02",
    selectedRecyclerName: "Madurai CleanMetals Eco-Processing",
    timeline: [
      { id: "e-1", event: "Phone Verified", timestamp: "05 Sep 2026, 11:00 AM", userRole: "Collector", status: "Completed", details: "Phone +91 94432 87654 verified via OTP" },
      { id: "e-2", event: "Waste Added", timestamp: "07 Sep 2026, 02:00 PM", userRole: "Collector", status: "Completed", details: "25 kg Battery Scrap declared" },
      { id: "e-3", event: "Waste Classified", timestamp: "07 Sep 2026, 02:10 PM", userRole: "Collector", status: "Completed", details: "Category: Batteries (Hazardous)" },
      { id: "e-4", event: "Digital Lot Created", timestamp: "07 Sep 2026, 02:15 PM", userRole: "System", status: "Completed", details: "Assigned ID LOT-EL26-TN-00124" },
      { id: "e-5", event: "Fair Price Calculated", timestamp: "07 Sep 2026, 02:15 PM", userRole: "Rules Engine", status: "Completed", details: "Benchmark: ₹450/kg | Fair Range: ₹338–₹563/kg" },
      { id: "e-6", event: "Recycler Matched", timestamp: "07 Sep 2026, 02:45 PM", userRole: "Rules Engine", status: "Completed", details: "Matched with Madurai CleanMetals Eco-Processing" },
      { id: "e-7", event: "Offer Received", timestamp: "07 Sep 2026, 04:00 PM", userRole: "Recycler", status: "Completed", details: "Offer submitted: ₹460/kg (Total: ₹11,500) - Status: FAIR ✓" },
      { id: "e-8", event: "Offer Accepted", timestamp: "07 Sep 2026, 04:30 PM", userRole: "Collector", status: "Completed", details: "Collector accepted Madurai CleanMetals offer" },
      { id: "e-9", event: "Pickup Scheduled", timestamp: "08 Sep 2026, 09:30 AM", userRole: "Logistics", status: "Completed", details: "Scheduled for 08 Sep 2026" },
      { id: "e-10", event: "Waste Handed Over", timestamp: "08 Sep 2026, 02:00 PM", userRole: "Collector & Recycler", status: "Completed", details: "Material verified and accepted at weighbridge" },
      { id: "e-11", event: "Payment Recorded", timestamp: "08 Sep 2026, 03:30 PM", userRole: "System", status: "Completed", details: "Transaction TXN-2026-9921 recorded: ₹11,500 settled" },
      { id: "e-12", event: "Transaction Completed", timestamp: "09 Sep 2026, 05:00 PM", userRole: "Recycler", status: "Completed", details: "Recovery Certificate CERT-TN-2026-0088 issued" }
    ],
    proof: {
      recoveredGoldGrams: "0.0 g",
      recoveredCopperKg: "4.8 kg",
      recoveredAluminumKg: "3.2 kg",
      recoveredLithiumKg: "1.9 kg",
      certificateId: "CERT-TN-2026-0088"
    }
  },
  {
    id: "LOT-EL26-TN-00126",
    collectorId: "COL-TN-101",
    collectorName: "Ramesh Kumar (Apex Scrap Collection)",
    collectorPhone: "+91 98401 23456",
    category: "Copper",
    material: "Copper Cable & Insulated Wires",
    quantity: 30,
    unit: "kg",
    condition: "Non-working / Scrap",
    location: "Chennai - Guindy Industrial Estate",
    collectionDate: "10 Sep 2026",
    createdDate: "10 Sep 2026, 09:15 AM",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop",
    notes: "Clean copper wiring and power cords stripped of heavy connectors.",
    benchmarkPrice: 720,
    tolerance: 0.20,
    lowerLimit: 576,
    upperLimit: 864,
    estimatedLotValue: 21600,
    minEstimatedValue: 17280,
    maxEstimatedValue: 25920,
    status: "OFFER_RECEIVED",
    timeline: [
      { id: "e-1", event: "Phone Verified", timestamp: "08 Sep 2026, 09:00 AM", userRole: "Collector", status: "Completed", details: "Phone +91 98401 23456 verified" },
      { id: "e-2", event: "Waste Added", timestamp: "10 Sep 2026, 09:00 AM", userRole: "Collector", status: "Completed", details: "30 kg Copper Scrap declared" },
      { id: "e-3", event: "Waste Classified", timestamp: "10 Sep 2026, 09:10 AM", userRole: "Collector", status: "Completed", details: "Category: Copper" },
      { id: "e-4", event: "Digital Lot Created", timestamp: "10 Sep 2026, 09:15 AM", userRole: "System", status: "Completed", details: "Assigned ID LOT-EL26-TN-00126" },
      { id: "e-5", event: "Fair Price Calculated", timestamp: "10 Sep 2026, 09:15 AM", userRole: "Rules Engine", status: "Completed", details: "Benchmark: ₹720/kg | Fair Range: ₹576–₹864/kg" },
      { id: "e-6", event: "Recycler Matched", timestamp: "10 Sep 2026, 09:30 AM", userRole: "Rules Engine", status: "Completed", details: "Matched with GreenCycle & Madurai CleanMetals" },
      { id: "e-7", event: "Offer Received", timestamp: "10 Sep 2026, 11:45 AM", userRole: "Recycler", status: "Active", details: "2 Offers Received from GreenCycle (₹740/kg) & Madurai CleanMetals (₹710/kg)" }
    ]
  },
  {
    id: "LOT-EL26-TN-00127",
    collectorId: "COL-TN-103",
    collectorName: "Karthik Raja (Citywide Tech Recyclers)",
    collectorPhone: "+91 97890 54321",
    category: "Computer Equipment",
    material: "Complete Laptops & Enterprise Towers",
    quantity: 15,
    unit: "kg",
    condition: "Mixed Condition",
    location: "Chennai - Ambattur Industrial Estate",
    collectionDate: "10 Sep 2026",
    createdDate: "10 Sep 2026, 11:30 AM",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop",
    notes: "Core i5 & i7 enterprise laptops with power adapters.",
    benchmarkPrice: 320,
    tolerance: 0.25,
    lowerLimit: 240,
    upperLimit: 400,
    estimatedLotValue: 4800,
    minEstimatedValue: 3600,
    maxEstimatedValue: 6000,
    status: "AVAILABLE",
    timeline: [
      { id: "e-1", event: "Phone Verified", timestamp: "09 Sep 2026, 10:00 AM", userRole: "Collector", status: "Completed", details: "Phone +91 97890 54321 verified" },
      { id: "e-2", event: "Waste Added", timestamp: "10 Sep 2026, 11:20 AM", userRole: "Collector", status: "Completed", details: "15 kg Computer Equipment declared" },
      { id: "e-3", event: "Waste Classified", timestamp: "10 Sep 2026, 11:25 AM", userRole: "Collector", status: "Completed", details: "Category: Computer Equipment" },
      { id: "e-4", event: "Digital Lot Created", timestamp: "10 Sep 2026, 11:30 AM", userRole: "System", status: "Completed", details: "Assigned ID LOT-EL26-TN-00127" },
      { id: "e-5", event: "Fair Price Calculated", timestamp: "10 Sep 2026, 11:30 AM", userRole: "Rules Engine", status: "Completed", details: "Benchmark: ₹320/kg | Fair Range: ₹240–₹400/kg" },
      { id: "e-6", event: "Recycler Matched", timestamp: "10 Sep 2026, 11:35 AM", userRole: "Rules Engine", status: "Completed", details: "Open for offers from verified recyclers" }
    ]
  }
];

/**
 * 5. Recycler Offers Database
 * Statuses: PENDING, ACCEPTED, REJECTED, EXPIRED, FLAGGED
 */
export const initialOffers = [
  {
    id: "OFF-2026-0881",
    lotId: "LOT-EL26-TN-00126",
    recyclerId: "REC-TN-01",
    recyclerName: "GreenCycle Material Recovery Ltd",
    recyclerVerified: true,
    pricePerUnit: 740, // within fair range (₹576-₹864)
    totalPrice: 22200,
    fairPriceStatus: "FAIR",
    fairPriceBadge: "FAIR ✓",
    status: "PENDING",
    timestamp: "10 Sep 2026, 11:45 AM",
    proposedPickupDate: "12 Sep 2026",
    location: "Chennai - Ambattur Industrial Estate",
    distanceKm: 8.4,
    notes: "Direct factory pickup arranged with certified weighing scales."
  },
  {
    id: "OFF-2026-0882",
    lotId: "LOT-EL26-TN-00126",
    recyclerId: "REC-TN-02",
    recyclerName: "Madurai CleanMetals Eco-Processing",
    recyclerVerified: true,
    pricePerUnit: 710, // within fair range
    totalPrice: 21300,
    fairPriceStatus: "FAIR",
    fairPriceBadge: "FAIR ✓",
    status: "PENDING",
    timestamp: "10 Sep 2026, 12:10 PM",
    proposedPickupDate: "13 Sep 2026",
    location: "Madurai - Kappalur SIDCO",
    distanceKm: 14.2,
    notes: "Will dispatch secondary logistics crate with advance payment."
  },
  {
    id: "OFF-2026-0879",
    lotId: "LOT-EL26-TN-00125",
    recyclerId: "REC-TN-01",
    recyclerName: "GreenCycle Material Recovery Ltd",
    recyclerVerified: true,
    pricePerUnit: 670,
    totalPrice: 13400,
    fairPriceStatus: "FAIR",
    fairPriceBadge: "FAIR ✓",
    status: "ACCEPTED",
    timestamp: "09 Sep 2026, 01:30 PM",
    proposedPickupDate: "11 Sep 2026",
    location: "Chennai - Ambattur Industrial Estate",
    distanceKm: 8.4,
    notes: "Accepted offer for enterprise telecom PCB scrap lot."
  },
  {
    id: "OFF-2026-0875",
    lotId: "LOT-EL26-TN-00127",
    recyclerId: "REC-TN-03",
    recyclerName: "Kongu Circular Resource Node",
    recyclerVerified: true,
    pricePerUnit: 190, // BELOW fair range (₹240-₹400) -> FLAGGED
    totalPrice: 2850,
    fairPriceStatus: "BELOW_FAIR_RANGE",
    fairPriceBadge: "BELOW FAIR RANGE ⚠️",
    status: "FLAGGED",
    timestamp: "10 Sep 2026, 01:00 PM",
    proposedPickupDate: "14 Sep 2026",
    location: "Coimbatore - Peelamedu",
    distanceKm: 22.0,
    notes: "Bulk price quotation (Flagged 21% below minimum benchmark)."
  }
];

/**
 * 6. Handovers & Pickups Database
 * Statuses: PICKUP_SCHEDULED, IN_TRANSIT, READY_FOR_HANDOVER, HANDED_OVER
 */
export const initialHandovers = [
  {
    id: "HND-2026-0041",
    lotId: "LOT-EL26-TN-00125",
    collectorId: "COL-TN-101",
    collectorName: "Ramesh Kumar",
    collectorPhone: "+91 98401 23456",
    recyclerId: "REC-TN-01",
    recyclerName: "GreenCycle Material Recovery Ltd",
    quantity: 20,
    unit: "kg",
    agreedPrice: 670,
    totalValue: 13400,
    pickupDate: "11 Sep 2026, 10:00 AM",
    location: "Guindy Scrap Yard Node #4, Chennai",
    status: "PICKUP_SCHEDULED",
    notes: "GreenCycle driver assigned: K. Vijay (+91 98840 99881)"
  },
  {
    id: "HND-2026-0038",
    lotId: "LOT-EL26-TN-00124",
    collectorId: "COL-TN-102",
    collectorName: "Velu Pandian",
    collectorPhone: "+91 94432 87654",
    recyclerId: "REC-TN-02",
    recyclerName: "Madurai CleanMetals Eco-Processing",
    quantity: 25,
    unit: "kg",
    agreedPrice: 460,
    totalValue: 11500,
    pickupDate: "08 Sep 2026, 02:00 PM",
    location: "Kappalur SIDCO Drop Node, Madurai",
    status: "HANDED_OVER",
    notes: "Handover successfully completed and verified at weighbridge."
  }
];

/**
 * 7. Recorded Transactions Database
 * Payment Statuses: PENDING, PAID, FAILED, COMPLETED
 * Transaction Statuses: PENDING, COMPLETED
 */
export const initialTransactions = [
  {
    id: "TXN-2026-0091",
    lotId: "LOT-EL26-TN-00124",
    collectorId: "COL-TN-102",
    collectorName: "Velu Pandian",
    recyclerId: "REC-TN-02",
    recyclerName: "Madurai CleanMetals Eco-Processing",
    quantity: 25,
    unit: "kg",
    category: "Batteries",
    acceptedPrice: 460,
    totalValue: 11500, // 25kg * ₹460 = ₹11,500
    date: "08 Sep 2026, 03:30 PM",
    paymentStatus: "PAID",
    transactionStatus: "COMPLETED",
    paymentMethod: "Platform Recorded Settlement (Direct NEFT Ref: TN-2026-8812)",
    receiptId: "REC-EPR-2026-0091"
  }
];

/**
 * 8. Active Recycler E-Waste Requirements (Marketplace Demand Posting)
 */
export const initialRecyclerRequirements = [
  {
    id: "REQ-2026-081",
    recyclerId: "REC-TN-01",
    recyclerName: "GreenCycle Material Recovery Ltd",
    cpcbRegistrationNo: "TN-EPR-2026-8821 (Verified)",
    isCpcbVerified: true,
    isPlatformVerified: true,
    category: "PCB / Electronic Components",
    requiredQuantityKg: 50,
    currentReceivedKg: 20,
    preferredCondition: "Non-working / Scrap",
    targetPricePerKg: 650,
    referenceMin: 488,
    referenceMax: 813,
    location: "Chennai - Ambattur Industrial Estate",
    postedDate: "08 Sep 2026",
    expiresInDays: 3,
    status: "Active",
    notes: "Requires desktop motherboards, enterprise laptops, and server racks for precious metal extraction."
  },
  {
    id: "REQ-2026-082",
    recyclerId: "REC-TN-02",
    recyclerName: "Madurai CleanMetals Eco-Processing",
    cpcbRegistrationNo: "TN-EPR-2026-4412 (Verified)",
    isCpcbVerified: true,
    isPlatformVerified: true,
    category: "Batteries",
    requiredQuantityKg: 100,
    currentReceivedKg: 45,
    preferredCondition: "Non-working / Scrap",
    targetPricePerKg: 450,
    referenceMin: 338,
    referenceMax: 563,
    location: "Madurai - Kappalur SIDCO",
    postedDate: "09 Sep 2026",
    expiresInDays: 5,
    status: "Active",
    notes: "High demand for Li-ion packs and power bank cells. Sealed packaging preferred."
  },
  {
    id: "REQ-2026-083",
    recyclerId: "REC-TN-03",
    recyclerName: "Kongu Circular Resource Node",
    cpcbRegistrationNo: "TN-EPR-2026-9055 (Verified)",
    isCpcbVerified: true,
    isPlatformVerified: true,
    category: "Computer Equipment",
    requiredQuantityKg: 40,
    currentReceivedKg: 0,
    preferredCondition: "Mixed Condition",
    targetPricePerKg: 320,
    referenceMin: 240,
    referenceMax: 400,
    location: "Coimbatore - Peelamedu Industrial Corridor",
    postedDate: "10 Sep 2026",
    expiresInDays: 4,
    status: "Active",
    notes: "Enterprise servers, workstations, and network equipment."
  }
];

/**
 * 9. Admin Platform Audit Logs
 */
export const adminAuditLogs = [
  { id: "log-1", timestamp: "10 Sep 2026, 13:00", action: "Offer Flagged (Below Fair Range)", entity: "OFF-2026-0875 (Kongu Circular ₹190/kg)", status: "Flagged" },
  { id: "log-2", timestamp: "10 Sep 2026, 11:30", action: "Digital Lot Created", entity: "LOT-EL26-TN-00127 (15 kg Computers)", status: "Active" },
  { id: "log-3", timestamp: "10 Sep 2026, 09:15", action: "Digital Lot Created", entity: "LOT-EL26-TN-00126 (30 kg Copper)", status: "Active" },
  { id: "log-4", timestamp: "09 Sep 2026, 15:00", action: "Recycler Offer Accepted", entity: "LOT-EL26-TN-00125 (GreenCycle)", status: "Completed" },
  { id: "log-5", timestamp: "08 Sep 2026, 15:30", action: "Payment Recorded & Settled", entity: "TXN-2026-0091 (₹11,500)", status: "Completed" },
  { id: "log-6", timestamp: "08 Sep 2026, 09:00", action: "Collector Phone Verified", entity: "COL-TN-101 (+91 98401 23456)", status: "Verified" }
];

/**
 * 10. Public Educational Guides & Locations (Preserved)
 */
export const recyclingCategories = structuredEWasteCategories.map(c => ({
  id: c.id,
  name: c.name,
  icon: c.icon,
  color: "bg-white text-[#1F6F5F] border-[#EEEEEE]",
  description: c.description,
  status: "Formal Recovery Only ⚡",
  referenceRate: `₹${c.benchmarkPrice}/kg`,
  prepSteps: [
    "Wipe sensitive personal data / factory reset",
    "Keep internal components and motherboards intact",
    "Pack power adapters and charging leads together"
  ],
  dontRecycle: [
    "Items with swollen or punctured battery packs",
    "Burnt or acid-leaked internal assemblies"
  ]
}));

export const searchableMaterials = structuredEWasteCategories.map(c => ({
  keywords: [c.name.toLowerCase(), c.category.toLowerCase(), ...c.recoveryMetals.map(m => m.toLowerCase())],
  item: c.name,
  isRecyclable: true,
  category: c.category,
  icon: c.icon,
  referencePrice: `₹${c.benchmarkPrice}/kg`,
  prep: `1. Keep dry and intact.\n2. Do not burn or crush.\n3. Hand over to verified ECO-Link collector.`,
  badge: "CPCB Recyclable ✓"
}));

export const recyclingLocations = [
  {
    id: "loc-1",
    name: "GreenCycle Material Recovery Hub",
    address: "Plot 42, SIDCO Industrial Estate, Ambattur, Chennai",
    distance: "1.2 km away",
    acceptedMaterials: ["PCB / Electronic Components", "Computer Equipment", "Copper"],
    cpcbRegistrationNo: "TN-EPR-2026-8821 (Verified)",
    hours: "Mon - Sat: 8:30 AM - 6:30 PM",
    rating: 4.95,
    phone: "+91 44 2688 1234",
    lat: 13.0827,
    lng: 80.2707
  },
  {
    id: "loc-2",
    name: "Madurai CleanMetals Eco-Processing Facility",
    address: "Kappalur Industrial Area, Sector 3, Madurai",
    distance: "2.8 km away",
    acceptedMaterials: ["Batteries", "Copper", "Ferrous Metals"],
    cpcbRegistrationNo: "TN-EPR-2026-4412 (Verified)",
    hours: "Mon - Sat: 9:00 AM - 6:00 PM",
    rating: 4.88,
    phone: "+91 452 245 6789",
    lat: 9.9252,
    lng: 78.1198
  },
  {
    id: "loc-3",
    name: "Kongu Circular Resource Node",
    address: "Peelamedu Industrial Corridor, Coimbatore",
    distance: "3.5 km away",
    acceptedMaterials: ["PCB / Electronic Components", "Computer Equipment", "Plastics"],
    cpcbRegistrationNo: "TN-EPR-2026-9055 (Verified)",
    hours: "Mon - Fri: 8:00 AM - 5:30 PM",
    rating: 4.92,
    phone: "+91 422 257 8901",
    lat: 11.0168,
    lng: 76.9558
  }
];

export const userDashboardData = {
  userName: "Sundar Rajan",
  totalRecycledKg: 42,
  co2SavedKg: 18.6,
  earnedPoints: 850,
  targetPoints: 1000,
  tier: "Eco Contributor",
  tierProgressPercent: 85,
  recentActivity: [
    { id: "act-1", category: "Laptop & Peripherals", weightKg: 8.5, points: 240, date: "Today, 11:30 AM", icon: "💻" },
    { id: "act-2", category: "Mobile Phones", weightKg: 1.2, points: 120, date: "Yesterday, 4:10 PM", icon: "📱" },
    { id: "act-3", category: "Lithium Battery", weightKg: 3.0, points: 180, date: "05 Sep 2026", icon: "🔋" }
  ]
};

export const ecoJournalArticles = [
  {
    id: "art-1",
    title: "How formal e-waste recovery extracts 98% pure Gold and Copper",
    category: "Material Recovery",
    readTime: "4 min read",
    icon: "🥇",
    summary: "Discover the hydrometallurgical and mechanical separation techniques used by verified recyclers in Tamil Nadu."
  },
  {
    id: "art-2",
    title: "Understanding CPCB and EPR compliance for e-waste collectors",
    category: "Regulatory Standards",
    readTime: "5 min read",
    icon: "📜",
    summary: "Why certified material recovery documentation is mandatory under national Extended Producer Responsibility guidelines."
  },
  {
    id: "art-3",
    title: "Fair reference scrap pricing: Empowering informal collectors",
    category: "Circularity & Economy",
    readTime: "3 min read",
    icon: "⚖️",
    summary: "How transparent rule-based reference ranges eliminate middleman exploitation and ensure fair per-kilogram settlements."
  }
];

export const communityTestimonials = [
  {
    quote: "As an informal collector, ECO-Link gives me direct access to registered recyclers with transparent reference pricing. My daily earnings grew by 35% without middleman cuts!",
    name: "Ramesh Kumar",
    location: "Chennai, Tamil Nadu",
    role: "Verified Collector",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop"
  },
  {
    quote: "Creating verified digital lots gives our facility 100% auditable evidence for CPCB and EPR reporting. The rule-based price check saves hours of negotiation.",
    name: "Dr. K. Senthil Nathan",
    location: "GreenCycle Material Recovery, Ambattur",
    role: "Verified Recycler Manager",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop"
  },
  {
    quote: "Disposing of our company's outdated laptops was effortless. We received a digital material lot tracking link and green receipt the same afternoon.",
    name: "Ananya Krishnan",
    location: "Tidel Park, Coimbatore",
    role: "IT Asset Manager",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
  }
];

export const rewardsList = [
  {
    id: "rew-1",
    title: "Reusable Stainless Water Bottle",
    pointsRequired: 1500,
    icon: "🥤",
    description: "Insulated 750ml double-wall stainless steel bottle with ECO-Link logo.",
    category: "Eco Merchandise",
    isRedeemable: false
  },
  {
    id: "rew-2",
    title: "Organic Cotton Canvas Tote Bag",
    pointsRequired: 800,
    icon: "🛍️",
    description: "100% unbleached organic cotton heavy-duty grocery tote bag.",
    category: "Eco Merchandise",
    isRedeemable: true
  },
  {
    id: "rew-3",
    title: "Plant 1 Native Forest Tree",
    pointsRequired: 500,
    icon: "🌳",
    description: "We plant a verified native sapling in your name with GPS tracking certificate.",
    category: "Direct Restoration",
    isRedeemable: true
  },
  {
    id: "rew-4",
    title: "Ceramic Bamboo Travel Coffee Mug",
    pointsRequired: 2000,
    icon: "☕",
    description: "Sleek ceramic travel tumbler with spill-proof bamboo lid.",
    category: "Eco Merchandise",
    isRedeemable: false
  }
];

export const generatorDisposalsList = [
  {
    id: "DISP-2026-0881",
    deviceType: "High-Grade Telecom Server Motherboards",
    weightKg: 18.5,
    pointsAwarded: 350,
    collectorAssigned: "Ramesh Kumar (Apex Scrap)",
    status: "Collected",
    date: "09 Sep 2026"
  },
  {
    id: "DISP-2026-0872",
    deviceType: "Lithium-Ion Laptop Battery Cells",
    weightKg: 14.0,
    pointsAwarded: 280,
    collectorAssigned: "Velu Pandian (Madurai Urban)",
    status: "Recycling Completed",
    date: "07 Sep 2026"
  },
  {
    id: "DISP-2026-0850",
    deviceType: "Old Core i5 Desktops & CRT Monitors",
    weightKg: 9.5,
    pointsAwarded: 220,
    collectorAssigned: "Karthik Raja (Citywide Tech)",
    status: "Handover Pending",
    date: "05 Sep 2026"
  }
];


