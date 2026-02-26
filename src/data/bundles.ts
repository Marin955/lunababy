import type { Bundle } from '@/types';

export const bundles: Bundle[] = [
  {
    id: 'sleep-bundle',
    slug: 'sleep-bundle',
    name: {
      hr: 'Paket za spavanje',
      en: 'Sleep Bundle',
    },
    description: {
      hr: 'Sve \u0161to va\u0161a beba treba za mirne no\u0107i i slatke snove. Ovaj pa\u017Eljivo sastavljen paket uklju\u010Duje baby monitor za potpuni mir roditelja, ure\u0111aj za bijeli \u0161um koji poma\u017Ee bebi da zaspe, set du\u0111a za umirivanje i mekanu deku za ugodno spavanje.',
      en: 'Everything your baby needs for peaceful nights and sweet dreams. This carefully curated bundle includes a baby monitor for complete parental peace of mind, a white noise machine to help your baby fall asleep, a soothing pacifier set, and a soft blanket for cozy sleeping.',
    },
    shortDescription: {
      hr: 'Mirne no\u0107i za bebe i roditelje',
      en: 'Peaceful nights for babies and parents',
    },
    items: [
      {
        name: { hr: 'Baby monitor', en: 'Baby Monitor' },
        description: {
          hr: 'Digitalni baby monitor s no\u0107nim vidom i dvosmjernom komunikacijom za sigurno pra\u0107enje bebe tijekom spavanja.',
          en: 'Digital baby monitor with night vision and two-way communication for safe monitoring of your baby during sleep.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Ure\u0111aj za bijeli \u0161um', en: 'White Noise Machine' },
        description: {
          hr: 'Kompaktni ure\u0111aj s 6 umiruju\u0107ih zvukova prirode koji poma\u017Eu bebi da se smiri i zaspe br\u017Ee.',
          en: 'Compact device with 6 soothing nature sounds that help your baby calm down and fall asleep faster.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Du\u0111e (set od 3)', en: 'Pacifiers (Set of 3)' },
        description: {
          hr: 'Ortodontske du\u0111e od medicinskog silikona u tri veli\u010Dine, prilagodljive rastu bebe od 0 do 12 mjeseci.',
          en: 'Orthodontic pacifiers made of medical-grade silicone in three sizes, adaptable to baby growth from 0 to 12 months.',
        },
        quantity: 3,
      },
      {
        name: { hr: 'Deka za spavanje', en: 'Sleeping Blanket' },
        description: {
          hr: 'Ultra-mekana deka od organskog pamuka, savr\u0161ena za umatanje bebe. Hipoalergena i prozra\u010Dna za sigurno spavanje.',
          en: 'Ultra-soft organic cotton blanket, perfect for swaddling your baby. Hypoallergenic and breathable for safe sleeping.',
        },
        quantity: 1,
      },
    ],
    price: 89.9,
    badge: 'popular',
    category: 'sleep',
    emoji: '\uD83C\uDF19',
    colorFrom: 'teal-light',
    colorTo: 'lavender-light',
    inStock: true,
  },
  {
    id: 'bath-time-bundle',
    slug: 'bath-time-bundle',
    name: {
      hr: 'Paket za kupanje',
      en: 'Bath Time Bundle',
    },
    description: {
      hr: 'Pretvorite kupanje u ugodno i sigurno iskustvo za va\u0161u bebu. Uklju\u010Duje ergonomsku kadicu, mekane ru\u010Dnike s kapulja\u010Dom, ne\u017Eni set za pranje i termometar za vodu kako bi kupanje bilo savr\u0161eno svaki put.',
      en: 'Turn bath time into a comfortable and safe experience for your baby. Includes an ergonomic bathtub, soft hooded towels, a gentle wash set, and a water thermometer so every bath is just right.',
    },
    shortDescription: {
      hr: 'Sigurno i ugodno kupanje za bebe',
      en: 'Safe and comfortable bath time for babies',
    },
    items: [
      {
        name: { hr: 'Kadica za bebe', en: 'Baby Bathtub' },
        description: {
          hr: 'Ergonomski oblikovana kadica s protukliznom podlogom i ugra\u0111enim dr\u017Ea\u010Dem za sapun. Pogodna za bebe od ro\u0111enja do 12 mjeseci.',
          en: 'Ergonomically designed bathtub with a non-slip base and built-in soap holder. Suitable for babies from birth to 12 months.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Ru\u010Dnici s kapulja\u010Dom (set od 2)', en: 'Hooded Towels (Set of 2)' },
        description: {
          hr: 'Veliki bambusovi ru\u010Dnici s preslatkim kapulja\u010Dama u obliku \u017Eivotinja. Iznimno upijaju\u0107i i ne\u017Eni prema bebinoj ko\u017Ei.',
          en: 'Large bamboo towels with adorable animal-shaped hoods. Exceptionally absorbent and gentle on baby skin.',
        },
        quantity: 2,
      },
      {
        name: { hr: 'Set za ne\u017Eno pranje', en: 'Gentle Wash Set' },
        description: {
          hr: 'Prirodni set za kupanje koji uklju\u010Duje \u0161ampon, kupku i losion za tijelo. Bez parabena, sulfata i umjetnih mirisa.',
          en: 'Natural bath set including shampoo, body wash, and body lotion. Free from parabens, sulfates, and artificial fragrances.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Termometar za vodu', en: 'Bath Thermometer' },
        description: {
          hr: 'Digitalni termometar u obliku patkice koji precizno mjeri temperaturu vode i prikazuje je li sigurna za kupanje bebe.',
          en: 'Digital duck-shaped thermometer that precisely measures water temperature and shows whether it is safe for baby bathing.',
        },
        quantity: 1,
      },
    ],
    price: 64.9,
    badge: 'new',
    category: 'bath',
    emoji: '\uD83D\uDEC1',
    colorFrom: 'teal-pale',
    colorTo: 'teal-light',
    inStock: true,
  },
  {
    id: 'feeding-bundle',
    slug: 'feeding-bundle',
    name: {
      hr: 'Paket za hranjenje',
      en: 'Feeding Bundle',
    },
    description: {
      hr: 'Kompletni set za hranjenje bebe koji olak\u0161ava svaki obrok. Od bo\u010Dica s anti-kolik sustavom do sterilizatora i grija\u010Da \u2013 sve \u0161to trebate za bezbrino hranjenje na jednom mjestu.',
      en: 'A complete baby feeding set that makes every meal easier. From anti-colic bottles to a sterilizer and warmer \u2013 everything you need for worry-free feeding in one place.',
    },
    shortDescription: {
      hr: 'Sve za bezbrino hranjenje bebe',
      en: 'Everything for worry-free baby feeding',
    },
    items: [
      {
        name: { hr: 'Set bo\u010Dica (3 bo\u010Dice)', en: 'Bottle Set (3 Bottles)' },
        description: {
          hr: 'Tri bo\u010Dice razli\u010Ditih veli\u010Dina (150ml, 240ml, 330ml) s anti-kolik ventilom koji smanjuje gu\u0161enje zraka tijekom hranjenja.',
          en: 'Three bottles of different sizes (150ml, 240ml, 330ml) with an anti-colic valve that reduces air swallowing during feeding.',
        },
        quantity: 3,
      },
      {
        name: { hr: 'Sterilizator', en: 'Sterilizer' },
        description: {
          hr: 'Parni sterilizator koji uklanja 99.9% \u0161tetnih bakterija u samo 6 minuta. Prima do 6 bo\u010Dica odjednom.',
          en: 'Steam sterilizer that eliminates 99.9% of harmful bacteria in just 6 minutes. Holds up to 6 bottles at once.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Podbradci (set od 5)', en: 'Bibs (Set of 5)' },
        description: {
          hr: 'Vodootporni podbradci od mekane tkanine s podesivom kop\u010Dom. Pet razli\u010Ditih boja i uzoraka za svakodnevnu upotrebu.',
          en: 'Waterproof bibs made of soft fabric with an adjustable snap. Five different colors and patterns for everyday use.',
        },
        quantity: 5,
      },
      {
        name: { hr: 'Grija\u010D bo\u010Dica', en: 'Bottle Warmer' },
        description: {
          hr: 'Brzi grija\u010D koji ravnomjerno zagrijava mlijeko do savr\u0161ene temperature u manje od 3 minute. Kompatibilan sa svim standardnim bo\u010Dicama.',
          en: 'Fast warmer that evenly heats milk to the perfect temperature in under 3 minutes. Compatible with all standard bottles.',
        },
        quantity: 1,
      },
    ],
    price: 74.9,
    originalPrice: 89.9,
    badge: 'sale',
    category: 'feeding',
    emoji: '\uD83C\uDF7C',
    colorFrom: 'gold-light',
    colorTo: 'blush-light',
    inStock: true,
  },
  {
    id: 'on-the-go-bundle',
    slug: 'on-the-go-bundle',
    name: {
      hr: 'Paket za put',
      en: 'On the Go Bundle',
    },
    description: {
      hr: 'Spremni za avanturu s bebom! Ovaj prakti\u010Dni paket za izlaske sadr\u017Ei sve \u0161to trebate za ugodne \u0161etnje i putovanja \u2013 od prostrane torbe za pelene do organizera za kolica.',
      en: 'Ready for adventure with baby! This practical outing bundle contains everything you need for comfortable walks and travels \u2013 from a spacious diaper bag to a stroller organizer.',
    },
    shortDescription: {
      hr: 'Prakti\u010Dan set za izlaske s bebom',
      en: 'Practical set for outings with baby',
    },
    items: [
      {
        name: { hr: 'Torba za pelene', en: 'Diaper Bag' },
        description: {
          hr: 'Prostrana torba s vi\u0161e pregrada za organizaciju pelena, vlažnih maramica, odje\u0107e i ostalih bebinih potrep\u0161tina. Vodootporan materijal.',
          en: 'Spacious bag with multiple compartments for organizing diapers, wet wipes, clothes, and other baby essentials. Waterproof material.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Prijenosna podloga za previjanje', en: 'Portable Changing Mat' },
        description: {
          hr: 'Sklopiva podloga za previjanje s integriranim d\u017Eepovima za pelene i maramice. Lako se \u010Disti i stane u bilo koju torbu.',
          en: 'Foldable changing mat with integrated pockets for diapers and wipes. Easy to clean and fits in any bag.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Organizer za kolica', en: 'Stroller Organizer' },
        description: {
          hr: 'Univerzalni organizer koji se pri\u010Dvr\u0161\u0107uje na ru\u010Dku kolica. Sadr\u017Ei dr\u017Ea\u010D za pi\u0107e, d\u017Eep za mobitel i prostor za klju\u010Deve.',
          en: 'Universal organizer that attaches to the stroller handlebar. Features a drink holder, phone pocket, and space for keys.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Putni dr\u017Ea\u010D bo\u010Dica', en: 'Travel Bottle Holder' },
        description: {
          hr: 'Termoizolirani dr\u017Ea\u010D koji odr\u017Eava mlijeko na \u017Eeljenoj temperaturi do 4 sata. Pogodan za bo\u010Dice svih standardnih veli\u010Dina.',
          en: 'Thermo-insulated holder that keeps milk at the desired temperature for up to 4 hours. Fits all standard-sized bottles.',
        },
        quantity: 1,
      },
    ],
    price: 79.9,
    badge: null,
    category: 'travel',
    emoji: '\uD83D\uDEBC',
    colorFrom: 'sage-light',
    colorTo: 'teal-pale',
    inStock: true,
  },
  {
    id: 'first-toys-bundle',
    slug: 'first-toys-bundle',
    name: {
      hr: 'Paket prvih igra\u010Daka',
      en: 'First Toys Bundle',
    },
    description: {
      hr: 'Potaknite razvoj va\u0161e bebe kroz igru! Ovaj set uklju\u010Duje pa\u017Eljivo odabrane igra\u010Dke koje stimuliraju osjetila, poti\u010Du motoriku i pru\u017Eaju sate zabave \u2013 od mekanih zve\u010Dki do senzorne knjige.',
      en: 'Encourage your baby\'s development through play! This set includes carefully selected toys that stimulate the senses, encourage motor skills, and provide hours of fun \u2013 from soft rattles to a sensory book.',
    },
    shortDescription: {
      hr: 'Igra\u010Dke za razvoj i zabavu beba',
      en: 'Toys for baby development and fun',
    },
    items: [
      {
        name: { hr: 'Mekane zve\u010Dke (set od 3)', en: 'Soft Rattles (Set of 3)' },
        description: {
          hr: 'Tri \u0161arene zve\u010Dke od pli\u0161a u obliku \u017Eivotinja s ne\u017Enim zvukom. Lako ih mali prsti\u0107i mogu dr\u017Eati i tresti.',
          en: 'Three colorful plush animal-shaped rattles with a gentle sound. Easy for tiny fingers to hold and shake.',
        },
        quantity: 3,
      },
      {
        name: { hr: 'Igra\u010Dke za zubi\u0107e (set od 2)', en: 'Teething Toys (Set of 2)' },
        description: {
          hr: 'Sigurne grizalice od medicinskog silikona s razli\u010Ditim teksturama koje ubla\u017Eavaju nelagodu pri nicanju zubi\u0107a.',
          en: 'Safe medical-grade silicone teethers with different textures that relieve discomfort during teething.',
        },
        quantity: 2,
      },
      {
        name: { hr: 'Podloga za igru', en: 'Play Gym Mat' },
        description: {
          hr: 'Mekana podloga za igru s lukom i visilicama koje stimuliraju bebin vid i koordinaciju. Sklopiva za lako spremanje.',
          en: 'Soft play mat with an arch and hanging toys that stimulate baby\'s vision and coordination. Foldable for easy storage.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Senzorna knjiga', en: 'Sensory Book' },
        description: {
          hr: 'Mekana knjiga s razli\u010Ditim teksturama, \u0161u\u0161kavim stranicama i jarkim bojama koja poti\u010De bebin taktilni i vizualni razvoj.',
          en: 'Soft book with different textures, crinkly pages, and bright colors that encourage baby\'s tactile and visual development.',
        },
        quantity: 1,
      },
    ],
    price: 59.9,
    badge: 'new',
    category: 'toys',
    emoji: '\uD83E\uDDF8',
    colorFrom: 'lavender-pale',
    colorTo: 'blush-light',
    inStock: true,
  },
  {
    id: 'newborn-essentials-bundle',
    slug: 'newborn-essentials-bundle',
    name: {
      hr: 'Paket za novoro\u0111en\u010De',
      en: 'Newborn Essentials Bundle',
    },
    description: {
      hr: 'Idealan po\u010Detni set za svakog novoro\u0111en\u010Deta. Sadr\u017Ei sve bitne predmete koje \u0107ete trebati u prvim tjednima \u2013 od udobnih bodi\u0107a i peleni\u010Da za zamatanje do seta za njegu nokti\u0107a i termometra.',
      en: 'The ideal starter set for every newborn. Contains all the essential items you will need in the first weeks \u2013 from comfortable onesies and swaddle wraps to a nail care kit and thermometer.',
    },
    shortDescription: {
      hr: 'Osnovne potrep\u0161tine za novoro\u0111en\u010De',
      en: 'Essential items for newborns',
    },
    items: [
      {
        name: { hr: 'Set bodi\u0107a (5 komada)', en: 'Onesies Set (5 pcs)' },
        description: {
          hr: 'Pet bodi\u0107a od 100% organskog pamuka u nježnim bojama. Patenti\u0107i za lako presvla\u010Denje, pogodni za veli\u010Dine 56-68.',
          en: 'Five onesies made of 100% organic cotton in gentle colors. Snap buttons for easy dressing, suitable for sizes 56-68.',
        },
        quantity: 5,
      },
      {
        name: { hr: 'Peleni\u010De za zamatanje (set od 2)', en: 'Swaddle Wraps (Set of 2)' },
        description: {
          hr: 'Mekane muslin peleni\u010De za sigurno zamatanje bebe. Prozra\u010Dan materijal sprje\u010Dava pregrijavanje i pru\u017Ea osje\u0107aj sigurnosti.',
          en: 'Soft muslin swaddle wraps for securely wrapping your baby. Breathable material prevents overheating and provides a sense of security.',
        },
        quantity: 2,
      },
      {
        name: { hr: 'Set za njegu nokti\u0107a', en: 'Nail Care Kit' },
        description: {
          hr: 'Kompletni set za sigurno podrezivanje bebinih nokti\u0107a s zaobljenim \u0161karicama, turpijom i pincetom u prakti\u010Dnoj torbici.',
          en: 'Complete set for safely trimming baby nails with rounded scissors, a file, and tweezers in a practical carrying case.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Termometar za bebe', en: 'Baby Thermometer' },
        description: {
          hr: 'Beskontaktni infracrveni termometar za brzo i precizno mjerenje tjelesne temperature bebe bez uznemiravanja.',
          en: 'Non-contact infrared thermometer for quick and precise measurement of baby\'s body temperature without disturbance.',
        },
        quantity: 1,
      },
    ],
    price: 54.9,
    badge: 'popular',
    category: 'essentials',
    emoji: '\uD83D\uDC76',
    colorFrom: 'blush-light',
    colorTo: 'gold-light',
    inStock: true,
  },
  {
    id: 'gift-deluxe-bundle',
    slug: 'gift-deluxe-bundle',
    name: {
      hr: 'Deluxe poklon paket',
      en: 'Gift Deluxe Bundle',
    },
    description: {
      hr: 'Luksuzni poklon paket koji \u0107e odu\u0161eviti svakog novog roditelja. Sadr\u017Ei pa\u017Eljivo odabrane premium proizvode \u2013 od organskog pamu\u010Dnog pidžamice do bambusovih bo\u010Dica i elegantne kutije za uspomene.',
      en: 'A luxurious gift bundle that will delight every new parent. Contains carefully selected premium products \u2013 from an organic cotton sleepsuit to bamboo bottles and an elegant keepsake box.',
    },
    shortDescription: {
      hr: 'Savr\u0161en poklon za nove roditelje',
      en: 'The perfect gift for new parents',
    },
    items: [
      {
        name: { hr: 'Pidžamica od organskog pamuka', en: 'Organic Cotton Sleepsuit' },
        description: {
          hr: 'Premium pidžamica od certificiranog organskog pamuka s dvostrani\u010Dnim patentom za lako presvla\u010Denje. Iznimno mekana i nježna za bebinu ko\u017Eu.',
          en: 'Premium sleepsuit made of certified organic cotton with a two-way zipper for easy dressing. Exceptionally soft and gentle on baby skin.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Mekana deka za snove', en: 'Dreamy Soft Blanket' },
        description: {
          hr: 'Luksuzan pleteni pokriva\u010D od mje\u0161avine ka\u0161mira i pamuka. Savr\u0161eno mekan i topao za udobno spavanje i mazenje.',
          en: 'Luxurious knitted blanket made of a cashmere and cotton blend. Perfectly soft and warm for cozy sleeping and cuddling.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Bambusov set bo\u010Dica', en: 'Bamboo Bottle Set' },
        description: {
          hr: 'Ekolo\u0161ki set od dvije bo\u010Dice s bambusovim detaljima i anti-kolik sustavom. Prirodna alternativa za svjesne roditelje.',
          en: 'Eco-friendly set of two bottles with bamboo accents and an anti-colic system. A natural alternative for conscious parents.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Ne\u017Eni set za kupanje', en: 'Gentle Bath Set' },
        description: {
          hr: 'Organski set za kupanje s \u0161amponom, kupkom i uljem za masažu. Blagih mirisa lavande koji umiruju bebu prije spavanja.',
          en: 'Organic bath set with shampoo, body wash, and massage oil. Gentle lavender scent that soothes baby before sleep.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Mekana zve\u010Dka', en: 'Soft Rattle' },
        description: {
          hr: 'Ru\u010Dno ra\u0111ena pletena zve\u010Dka u obliku zeca od 100% organskog pamuka. Siguran i lijep prvi prijatelj za bebu.',
          en: 'Handmade knitted bunny-shaped rattle made of 100% organic cotton. A safe and beautiful first friend for baby.',
        },
        quantity: 1,
      },
      {
        name: { hr: 'Kutija za uspomene', en: 'Keepsake Box' },
        description: {
          hr: 'Elegantna drvena kutija s pregradama za \u010Duvanje posebnih uspomena \u2013 prve \u010Darapice, narukvice iz rodili\u0161ta, pramenka kose i drugih dragocjenosti.',
          en: 'Elegant wooden box with compartments for preserving special memories \u2013 first socks, hospital bracelet, lock of hair, and other treasures.',
        },
        quantity: 1,
      },
    ],
    price: 139.9,
    originalPrice: 159.9,
    badge: 'sale',
    category: 'gift',
    emoji: '\uD83C\uDF81',
    colorFrom: 'gold-light',
    colorTo: 'lavender-light',
    inStock: true,
  },
];
