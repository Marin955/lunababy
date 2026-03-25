# Idempotent seed file — safe to run multiple times
# All monetary values are in cents (e.g. 8990 = €89.90)

puts "Seeding admin user..."
admin = User.find_or_create_by!(email: ENV.fetch("ADMIN_EMAIL", "admin@lunababy.eu")) do |u|
  u.name = "LunaBaby Admin"
  u.role = :admin
  u.language = :hr
  u.password = ENV.fetch("ADMIN_PASSWORD", "admin123!")
end
# Update password if admin already exists but has no password
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

puts "Seeding bundles..."
bundles_data = [
  {
    slug: "sleep-bundle", category: "sleep", emoji: "🌙", color_from: "teal-light", color_to: "lavender-light",
    badge: :popular, price: 8990, stock_quantity: 50, position: 0,
    name_hr: "Paket za spavanje", name_en: "Sleep Bundle",
    short_description_hr: "Mirne noći za bebe i roditelje", short_description_en: "Peaceful nights for babies and parents",
    description_hr: "Sve što vaša beba treba za mirne noći i slatke snove. Ovaj pažljivo sastavljen paket uključuje baby monitor za potpuni mir roditelja, uređaj za bijeli šum koji pomaže bebi da zaspe, set duda za umirivanje i mekanu deku za ugodno spavanje.",
    description_en: "Everything your baby needs for peaceful nights and sweet dreams. This carefully curated bundle includes a baby monitor for complete parental peace of mind, a white noise machine to help your baby fall asleep, a soothing pacifier set, and a soft blanket for cozy sleeping.",
    items: [
      { name_hr: "Baby monitor", name_en: "Baby Monitor", description_hr: "Digitalni baby monitor s noćnim vidom i dvosmjernom komunikacijom za sigurno praćenje bebe tijekom spavanja.", description_en: "Digital baby monitor with night vision and two-way communication for safe monitoring of your baby during sleep.", quantity: 1 },
      { name_hr: "Uređaj za bijeli šum", name_en: "White Noise Machine", description_hr: "Kompaktni uređaj s 6 umirujućih zvukova prirode koji pomažu bebi da se smiri i zaspe brže.", description_en: "Compact device with 6 soothing nature sounds that help your baby calm down and fall asleep faster.", quantity: 1 },
      { name_hr: "Dude (set od 3)", name_en: "Pacifiers (Set of 3)", description_hr: "Ortodontske dude od medicinskog silikona u tri veličine, prilagodljive rastu bebe od 0 do 12 mjeseci.", description_en: "Orthodontic pacifiers made of medical-grade silicone in three sizes, adaptable to baby growth from 0 to 12 months.", quantity: 3 },
      { name_hr: "Deka za spavanje", name_en: "Sleeping Blanket", description_hr: "Ultra-mekana deka od organskog pamuka, savršena za umatanje bebe. Hipoalergena i prozračna za sigurno spavanje.", description_en: "Ultra-soft organic cotton blanket, perfect for swaddling your baby. Hypoallergenic and breathable for safe sleeping.", quantity: 1 }
    ]
  },
  {
    slug: "bath-time-bundle", category: "bath", emoji: "🛁", color_from: "teal-pale", color_to: "teal-light",
    badge: :new, price: 6490, stock_quantity: 50, position: 1,
    name_hr: "Paket za kupanje", name_en: "Bath Time Bundle",
    short_description_hr: "Sigurno i ugodno kupanje za bebe", short_description_en: "Safe and comfortable bath time for babies",
    description_hr: "Pretvorite kupanje u ugodno i sigurno iskustvo za vašu bebu. Uključuje ergonomsku kadicu, mekane ručnike s kapuljačom, nežni set za pranje i termometar za vodu kako bi kupanje bilo savršeno svaki put.",
    description_en: "Turn bath time into a comfortable and safe experience for your baby. Includes an ergonomic bathtub, soft hooded towels, a gentle wash set, and a water thermometer so every bath is just right.",
    items: [
      { name_hr: "Kadica za bebe", name_en: "Baby Bathtub", description_hr: "Ergonomski oblikovana kadica s protukliznom podlogom i ugrađenim držačem za sapun. Pogodna za bebe od rođenja do 12 mjeseci.", description_en: "Ergonomically designed bathtub with a non-slip base and built-in soap holder. Suitable for babies from birth to 12 months.", quantity: 1 },
      { name_hr: "Ručnici s kapuljačom (set od 2)", name_en: "Hooded Towels (Set of 2)", description_hr: "Veliki bambusovi ručnici s preslatkim kapuljačama u obliku životinja. Iznimno upijajući i nežni prema bebinoj koži.", description_en: "Large bamboo towels with adorable animal-shaped hoods. Exceptionally absorbent and gentle on baby skin.", quantity: 2 },
      { name_hr: "Set za nežno pranje", name_en: "Gentle Wash Set", description_hr: "Prirodni set za kupanje koji uključuje šampon, kupku i losion za tijelo. Bez parabena, sulfata i umjetnih mirisa.", description_en: "Natural bath set including shampoo, body wash, and body lotion. Free from parabens, sulfates, and artificial fragrances.", quantity: 1 },
      { name_hr: "Termometar za vodu", name_en: "Bath Thermometer", description_hr: "Digitalni termometar u obliku patkice koji precizno mjeri temperaturu vode i prikazuje je li sigurna za kupanje bebe.", description_en: "Digital duck-shaped thermometer that precisely measures water temperature and shows whether it is safe for baby bathing.", quantity: 1 }
    ]
  },
  {
    slug: "feeding-bundle", category: "feeding", emoji: "🍼", color_from: "gold-light", color_to: "blush-light",
    badge: :sale, price: 7490, original_price: 8990, stock_quantity: 50, position: 2,
    name_hr: "Paket za hranjenje", name_en: "Feeding Bundle",
    short_description_hr: "Sve za bezbrino hranjenje bebe", short_description_en: "Everything for worry-free baby feeding",
    description_hr: "Kompletni set za hranjenje bebe koji olakšava svaki obrok. Od bočica s anti-kolik sustavom do sterilizatora i grijača – sve što trebate za bezbrino hranjenje na jednom mjestu.",
    description_en: "A complete baby feeding set that makes every meal easier. From anti-colic bottles to a sterilizer and warmer – everything you need for worry-free feeding in one place.",
    items: [
      { name_hr: "Set bočica (3 bočice)", name_en: "Bottle Set (3 Bottles)", description_hr: "Tri bočice različitih veličina (150ml, 240ml, 330ml) s anti-kolik ventilom koji smanjuje gušenje zraka tijekom hranjenja.", description_en: "Three bottles of different sizes (150ml, 240ml, 330ml) with an anti-colic valve that reduces air swallowing during feeding.", quantity: 3 },
      { name_hr: "Sterilizator", name_en: "Sterilizer", description_hr: "Parni sterilizator koji uklanja 99.9% štetnih bakterija u samo 6 minuta. Prima do 6 bočica odjednom.", description_en: "Steam sterilizer that eliminates 99.9% of harmful bacteria in just 6 minutes. Holds up to 6 bottles at once.", quantity: 1 },
      { name_hr: "Podbradci (set od 5)", name_en: "Bibs (Set of 5)", description_hr: "Vodootporni podbradci od mekane tkanine s podesivom kopčom. Pet različitih boja i uzoraka za svakodnevnu upotrebu.", description_en: "Waterproof bibs made of soft fabric with an adjustable snap. Five different colors and patterns for everyday use.", quantity: 5 },
      { name_hr: "Grijač bočica", name_en: "Bottle Warmer", description_hr: "Brzi grijač koji ravnomjerno zagrijava mlijeko do savršene temperature u manje od 3 minute. Kompatibilan sa svim standardnim bočicama.", description_en: "Fast warmer that evenly heats milk to the perfect temperature in under 3 minutes. Compatible with all standard bottles.", quantity: 1 }
    ]
  },
  {
    slug: "on-the-go-bundle", category: "travel", emoji: "🚼", color_from: "sage-light", color_to: "teal-pale",
    badge: nil, price: 7990, stock_quantity: 50, position: 3,
    name_hr: "Paket za put", name_en: "On the Go Bundle",
    short_description_hr: "Praktičan set za izlaske s bebom", short_description_en: "Practical set for outings with baby",
    description_hr: "Spremni za avanturu s bebom! Ovaj praktični paket za izlaske sadrži sve što trebate za ugodne šetnje i putovanja – od prostrane torbe za pelene do organizera za kolica.",
    description_en: "Ready for adventure with baby! This practical outing bundle contains everything you need for comfortable walks and travels – from a spacious diaper bag to a stroller organizer.",
    items: [
      { name_hr: "Torba za pelene", name_en: "Diaper Bag", description_hr: "Prostrana torba s više pregrada za organizaciju pelena, vlažnih maramica, odjeće i ostalih bebinih potrepština. Vodootporan materijal.", description_en: "Spacious bag with multiple compartments for organizing diapers, wet wipes, clothes, and other baby essentials. Waterproof material.", quantity: 1 },
      { name_hr: "Prijenosna podloga za previjanje", name_en: "Portable Changing Mat", description_hr: "Sklopiva podloga za previjanje s integriranim džepovima za pelene i maramice. Lako se čisti i stane u bilo koju torbu.", description_en: "Foldable changing mat with integrated pockets for diapers and wipes. Easy to clean and fits in any bag.", quantity: 1 },
      { name_hr: "Organizer za kolica", name_en: "Stroller Organizer", description_hr: "Univerzalni organizer koji se pričvršćuje na ručku kolica. Sadrži držač za piće, džep za mobitel i prostor za ključeve.", description_en: "Universal organizer that attaches to the stroller handlebar. Features a drink holder, phone pocket, and space for keys.", quantity: 1 },
      { name_hr: "Putni držač bočica", name_en: "Travel Bottle Holder", description_hr: "Termoizolirani držač koji održava mlijeko na željenoj temperaturi do 4 sata. Pogodan za bočice svih standardnih veličina.", description_en: "Thermo-insulated holder that keeps milk at the desired temperature for up to 4 hours. Fits all standard-sized bottles.", quantity: 1 }
    ]
  },
  {
    slug: "first-toys-bundle", category: "toys", emoji: "🧸", color_from: "lavender-pale", color_to: "blush-light",
    badge: :new, price: 5990, stock_quantity: 50, position: 4,
    name_hr: "Paket prvih igračaka", name_en: "First Toys Bundle",
    short_description_hr: "Igračke za razvoj i zabavu beba", short_description_en: "Toys for baby development and fun",
    description_hr: "Potaknite razvoj vaše bebe kroz igru! Ovaj set uključuje pažljivo odabrane igračke koje stimuliraju osjetila, potiču motoriku i pružaju sate zabave – od mekanih zvečki do senzorne knjige.",
    description_en: "Encourage your baby's development through play! This set includes carefully selected toys that stimulate the senses, encourage motor skills, and provide hours of fun – from soft rattles to a sensory book.",
    items: [
      { name_hr: "Mekane zvečke (set od 3)", name_en: "Soft Rattles (Set of 3)", description_hr: "Tri šarene zvečke od pliša u obliku životinja s nežnim zvukom. Lako ih mali prstići mogu držati i tresti.", description_en: "Three colorful plush animal-shaped rattles with a gentle sound. Easy for tiny fingers to hold and shake.", quantity: 3 },
      { name_hr: "Igračke za zubiće (set od 2)", name_en: "Teething Toys (Set of 2)", description_hr: "Sigurne grizalice od medicinskog silikona s različitim teksturama koje ublažavaju nelagodu pri nicanju zubića.", description_en: "Safe medical-grade silicone teethers with different textures that relieve discomfort during teething.", quantity: 2 },
      { name_hr: "Podloga za igru", name_en: "Play Gym Mat", description_hr: "Mekana podloga za igru s lukom i visilicama koje stimuliraju bebin vid i koordinaciju. Sklopiva za lako spremanje.", description_en: "Soft play mat with an arch and hanging toys that stimulate baby's vision and coordination. Foldable for easy storage.", quantity: 1 },
      { name_hr: "Senzorna knjiga", name_en: "Sensory Book", description_hr: "Mekana knjiga s različitim teksturama, šuškavih stranicama i jarkim bojama koja potiče bebin taktilni i vizualni razvoj.", description_en: "Soft book with different textures, crinkly pages, and bright colors that encourage baby's tactile and visual development.", quantity: 1 }
    ]
  },
  {
    slug: "newborn-essentials-bundle", category: "essentials", emoji: "👶", color_from: "blush-light", color_to: "gold-light",
    badge: :popular, price: 5490, stock_quantity: 50, position: 5,
    name_hr: "Paket za novorođenče", name_en: "Newborn Essentials Bundle",
    short_description_hr: "Osnovne potrepštine za novorođenče", short_description_en: "Essential items for newborns",
    description_hr: "Idealan početni set za svakog novorođenčeta. Sadrži sve bitne predmete koje ćete trebati u prvim tjednima – od udobnih bodića i peleničia za zamatanje do seta za njegu noktića i termometra.",
    description_en: "The ideal starter set for every newborn. Contains all the essential items you will need in the first weeks – from comfortable onesies and swaddle wraps to a nail care kit and thermometer.",
    items: [
      { name_hr: "Set bodića (5 komada)", name_en: "Onesies Set (5 pcs)", description_hr: "Pet bodića od 100% organskog pamuka u nježnim bojama. Patentići za lako presvlačenje, pogodni za veličine 56-68.", description_en: "Five onesies made of 100% organic cotton in gentle colors. Snap buttons for easy dressing, suitable for sizes 56-68.", quantity: 5 },
      { name_hr: "Peleničie za zamatanje (set od 2)", name_en: "Swaddle Wraps (Set of 2)", description_hr: "Mekane muslin peleničie za sigurno zamatanje bebe. Prozračan materijal sprječava pregrijavanje i pruža osjećaj sigurnosti.", description_en: "Soft muslin swaddle wraps for securely wrapping your baby. Breathable material prevents overheating and provides a sense of security.", quantity: 2 },
      { name_hr: "Set za njegu noktića", name_en: "Nail Care Kit", description_hr: "Kompletni set za sigurno podrezivanje bebinih noktića s zaobljenim škaricama, turpijom i pincetom u praktičnoj torbici.", description_en: "Complete set for safely trimming baby nails with rounded scissors, a file, and tweezers in a practical carrying case.", quantity: 1 },
      { name_hr: "Termometar za bebe", name_en: "Baby Thermometer", description_hr: "Beskontaktni infracrveni termometar za brzo i precizno mjerenje tjelesne temperature bebe bez uznemiravanja.", description_en: "Non-contact infrared thermometer for quick and precise measurement of baby's body temperature without disturbance.", quantity: 1 }
    ]
  },
  {
    slug: "gift-deluxe-bundle", category: "gift", emoji: "🎁", color_from: "gold-light", color_to: "lavender-light",
    badge: :sale, price: 13990, original_price: 15990, stock_quantity: 50, position: 6,
    name_hr: "Deluxe poklon paket", name_en: "Gift Deluxe Bundle",
    short_description_hr: "Savršen poklon za nove roditelje", short_description_en: "The perfect gift for new parents",
    description_hr: "Luksuzni poklon paket koji će oduševiti svakog novog roditelja. Sadrži pažljivo odabrane premium proizvode – od organskog pamučnog pidžamice do bambusovih bočica i elegantne kutije za uspomene.",
    description_en: "A luxurious gift bundle that will delight every new parent. Contains carefully selected premium products – from an organic cotton sleepsuit to bamboo bottles and an elegant keepsake box.",
    items: [
      { name_hr: "Pidžamica od organskog pamuka", name_en: "Organic Cotton Sleepsuit", description_hr: "Premium pidžamica od certificiranog organskog pamuka s dvostraničnim patentom za lako presvlačenje. Iznimno mekana i nježna za bebinu kožu.", description_en: "Premium sleepsuit made of certified organic cotton with a two-way zipper for easy dressing. Exceptionally soft and gentle on baby skin.", quantity: 1 },
      { name_hr: "Mekana deka za snove", name_en: "Dreamy Soft Blanket", description_hr: "Luksuzan pleteni pokrivač od mješavine kašmira i pamuka. Savršeno mekan i topao za udobno spavanje i mazenje.", description_en: "Luxurious knitted blanket made of a cashmere and cotton blend. Perfectly soft and warm for cozy sleeping and cuddling.", quantity: 1 },
      { name_hr: "Bambusov set bočica", name_en: "Bamboo Bottle Set", description_hr: "Ekološki set od dvije bočice s bambusovim detaljima i anti-kolik sustavom. Prirodna alternativa za svjesne roditelje.", description_en: "Eco-friendly set of two bottles with bamboo accents and an anti-colic system. A natural alternative for conscious parents.", quantity: 1 },
      { name_hr: "Nežni set za kupanje", name_en: "Gentle Bath Set", description_hr: "Organski set za kupanje s šamponom, kupkom i uljem za masažu. Blagih mirisa lavande koji umiruju bebu prije spavanja.", description_en: "Organic bath set with shampoo, body wash, and massage oil. Gentle lavender scent that soothes baby before sleep.", quantity: 1 },
      { name_hr: "Mekana zvečka", name_en: "Soft Rattle", description_hr: "Ručno rađena pletena zvečka u obliku zeca od 100% organskog pamuka. Siguran i lijep prvi prijatelj za bebu.", description_en: "Handmade knitted bunny-shaped rattle made of 100% organic cotton. A safe and beautiful first friend for baby.", quantity: 1 },
      { name_hr: "Kutija za uspomene", name_en: "Keepsake Box", description_hr: "Elegantna drvena kutija s pregradama za čuvanje posebnih uspomena – prve čarapice, narukvice iz rodilišta, pramenka kose i drugih dragocjenosti.", description_en: "Elegant wooden box with compartments for preserving special memories – first socks, hospital bracelet, lock of hair, and other treasures.", quantity: 1 }
    ]
  }
]

bundles_data.each do |data|
  items = data.delete(:items)
  bundle = Bundle.find_or_initialize_by(slug: data[:slug])
  bundle.assign_attributes(data)
  bundle.save!

  items.each_with_index do |item_data, idx|
    bi = bundle.bundle_items.find_or_initialize_by(name_en: item_data[:name_en])
    bi.assign_attributes(item_data.merge(position: idx))
    bi.save!
  end
end

puts "Seed complete! #{Bundle.count} bundles, #{BundleItem.count} items, #{ShippingMethod.count} shipping methods, #{PromoCode.count} promo codes, #{User.where(role: :admin).count} admin user(s)"
