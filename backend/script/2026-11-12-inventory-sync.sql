-- One-off production data sync, 2026-11-12.
--   1. Wipe all test orders (and the reviews, shipments, status transitions and queued
--      order e-mail jobs that hang off them).
--   2. Replace the product catalog with the stock actually bought (Faire invoices + Amazon
--      + custom door sign) and relink the five boxes to it, matching the box photos.
--   3. Update box descriptions that named items no longer in the boxes.
--   4. Add 45 single-use 10 % voucher codes for the first 45 boxes (separate file).
-- Runs in one transaction; any error rolls everything back.
-- Product research behind the texts: product-info/*.md

\set ON_ERROR_STOP on
\pset pager off
BEGIN;

-- 1. Test orders ----------------------------------------------------------------
DELETE FROM reviews;
DELETE FROM shipments;
DELETE FROM order_status_transitions;
DELETE FROM order_items;
DELETE FROM orders;
UPDATE promo_codes SET current_use_count = 0, updated_at = now();
-- Old seeded test codes (LUNA10, BEBA20, FREESHIP) had no usage limit; switch them off.
UPDATE promo_codes SET active = false, updated_at = now() WHERE code IN ('LUNA10', 'BEBA20', 'FREESHIP');
-- Queued e-mails about the deleted orders (executions cascade).
DELETE FROM solid_queue_jobs
 WHERE finished_at IS NULL
   AND class_name IN ('ReviewRequestJob', 'SendOrderConfirmationJob', 'SendOrderStatusUpdateJob');

-- 2. Catalog -------------------------------------------------------------------
DELETE FROM bundle_items;
DELETE FROM products;

INSERT INTO products
  (sku, position, name_hr, name_en, description_hr, description_en, brand, supplier_name, supplier_url,
   purchase_price, purchase_price_with_vat, msrp, stock_quantity, image_path, dimensions,
   material_hr, material_en, age_range_hr, age_range_en, care_instructions_hr, care_instructions_en,
   certifications, created_at, updated_at)
VALUES
-- Feeding
('21', 0, 'Silikonska zdjelica s poklopcem – medo', 'Silicone Suction Bowl with Lid – Bear',
 $$Zdjelica od silikona za hranu talijanske marke Soina, u obliku medvjedića, u boji bjelokosti. Vakuumsko dno drži je čvrsto na stolu ili pladnju hranilice, a poklopac omogućuje čuvanje i nošenje hrane. Zapremine je 250 ml, ne sadrži BPA ni ftalate i može se prati u perilici posuđa. Prikladna od 4. mjeseca. Dijete tijekom jela uvijek mora biti pod nadzorom.$$,
 $$A food-grade silicone bowl from the Italian brand Soina, shaped like a bear, in ivory. A suction base keeps it firmly on the table or high-chair tray, and the lid lets you store or carry food. It holds 250 ml, is BPA- and phthalate-free, and is dishwasher safe. Suitable from 4 months. Always supervise your child while eating.$$,
 'Soina', 'Soina', 'https://www.faire.com/product/p_h6kc2x3s4g',
 750, 938, 1500, 15, '/images/products/silicone-bowl.jpg', '12 × 6 cm, 250 ml',
 'Silikon za hranu, bez BPA i ftalata', 'Food-grade silicone, BPA- and phthalate-free', 'Od 4 mjeseca', 'From 4 months',
 'Oprati prije prve uporabe. Pere se ručno ili u perilici posuđa, deterdžentom bez mirisa.', 'Wash before first use. Hand wash or dishwasher, with unscented detergent.',
 '{}', now(), now()),
('24', 1, 'Silikonska žličica i vilica', 'Silicone Spoon and Fork',
 $$Silikonska žličica i vilica u boji kadulje nizozemske marke Rammelaartje, namijenjene djeci koja uče samostalno jesti. Široke drške lako se drže malim rukama, a mekani, blago savitljivi silikon nježan je prema desnima. Dijete tijekom jela uvijek mora biti pod nadzorom.$$,
 $$A silicone spoon and fork set in sage green from the Dutch brand Rammelaartje, designed for babies learning to feed themselves. The wide handles are easy for small hands to grip, and the soft, slightly flexible silicone is gentle on gums. Always supervise your child during meals.$$,
 'Rammelaartje', 'Rammelaartje', 'https://www.faire.com/product/p_p7qq4wu255',
 597, 746, 1195, 18, '/images/products/fork-and-spoon.jpg', NULL,
 'Silikon', 'Silicone', NULL, NULL, NULL, NULL,
 '{}', now(), now()),
('25', 2, 'Silikonski podbradnik – medo', 'Silicone Bib – Bear With Me',
 $$Mekani silikonski podbradnik KikkaBoo s motivom medvjedića „Bear With Me”. Duboki džep sprijeda hvata mrvice i proliveno tijekom obroka, a podesivo zakopčavanje oko vrata prilagođava se djetetu koje raste. Ne sadrži BPA i čisti se jednostavnim brisanjem ili ispiranjem. Prikladan od 4. mjeseca.$$,
 $$A soft silicone bib from KikkaBoo with a "Bear With Me" bear motif. A deep front pocket catches crumbs and spills during meals, and the adjustable neck closure fits a growing baby. It is BPA-free and cleans with a quick wipe or rinse. Suitable from 4 months.$$,
 'KikkaBoo', 'Kikkaboo', 'https://www.faire.com/product/p_xjxfgwu8y3',
 475, 594, 950, 15, '/images/products/bear-silicone-bib.jpg', '23 × 32 cm',
 'Mekani silikon, bez BPA', 'Soft silicone, BPA-free', 'Od 4 mjeseca', 'From 4 months',
 'Obrisati ili isprati vodom nakon uporabe.', 'Wipe clean or rinse after use.',
 '{}', now(), now()),
('23', 3, 'Dozator za mlijeko u prahu', 'Formula Milk Powder Dispenser',
 $$Dozator za mlijeko u prahu KikkaBoo s tri odjeljka, u plavoj boji, za nošenje unaprijed odmjerenih obroka. Slojevi se spajaju zakretanjem pa obroci ostaju odvojeni, a ljevkasti otvor olakšava presipanje u većinu bočica. Ne sadrži BPA, smije se prati u perilici posuđa i sterilizirati parom. Namijenjen je samo za suhi prah, ne za tekućine.$$,
 $$A three-compartment formula dispenser from KikkaBoo in blue, for carrying pre-measured portions of milk powder. The layers twist together to keep portions separate, and the funnel-shaped spout pours into most bottle necks. BPA-free, dishwasher safe and steam-steriliser safe. For dry powder only, not for liquids.$$,
 'KikkaBoo', 'Kikkaboo', 'https://www.faire.com/product/p_k568dsa864',
 316, 395, 632, 5, '/images/products/three-compartment-container.jpg', '7,8 × 8,5 × 25 cm',
 'Polipropilen i silikon, bez BPA', 'Polypropylene and silicone, BPA-free', NULL, NULL,
 'Pere se u perilici posuđa; smije se sterilizirati parom.', 'Dishwasher safe; steam-steriliser safe.',
 '{}', now(), now()),
('41', 4, 'Prijenosni grijač za bočice', 'Portable Bottle Warmer',
 $$Prijenosni grijač za bočice Kryvella na baterije, u bež boji. Ugrađena litij-ionska baterija od 8000 mAh napaja šest postavki temperature od 38 do 50 °C, prikazanih na LED zaslonu. Ima i nježno noćno svjetlo za noćno hranjenje, a puni se putem USB-a. Prije hranjenja uvijek provjerite temperaturu mlijeka.$$,
 $$A portable, battery-powered baby bottle warmer from Kryvella in beige. A built-in 8000 mAh lithium-ion battery powers six temperature settings from 38 to 50 °C, shown on an LED display. It also has a soft night light for night-time feeds and charges by USB. Always check the milk temperature before feeding.$$,
 'Kryvella', 'Amazon.de (Kejun Tech)', 'https://www.amazon.de/dp/B0GTYLSSWM',
 2688, 3360, 3360, 5, '/images/products/kryvella-bottle-warmer.jpg', NULL,
 NULL, NULL, NULL, NULL,
 'Čistiti vlažnom krpom. Ne uranjati u vodu.', 'Clean with a damp cloth. Do not immerse in water.',
 '{}', now(), now()),
-- Sleep
('40', 5, 'Tješilica My Teddy', 'My Teddy Comforter',
 $$„My Teddy” je mekana tješilica marke KikkaBoo s glavom medvjedića i nježnom ugrađenom zvečkom. S 24 cm i oko 80 g lako ju je držati malim rukama i nositi u torbi za previjanje. Prikladna od rođenja. Prema navodu proizvođača ispitana je prema europskoj normi za sigurnost igračaka EN 71.$$,
 $$"My Teddy" is a soft KikkaBoo comforter with a teddy-bear head and a gentle built-in rattle. At 24 cm and about 80 g it is easy for small hands to hold and to carry in a nappy bag. Suitable from birth. The manufacturer states it is tested to the European toy safety standard EN 71.$$,
 'KikkaBoo', 'Kikkaboo', 'https://www.faire.com/product/p_hp89mta8qy',
 569, 711, 1138, 15, '/images/products/my-teddy-comforter.jpg', '24 cm',
 NULL, NULL, 'Od rođenja', 'From birth', NULL, NULL,
 '{EN 71}', now(), now()),
('34', 6, 'Noćno svjetlo – psić', 'Tiny Night Light – Puppy',
 $$Mala noćna svjetiljka Winkee u obliku psića, od mekanog silikona s LED svjetlom. Dodirom se uključuje, mijenja boju i podešava jačinu svjetla. Radi na ugrađenu punjivu bateriju koja se puni USB kabelom.$$,
 $$A small Winkee night light shaped like a puppy, made of soft silicone with an LED inside. Tap it to switch it on, change the colour or adjust the brightness. It runs on a built-in rechargeable battery and charges by USB cable.$$,
 'Winkee', 'MAGS Vertriebs GmbH', 'https://www.faire.com/product/p_f5ksgnybhm',
 580, 725, 1390, 36, '/images/products/silicone-night-light.jpg', '8 × 6 × 8 cm',
 'Silikon', 'Silicone', NULL, NULL, NULL, NULL,
 '{}', now(), now()),
('3', 7, 'Znak za vrata „Beba spava”', 'Baby Sleeping Door Sign',
 $$Ručno izrađena drvena oznaka za vrata u obliku oblaka, rad Magde i Darka iz Hrvatske. Natpis „Shhh… baby sleeping – please knock softly” na vratima dječje sobe čuva dragocjeno vrijeme spavanja. Ukrasni predmet, nije igračka; objesite ga izvan dohvata djeteta.$$,
 $$A handmade wooden door sign in the shape of a cloud, made in Croatia by Magda i Darko. It reads "Shhh… baby sleeping – please knock softly" and hangs on the nursery door to protect precious nap time. A decorative item, not a toy: hang it out of the child's reach.$$,
 NULL, 'Magda i Darko', NULL,
 100, 125, 500, 15, NULL, NULL,
 'Drvo', 'Wood', NULL, NULL, NULL, NULL,
 '{}', now(), now()),
('42', 8, 'Tetra pelena – limuni', 'Muslin Cloth – Lemons',
 $$Velika tetra pelena nizozemske marke Rammelaartje, dimenzija 130 x 110 cm, bež boje s uzorkom limuna. Izrađena je od 100 % pamuka i može se koristiti za povijanje bebe, brisanje nakon kupanja ili kao lagani pokrivač u krevetiću ili kolicima.$$,
 $$An extra-large muslin cloth from the Dutch brand Rammelaartje, 130 x 110 cm, in beige with a lemon print. It is made of 100 % cotton and can be used to swaddle your baby, to dry off after a bath, or as a light blanket in the cot or pram.$$,
 'Rammelaartje', 'Rammelaartje', 'https://www.faire.com/product/p_6jcr99jssb',
 1147, 1434, 2295, 15, '/images/products/muslin-cloth-lemons.jpg', '130 × 110 cm',
 '100 % pamuk', '100% cotton', 'Od rođenja', 'From birth', NULL, NULL,
 '{}', now(), now()),
('37', 9, 'Wi-Fi baby monitor Ethan', 'Wi-Fi Baby Monitor Ethan',
 $$KikkaBoo Ethan je Wi-Fi kamera za bebe koja putem aplikacije CloudEdge prenosi 2K video na vaš mobitel. Ima noćni vid do 10 m, detekciju pokreta s obavijestima, dvosmjernu komunikaciju i snimanje na microSD karticu do 128 GB. Spaja se isključivo na Wi-Fi mrežu od 2,4 GHz, a pristup može dijeliti do 5 korisnika.$$,
 $$The KikkaBoo Ethan is a Wi-Fi baby camera that streams 2K video to your phone through the CloudEdge app. It has night vision up to 10 m, motion detection with push alerts, two-way talk, and recording to a microSD card of up to 128 GB. It connects to 2.4 GHz Wi-Fi only, and up to 5 users can share access.$$,
 'KikkaBoo', 'Kikkaboo', 'https://www.faire.com/product/p_2x6wd7swxq',
 3218, 4023, 6436, 5, '/images/products/baby-monitor.jpg', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL,
 '{}', now(), now()),
-- Bath
('7', 10, 'Ručnik s kapuljačom – medo', 'Hooded Towel – Bear',
 $$Bijeli ručnik s kapuljačom za bebe, 80 x 80 cm, s motivom medvjedića na kapuljači. Kapuljača grije glavicu nakon kupanja, a velike dimenzije omogućuju da se dijete u njega zamota i kad naraste.$$,
 $$A white 80 x 80 cm hooded baby towel with a bear motif on the hood. The hood keeps your baby's head warm after the bath, and the generous size wraps around a growing child.$$,
 'We celebrate emotions', 'Countdown-Kalender – We celebrate emotions', 'https://www.faire.com/product/p_4pgawpwza7',
 690, 863, 1587, 15, '/images/products/hooded-towel.jpg', '80 × 80 cm',
 '80 % poliester, 20 % poliamid', '80% polyester, 20% polyamide (nylon)', NULL, NULL,
 'Pranje na 40 °C, bez omekšivača; sušenje u sušilici na niskoj temperaturi. Oprati prije prve uporabe.', 'Wash at 40 °C without fabric softener; tumble dry low. Wash before first use.',
 '{}', now(), now()),
('12', 11, 'Set za njegu bebe, 8 dijelova', 'Baby Grooming Set, 8 Pieces',
 $$Set za njegu bebe KikkaBoo od 8 dijelova u boji mente, spremljen u torbicu s patentnim zatvaračem. Sadrži digitalni toplomjer, aspirator za nos, češalj, četku za kosu, masažer za desni, grickalicu za nokte, škarice i turpije za nokte. Prikladan od rođenja. Držite set izvan dohvata djece: sadrži sitne dijelove, oštar pribor i gumbastu bateriju.$$,
 $$An 8-piece baby-care set from KikkaBoo in mint, packed in a zip case for home or travel. It contains a digital thermometer, a nasal aspirator, comb, hair brush, finger gum massager, nail clipper, scissors and nail files. Suitable from birth. Keep the set away from children: it contains small parts, sharp tools and a button battery.$$,
 'KikkaBoo', 'Kikkaboo', 'https://www.faire.com/product/p_83hcagk8yg',
 1454, 1818, 2908, 15, '/images/products/grooming-set-mint.jpg', '17,5 × 14 × 5,5 cm',
 NULL, NULL, 'Od rođenja', 'From birth', NULL, NULL,
 '{}', now(), now()),
('8', 12, 'Termometar za kupanje – slonić', 'Bath Thermometer – Elephant',
 $$Termometar za kupanje u obliku slonića, u boji mente, marke KikkaBoo. Pokazuje temperaturu vode za kupanje i temperaturu prostorije. Temperaturu vode uvijek provjerite i rukom te nikada ne ostavljajte dijete samo u kadici.$$,
 $$A mint-green elephant bath thermometer from KikkaBoo that shows the temperature of the bath water and of the room. Always check the water by hand as well, and never leave a baby unattended in the bath.$$,
 'KikkaBoo', 'Kikkaboo', 'https://www.faire.com/product/p_cje4mpeq3t',
 300, 375, 600, 15, '/images/products/elephant-bath-thermometer.jpg', '8,5 × 4 × 11 cm',
 NULL, NULL, NULL, NULL, NULL, NULL,
 '{}', now(), now()),
('26', 13, 'Patkica „I Love Mama”', 'Rubber Duck "I Love Mama"',
 $$Klasična patkica od 8 cm s porukom „I Love Mama”, iz kolekcije Dutch Ducky. Slatka uspomena za novu mamu, u paru s patkicom „I Love Papa”.$$,
 $$A classic 8 cm rubber duck with an "I Love Mama" message, from the Dutch Ducky collection. A sweet keepsake for a new mum, paired with the "I Love Papa" duck.$$,
 'Dutch Ducky', 'TRAAGOODS.COM', 'https://www.faire.com/product/p_aqg57acj2f',
 300, 375, 850, 20, '/images/products/rubber-duck-mama.jpg', '8 cm',
 NULL, NULL, NULL, NULL, NULL, NULL,
 '{}', now(), now()),
('27', 14, 'Patkica „I Love Papa”', 'Rubber Duck "I Love Papa"',
 $$Klasična patkica od 8 cm s porukom „I Love Papa”, iz kolekcije Dutch Ducky. Slatka uspomena za novog tatu, u paru s patkicom „I Love Mama”.$$,
 $$A classic 8 cm rubber duck with an "I Love Papa" message, from the Dutch Ducky collection. A sweet keepsake for a new dad, paired with the "I Love Mama" duck.$$,
 'Dutch Ducky', 'TRAAGOODS.COM', 'https://www.faire.com/product/p_d8udz35dw5',
 272, 340, 850, 20, '/images/products/rubber-duck-papa.jpg', '8 cm',
 NULL, NULL, NULL, NULL, NULL, NULL,
 '{}', now(), now());

-- Box contents, matching the box photos.
INSERT INTO bundle_items (bundle_id, product_id, quantity, position, created_at, updated_at)
SELECT b.id, p.id, x.qty, x.pos, now(), now()
FROM (VALUES
  ('first-bites',        '21', 1, 0), ('first-bites',        '24', 1, 1), ('first-bites',        '25', 1, 2),
  ('first-bites-plus',   '21', 1, 0), ('first-bites-plus',   '24', 1, 1), ('first-bites-plus',   '25', 1, 2),
  ('first-bites-plus',   '23', 1, 3), ('first-bites-plus',   '41', 1, 4),
  ('sweet-dreams',       '40', 1, 0), ('sweet-dreams',       '34', 1, 1), ('sweet-dreams',       '3',  1, 2),
  ('sweet-dreams-plus',  '40', 1, 0), ('sweet-dreams-plus',  '34', 1, 1), ('sweet-dreams-plus',  '3',  1, 2),
  ('sweet-dreams-plus',  '42', 1, 3), ('sweet-dreams-plus',  '37', 1, 4),
  ('bubbles-and-cuddles','7',  1, 0), ('bubbles-and-cuddles','12', 1, 1), ('bubbles-and-cuddles','8',  1, 2),
  ('bubbles-and-cuddles','26', 1, 3), ('bubbles-and-cuddles','27', 1, 4)
) AS x(slug, sku, qty, pos)
JOIN bundles b ON b.slug = x.slug
JOIN products p ON p.sku = x.sku;

-- 3. Box texts that named items no longer in the boxes ---------------------------------
UPDATE bundles SET updated_at = now(),
  short_description_hr = 'Kompletan set za hranjenje, uz grijač za bočice',
  short_description_en = 'The complete feeding set, with a bottle warmer',
  description_hr = 'Sve iz paketa Prvi zalogaji, uz prijenosni grijač za bočice i dozator za mlijeko u prahu s tri odjeljka. Silikonska zdjelica s vakuumskim dnom, žličica i vilica, silikonski podbradnik, grijač i dozator – kompletan set za hranjenje, kod kuće i u pokretu.',
  description_en = 'Everything in First Bites, plus a portable bottle warmer and a three-compartment formula dispenser. A silicone suction bowl, spoon and fork, silicone bib, warmer and dispenser – the complete feeding set, at home and on the go.'
WHERE slug = 'first-bites-plus';

UPDATE bundles SET updated_at = now(),
  description_hr = 'Sve iz paketa Slatki snovi, uz veliku tetra pelenu od pamuka i Wi-Fi baby monitor. Tješilica, noćno svjetlo, znak za vrata, pelena za povijanje i kamera – sve što vam treba za mirne noći i bezbrižne roditelje.',
  description_en = 'Everything in Sweet Dreams, plus a large cotton muslin cloth and a Wi-Fi baby monitor. A comforter, night light, door sign, swaddle cloth and camera – everything you need for peaceful nights and relaxed parents.'
WHERE slug = 'sweet-dreams-plus';

UPDATE bundles SET updated_at = now(),
  description_hr = 'Pretvorite kupanje u ugodno i sigurno iskustvo za vašu bebu. Uključuje ručnik s kapuljačom, set za njegu od 8 dijelova, termometar za vodu u obliku slonića i dvije patkice – „I Love Mama” i „I Love Papa”.',
  description_en = 'Turn bath time into a safe, cosy ritual for your baby. Includes a hooded towel, an 8-piece grooming set, an elephant water thermometer and two rubber ducks – "I Love Mama" and "I Love Papa".'
WHERE slug = 'bubbles-and-cuddles';

-- 4. Voucher codes ---------------------------------------------------------------
-- The codes are not committed; pass the generated file with -v voucher_file=/path/vouchers.sql
\if :{?voucher_file}
\i :voucher_file
\else
\echo 'voucher_file not set: aborting'
ROLLBACK;
\quit
\endif

-- Checks -------------------------------------------------------------------------
SELECT b.slug, string_agg(p.name_en || ' x' || bi.quantity, ', ' ORDER BY bi.position) AS contents,
       min(p.stock_quantity / bi.quantity) AS boxes_possible
FROM bundles b JOIN bundle_items bi ON bi.bundle_id = b.id JOIN products p ON p.id = bi.product_id
GROUP BY b.slug, b.position ORDER BY b.position;
SELECT (SELECT count(*) FROM orders) AS orders, (SELECT count(*) FROM products) AS products,
       (SELECT count(*) FROM bundle_items) AS bundle_items,
       (SELECT count(*) FROM promo_codes WHERE label_en = 'Box voucher (10%)') AS box_vouchers,
       (SELECT count(*) FROM promo_codes WHERE active) AS active_codes;

COMMIT;
