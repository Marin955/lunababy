-- One-off production price update, 2026-11-12.
-- Box prices = sum of the per-item "Naša cijena" in the purchasing sheet, except:
--   First Bites Plus: €99 (the sheet's €80 warmer price was for a warmer never bought)
--   Sweet Dreams Plus: €105 (muslin had no price; valued at €20)
-- Logs each change in bundle_price_changes, as Bundle#record_price_change does,
-- so the 30-day lowest-price display stays correct.

\set ON_ERROR_STOP on
\pset pager off
BEGIN;

WITH new_prices(slug, price) AS (
  VALUES ('first-bites', 3700), ('first-bites-plus', 9900), ('bubbles-and-cuddles', 7000),
         ('sweet-dreams', 3000), ('sweet-dreams-plus', 10500)
), changed AS (
  UPDATE bundles b SET price = n.price, original_price = NULL, discount_percent = 0, updated_at = now()
  FROM new_prices n
  WHERE b.slug = n.slug AND b.price <> n.price
  RETURNING b.id, b.price
)
INSERT INTO bundle_price_changes (bundle_id, price, created_at)
SELECT id, price, now() FROM changed;

SELECT slug, price, discount_percent FROM bundles ORDER BY position;

COMMIT;
