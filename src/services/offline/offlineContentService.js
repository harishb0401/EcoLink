/**
 * Eco-Link Offline Content & Price Cache Service
 * Provides local caching and retrieval for benchmark prices and safety guidance.
 */

import db from './offlineDatabase';
import { structuredEWasteCategories, referenceScrapPrices } from '../../data/scrapPrices';

/**
 * Cache benchmark prices into IndexedDB
 * @param {Array} priceList
 */
export async function cacheBenchmarkPrices(priceList) {
  if (!Array.isArray(priceList) || priceList.length === 0) return;

  const now = new Date().toISOString();
  try {
    for (const item of priceList) {
      await db.cachedPrices.put({
        category: item.category,
        material: item.material || item.name,
        referencePrice: item.referencePrice || item.benchmarkPrice || 350,
        tolerancePercent: item.tolerancePercent !== undefined ? item.tolerancePercent : 25,
        lastUpdated: now
      });
    }
  } catch (err) {
    console.warn('Failed to cache prices into IndexedDB:', err);
  }
}

/**
 * Get benchmark price for a category (online/offline aware)
 * @param {string} categoryName
 * @returns {Promise<{ price: number, tolerance: number, isOffline: boolean, lastUpdated: string|null }>}
 */
export async function getCategoryPrice(categoryName) {
  try {
    const cached = await db.cachedPrices.get(categoryName);
    if (cached) {
      return {
        price: cached.referencePrice,
        tolerance: cached.tolerancePercent,
        isOffline: true,
        lastUpdated: new Date(cached.lastUpdated).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    }
  } catch (e) {
    console.warn('Could not read cached price:', e);
  }

  // Fallback to static structured scrap prices
  const fallback = structuredEWasteCategories.find(c => c.name === categoryName);
  if (fallback) {
    return {
      price: fallback.benchmarkPrice || 350,
      tolerance: fallback.tolerance ? fallback.tolerance * 100 : 25,
      isOffline: true,
      lastUpdated: 'System Baseline'
    };
  }

  return {
    price: 350,
    tolerance: 25,
    isOffline: true,
    lastUpdated: null
  };
}

/**
 * Initialize default offline cache with standard reference prices and safety guides
 */
export async function seedInitialOfflineCache() {
  try {
    const existingCount = await db.cachedPrices.count();
    if (existingCount === 0) {
      const now = new Date().toISOString();
      for (const cat of structuredEWasteCategories) {
        await db.cachedPrices.put({
          category: cat.name,
          material: cat.description,
          referencePrice: cat.benchmarkPrice || 350,
          tolerancePercent: cat.tolerance ? cat.tolerance * 100 : 25,
          lastUpdated: now
        });
      }
    }

    const safetyCount = await db.cachedSafetyGuidance.count();
    if (safetyCount === 0) {
      const safetyProtocols = [
        {
          category: 'Mobile / Small Electronics',
          whatIsIt: 'End-of-life smartphones, feature phones, and handhelds.',
          components: ['Li-ion battery', 'Motherboard PCB', 'Rare earth display magnet'],
          dos: ['Detach battery if easily removable', 'Tape terminals to avoid discharge', 'Store in dry shaded container'],
          donts: ['Do not puncture battery pouches', 'Do not submerge in water', 'Do not crush casing']
        },
        {
          category: 'Lithium / Lead Batteries',
          whatIsIt: 'Rechargeable power packs, UPS batteries, and automotive e-scrap.',
          components: ['Lithium cobalt oxide', 'Acid electrolyte', 'Lead grids'],
          dos: ['Wear rubber gloves when handling', 'Keep in non-conductive plastic crates', 'Isolate swollen batteries'],
          donts: ['Never short circuit terminal posts', 'Do not incinerate or burn', 'Do not stack heavy items on batteries']
        },
        {
          category: 'Computer Equipment',
          whatIsIt: 'Laptops, server units, PCs, monitors, and PSUs.',
          components: ['Power capacitors', 'FR-4 motherboards', 'Copper heat exchangers'],
          dos: ['Unplug all cables before packing', 'Bundle wiring neatly', 'Hand over to authorized CPCB channels'],
          donts: ['Do not discharge CRT tube neck manually', 'Do not burn plastic insulation', 'Do not leave in rain']
        },
        {
          category: 'PCB / Electronic Components',
          whatIsIt: 'Printed Circuit Boards from industrial & consumer electronics.',
          components: ['Gold/Silver contacts', 'IC chips', 'Solder alloys'],
          dos: ['Store in anti-static or cardboard boxes', 'Separate high-grade boards from power boards', 'Protect gold fingers from abrasion'],
          donts: ['Do not use crude open-air acid baths', 'Do not burn solder over charcoal', 'Do not shred without dust filters']
        }
      ];

      for (const item of safetyProtocols) {
        await db.cachedSafetyGuidance.put({
          ...item,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  } catch (e) {
    console.warn('Could not seed offline cache:', e);
  }
}

/**
 * Retrieve cached safety guidance for e-waste category
 * @param {string} categoryName
 */
export async function getCachedSafetyGuidance(categoryName) {
  try {
    let item = await db.cachedSafetyGuidance.get(categoryName);
    if (!item && categoryName === 'Batteries') {
      item = await db.cachedSafetyGuidance.get('Lithium / Lead Batteries');
    }
    if (item) return item;
    // Fallback to first available
    const first = await db.cachedSafetyGuidance.toCollection().first();
    return first || null;
  } catch (err) {
    return null;
  }
}

// Automatically seed cache on module load
seedInitialOfflineCache();

export default {
  cacheBenchmarkPrices,
  getCategoryPrice,
  getCachedSafetyGuidance,
  seedInitialOfflineCache
};
