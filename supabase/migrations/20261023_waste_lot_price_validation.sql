-- ====================================================================
-- Migration: EcoLink Waste Lot Price Validation and Storage
-- File: supabase/migrations/20261023_waste_lot_price_validation.sql
-- Description:
--   Ensures exact numeric columns for collector expected selling price,
--   tolerance limits, fair price boundaries, and open-to-market status.
--   Enforces price non-negativity and database-level integrity rules.
-- ====================================================================

-- 1. Ensure price and benchmark columns exist with exact numeric precision
ALTER TABLE public.waste_lots
    ADD COLUMN IF NOT EXISTS expected_price NUMERIC(12,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS is_open_to_market BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS benchmark_rate NUMERIC(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS min_fair_price NUMERIC(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS max_fair_price NUMERIC(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS total_weight_kg NUMERIC(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS estimated_total_value NUMERIC(12,2) DEFAULT NULL;

-- 2. Add CHECK constraint: Expected price must be non-negative (>= 0)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_waste_lots_expected_price_non_negative'
    ) THEN
        ALTER TABLE public.waste_lots
            ADD CONSTRAINT chk_waste_lots_expected_price_non_negative
            CHECK (expected_price IS NULL OR expected_price >= 0);
    END IF;
END $$;

-- 3. Comments on columns for auditability and schema documentation
COMMENT ON COLUMN public.waste_lots.expected_price IS 
    'The exact expected selling price entered by the collector during waste lot registration. Stored without alteration or rounding for presentation to verified recyclers.';

COMMENT ON COLUMN public.waste_lots.is_open_to_market IS 
    'Explicit flag denoting that the waste lot has no asking price and is open to competitive recycler market bids.';

COMMENT ON COLUMN public.waste_lots.min_fair_price IS 
    'Dynamic lower bound unit rate (₹/kg) derived from CPCB reference benchmark and state tolerance.';

COMMENT ON COLUMN public.waste_lots.max_fair_price IS 
    'Dynamic upper bound unit rate (₹/kg) derived from CPCB reference benchmark and state tolerance.';

-- 4. Verification View for Fair Price Audit
CREATE OR REPLACE VIEW public.vw_waste_lot_pricing_audit AS
SELECT 
    w.id,
    w.lot_id,
    w.collector_id,
    p.full_name AS collector_name,
    w.category,
    w.material_type,
    COALESCE(w.total_weight_kg, w.quantity) AS weight_kg,
    w.benchmark_rate,
    w.min_fair_price,
    w.max_fair_price,
    w.expected_price,
    w.is_open_to_market,
    ROUND(COALESCE(w.min_fair_price, 0) * COALESCE(w.total_weight_kg, w.quantity, 1)) AS min_permitted_total,
    ROUND(COALESCE(w.max_fair_price, 0) * COALESCE(w.total_weight_kg, w.quantity, 1)) AS max_permitted_total,
    CASE 
        WHEN w.is_open_to_market OR w.expected_price = 0 THEN 'OPEN_TO_MARKET'
        WHEN w.expected_price >= ROUND(COALESCE(w.min_fair_price, 0) * COALESCE(w.total_weight_kg, w.quantity, 1))
         AND w.expected_price <= ROUND(COALESCE(w.max_fair_price, 0) * COALESCE(w.total_weight_kg, w.quantity, 1)) THEN 'VALID_FAIR_PRICE'
        ELSE 'OUTSIDE_TOLERANCE_OR_LEGACY'
    END AS fair_price_compliance_status,
    w.created_at
FROM public.waste_lots w
LEFT JOIN public.profiles p ON p.id = w.collector_id;

-- 5. RLS Rules Reminder
-- Retain standard RLS:
-- Collectors can INSERT their own waste lots (auth.uid() = collector_id).
-- Collectors can SELECT their own waste lots.
-- Verified Recyclers can SELECT available waste lots in 'AWAITING_OFFERS' or 'OFFERS_RECEIVED' status.
