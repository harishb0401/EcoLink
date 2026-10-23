import jwt from 'jsonwebtoken';
import { supabase } from '../server/config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ecolink-production-jwt-super-secret-key-2026';
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== EcoLink Waste Lot Price Validation & Recycler Transfer E2E Tests ===\n');

  // 1. Fetch real collector and recycler profiles from Supabase
  const { data: collectorProfile, error: colErr } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'collector')
    .limit(1)
    .single();

  if (colErr || !collectorProfile) {
    throw new Error('Could not find collector profile in Supabase: ' + (colErr?.message || 'None found'));
  }

  const { data: recyclerProfile, error: recErr } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'recycler')
    .limit(1)
    .single();

  if (recErr || !recyclerProfile) {
    throw new Error('Could not find recycler profile in Supabase: ' + (recErr?.message || 'None found'));
  }

  console.log(`✅ Using Collector: ${collectorProfile.full_name} (${collectorProfile.id})`);
  console.log(`✅ Using Recycler: ${recyclerProfile.full_name} (${recyclerProfile.id})`);

  const collectorToken = jwt.sign({ userId: collectorProfile.id, role: 'collector' }, JWT_SECRET, { expiresIn: '1h' });
  const recyclerToken = jwt.sign({ userId: recyclerProfile.id, role: 'recycler' }, JWT_SECRET, { expiresIn: '1h' });

  const collectorHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${collectorToken}`
  };

  const recyclerHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${recyclerToken}`
  };

  console.log('\n--- Pricing Calculation Benchmark Verification ---');
  // Printed Circuit Boards (PCB): benchmark = 650, tolerance = 0.25 (±25%)
  // LowerLimit = Math.round(650 * 0.75) = 488
  // UpperLimit = Math.round(650 * 1.25) = 813
  // For 25 kg:
  // minTotalVal = 488 * 25 = 12,200
  // maxTotalVal = 813 * 25 = 20,325
  console.log('Category: Printed Circuit Boards (PCB), Weight: 25 kg');
  console.log('Permitted Fair Range: ₹12,200 to ₹20,325 (Inclusive)\n');

  const createPayload = (expectedPrice, isOpenToMarket = false, weight = 25) => ({
    category: 'Printed Circuit Boards (PCB)',
    material: 'Circuit Cards & Components',
    quantity: weight,
    lotWeight: weight,
    unit: 'kg',
    condition: 'Sorted and dry-stored',
    expectedPrice: expectedPrice,
    isOpenToMarket: isOpenToMarket,
    collectionAddress: 'Industrial Estate Phase 2, Guindy',
    cityDistrict: 'Chennai',
    preferredPickupDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: 'E2E automated test lot'
  });

  let testPassed = 0;
  let testFailed = 0;

  function report(name, passed, detail) {
    if (passed) {
      console.log(`✅ PASS: ${name}`);
      if (detail) console.log(`   ${detail}`);
      testPassed++;
    } else {
      console.log(`❌ FAIL: ${name}`);
      if (detail) console.log(`   ${detail}`);
      testFailed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Enter price below minimum (₹12,199). Must fail (400).
  // -------------------------------------------------------------
  console.log('[Test 1] Price below minimum (₹12,199 for 25kg PCB)...');
  const resBelow = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(12199))
  });
  const dataBelow = await resBelow.json();
  report(
    'Registration fails for price below minimum (₹12,199)',
    resBelow.status === 400 && dataBelow.message?.includes('12,200') && dataBelow.message?.includes('20,325'),
    `HTTP ${resBelow.status}: "${dataBelow.message}"`
  );

  // -------------------------------------------------------------
  // Test 2: Enter price above maximum (₹20,326). Must fail (400).
  // -------------------------------------------------------------
  console.log('\n[Test 2] Price above maximum (₹20,326 for 25kg PCB)...');
  const resAbove = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(20326))
  });
  const dataAbove = await resAbove.json();
  report(
    'Registration fails for price above maximum (₹20,326)',
    resAbove.status === 400 && dataAbove.message?.includes('12,200') && dataAbove.message?.includes('20,325'),
    `HTTP ${resAbove.status}: "${dataAbove.message}"`
  );

  // -------------------------------------------------------------
  // Test 3: Enter exact minimum (₹12,200). Must succeed (201).
  // -------------------------------------------------------------
  console.log('\n[Test 3] Exact minimum price boundary (₹12,200 for 25kg PCB)...');
  const resExactMin = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(12200))
  });
  const dataExactMin = await resExactMin.json();
  report(
    'Registration succeeds for exact minimum boundary price (₹12,200)',
    resExactMin.status === 201 && dataExactMin.data?.expectedPrice === 12200,
    `HTTP ${resExactMin.status}: Expected price saved as ₹${dataExactMin.data?.expectedPrice}`
  );

  // -------------------------------------------------------------
  // Test 4: Enter price within range (₹16,000). Must succeed (201).
  // -------------------------------------------------------------
  console.log('\n[Test 4] Price within permitted range (₹16,000 for 25kg PCB)...');
  const resMid = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(16000))
  });
  const dataMid = await resMid.json();
  const midLot = dataMid.data;
  report(
    'Registration succeeds for price within range (₹16,000)',
    resMid.status === 201 && midLot?.expectedPrice === 16000,
    `HTTP ${resMid.status}: Stored exact price = ₹${midLot?.expectedPrice}, Lot ID = ${midLot?.lotId}`
  );

  // -------------------------------------------------------------
  // Test 5: Enter exact maximum (₹20,325). Must succeed (201).
  // -------------------------------------------------------------
  console.log('\n[Test 5] Exact maximum price boundary (₹20,325 for 25kg PCB)...');
  const resExactMax = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(20325))
  });
  const dataExactMax = await resExactMax.json();
  report(
    'Registration succeeds for exact maximum boundary price (₹20,325)',
    resExactMax.status === 201 && dataExactMax.data?.expectedPrice === 20325,
    `HTTP ${resExactMax.status}: Expected price saved as ₹${dataExactMax.data?.expectedPrice}`
  );

  // -------------------------------------------------------------
  // Test 6: Change waste lot weight to 50kg. Verify range updates.
  // Benchmark 650, range 488-813 * 50 = ₹24,400 to ₹40,650.
  // ₹16,000 must now fail! ₹30,000 must succeed!
  // -------------------------------------------------------------
  console.log('\n[Test 6] Change waste lot weight to 50kg (Dynamic recalculation)...');
  const res50kgFail = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(16000, false, 50))
  });
  const data50kgFail = await res50kgFail.json();

  const res50kgPass = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(30000, false, 50))
  });
  const data50kgPass = await res50kgPass.json();

  report(
    'Fair range dynamically updates with weight change (50kg: ₹24,400 - ₹40,650)',
    res50kgFail.status === 400 && data50kgFail.message?.includes('24,400') && res50kgPass.status === 201,
    `₹16,000 rejected with: "${data50kgFail.message}", ₹30,000 accepted with HTTP ${res50kgPass.status}`
  );

  // -------------------------------------------------------------
  // Test 7: Direct backend submission of invalid price rejected
  // -------------------------------------------------------------
  console.log('\n[Test 7] Backend path rejects invalid price without client UI...');
  const resDirectInvalid = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify({
      category: 'Lead-Acid Batteries',
      quantity: 10,
      unit: 'kg',
      expectedPrice: 999999 // absurd price
    })
  });
  const dataDirectInvalid = await resDirectInvalid.json();
  report(
    'Server-side validation rejects invalid price independently of client',
    resDirectInvalid.status === 400,
    `HTTP ${resDirectInvalid.status}: "${dataDirectInvalid.message}"`
  );

  // -------------------------------------------------------------
  // Test 8: Register valid waste lot and verify Supabase DB storage
  // -------------------------------------------------------------
  console.log('\n[Test 8] Database Integrity: Verify exact price in Supabase DB...');
  const { data: dbLot, error: dbErr } = await supabase
    .from('waste_lots')
    .select('id, lot_id, expected_price, benchmark_rate, min_fair_price, max_fair_price')
    .eq('lot_id', midLot.lotId)
    .single();

  report(
    'Exact entered price (₹16,000) saved directly in Supabase record',
    !dbErr && dbLot && parseFloat(dbLot.expected_price) === 16000,
    `Supabase lot_id: ${dbLot?.lot_id}, expected_price: ${dbLot?.expected_price}`
  );

  // -------------------------------------------------------------
  // Test 9: Recycler views exact expected price in portal
  // -------------------------------------------------------------
  console.log('\n[Test 9] Recycler Portal: Fetch waste lot and verify price transfer...');
  const resRecycler = await fetch(`${BASE_URL}/waste/${midLot.lotId}`, {
    headers: recyclerHeaders
  });
  const dataRecycler = await resRecycler.json();
  const recyclerLot = dataRecycler.data;
  report(
    'Recycler receives exact collector expected price without modification',
    resRecycler.status === 200 && recyclerLot?.expectedPrice === 16000,
    `Recycler endpoint returned expectedPrice = ₹${recyclerLot?.expectedPrice}`
  );

  // -------------------------------------------------------------
  // Test 10: Open-to-Market Mode (₹0 with isOpenToMarket: true)
  // vs accidental ₹0 without flag. Verify no duplicate or illegal lot.
  // -------------------------------------------------------------
  console.log('\n[Test 10] Open-to-Market Bids mode vs Accidental ₹0...');
  // 10a: Accidental 0 -> MUST FAIL
  const resAccidentalZero = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(0, false, 25))
  });
  const dataAccidentalZero = await resAccidentalZero.json();

  // 10b: Explicit Open to Market -> MUST SUCCEED
  const resOpenMarket = await fetch(`${BASE_URL}/waste`, {
    method: 'POST',
    headers: collectorHeaders,
    body: JSON.stringify(createPayload(0, true, 25))
  });
  const dataOpenMarket = await resOpenMarket.json();
  const marketLot = dataOpenMarket.data;

  // 10c: Recycler sees Open to Market status
  const resMarketRecycler = await fetch(`${BASE_URL}/waste/${marketLot?.lotId}`, {
    headers: recyclerHeaders
  });
  const dataMarketRecycler = await resMarketRecycler.json();

  report(
    'Open-to-Market treated as explicit pricing mode and verified in recycler portal',
    resAccidentalZero.status === 400 &&
    resOpenMarket.status === 201 &&
    marketLot?.isOpenToMarket === true &&
    dataMarketRecycler.data?.isOpenToMarket === true,
    `Accidental 0 rejected (HTTP ${resAccidentalZero.status}), Market mode accepted with isOpenToMarket=true`
  );

  console.log('\n======================================================');
  console.log(`Results: ${testPassed} Passed, ${testFailed} Failed`);
  console.log('======================================================\n');

  if (testFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
