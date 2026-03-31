# Idempotent seed file — safe to run multiple times
# All monetary values are in cents (e.g. 8990 = €89.90)

require "open-uri"
require "nokogiri"
require "fileutils"

FRONTEND_PUBLIC = File.expand_path("../../public/images/products", __dir__)
FileUtils.mkdir_p(FRONTEND_PUBLIC)

# Helper: download product image from faire.com product page
def download_product_image(supplier_url, slug)
  return nil if supplier_url.blank? || !supplier_url.include?("faire.com")

  image_filename = "#{slug}.jpg"
  image_disk_path = File.join(FRONTEND_PUBLIC, image_filename)

  # Skip if already downloaded
  if File.exist?(image_disk_path)
    puts "  Image already exists: #{image_filename}"
    return "/images/products/#{image_filename}"
  end

  puts "  Downloading image for #{slug}..."
  html = URI.parse(supplier_url).open(
    "User-Agent" => "Mozilla/5.0",
    read_timeout: 15,
    open_timeout: 10
  ).read

  doc = Nokogiri::HTML(html)
  og_image = doc.at('meta[property="og:image"]')&.[]("content")

  if og_image.present?
    image_data = URI.parse(og_image).open("User-Agent" => "Mozilla/5.0", read_timeout: 15).read
    File.binwrite(image_disk_path, image_data)
    puts "  Downloaded: #{image_filename} (#{image_data.bytesize} bytes)"
    "/images/products/#{image_filename}"
  else
    puts "  No og:image found for #{slug}"
    nil
  end
rescue StandardError => e
  puts "  Failed to download image for #{slug}: #{e.message}"
  nil
end

puts "Seeding admin user..."
admin = User.find_or_create_by!(email: ENV.fetch("ADMIN_EMAIL", "admin@lunababy.eu")) do |u|
  u.name = "LunaBaby Admin"
  u.role = :admin
  u.language = :hr
  u.password = ENV.fetch("ADMIN_PASSWORD", "admin123!")
end
if admin.password_digest.blank?
  admin.update!(password: ENV.fetch("ADMIN_PASSWORD", "admin123!"))
end

puts "Seeding shipping methods..."
[
  {
    slug: "standard",
    name_hr: "Standardna dostava", name_en: "Standard Delivery",
    carrier: "Hrvatska Pošta",
    description_hr: "Dostava Hrvatskom Poštom na kućnu adresu u roku od 3-5 radnih dana.",
    description_en: "Delivery by Hrvatska Pošta to your home address within 3-5 business days.",
    price: 350, estimated_days: "3-5", free_threshold: 5000, position: 0
  },
  {
    slug: "express",
    name_hr: "Ekspresna dostava", name_en: "Express Delivery",
    carrier: "GLS / DPD",
    description_hr: "Brza dostava kurirskom službom GLS ili DPD na kućnu adresu u roku od 1-2 radna dana.",
    description_en: "Fast delivery by GLS or DPD courier service to your home address within 1-2 business days.",
    price: 599, estimated_days: "1-2", free_threshold: nil, position: 1
  },
  {
    slug: "pickup",
    name_hr: "Preuzimanje na paketomatu", name_en: "Parcel Locker Pickup",
    carrier: "BoxNow / GLS Parketomat",
    description_hr: "Preuzimanje paketa na najbližem BoxNow ili GLS paketomatu u roku od 1-2 radna dana.",
    description_en: "Pick up your package at the nearest BoxNow or GLS parcel locker within 1-2 business days.",
    price: 250, estimated_days: "1-2", free_threshold: 5000, position: 2
  }
].each do |attrs|
  sm = ShippingMethod.find_or_initialize_by(slug: attrs[:slug])
  sm.assign_attributes(attrs)
  sm.save!
end

puts "Seeding promo codes..."
[
  { code: "LUNA10", discount_type: :percentage, value: 10, label_hr: "10% popusta", label_en: "10% off" },
  { code: "BEBA20", discount_type: :fixed, value: 2000, min_order_amount: 5000, label_hr: "20€ popusta na narudžbe iznad 50€", label_en: "20€ off orders over 50€" },
  { code: "FREESHIP", discount_type: :free_shipping, value: 0, label_hr: "Besplatna dostava", label_en: "Free shipping" }
].each do |attrs|
  pc = PromoCode.find_or_initialize_by(code: attrs[:code].upcase)
  pc.assign_attributes(attrs)
  pc.save!
end

puts "Seeding products..."
products_data = [
  # === Feeding bundle products ===
  {
    sku: "11", slug: "silicone-bowl",
    name_hr: "Silikonska zdjelica s vakuumskim dnom", name_en: "Silicone Bowl with Suction Base",
    description_hr: "Silikonska zdjelica s vakuumskim dnom koja se čvrsto drži za stol, sprječava prolijevanje hrane.", description_en: "Silicone bowl with suction base that firmly attaches to the table, preventing food spills.",
    sex: :female, purchase_price: 750, purchase_price_with_vat: 938, msrp: 1500,
    supplier_url: "https://www.faire.com/product/p_h6kc2x3s4g",
    stock_quantity: 50, position: 0
  },
  {
    sku: "13", slug: "baby-bottle",
    name_hr: "Bočica", name_en: "Baby Bottle with Handles",
    description_hr: "Bočica za bebe s ergonomskim ručkama za lakše držanje.", description_en: "Baby bottle with ergonomic handles for easier grip.",
    sex: :unisex, purchase_price: 377, purchase_price_with_vat: 471, msrp: 620,
    supplier_url: "https://www.faire.com/product/p_bxz6vbvg7n",
    stock_quantity: 50, position: 1
  },
  {
    sku: "14", slug: "three-compartment-container",
    name_hr: "Trodjelna posuda za hranu", name_en: "Three-Compartment Food Container",
    description_hr: "Praktična trodjelna posuda za čuvanje i serviranje bebine hrane.", description_en: "Practical three-compartment container for storing and serving baby food.",
    sex: :unisex, purchase_price: 316, purchase_price_with_vat: 395, msrp: 490,
    supplier_url: "https://www.faire.com/product/p_k568dsa864",
    stock_quantity: 50, position: 2
  },
  {
    sku: "15", slug: "fork-and-spoon",
    name_hr: "Vilica i žlica", name_en: "Fork and Spoon Set",
    description_hr: "Set vilice i žlice za bebe, ergonomski oblikovane za male ručice.", description_en: "Baby fork and spoon set, ergonomically designed for little hands.",
    sex: :unisex, purchase_price: 597, purchase_price_with_vat: 746, msrp: 1195,
    supplier_url: "https://www.faire.com/product/p_p7qq4wu255",
    stock_quantity: 50, position: 3
  },
  {
    sku: "9", slug: "baby-girl-bib",
    name_hr: "Partiklica za curicu", name_en: "Baby Girl Bib",
    description_hr: "Slatka partiklica za curicu, mekana i upijajuća.", description_en: "Cute baby girl bib, soft and absorbent.",
    sex: :female, purchase_price: 368, purchase_price_with_vat: 460, msrp: 736,
    supplier_url: "https://www.faire.com/product/p_3npnnkhxq5",
    stock_quantity: 50, position: 4
  },
  # === Bath bundle products ===
  {
    sku: "10", slug: "rubber-duck",
    name_hr: "Patkica", name_en: "Rubber Duck",
    description_hr: "Klasična gumena patkica za kupanje, sigurna za bebe.", description_en: "Classic rubber duck for bath time, safe for babies.",
    sex: :unisex, purchase_price: 180, purchase_price_with_vat: 225, msrp: 495,
    supplier_url: "https://www.faire.com/product/p_vsmqpy93hd",
    stock_quantity: 50, position: 5
  },
  {
    sku: "12", slug: "bath-accessories-set",
    name_hr: "Set za kupanje", name_en: "Bath Accessories Set",
    description_hr: "Kompletni set pribora za kupanje bebe.", description_en: "Complete baby bath accessories set.",
    sex: :unisex, purchase_price: 1454, purchase_price_with_vat: 1818, msrp: 2290,
    supplier_url: "https://www.faire.com/product/p_ph9qf7tugr",
    stock_quantity: 50, position: 6
  },
  {
    sku: "6", slug: "baby-comb",
    name_hr: "Češalj", name_en: "Baby Comb",
    description_hr: "Nježni češalj za bebinu osjetljivu kosu i tjeme.", description_en: "Gentle comb for baby's sensitive hair and scalp.",
    sex: :unisex, purchase_price: 295, purchase_price_with_vat: 369, msrp: 695,
    supplier_url: "https://www.faire.com/product/p_hq7zajvksq",
    stock_quantity: 50, position: 7
  },
  {
    sku: "7", slug: "hooded-towel",
    name_hr: "Ručnik s kapuljačom", name_en: "Hooded Towel",
    description_hr: "Mekani ručnik s kapuljačom za ugrijavanje bebe nakon kupanja.", description_en: "Soft hooded towel for keeping baby warm after bath.",
    sex: :unisex, purchase_price: 690, purchase_price_with_vat: 863, msrp: 1587,
    supplier_url: "https://www.faire.com/product/p_4pgawpwza7",
    stock_quantity: 50, position: 8
  },
  {
    sku: "8", slug: "water-thermometer",
    name_hr: "Termometar", name_en: "Water Thermometer",
    description_hr: "Termometar za mjerenje temperature vode za kupanje bebe.", description_en: "Thermometer for measuring baby bath water temperature.",
    sex: :unisex, purchase_price: 238, purchase_price_with_vat: 298, msrp: 390,
    supplier_url: "https://www.faire.com/product/p_ewsgmnkwhv",
    stock_quantity: 50, position: 9
  },
  # === Sleep bundle products ===
  {
    sku: "1", slug: "baby-girl-comforter",
    name_hr: "Tješilica za curicu", name_en: "Baby Girl Comforter",
    description_hr: "Mekana tješilica za curicu koja pruža osjećaj sigurnosti.", description_en: "Soft comforter for baby girl that provides a sense of security.",
    sex: :female, purchase_price: 549, purchase_price_with_vat: 686, msrp: 549,
    supplier_url: "https://www.faire.com/product/p_47es6r9h9k",
    stock_quantity: 50, position: 10
  },
  {
    sku: "2", slug: "silicone-night-light",
    name_hr: "Silikonsko svjetlo", name_en: "Silicone Night Light",
    description_hr: "Mekano silikonsko noćno svjetlo s promjenjivim bojama.", description_en: "Soft silicone night light with color-changing modes.",
    sex: :unisex, purchase_price: 580, purchase_price_with_vat: 725, msrp: 1360,
    supplier_url: "https://www.faire.com/product/p_f5ksgnybhm",
    stock_quantity: 50, position: 11
  },
  {
    sku: "3", slug: "baby-sleeping-sign",
    name_hr: "Beba spava znak", name_en: "Baby Sleeping Sign",
    description_hr: "Dekorativni znak 'Beba spava' za vrata sobe.", description_en: "Decorative 'Baby Sleeping' door sign.",
    sex: :unisex, purchase_price: 100, purchase_price_with_vat: 125, msrp: 500,
    supplier_name: "Magda i Darko",
    stock_quantity: 50, position: 12
  },
  {
    sku: "4", slug: "white-noise-machine",
    name_hr: "Uređaj za bijeli zvuk + svjetlo", name_en: "White Noise Machine with Light",
    description_hr: "Uređaj za bijeli zvuk s integriranim noćnim svjetlom za umirujuće spavanje.", description_en: "White noise machine with integrated night light for soothing sleep.",
    sex: :unisex, purchase_price: 999, purchase_price_with_vat: 1249, msrp: 2499,
    supplier_url: "https://www.faire.com/product/p_23cgqmv665",
    stock_quantity: 50, position: 13
  },
  {
    sku: "5", slug: "baby-monitor",
    name_hr: "Baby monitor", name_en: "Baby Monitor",
    description_hr: "Baby monitor za sigurno praćenje bebe tijekom spavanja.", description_en: "Baby monitor for safe monitoring of your baby during sleep.",
    sex: :unisex, purchase_price: 3218, purchase_price_with_vat: 4023, msrp: 4990,
    supplier_url: "https://www.faire.com/product/p_2x6wd7swxq",
    stock_quantity: 50, position: 14
  },
  # === Shared product (Bath + Sleep) ===
  {
    sku: "16", slug: "pacifier-clip",
    name_hr: "Držač za dudu", name_en: "Pacifier Clip",
    description_hr: "Praktičan držač za dudu koji sprječava padanje na pod.", description_en: "Practical pacifier clip that prevents dropping on the floor.",
    sex: :unisex, purchase_price: 386, purchase_price_with_vat: 483, msrp: 690,
    stock_quantity: 50, position: 15
  }
]

# Clear old data and recreate
puts "Clearing old data..."
OrderStatusTransition.delete_all
Shipment.delete_all
OrderItem.delete_all
Order.delete_all
BundleItem.delete_all
Bundle.delete_all
Product.delete_all

product_records = {}
products_data.each do |data|
  slug = data.delete(:slug)
  supplier_url = data[:supplier_url]

  # Download image from supplier page
  image_path = download_product_image(supplier_url, slug)
  data[:image_path] = image_path

  product = Product.create!(data)
  product_records[slug] = product
  puts "  Created product: #{product.name_hr} (SKU: #{product.sku})"
end

puts "\nSeeding bundles..."
bundles_data = [
  {
    slug: "feeding-bundle", category: "feeding", emoji: "🍼",
    color_from: "gold-light", color_to: "blush-light",
    badge: :new, price: 4490, position: 0,
    image_path: "/images/bundles/feeding-bundle.jpg",
    name_hr: "Paket za hranjenje", name_en: "Feeding Bundle",
    short_description_hr: "Sve za bezbrino hranjenje bebe",
    short_description_en: "Everything for worry-free baby feeding",
    description_hr: "Kompletni set za hranjenje bebe koji uključuje silikonsku zdjelicu, bočicu, trodjelnu posudu za hranu, vilicu i žlicu te partiklicu. Sve što trebate za hranjenje vaše bebe na jednom mjestu.",
    description_en: "A complete baby feeding set including a silicone bowl, bottle, three-compartment food container, fork and spoon, and a bib. Everything you need for feeding your baby in one place.",
    items: [
      { product_slug: "silicone-bowl", quantity: 1 },
      { product_slug: "baby-bottle", quantity: 1 },
      { product_slug: "three-compartment-container", quantity: 1 },
      { product_slug: "fork-and-spoon", quantity: 1 },
      { product_slug: "baby-girl-bib", quantity: 1 }
    ]
  },
  {
    slug: "bath-time-bundle", category: "bath", emoji: "🛁",
    color_from: "teal-pale", color_to: "teal-light",
    badge: :popular, price: 5990, position: 1,
    image_path: "/images/bath-box.jpg",
    name_hr: "Paket za kupanje", name_en: "Bath Time Bundle",
    short_description_hr: "Sigurno i ugodno kupanje za bebe",
    short_description_en: "Safe and comfortable bath time for babies",
    description_hr: "Pretvorite kupanje u ugodno i sigurno iskustvo za vašu bebu. Uključuje patkicu, set za kupanje, češalj, ručnik s kapuljačom, termometar i držač za dudu.",
    description_en: "Turn bath time into a comfortable and safe experience for your baby. Includes a rubber duck, bath set, comb, hooded towel, thermometer, and pacifier clip.",
    items: [
      { product_slug: "rubber-duck", quantity: 1 },
      { product_slug: "bath-accessories-set", quantity: 1 },
      { product_slug: "baby-comb", quantity: 1 },
      { product_slug: "hooded-towel", quantity: 1 },
      { product_slug: "water-thermometer", quantity: 1 },
      { product_slug: "pacifier-clip", quantity: 1 }
    ]
  },
  {
    slug: "sleep-bundle", category: "sleep", emoji: "🌙",
    color_from: "teal-light", color_to: "lavender-light",
    badge: :sale, price: 8990, original_price: 10588, position: 2,
    image_path: "/images/sleeping-box.jpg",
    name_hr: "Paket za spavanje", name_en: "Sleep Bundle",
    short_description_hr: "Mirne noći za bebe i roditelje",
    short_description_en: "Peaceful nights for babies and parents",
    description_hr: "Sve što vaša beba treba za mirne noći i slatke snove. Ovaj paket uključuje tješilicu, silikonsko svjetlo, znak za vrata, uređaj za bijeli zvuk, baby monitor i držač za dudu.",
    description_en: "Everything your baby needs for peaceful nights and sweet dreams. This bundle includes a comforter, silicone night light, door sign, white noise machine, baby monitor, and pacifier clip.",
    items: [
      { product_slug: "baby-girl-comforter", quantity: 1 },
      { product_slug: "silicone-night-light", quantity: 1 },
      { product_slug: "baby-sleeping-sign", quantity: 1 },
      { product_slug: "white-noise-machine", quantity: 1 },
      { product_slug: "baby-monitor", quantity: 1 },
      { product_slug: "pacifier-clip", quantity: 1 }
    ]
  }
]

bundles_data.each do |data|
  items = data.delete(:items)
  bundle = Bundle.create!(data)

  items.each_with_index do |item_data, idx|
    product = product_records[item_data[:product_slug]]
    bundle.bundle_items.create!(
      product: product,
      quantity: item_data[:quantity],
      position: idx
    )
  end

  puts "  Created bundle: #{bundle.name_hr} (#{bundle.bundle_items.count} items, computed stock: #{bundle.computed_stock_quantity})"
end

puts "\nSeed complete!"
puts "  #{Product.count} products"
puts "  #{Bundle.count} bundles"
puts "  #{BundleItem.count} bundle-item associations"
puts "  #{ShippingMethod.count} shipping methods"
puts "  #{PromoCode.count} promo codes"
puts "  #{User.where(role: :admin).count} admin user(s)"
