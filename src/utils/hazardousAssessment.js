/**
 * Eco-Link Automated Hazardous Material & Battery Assessment Engine
 * Centralized, category-driven risk profiling for e-waste lot registration.
 */

export const HAZARDOUS_ASSESSMENT_MAP = {
  // 1. Mobile & Small Handheld Electronics
  'Mobile / Small Electronics': {
    assessment: 'Batteries may be present; battery presence and condition require confirmation.',
    hazardRisk: 'Medium',
    batteryLikelihood: 'Likely',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Lithium-ion / Li-Po pouch cells typical. Verify battery swelling, puncture, or casing damage.',
    defaultBatteryState: 'Unconfirmed / Pending Physical Manifest'
  },

  // 2. Computer Equipment & Laptops
  'Computer Equipment': {
    assessment: 'Lithium-ion batteries may be present; battery presence and condition require confirmation.',
    hazardRisk: 'Medium',
    batteryLikelihood: 'Likely',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Laptops, portable workstations, and UPS equipment may house internal high-capacity battery packs.',
    defaultBatteryState: 'Unconfirmed / Pending Physical Manifest'
  },

  // 3. Dedicated Battery Waste
  'Batteries': {
    assessment: 'Battery waste present; battery type and physical condition require confirmation.',
    hazardRisk: 'High',
    batteryLikelihood: 'Yes',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Critical electrochemical risk. Terminals must be taped and insulated. Store in non-conductive dry crates.',
    defaultBatteryState: 'Batteries Intact (Securely enclosed)'
  },

  // 4. Circuit Boards and Components
  'PCB / Electronic Components': {
    assessment: 'Electronic components may contain hazardous substances; physical verification is required.',
    hazardRisk: 'Medium',
    batteryLikelihood: 'Infrequent',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Electronic boards may contain heavy metal solders and brominated flame retardants; inspect for backup RTC coin cells.',
    defaultBatteryState: 'No Batteries Applicable for Item'
  },

  // 5. Cables & Wiring
  'Cables / Wires': {
    assessment: 'Batteries are not typically expected, but other hazardous components may require assessment.',
    hazardRisk: 'Low',
    batteryLikelihood: 'Unlikely',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Assess for halogenated PVC sheathing and lead stabilizers; batteries not typically expected.',
    defaultBatteryState: 'No Batteries Applicable for Item'
  },

  // 6. Copper Scrap
  'Copper': {
    assessment: 'Batteries are not typically expected, but other hazardous components may require assessment.',
    hazardRisk: 'Low',
    batteryLikelihood: 'Unlikely',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Pure metallic scrap; verify absence of transformer oils, coolants, or chemical residue.',
    defaultBatteryState: 'No Batteries Applicable for Item'
  },

  // 7. Aluminium Scrap
  'Aluminium': {
    assessment: 'Batteries are not typically expected, but other hazardous components may require assessment.',
    hazardRisk: 'Low',
    batteryLikelihood: 'Unlikely',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Metallic chassis frames; verify absence of attached capacitor cans or electrolyte fluids.',
    defaultBatteryState: 'No Batteries Applicable for Item'
  },

  // 8. Ferrous Scrap
  'Ferrous Metals': {
    assessment: 'Batteries are not typically expected, but other hazardous components may require assessment.',
    hazardRisk: 'Low',
    batteryLikelihood: 'Unlikely',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Structural server steel and transformer iron; verify no internal sealed capacitors or battery backups.',
    defaultBatteryState: 'No Batteries Applicable for Item'
  },

  // 9. Polymers & Plastics
  'Plastics': {
    assessment: 'Batteries are not typically expected, but other hazardous components may require assessment.',
    hazardRisk: 'Low',
    batteryLikelihood: 'Unlikely',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Flame-retardant housings (ABS/PC); inspect to ensure no internal pouch cells remain stuck inside housings.',
    defaultBatteryState: 'No Batteries Applicable for Item'
  },

  // 10. General / Mixed E-Waste
  'Other E-Waste': {
    assessment: 'Composition unknown; hazardous materials require physical verification.',
    hazardRisk: 'Variable',
    batteryLikelihood: 'Possible',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Mixed composition e-waste must be physically segregated and inspected by authorized recycler personnel.',
    defaultBatteryState: 'Unconfirmed / Pending Physical Manifest'
  },

  // 11. Custom User Stream
  'Other': {
    assessment: 'Composition unknown; hazardous materials require physical verification.',
    hazardRisk: 'Unknown',
    batteryLikelihood: 'Possible',
    verificationStatus: 'Requires Verification',
    safetyNotice: 'Custom stream requires physical inspection and certified CPCB recycler manifest verification.',
    defaultBatteryState: 'Unconfirmed / Pending Physical Manifest'
  }
};

/**
 * Common Aliases Mapping for flexible input
 */
const CATEGORY_ALIASES = {
  'mobile phones': 'Mobile / Small Electronics',
  'smartphones': 'Mobile / Small Electronics',
  'tablets': 'Mobile / Small Electronics',
  'laptops': 'Computer Equipment',
  'computers': 'Computer Equipment',
  'monitors': 'Computer Equipment',
  'televisions and monitors': 'Computer Equipment',
  'printers and scanners': 'Other E-Waste',
  'chargers and cables': 'Cables / Wires',
  'circuit boards / pcbs': 'PCB / Electronic Components',
  'pcbs': 'PCB / Electronic Components',
  'refrigerators and air conditioners': 'Other E-Waste',
  'mixed e-waste': 'Other E-Waste',
  'lithium / lead batteries': 'Batteries'
};

/**
 * Retrieve the automated hazardous material condition and risk profile for an e-waste category.
 * @param {string} categoryName
 * @returns {object} Assessment profile
 */
export function getHazardousAssessment(categoryName) {
  if (!categoryName) {
    return HAZARDOUS_ASSESSMENT_MAP['Other'];
  }

  // Exact match
  if (HAZARDOUS_ASSESSMENT_MAP[categoryName]) {
    return HAZARDOUS_ASSESSMENT_MAP[categoryName];
  }

  // Normalized alias match
  const lower = categoryName.trim().toLowerCase();
  if (CATEGORY_ALIASES[lower] && HAZARDOUS_ASSESSMENT_MAP[CATEGORY_ALIASES[lower]]) {
    return HAZARDOUS_ASSESSMENT_MAP[CATEGORY_ALIASES[lower]];
  }

  // Partial match
  for (const [key, profile] of Object.entries(HAZARDOUS_ASSESSMENT_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return profile;
    }
  }

  return HAZARDOUS_ASSESSMENT_MAP['Other'];
}

export default {
  HAZARDOUS_ASSESSMENT_MAP,
  getHazardousAssessment
};
