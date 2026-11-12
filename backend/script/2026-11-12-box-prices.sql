-- One-off production price update, 2026-11-12.
-- Box prices = item cost incl. 25 % VAT × 1.8, rounded up to the next €5
-- (costs: 22.78, 60.33, 37.70, 15.61, 70.18). Replaced an earlier same-day set
-- (37 / 99 / 70 / 30 / 105) taken from the purchasing sheet.
-- Logs each change in bundle_price_changes, as Bundle#record_price_change does,
-- so the 30-day lowest-price display stays correct.

\set ON_ERROR_STOP on
\pset pager off
BEGIN;

WITH new_prices(slug, price) AS (
  VALUES ('first-bites', 4500), ('first-bites-plus', 11000), ('bubbles-and-cuddles', 7000),
         ('sweet-dreams', 3000), ('sweet-dreams-plus', 13000)
), changed AS (
  UPDATE bundles b SET price = n.price, original_price = NULL, discount_percent = 0, updated_at = now()
  FROM new_prices n
  WHERE b.slug = n.slug AND b.price <> n.price
  RETURNING b.id, b.price
)
INSERT INTO bundle_price_changes (bundle_id, price, created_at)
SELECT id, price, now() FROM changed;

-- Earlier prices were never really offered, so the history keeps only the current
-- price; otherwise the "lowest price in the last 30 days" notice shows them for a month.
DELETE FROM bundle_price_changes c
 USING bundles b
 WHERE b.id = c.bundle_id AND c.price <> b.price;
DELETE FROM bundle_price_changes c
 WHERE EXISTS (SELECT 1 FROM bundle_price_changes n
                WHERE n.bundle_id = c.bundle_id AND n.created_at > c.created_at);
-- Every box must end up with exactly one history row: its current price.
INSERT INTO bundle_price_changes (bundle_id, price, created_at)
SELECT b.id, b.price, now() FROM bundles b
 WHERE NOT EXISTS (SELECT 1 FROM bundle_price_changes c WHERE c.bundle_id = b.id);

SELECT b.slug, b.price, count(c.*) AS history_rows, min(c.price) AS lowest_logged
  FROM bundles b LEFT JOIN bundle_price_changes c ON c.bundle_id = b.id
 GROUP BY b.slug, b.price, b.position ORDER BY b.position;

SELECT slug, price, discount_percent FROM bundles ORDER BY position;

COMMIT;
