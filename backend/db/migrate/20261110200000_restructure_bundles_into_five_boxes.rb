class RestructureBundlesIntoFiveBoxes < ActiveRecord::Migration[8.1]
  # The shop moves from 3 bundles to 5 boxes, each with its own box photo:
  #   feeding-bundle   -> first-bites-plus     (same 5 items)
  #   sleep-bundle     -> sweet-dreams-plus    (same 6 items)
  #   bath-time-bundle -> bubbles-and-cuddles  (now 2 rubber ducks, as in the photo)
  #   new: first-bites  (bowl, fork & spoon, bib)
  #   new: sweet-dreams (comforter, night light, door sign)
  # Existing bundles are renamed in place so orders, reviews and price history stay attached.
  # Old URLs are redirected in next.config.ts. Products are matched by SKU; anything missing is skipped.

  class MBundle < ActiveRecord::Base
    self.table_name = "bundles"
  end

  class MBundleItem < ActiveRecord::Base
    self.table_name = "bundle_items"
  end

  class MProduct < ActiveRecord::Base
    self.table_name = "products"
  end

  class MPriceChange < ActiveRecord::Base
    self.table_name = "bundle_price_changes"
    self.record_timestamps = false
  end

  RENAMES = {
    "feeding-bundle" => {
      slug: "first-bites-plus", position: 1, image_path: "/images/bundles/feeding-box-large.jpg",
      name_hr: "Prvi zalogaji Plus", name_en: "First Bites Plus",
      short_description_hr: "Kompletan set za hranjenje, od bočice do zdjelice",
      short_description_en: "The complete feeding set, from bottle to bowl",
      description_hr: "Sve iz paketa Prvi zalogaji, uz bočicu s ručkama i trodjelnu posudu za hranu. Silikonska zdjelica s vakuumskim dnom, vilica i žlica, portiklica, bočica i posuda – kompletan set za hranjenje na jednom mjestu.",
      description_en: "Everything in First Bites, plus a baby bottle with handles and a three-compartment food container. A silicone suction bowl, fork and spoon, bib, bottle and container – the complete feeding set in one box."
    },
    "sleep-bundle" => {
      slug: "sweet-dreams-plus", position: 4, image_path: "/images/bundles/sleep-box-large.jpg",
      name_hr: "Slatki snovi Plus", name_en: "Sweet Dreams Plus",
      short_description_hr: "Mirne noći za bebe i roditelje",
      short_description_en: "Peaceful nights for babies and parents",
      description_hr: "Sve iz paketa Slatki snovi, uz uređaj za bijeli zvuk sa svjetlom, baby monitor i držač za dudu. Tješilica, noćno svjetlo, znak za vrata i sve što vam treba za mirne noći i bezbrižne roditelje.",
      description_en: "Everything in Sweet Dreams, plus a white noise machine with light, a baby monitor and a pacifier clip. A comforter, night light, door sign and everything you need for peaceful nights and relaxed parents."
    },
    "bath-time-bundle" => {
      slug: "bubbles-and-cuddles", position: 2, image_path: "/images/bundles/bath-box.jpg",
      name_hr: "Mjehurići i maženje", name_en: "Bubbles & Cuddles",
      short_description_hr: "Sve za sigurno i ugodno kupanje",
      short_description_en: "Everything for safe, cosy bath time",
      description_hr: "Pretvorite kupanje u ugodno i sigurno iskustvo za vašu bebu. Uključuje dvije patkice, set za njegu, češalj, ručnik s kapuljačom, termometar za vodu i držač za dudu.",
      description_en: "Turn bath time into a safe, cosy ritual for your baby. Includes two rubber ducks, a grooming set, a comb, a hooded towel, a water thermometer and a pacifier clip."
    }
  }.freeze

  NEW_BUNDLES = [
    {
      slug: "first-bites", category: "feeding", emoji: "🥣", color_from: "gold-light", color_to: "blush-light",
      price: 2990, position: 0, image_path: "/images/bundles/feeding-box.jpg",
      name_hr: "Prvi zalogaji", name_en: "First Bites",
      short_description_hr: "Osnove za prve obroke na žličicu",
      short_description_en: "The essentials for first spoon-fed meals",
      description_hr: "Mali set za početak dohrane: silikonska zdjelica s vakuumskim dnom koja ostaje na stolu, vilica i žlica za male ruke te portiklica. Sve što trebate za prve zalogaje, složeno u jednu kutiju.",
      description_en: "A small set for starting solids: a silicone bowl with a suction base that stays put on the table, a fork and spoon for little hands, and a bib. Everything you need for the first bites, packed in one box.",
      items: [ [ "11", 1 ], [ "15", 1 ], [ "9", 1 ] ] # bowl, fork & spoon, bib
    },
    {
      slug: "sweet-dreams", category: "sleep", emoji: "🌙", color_from: "teal-light", color_to: "lavender-light",
      price: 2490, position: 3, image_path: "/images/bundles/sleep-box.jpg",
      name_hr: "Slatki snovi", name_en: "Sweet Dreams",
      short_description_hr: "Mala rutina za laku noć",
      short_description_en: "A little bedtime routine",
      description_hr: "Sve za mirnu rutinu prije spavanja: mekana tješilica, silikonsko noćno svjetlo i znak „Beba spava” za vrata sobe.",
      description_en: "Everything for a calm bedtime routine: a soft comforter, a silicone night light and a “baby sleeping” sign for the nursery door.",
      items: [ [ "1", 1 ], [ "2", 1 ], [ "3", 1 ] ] # comforter, night light, door sign
    }
  ].freeze

  def up
    RENAMES.each do |old_slug, attrs|
      MBundle.where(slug: old_slug).update_all(attrs.merge(updated_at: Time.current))
    end

    bath = MBundle.find_by(slug: "bubbles-and-cuddles")
    duck = MProduct.find_by(sku: "10")
    MBundleItem.where(bundle_id: bath.id, product_id: duck.id).update_all(quantity: 2) if bath && duck

    # Only build the new boxes where the catalog exists (production, seeded dev DBs).
    return unless MBundle.exists?(slug: "first-bites-plus")

    NEW_BUNDLES.each do |data|
      next if MBundle.exists?(slug: data[:slug])

      products = data[:items].map { |sku, qty| [ MProduct.find_by(sku: sku), qty ] }
      next if products.any? { |product, _| product.nil? }

      bundle = MBundle.create!(data.except(:items).merge(active: true))
      products.each_with_index do |(product, qty), idx|
        MBundleItem.create!(bundle_id: bundle.id, product_id: product.id, quantity: qty, position: idx)
      end
      MPriceChange.create!(bundle_id: bundle.id, price: bundle.price, created_at: Time.current)
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
