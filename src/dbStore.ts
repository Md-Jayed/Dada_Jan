import { Product, Partner, Order, Withdrawal, AppNotification, Customer } from './types';

// Let's seed initial data
const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Sundarbans Premium Honey (সুন্দরবনের প্রাকৃতিক খলিশা মধু)',
    sku: 'SKU-HONEY-SB-500',
    category: 'Pure Food Collection',
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
    category: 'Pure Food Collection',
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
    category: 'Pure Food Collection',
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
    category: 'Sunnah & Lifestyle',
    price: 1400,
    costPrice: 950,
    stockQty: 12, // Low stock item
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
    category: 'Sunnah & Lifestyle',
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
    id: 'prod-6',
    name: 'Turkish Premium Velvet Prayer Mat (তুর্কি মখমল জায়নামাজ - গোল্ড এমব্রয়ডারি)',
    sku: 'SKU-MAT-TURK-01',
    category: 'Sunnah & Lifestyle',
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
    id: 'prod-7',
    name: 'Hajj & Umrah Complete Essential Kit (হজ্ব ও ওমরাহ সম্পূর্ণ সাথি কিট)',
    sku: 'SKU-HAJJ-PACK-01',
    category: 'Special Collections',
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
}

export function loadDB(): DBState {
  if (typeof window === 'undefined') {
    return {
      products: initialProducts,
      partners: initialPartners,
      orders: initialOrders,
      withdrawals: initialWithdrawals,
      notifications: initialNotifications,
      customers: initialCustomers
    };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const db = {
      products: initialProducts,
      partners: initialPartners,
      orders: initialOrders,
      withdrawals: initialWithdrawals,
      notifications: initialNotifications,
      customers: initialCustomers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse database, resetting to initial', e);
    return {
      products: initialProducts,
      partners: initialPartners,
      orders: initialOrders,
      withdrawals: initialWithdrawals,
      notifications: initialNotifications,
      customers: initialCustomers
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
