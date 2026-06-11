import { Product, Partner, Order, Withdrawal, AppNotification, Customer, Category, Coupon } from './types';

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Dry Food', bnName: 'শুকনো খাবার', description: 'খাঁটি মধু, ঘি ও সুন্নাহ খাবার', isActive: true },
  { id: 'cat-2', name: 'Beauty & Cosmetics', bnName: 'সৌন্দর্য ও প্রসাধনী', description: 'হালাল ও অর্গানিক প্রসাধনী', isActive: true },
  { id: 'cat-3', name: 'Fashion', bnName: 'ফ্যাশন ও পোশাক', description: 'শালীন সুন্নাহ পোশাক', isActive: true },
  { id: 'cat-4', name: 'Perfume', bnName: 'আতর ও সুগন্ধি', description: 'অ্যালকোহলমুক্ত খাঁটি আতর', isActive: true },
  { id: 'cat-5', name: 'Gadgets & Electronics', bnName: 'গ্যাজেটস ও ইলেকট্রনিক্স', description: 'দৈনন্দিন প্রয়োজনীয় গ্যাজেটস', isActive: true },
  { id: 'cat-6', name: 'Spices', bnName: 'খাঁটি মশলা', description: 'প্রাকৃতিক ও নির্ভেজাল মশলা', isActive: true },
];

const initialCoupons: Coupon[] = [
  { id: 'cp-1', code: 'SUNNAH10', discountType: 'Percentage', amount: 10, minOrderAmount: 500, usageLimit: 100, usageCount: 4, isActive: true },
  { id: 'cp-2', code: 'DADAJAN100', discountType: 'Fixed', amount: 100, minOrderAmount: 1000, usageLimit: 50, usageCount: 12, isActive: true },
];

// Let's seed initial data
const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Sundarbans Premium Honey (সুন্দরবনের প্রাকৃতিক খলিশা মধু)',
    sku: 'SKU-HONEY-SB-500',
    category: 'Dry Food',
    price: 950,
    costPrice: 620,
    stockQty: 80,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-honey-dripping-from-a-wooden-dipper-41005-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: true,
      certifiedAuthentic: true
    },
    origin: 'Sundarbans Mangrove Forest, Satkhira, Bangladesh',
    ingredients: '100% Pure Raw Wild Khalisha Flower Nectar Honey',
    description: 'Collected directly from the deep forest of Sundarbans by local Mawalis under ethical and sustainable harvesting rules. Checked and verified by our local Partner Imams. Lab certified with zero sucrose addition, high in enzymes and pure antioxidant power.',
    rating: 5,
    reviewsCount: 18
  },
  {
    id: 'prod-2',
    name: 'Grass-fed Cow Ghee (হালাল খাঁটি গাওয়া ঘি)',
    sku: 'SKU-GHEE-GF-500',
    category: 'Dry Food',
    price: 1350,
    costPrice: 900,
    stockQty: 45,
    images: [
      'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1589135763458-40af7fbe0642?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-dripping-olive-oil-42289-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: true,
      certifiedAuthentic: true
    },
    origin: 'Sirajganj Dairy Hubs, Bangladesh',
    ingredients: 'Pure Butterfat derived from grass-fed cow milk cream',
    description: 'Slow-cooked in small-batch traditional copper vessels to ensure optimal granular texture (দানাদার) and rich, authentic aroma. No artificial colors, preservatives, or vegetable oil fats. A source of healthy fats and vitamins for your Sunnah family dining.',
    rating: 5,
    reviewsCount: 14
  },
  {
    id: 'prod-3',
    name: 'Extra Virgin Palestine Olive Oil (ফিলিস্তিনি জাইতুন তেল)',
    sku: 'SKU-OLIVE-PAL-500',
    category: 'Dry Food',
    price: 1850,
    costPrice: 1250,
    stockQty: 30,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1541256996761-85df2ea31644?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dropping-olive-oil-on-bread-34062-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: true,
      certifiedAuthentic: true
    },
    origin: 'West Bank Olive Groves, Palestine (Imported)',
    ingredients: '100% First Cold Pressed Extra Virgin Olive Oil',
    description: 'Directly sourced from Palestinian family farms sustaining old-growth olive trees. Cold-pressed within hours of hand-harvesting. Very low acidity, deeply fragrant, containing high levels of polyphenols. A blessed Sunnah food of exquisite taste.',
    rating: 5,
    reviewsCount: 22
  },
  {
    id: 'prod-4',
    name: 'Saudi Premium Ajwa Dates (মদিনার প্রিমিয়াম আজওয়া খেজুর)',
    sku: 'SKU-DATES-AJWA-1000',
    category: 'Dry Food',
    price: 1400,
    costPrice: 950,
    stockQty: 12,
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1628136367375-9247343e390c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-dates-dried-fruits-41712-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Madina Al-Munawwarah, Saudi Arabia',
    ingredients: 'Premium Selected Whole Dried Ajwa Dates',
    description: 'Direct import of the finest grade Ajwa dates from Madinah plantations. Soft, moderately sweet, dark-veined. As mentioned in authentic Hadith: "He who eats seven Ajwa dates in the morning, neither poison nor magic will hurt him on that day."',
    rating: 5,
    reviewsCount: 31
  },
  {
    id: 'prod-5',
    name: 'Arabian Jannatul Firdous Attar (জান্নাতুল ফেরদৌস আতর)',
    sku: 'SKU-ATTAR-JF-12',
    category: 'Perfume',
    price: 450,
    costPrice: 240,
    stockQty: 100,
    images: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-oil-from-a-dropper-40292-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Sourced from Dubai & Blended in Chittogram, Bangladesh',
    ingredients: 'Alcohol-free, pure Concentrated Oil Perfume (Attar)',
    description: 'Premium organic fragrance featuring fresh herbal notes, celestial wild lilies, sandalwood, and heavy musk accents. Completely non-alcoholic, persistent, perfect for application before Jumuah and daily prayers.',
    rating: 5,
    reviewsCount: 9
  },
  {
    id: 'prod-attar-wo',
    name: 'White Oud Imperial Blended Attar (হোয়াইট ঔদ লাক্সারি আতর)',
    sku: 'SKU-ATTAR-WO-12',
    category: 'Perfume',
    price: 750,
    costPrice: 420,
    stockQty: 50,
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-oil-from-a-dropper-40292-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Dehn Al-Oud Distilleries, Sylhet Border Woods',
    ingredients: 'Pure Agarwood essential oils, amber white compound, non-alcoholic base',
    description: 'An exceptional warm and aquatic woody fragrance starting with premium white musk leading to heavy aged cedarwood nodes. True organic longevity with deep spiritual resonance.',
    rating: 4.9,
    reviewsCount: 13
  },
  {
    id: 'prod-6',
    name: 'Turkish Premium Velvet Prayer Mat (তুর্কি মখমল জায়নামাজ - গোল্ড এমব্রয়ডারি)',
    sku: 'SKU-MAT-TURK-01',
    category: 'Fashion',
    price: 1800,
    costPrice: 1100,
    stockQty: 25,
    images: [
      'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-running-on-embroidered-sari-fabric-41004-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Istanbul, Turkey (Imported)',
    ingredients: 'High-Density Premium Velvet, Gold Metallic Weave backing',
    description: 'An ultra-soft, premium thick prayer mat designed specifically for comfortable prolonged prostration (Sajdah). Featuring traditional Ottoman floral arches with precise gold threads. Non-slip, dense, elegant luxury.',
    rating: 5,
    reviewsCount: 15
  },
  {
    id: 'prod-fashion-panjabi',
    name: 'Cotton Shahi Modesty Panjabi (রাজকীয় শাহি সুতি পাঞ্জাবি)',
    sku: 'SKU-FASHION-PJB-01',
    category: 'Fashion',
    price: 2400,
    costPrice: 1550,
    stockQty: 35,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1618242472859-ac0a9a95781a?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-folding-clothes-neatly-and-placing-in-suit-case-40321-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Tangail Handloom Weavers, Bangladesh',
    ingredients: '100% Organic Egyptian Combed Cotton',
    description: 'Exquisite hand-guided embroidery around fine neck placket in subtle golden-cream colors. Features comfortable loose-fit following elegant modesty rules. Perfect for Jumuah congregation and blessed celebrations.',
    rating: 4.8,
    reviewsCount: 27
  },
  {
    id: 'prod-7',
    name: 'Hajj & Umrah Complete Essential Kit (হজ্ব ও ওমরাহ সম্পূর্ণ সাথি কিট)',
    sku: 'SKU-HAJJ-PACK-01',
    category: 'Fashion',
    price: 3200,
    costPrice: 2200,
    stockQty: 15,
    images: [
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1628136367375-9247343e390c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-folding-clothes-neatly-and-placing-in-suit-case-40321-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Hand-sewn locally & imported elements',
    ingredients: 'Ihram towels, unscented soap, travel prayer mat, waist pouch, drawstring bag, dua card booklets',
    description: 'Take the worry out of preparation. This curated package includes premium combed 100% cotton double-towelled Ihram, high-grade security belt pouch, non-scented organic toiletries, stone collection pouch, Tawaf counter ring, and reference book approved by scholars.',
    rating: 5,
    reviewsCount: 12
  },
  {
    id: 'prod-beauty-seedoil',
    name: 'Organic Black Seed Oil Hair Elixir (কালোজিরা তেল হেয়ার এলিক্সির)',
    sku: 'SKU-BEAUTY-BSEED-200',
    category: 'Beauty & Cosmetics',
    price: 850,
    costPrice: 500,
    stockQty: 60,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-oil-from-a-dropper-40292-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: true,
      certifiedAuthentic: true
    },
    origin: 'Mymensingh Herbal Farms, Bangladesh',
    ingredients: '100% Cold Pressed Organic Nigella Sativa seed oil with virgin coconut extracts',
    description: 'Derived under low-temperature cold press to preserve active Thymoquinone. Richly nourishes scalp hair under Prophetic sunnah guidance for complete daily premium hair nutrition and shine.',
    rating: 4.8,
    reviewsCount: 11
  },
  {
    id: 'prod-beauty-soap',
    name: 'Handcrafted Saffron Goat Milk Soap (জাফরান ও ছাগলের দুধের সাবান)',
    sku: 'SKU-BEAUTY-SOAP-100',
    category: 'Beauty & Cosmetics',
    price: 380,
    costPrice: 220,
    stockQty: 95,
    images: [
      'https://images.unsplash.com/photo-1607006342411-9243db068bfc?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-oil-from-a-dropper-40292-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Sylhet Artisan Soapworks, Bangladesh',
    ingredients: 'Raw Kashmiri Saffron Threads, Organic Goat Milk, Beeswax, Olive Oil',
    description: 'Gently cures dry skin, irritation, blemishes and enhances glow naturally. Completely SLS, paraben, and petroleum tallow derivative-free. Pure faith-conscious luxury skincare.',
    rating: 4.9,
    reviewsCount: 16
  },
  {
    id: 'prod-gadget-tasbeeh',
    name: 'Premium OLED Smart Tasbeeh Counter (ডিজিটাল এলইডি স্মার্ট তাসবিহ)',
    sku: 'SKU-GADGET-TASB-01',
    category: 'Gadgets & Electronics',
    price: 650,
    costPrice: 350,
    stockQty: 120,
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-running-on-embroidered-sari-fabric-41004-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Imported Tech, Configured in Dhaka, Bangladesh',
    ingredients: 'Silicone wrap-around strap, high-brightness OLED micro screen, Smart Vibrating Node',
    description: 'Silent vibration alert at every 33, 99 and 100 counts. Keeps dual tally memory logs, rechargeable via USB-C. Encourages convenient, unobtrusive daily Thikr.',
    rating: 4.8,
    reviewsCount: 38
  },
  {
    id: 'prod-gadget-trimmer',
    name: 'Sunnah Shaver & Precision Beard Trimmer (সুন্নাহ দাড়ি ট্রিমার ও ক্লিপার)',
    sku: 'SKU-GADGET-TRIM-XR',
    category: 'Gadgets & Electronics',
    price: 1650,
    costPrice: 1050,
    stockQty: 40,
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-honey-dripping-from-a-wooden-dipper-41005-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Premium Shaving Co, Styled for Muslim Grooming',
    ingredients: 'Titanium-coated micro-blades, high torque copper motor, 600mAh battery',
    description: 'Engineered precisely for detailing beard margins and cleaning mustaches following sunnah limits. Ultra-low heat micro titanium tooth blade prevents shaving burns and preserves skin elasticity.',
    rating: 4.6,
    reviewsCount: 19
  },
  {
    id: 'prod-spice-saffron',
    name: 'Iranian Royal Sargol Saffron Threads (ইরানিয়া জাফরান কুঁড়ি)',
    sku: 'SKU-SPICE-SAFFRON-05',
    category: 'Spices',
    price: 1250,
    costPrice: 850,
    stockQty: 25,
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-dripping-olive-oil-42289-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: true,
      certifiedAuthentic: true
    },
    origin: 'Mashhad Plains, Iran (Khorasan region Imported)',
    ingredients: '100% Grade A Sargol Saffron Threads',
    description: 'Possesses incredibly intense crimson threads, coloring milk and tea into gold instantly. Rich in crocin and aromatic safranal. Pure hand-picked golden sunnah spice of premium certification.',
    rating: 4.9,
    reviewsCount: 22
  },
  {
    id: 'prod-spice-cinnamon',
    name: 'Organic Halal Ceylon Cinnamon Bark (সেরা সিলন দারুচিনি)',
    sku: 'SKU-SPICE-CINNA-250',
    category: 'Spices',
    price: 420,
    costPrice: 280,
    stockQty: 70,
    images: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dropping-olive-oil-on-bread-34062-large.mp4',
    certificationStatus: {
      imamVerified: true,
      labTested: false,
      certifiedAuthentic: true
    },
    origin: 'Dambulla Plantation Forests, Sri Lanka (Ceylon Imported)',
    ingredients: 'Thin rolled soft bark quill of True Ceylon Cinnamon',
    description: 'Extremely low coumarin, healthy food preservative. Offers a delicate, sweet, highly wood-scented flavor compound far superior to cassia bark. Essential for premium authentic curries.',
    rating: 4.7,
    reviewsCount: 15
  }
];

const initialPartners: Partner[] = [
  {
    id: 'imam-1',
    name: 'Maulana Mufti Abdur Rahman',
    bengaliName: 'মাওলানা মুফতি আব্দুর রহমান',
    role: 'Imam',
    mobile: '01712345678',
    email: 'murtadi.rahman@gmail.com',
    referralCode: 'IMAM100',
    district: 'Chattogram',
    area: 'Boalkhali',
    verifiedStatus: 'Approved',
    nidPhoto: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=400',
    walletBalance: 2450,
    pendingBalance: 400,
    totalWithdrawn: 12000,
    rating: 4.9
  },
  {
    id: 'imam-2',
    name: 'Hafez Maulana Abu Bakr Siddique',
    bengaliName: 'হাফেজ মাওলানা আবু বকর সিদ্দিক',
    role: 'Imam',
    mobile: '01812345679',
    email: 'abubakr@gmail.com',
    referralCode: 'AISUMAM2',
    district: 'Chattogram',
    area: 'Panchlaish',
    verifiedStatus: 'Approved',
    nidPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    walletBalance: 1200,
    pendingBalance: 250,
    totalWithdrawn: 3500,
    rating: 4.8
  },
  {
    id: 'dealer-1',
    name: 'Al-Haj Mohammad Mahbubur Rahman',
    bengaliName: 'আলহাজ্ব মোহাম্মদ মাহবুবুর রহমান',
    role: 'Dealer',
    mobile: '01912345611',
    email: 'mahbub.dealer@gmail.com',
    referralCode: 'DEALERCHIT',
    district: 'Chattogram',
    area: 'Boalkhali',
    verifiedStatus: 'Approved',
    nidPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    walletBalance: 8750,
    pendingBalance: 1850,
    totalWithdrawn: 45000,
    rating: 4.7
  },
  {
    id: 'imam-3',
    name: 'Maulana Kamal Uddin Sufyani',
    bengaliName: 'মাওলানা কামাল উদ্দিন সুফিয়ানী',
    role: 'Imam',
    mobile: '01512345600',
    email: 'sufyani@gmail.com',
    referralCode: 'Sufyani5',
    district: 'Dhaka',
    area: 'Uttara',
    verifiedStatus: 'Pending',
    nidPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    walletBalance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0
  }
];

const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ariful Islam',
    mobile: '01677889900',
    email: 'arif@gmail.com',
    district: 'Chattogram',
    area: 'Boalkhali',
    address: 'Kandhurkhil Post, Boalkhali Hub vicinity',
    referredBy: 'IMAM100',
    joinDate: '2026-03-12'
  },
  {
    id: 'cust-2',
    name: 'Dr. S. M. Yousuf',
    mobile: '01711223344',
    email: 'yousuf@gmail.com',
    district: 'Chattogram',
    area: 'Panchlaish',
    address: 'Road 4, House 51, Panchlaish Residential Area',
    referredBy: 'AISUMAM2',
    joinDate: '2026-04-01'
  },
  {
    id: 'cust-3',
    name: 'Tariq Al-Masood',
    mobile: '01923112233',
    email: 'tariq@gmail.com',
    district: 'Dhaka',
    area: 'Uttara',
    address: 'Sector 4, Road 8, House 12',
    referredBy: 'DEALERCHIT',
    joinDate: '2026-05-15'
  }
];

const initialOrders: Order[] = [
  {
    id: 'DDJ-10021',
    customerName: 'Ariful Islam',
    customerMobile: '01677889900',
    customerEmail: 'arif@gmail.com',
    customerAddress: 'Kandhurkhil Post, Boalkhali',
    district: 'Chattogram',
    area: 'Boalkhali',
    items: [
      {
        productId: 'prod-1',
        name: 'Sundarbans Premium Honey (সুন্দরবনের প্রাকৃতিক খলিশা মধু)',
        quantity: 2,
        price: 950,
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=200'
      },
      {
        productId: 'prod-2',
        name: 'Grass-fed Cow Ghee (হালাল খাঁটি গাওয়া ঘি)',
        quantity: 1,
        price: 1350,
        image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=200'
      }
    ],
    subtotal: 3250,
    discount: 100, // Coupon or Referral applied
    shipping: 100,
    total: 3250,
    referralCode: 'IMAM100',
    status: 'Delivered',
    paymentMethod: 'bKash',
    paymentStatus: 'Paid',
    date: '2026-05-24',
    assignedPartnerId: 'dealer-1',
    commissionsCalculated: true
  },
  {
    id: 'DDJ-10022',
    customerName: 'Dr. S. M. Yousuf',
    customerMobile: '01711223344',
    customerEmail: 'yousuf@gmail.com',
    customerAddress: 'Road 4, House 51, Panchlaish Residential Area',
    district: 'Chattogram',
    area: 'Panchlaish',
    items: [
      {
        productId: 'prod-3',
        name: 'Extra Virgin Palestine Olive Oil',
        quantity: 1,
        price: 1850,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200'
      },
      {
        productId: 'prod-5',
        name: 'Arabian Jannatul Firdous Attar (জান্নাতুল ফেরদৌস আতর)',
        quantity: 1,
        price: 450,
        image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=200'
      }
    ],
    subtotal: 2300,
    discount: 150,
    shipping: 120,
    total: 2270,
    referralCode: 'AISUMAM2',
    status: 'Processing',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    date: '2026-06-03',
    assignedPartnerId: 'dealer-1',
    commissionsCalculated: false
  }
];

const initialWithdrawals: Withdrawal[] = [
  {
    id: 'WTH-501',
    partnerId: 'imam-1',
    partnerName: 'Maulana Mufti Abdur Rahman',
    partnerRole: 'Imam',
    mobile: '01712345678',
    amount: 5000,
    method: 'bKash',
    details: '01712345678 (Personal)',
    status: 'Approved',
    date: '2026-05-01'
  },
  {
    id: 'WTH-502',
    partnerId: 'imam-1',
    partnerName: 'Maulana Mufti Abdur Rahman',
    partnerRole: 'Imam',
    mobile: '01712345678',
    amount: 7000,
    method: 'bKash',
    details: '01712345678 (Personal)',
    status: 'Approved',
    date: '2026-05-15'
  },
  {
    id: 'WTH-503',
    partnerId: 'dealer-1',
    partnerName: 'Al-Haj Mohammad Mahbubur Rahman',
    partnerRole: 'Dealer',
    mobile: '01912345611',
    amount: 15000,
    method: 'Bank Account',
    details: 'Al-Arafah Islami Bank, A/C: 1120239100023',
    status: 'Approved',
    date: '2026-05-20'
  }
];

const initialNotifications: AppNotification[] = [
  {
    id: 'not-1',
    type: 'Order',
    targetRole: 'Partner',
    partnerId: 'imam-1',
    title: 'নতুন রেফারেল অর্ডার!',
    description: 'আপনার অনুরাগী Ariful Islam একটি অর্ডার করেছেন। কমিশন দ্রুত যোগ করা হবে।',
    timestamp: '2026-05-24T10:15:00Z',
    read: true
  },
  {
    id: 'not-2',
    type: 'Commission',
    targetRole: 'Partner',
    partnerId: 'imam-1',
    title: 'কমিশন অর্জিত হয়েছে! (৳৮১)',
    description: 'অর্ডার DDJ-10021 সফলভাবে বিতরণ করা হয়েছে। আপনার ওয়ালেটে ৳৮১ যোগ হয়েছে।',
    timestamp: '2026-05-24T18:30:00Z',
    read: false
  },
  {
    id: 'not-3',
    type: 'Order',
    targetRole: 'Admin',
    title: 'New Order Received',
    description: 'Order DDJ-10022 placed by Dr. S. M. Yousuf from Panchlaish',
    timestamp: '2026-06-03T11:42:00Z',
    read: false
  },
  {
    id: 'not-4',
    type: 'Payout',
    targetRole: 'Partner',
    partnerId: 'imam-1',
    title: 'পেমেন্ট অনুমোদিত হয়েছে!',
    description: 'আপনার ১০ মে বুকিংকৃত ৳৭০০০ প্রত্যাহার সফল হয়েছে।',
    timestamp: '2026-05-15T14:00:00Z',
    read: true
  }
];

// Helper to interact with LocalStorage
const STORAGE_KEY = 'DADAJAN_DB';

export interface DBState {
  products: Product[];
  partners: Partner[];
  orders: Order[];
  withdrawals: Withdrawal[];
  notifications: AppNotification[];
  customers: Customer[];
  categories: Category[];
  coupons: Coupon[];
}

export function loadDB(): DBState {
  if (typeof window === 'undefined') {
    return {
      products: initialProducts,
      partners: initialPartners,
      orders: initialOrders,
      withdrawals: initialWithdrawals,
      notifications: initialNotifications,
      customers: initialCustomers,
      categories: initialCategories,
      coupons: initialCoupons
    };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const db: DBState = {
      products: initialProducts,
      partners: initialPartners,
      orders: initialOrders,
      withdrawals: initialWithdrawals,
      notifications: initialNotifications,
      customers: initialCustomers,
      categories: initialCategories,
      coupons: initialCoupons
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
  try {
    const parsed = JSON.parse(stored);
    const hasNewItems = parsed.products && parsed.products.some((p: any) => p.sku === 'SKU-SPICE-SAFFRON-05');
    if (!hasNewItems) {
      parsed.products = initialProducts;
    }
    if (!parsed.categories) {
      parsed.categories = initialCategories;
    }
    if (!parsed.coupons) {
      parsed.coupons = initialCoupons;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (e) {
    console.error('Failed to parse database, resetting to initial', e);
    return {
      products: initialProducts,
      partners: initialPartners,
      orders: initialOrders,
      withdrawals: initialWithdrawals,
      notifications: initialNotifications,
      customers: initialCustomers,
      categories: initialCategories,
      coupons: initialCoupons
    };
  }
}

export function saveDB(state: DBState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

// Complex commission split logic based on guidelines
// Introducer (Imam/Referrer): 2-3% of order total (or item-wise profit)
// Handler (Local Dealer): 5-7% of order total (or item-wise profit)
// Remaining: Company Share
export function calculateCommissions(order: Order, partners: Partner[]): {
  introducerId?: string;
  introducerAmount: number;
  handlerId?: string;
  handlerAmount: number;
} {
  let profit = 0;
  // Calculate aggregate profit from cost of items
  order.items.forEach(item => {
    // Find matching product to get cost
    const db = loadDB();
    const prod = db.products.find(p => p.id === item.productId);
    const cost = prod ? prod.costPrice : item.price * 0.7; // default fallback cost
    profit += (item.price - cost) * item.quantity;
  });

  // Take referral Imam
  let introducerId: string | undefined;
  if (order.referralCode) {
    const imam = partners.find(p => p.referralCode.toLowerCase() === order.referralCode?.toLowerCase());
    if (imam && imam.verifiedStatus === 'Approved') {
      introducerId = imam.id;
    }
  }

  // Introducer gets 2-3% of total order cost or ~10% of profit. Let's do 2.5% of total order value
  let introducerAmount = 0;
  if (introducerId) {
    introducerAmount = Math.round(order.total * 0.025);
  }

  // Handler gets 6% of total order value (assigned dealer)
  let handlerId = order.assignedPartnerId;
  let handlerAmount = 0;
  if (handlerId) {
    handlerAmount = Math.round(order.total * 0.06);
  }

  return { introducerId, introducerAmount, handlerId, handlerAmount };
}
export function getLocalTime(): string {
  return new Date().toISOString();
}

// ==========================================
// SUPABASE SERIALIZERS & DESERIALIZERS
// ==========================================

export function serializeProduct(p: Product): any {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: p.price,
    cost_price: p.costPrice,
    stock_qty: p.stockQty,
    images: p.images,
    video_url: p.videoUrl,
    certification_status: p.certificationStatus,
    origin: p.origin,
    ingredients: p.ingredients,
    description: p.description,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    is_featured: p.isFeatured || false,
    status: p.status || 'Published',
    sale_price: p.salePrice || null
  };
}

export function deserializeProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name || 'Untitled Product',
    sku: row.sku || '',
    category: row.category || '',
    price: Number(row.price || 0),
    costPrice: Number(row.cost_price || 0),
    stockQty: Number(row.stock_qty || 0),
    images: Array.isArray(row.images) ? row.images : [],
    videoUrl: row.video_url || '',
    certificationStatus: typeof row.certification_status === 'object' && row.certification_status ? row.certification_status : {
      imamVerified: false,
      labTested: false,
      certifiedAuthentic: false
    },
    origin: row.origin || '',
    ingredients: row.ingredients || '',
    description: row.description || '',
    rating: Number(row.rating || 5),
    reviewsCount: Number(row.reviews_count || 0),
    isFeatured: row.is_featured,
    status: row.status,
    salePrice: row.sale_price ? Number(row.sale_price) : undefined
  };
}

export function serializeCategory(c: Category): any {
  return {
    id: c.id,
    name: c.name,
    bn_name: c.bnName,
    description: c.description || null,
    image: c.image || null,
    is_active: c.isActive
  };
}

export function deserializeCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name || '',
    bnName: row.bn_name || '',
    description: row.description || '',
    image: row.image || undefined,
    isActive: row.is_active !== false
  };
}

export function serializeCoupon(c: Coupon): any {
  return {
    id: c.id,
    code: c.code,
    discount_type: c.discountType,
    amount: c.amount,
    min_order_amount: c.minOrderAmount || null,
    usage_limit: c.usageLimit || null,
    usage_count: c.usageCount || 0,
    is_active: c.isActive,
    expires_date: c.expiresDate || null
  };
}

export function deserializeCoupon(row: any): Coupon {
  return {
    id: row.id,
    code: row.code || '',
    discountType: row.discount_type || 'Percentage',
    amount: Number(row.amount || 0),
    minOrderAmount: row.min_order_amount ? Number(row.min_order_amount) : undefined,
    usageLimit: row.usage_limit ? Number(row.usage_limit) : undefined,
    usageCount: Number(row.usage_count || 0),
    isActive: row.is_active !== false,
    expiresDate: row.expires_date || undefined
  };
}

export function serializeOrder(o: Order): any {
  return {
    id: o.id,
    customer_name: o.customerName,
    customer_mobile: o.customerMobile,
    customer_email: o.customerEmail,
    customer_address: o.customerAddress,
    district: o.district,
    area: o.area,
    items: o.items,
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    total: o.total,
    referral_code: o.referralCode || null,
    status: o.status,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    date: o.date,
    assigned_partner_id: o.assignedPartnerId || null,
    commissions_calculated: o.commissionsCalculated
  };
}

export function deserializeOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name || '',
    customerMobile: row.customer_mobile || '',
    customerEmail: row.customer_email || '',
    customerAddress: row.customer_address || '',
    district: row.district || '',
    area: row.area || '',
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    shipping: Number(row.shipping || 0),
    total: Number(row.total || 0),
    referralCode: row.referral_code || undefined,
    status: row.status || 'Placed',
    paymentMethod: row.payment_method || 'Cash on Delivery',
    paymentStatus: row.payment_status || 'Pending',
    date: row.date || '',
    assignedPartnerId: row.assigned_partner_id || undefined,
    commissionsCalculated: !!row.commissions_calculated
  };
}

export function serializePartner(p: Partner): any {
  return {
    id: p.id,
    name: p.name,
    bengali_name: p.bengaliName,
    role: p.role,
    mobile: p.mobile,
    email: p.email,
    password: p.password || '123456',
    referral_code: p.referralCode,
    district: p.district,
    area: p.area,
    verified_status: p.verifiedStatus,
    nid_photo: p.nidPhoto,
    wallet_balance: p.walletBalance,
    pending_balance: p.pendingBalance,
    total_withdrawn: p.totalWithdrawn,
    rating: p.rating || 5.0
  };
}

export function deserializePartner(row: any): Partner {
  return {
    id: row.id,
    name: row.name || '',
    bengaliName: row.bengali_name || '',
    role: row.role || 'Partner',
    mobile: row.mobile || '',
    email: row.email || '',
    password: row.password || '123456',
    referralCode: row.referral_code || '',
    district: row.district || '',
    area: row.area || '',
    verifiedStatus: row.verified_status || 'Pending',
    nidPhoto: row.nid_photo || '',
    walletBalance: Number(row.wallet_balance || 0),
    pendingBalance: Number(row.pending_balance || 0),
    totalWithdrawn: Number(row.total_withdrawn || 0),
    rating: Number(row.rating || 5.0)
  };
}

export function serializeWithdrawal(w: Withdrawal): any {
  return {
    id: w.id,
    partner_id: w.partnerId,
    partner_name: w.partnerName,
    partner_role: w.partnerRole,
    mobile: w.mobile,
    amount: w.amount,
    method: w.method,
    details: w.details,
    status: w.status,
    date: w.date
  };
}

export function deserializeWithdrawal(row: any): Withdrawal {
  return {
    id: row.id,
    partnerId: row.partner_id || '',
    partnerName: row.partner_name || '',
    partnerRole: row.partner_role || '',
    mobile: row.mobile || '',
    amount: Number(row.amount || 0),
    method: row.method || 'bKash',
    details: row.details || '',
    status: row.status || 'Pending',
    date: row.date || ''
  };
}

export function serializeNotification(n: AppNotification): any {
  return {
    id: n.id,
    type: n.type,
    target_role: n.targetRole,
    partner_id: n.partnerId || null,
    title: n.title,
    description: n.description,
    timestamp: n.timestamp,
    read: n.read
  };
}

export function deserializeNotification(row: any): AppNotification {
  return {
    id: row.id,
    type: row.type || 'Order',
    targetRole: row.target_role || 'Partner',
    partnerId: row.partner_id || undefined,
    title: row.title || '',
    description: row.description || '',
    timestamp: row.timestamp || '',
    read: !!row.read
  };
}

export function serializeCustomer(c: Customer): any {
  return {
    id: c.id,
    name: c.name,
    mobile: c.mobile,
    email: c.email,
    password: c.password || '123456',
    district: c.district,
    area: c.area,
    address: c.address,
    referred_by: c.referredBy || null,
    join_date: c.joinDate
  };
}

export function deserializeCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name || '',
    mobile: row.mobile || '',
    email: row.email || '',
    password: row.password || '123456',
    district: row.district || '',
    area: row.area || '',
    address: row.address || '',
    referredBy: row.referred_by || undefined,
    joinDate: row.join_date || ''
  };
}

export const SUPABASE_SETUP_SQL = `-- Supabase DDL Script for Dadajan Honey ERP
-- Copy and run this in your Supabase SQL Editor.

-- 1. categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bn_name TEXT,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  min_order_amount NUMERIC,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_date TEXT
);

-- 3. products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  cost_price NUMERIC,
  stock_qty INT DEFAULT 0,
  images TEXT[],
  video_url TEXT,
  certification_status JSONB,
  origin TEXT,
  ingredients TEXT,
  description TEXT,
  rating NUMERIC,
  reviews_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Published',
  sale_price NUMERIC
);

-- 4. partners Table
CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bengali_name TEXT,
  role TEXT,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT DEFAULT '123456',
  referral_code TEXT UNIQUE,
  district TEXT,
  area TEXT,
  verified_status TEXT DEFAULT 'Pending',
  nid_photo TEXT,
  wallet_balance NUMERIC DEFAULT 0,
  pending_balance NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 5.0
);

-- 5. customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT,
  password TEXT DEFAULT '123456',
  district TEXT,
  area TEXT,
  address TEXT,
  referred_by TEXT,
  join_date TEXT
);

-- 6. orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_mobile TEXT,
  customer_email TEXT,
  customer_address TEXT,
  district TEXT,
  area TEXT,
  items JSONB,
  subtotal NUMERIC,
  discount NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  total NUMERIC,
  referral_code TEXT,
  status TEXT DEFAULT 'Placed',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'Pending',
  date TEXT,
  assigned_partner_id TEXT,
  commissions_calculated BOOLEAN DEFAULT FALSE
);

-- 7. withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  partner_id TEXT,
  partner_name TEXT,
  partner_role TEXT,
  mobile TEXT,
  amount NUMERIC,
  method TEXT,
  details TEXT,
  status TEXT DEFAULT 'Pending',
  date TEXT
);

-- 8. notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  target_role TEXT,
  partner_id TEXT,
  title TEXT,
  description TEXT,
  timestamp TEXT,
  read BOOLEAN DEFAULT FALSE
);

-- Enable RLS On All Tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Anonymous Select Rights to enable public catalog viewing (Products/Categories)
CREATE POLICY "Allow public select categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public select products" ON public.products FOR SELECT TO anon, authenticated USING (true);

-- Authenticated General Access
CREATE POLICY "Allow admin full access categories" ON public.categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access coupons" ON public.coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access products" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access partners" ON public.partners FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access customers" ON public.customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access orders" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access withdrawals" ON public.withdrawals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin full access notifications" ON public.notifications FOR ALL TO authenticated USING (true);

-- If tables already exist, users can skip DDL and enjoy immediate seamless synchronization.
`;
