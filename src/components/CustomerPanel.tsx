import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Product, OrderItem, Order } from '../types';
import { ProductDetailsPage } from './ProductDetailsPage';
import { 
  ShoppingBag, CheckCircle, Video, FileText, BadgeHelp, Award, ShieldCheck, 
  MapPin, Phone, Mail, User, Percent, CreditCard, ChevronRight, X, Play, RefreshCw, Star, Info
} from 'lucide-react';

export const CustomerPanel: React.FC = () => {
  const { 
    products, 
    partners, 
    orders, 
    placeOrder, 
    setPriceFormat, 
    lang 
  } = useApp();

  // Navigation states
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'tracking' | 'product-details'>('home');
  const [previousTab, setPreviousTab] = useState<'home' | 'shop' | 'tracking'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product details modal
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);
  const [activeDetailImg, setActiveDetailImg] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Cart & Checkout states
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout form state
  const [shippingInfo, setShippingInfo] = useState({
    name: 'Ariful Islam Chowdhury',
    mobile: '01815566778',
    email: 'arif.chowdhury@outlook.com',
    address: 'Chowdhury Bari, Ward 3, Boalkhali Hub Area',
    district: 'Chattogram',
    area: 'Boalkhali'
  });
  
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [referralError, setReferralError] = useState('');
  const [referralSuccess, setReferralSuccess] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'bKash' | 'Nagad' | 'Bank Transfer'>('bKash');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string>('');
  const [orderCompleteData, setOrderCompleteData] = useState<Order | null>(null);

  // OTP SIMULATION for login / registration
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Sourcing highlight stories
  const sourcingStories = [
    {
      title: lang === 'bn' ? 'সুন্দরবনে খলিশা মধু নিষ্কাশন' : 'Sourcing Wild Khalisha Honey',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-honey-dripping-from-a-wooden-dipper-41005-large.mp4',
      origin: 'Satkhira, Sundarbans',
      desc: lang === 'bn' ? 'মৌয়ালদের হাত ধরে কোনো ভেজাল ছাড়া সরাসরি বনের চাক ভাঙ্গার মুহূর্ত।' : 'Direct footage of sustainably collecting nectar by traditional Mawalis.'
    },
    {
      title: lang === 'bn' ? 'ঘানি ভাঙ্গা খাঁটি সরিষার তেল' : 'Cold-Pressed Mustard Oil Sourcing',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-dripping-olive-oil-42289-large.mp4',
      origin: 'Sirajganj',
      desc: lang === 'bn' ? 'শতভাগ কাঠের ঘানিতে প্রথম চাপে নিষ্কাশিত ঝাঁঝালো সরিষার তেল।' : 'Aroma preserved using wooden cold-processing extraction wheels.'
    }
  ];

  const categories = [
    'All',
    'Pure Food Collection',
    'Sunnah & Lifestyle',
    'Special Collections'
  ];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product, quantity = 1, openCart = true) => {
    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIdx > -1) {
        const nextCart = [...prevCart];
        const newQty = nextCart[existingIdx].quantity + quantity;
        if (newQty <= product.stockQty) {
          nextCart[existingIdx].quantity = newQty;
        }
        return nextCart;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const nextQty = item.quantity + delta;
          if (nextQty > 0 && nextQty <= item.product.stockQty) {
            return { ...item, quantity: nextQty };
          }
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Validate Referral Code
  const handleValidateReferral = () => {
    if (!referralCodeInput) {
      setReferralError(lang === 'bn' ? 'অনুগ্রহ করে কোডটি লিখুন।' : 'Please enter code.');
      setReferralSuccess('');
      setReferralDiscount(0);
      return;
    }
    const partner = partners.find(p => p.referralCode.toLowerCase() === referralCodeInput.toLowerCase());
    if (partner) {
      if (partner.verifiedStatus === 'Approved') {
        const title = partner.role === 'Imam' 
          ? (lang === 'bn' ? `সম্মানিত ${partner.bengaliName} (ইমাম)` : `Revered ${partner.name} (Imam)`)
          : (lang === 'bn' ? `${partner.bengaliName} (ডিলার)` : `${partner.name} (Dealer)`);
        setReferralSuccess(lang === 'bn' 
          ? `${title} এর পক্ষ থেকে ৳১০০ বিশেষ ছাড় দেওয়া হয়েছে!` 
          : `${title} recommendation verified! 100 BDT reward applied.`);
        setReferralError('');
        setReferralDiscount(100);
      } else {
        setReferralError(lang === 'bn' ? 'এই অংশীদার এখনো ভেরিফাইড নয়।' : 'Partner referral key is not active.');
        setReferralSuccess('');
        setReferralDiscount(0);
      }
    } else {
      setReferralError(lang === 'bn' ? 'ভুল রেফারেল কোড। সঠিক কোড দিন।' : 'Invalid Referral Code. Try again.');
      setReferralSuccess('');
      setReferralDiscount(0);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!otpVerified && !otpSent) {
      // Send OTP mockup
      setOtpSent(true);
      return;
    }

    if (otpSent && !otpVerified) {
      if (otpCode === '1234') {
        setOtpVerified(true);
        // Continue to checkout submission
      } else {
        alert(lang === 'bn' ? 'ভুল ওটিপি কোড! সিমুলেশন কোড: 1234' : 'Incorrect OTP! Simulation PIN: 1234');
        return;
      }
    }

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0]
    }));

    const result = placeOrder(
      shippingInfo,
      orderItems,
      referralCodeInput,
      paymentMethod,
      referralDiscount
    );

    setOrderCompleteData(result);
    setActiveTrackingOrderId(result.id);
    setCart([]);
    setIsCheckoutOpen(false);
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
  };

  const openProductDetails = (product: Product) => {
    if (currentTab !== 'product-details') {
      setPreviousTab(currentTab);
    }
    setDetailedProduct(product);
    setCurrentTab('product-details');
    setActiveDetailImg(product.images[0]);
    setIsVideoPlaying(false);
  };

  const handleQuickBuyNow = (product: Product) => {
    setCart([{ product, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800 font-sans pb-16">
      {/* 1. Customer Top Nav */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 transition-shadow hover:shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <span className="bg-emerald-600 text-white p-2.5 rounded-xl font-bold text-xl tracking-tight leading-none shadow-sm shadow-emerald-900/10">দ</span>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight tracking-wider text-emerald-800">DADAJAN</span>
              <span className="text-[10px] font-medium text-amber-700 tracking-widest uppercase">Faith-Centered Commerce</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              id="customer-nav-home"
              onClick={() => { setCurrentTab('home'); setSelectedCategory('All'); }}
              className={`font-semibold text-sm transition-colors ${currentTab === 'home' ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1' : 'text-slate-600 hover:text-emerald-700'}`}
            >
              {lang === 'bn' ? 'হোম পেইজ' : 'Home'}
            </button>
            <button 
              id="customer-nav-shop"
              onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); }}
              className={`font-semibold text-sm transition-colors ${currentTab === 'shop' ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1' : 'text-slate-600 hover:text-emerald-700'}`}
            >
              {lang === 'bn' ? 'সকল পণ্য সংগ্রহ' : 'Our Collection'}
            </button>
            <button 
              id="customer-nav-tracking"
              onClick={() => setCurrentTab('tracking')}
              className={`font-semibold text-sm transition-colors ${currentTab === 'tracking' ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1' : 'text-slate-600 hover:text-emerald-700'}`}
            >
              {lang === 'bn' ? 'অর্ডার ট্র্যাক ও ট্র্যাকিং' : 'Order Tracking'}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              id="btn-customer-cart-icon"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 rounded-full transition-all flex items-center justify-center cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-653 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold font-mono shadow-sm">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
            <button 
              id="btn-nav-buy-direct"
              onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm px-4.5 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              {lang === 'bn' ? 'বাজার করুন' : 'Shop Now'}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Sourcing Transparency Hero (Home only) */}
      {currentTab === 'home' && (
        <>
          <div className="bg-[#022C22] text-stone-100 py-12 md:py-16 relative overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-6">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Elegant Design Decorative Ring */}
            <div className="absolute right-[-40px] top-[-20px] w-80 h-80 bg-[#059669]/10 rounded-full border-[12px] border-white/5 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-left">
                <span className="inline-block px-3 py-1 bg-amber-200 text-amber-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                  {lang === 'bn' ? '🔒 শতভাগ হালাল ও বিশুদ্ধ সরবরাহ' : 'Premium Sourcing'}
                </span>
                
                <h1 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-4 italic font-bold">
                  {lang === 'bn' ? (
                    <>সুন্দরবনের খলিশা মধু<br/>ইমাম ভেরিফাইড ও ল্যাব সার্টিফাইড</>
                  ) : (
                    <>Pure Sundarbans Honey<br/>Verified & Lab Tested</>
                  )}
                </h1>
                
                <p className="text-gray-200 text-sm md:text-base mb-6 max-w-md">
                  {lang === 'bn' 
                    ? 'সম্মানিত ইমাম ও ডিলার অংশীদারদের দ্বারা উৎসস্থলে গিয়ে সরাসরি সংগৃহীত। শতভাগ বিশুদ্ধতার নিশ্চয়তা।'
                    : 'Trusted by Imams and community partners. Sourced directly from the forest with 100% transparency.'}
                </p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <button 
                    onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); }}
                    className="px-8 py-3 bg-amber-200 text-amber-700 font-bold rounded-lg shadow-xl hover:bg-amber-100 transition-all cursor-pointer text-xs uppercase"
                  >
                    {lang === 'bn' ? 'এখনই কিনুন 🛒' : 'Shop Now'}
                  </button>
                  <button 
                    onClick={() => {
                      // Scroll or change state to show videos
                      const videoSec = document.getElementById('transparent-sourcing-section');
                      if (videoSec) videoSec.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-3 border border-white/30 text-white font-bold rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer text-xs uppercase"
                  >
                    {lang === 'bn' ? 'সোর্সিং ভিডিও দেখুন 🎬' : 'Watch Sourcing'}
                  </button>
                </div>
              </div>

              {/* Sidebar Quick-Stats Trust Flags inside Hero */}
              <div className="w-full md:w-auto shrink-0 self-stretch flex flex-col justify-center gap-3">
                <div className="p-4 bg-emerald-50/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4 text-left min-w-[260px]">
                  <div className="p-2 bg-emerald-800 text-white rounded-lg">
                    <CheckCircle className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white uppercase tracking-wider">{lang === 'bn' ? 'ইমাম ভেরিফাইড' : 'Imam Verified'}</p>
                    <p className="text-[10px] text-gray-300">{lang === 'bn' ? 'স্থানীয় ইমামগণের স্বচক্ষে সার্টিফাইড' : 'Certified by local community Imams'}</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4 text-left min-w-[260px]">
                  <div className="p-2 bg-amber-700 text-white rounded-lg">
                    <Award className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white uppercase tracking-wider">{lang === 'bn' ? 'ল্যাব পরীক্ষিত' : 'Lab Tested'}</p>
                    <p className="text-[10px] text-gray-300">{lang === 'bn' ? 'বিশ্লেষণ রিপোর্ট ও প্রমাণ উপলব্ধ' : 'Analytical raw honey report available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.1 Home Sourcing Video Highlights */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-2 border-b border-stone-200">
              <div>
                <h3 id="transparent-sourcing-section" className="text-xl font-bold border-l-4 border-emerald-800 pl-4 text-emerald-950 font-display">
                  {lang === 'bn' ? 'উৎসের স্বচ্ছতা: লাইভ সোর্সিং ও যাচাইকরণ ভিডিও' : 'Source Transparency'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {lang === 'bn' ? 'আমরা কীভাবে পণ্য সংগ্রহ করি তা সরাসরি দেখুন।' : 'Watch how we harvest and procure under strict halal criteria.'}
                </p>
              </div>
              <button 
                id="btn-view-transparent-shop"
                onClick={() => setCurrentTab('shop')} 
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-sm flex items-center gap-0.5 mt-2 md:mt-0 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'সকল পণ্য দেখুন' : 'Browse All Products'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sourcingStories.map((story, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-xs border border-stone-200/65 flex flex-col sm:flex-row h-full">
                  <div className="relative w-full sm:w-48 h-40 bg-zinc-900 shrink-0">
                    <video 
                      src={story.videoUrl} 
                      className="w-full h-full object-cover opacity-85" 
                      loop 
                      muted 
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                      <span className="p-3 bg-white/20 backdrop-blur-xs rounded-full text-white cursor-pointer hover:scale-105 transition-all">
                        <Play className="w-6 h-6 fill-white" />
                      </span>
                    </div>
                    <span className="absolute bottom-2 left-2 bg-emerald-900 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                      {story.origin}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-extrabold text-base text-slate-800 mb-1.5 leading-snug">{story.title}</h3>
                      <p className="text-xs text-stone-500 leading-relaxed mb-3">{story.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{lang === 'bn' ? 'বিশ্বাসী উৎস' : 'Honest Supply'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 3. Product Category Filters & Product List (Shop/Home both show this) */}
      {(currentTab === 'home' || currentTab === 'shop') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-transparent">
        {currentTab === 'shop' && (
          <div className="mb-6 pt-4">
            <h1 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">
              {lang === 'bn' ? 'দাদাজান সামগ্রী বুকশেলফ ও স্টোর' : 'DadaJan Premium Products'}
            </h1>
            <p className="text-sm text-stone-500">
              {lang === 'bn' ? 'সরাসরি প্রডিউসার থেকে সংগৃহীত খাঁটি সুনাহ খাদ্য ও সামগ্রী।' : 'Ethical, lab-tested foods, Sunnah clothes, and prayer mats.'}
            </p>
          </div>
        )}

        {/* Categories Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-tab-${cat.replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-emerald-800 text-white shadow-sm' 
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat === 'All' ? (lang === 'bn' ? 'সকল পণ্য' : 'All Products') : (lang === 'bn' ? cat : cat)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              id="input-customer-product-search"
              placeholder={lang === 'bn' ? 'মধু, ঘি, আতর খুঁজুন...' : 'Search pure food, attar...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 placeholder-stone-400 font-medium"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-stone-200/60 rounded-2xl py-12 text-center p-4">
            <p className="text-stone-500 text-sm font-medium">
              {lang === 'bn' ? 'দুঃখিত, কোনো পণ্য পাওয়া যায়নি।' : 'No products found match your search query.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl border border-stone-200/50 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                {/* Product Media Area */}
                <div className="relative bg-stone-50 h-48 overflow-hidden shrink-0 cursor-pointer" onClick={() => openProductDetails(p)}>
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {p.certificationStatus.imamVerified && (
                      <span className="bg-emerald-700/90 text-white font-semibold text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-xs tracking-wide">
                        <Award className="w-3 h-3 text-amber-300 shrink-0" />
                        {lang === 'bn' ? 'ইমাম সুপারিশকৃত' : 'Imam Verified'}
                      </span>
                    )}
                    {p.certificationStatus.labTested && (
                      <span className="bg-stone-900/80 text-emerald-450 font-bold text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-xs tracking-wide">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        {lang === 'bn' ? 'ল্যাব সার্টিফাইড' : 'Lab Verified'}
                      </span>
                    )}
                  </div>
                  {p.stockQty <= 5 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                      {lang === 'bn' ? 'সীমিত স্টক' : 'Low Stock'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{p.category}</span>
                    <h3 
                      onClick={() => openProductDetails(p)}
                      className="font-display font-extrabold text-sm text-stone-900 hover:text-emerald-850 cursor-pointer mt-1 mb-2 line-clamp-2 h-10 leading-snug"
                    >
                      {p.name}
                    </h3>
                    <div className="text-[11px] text-stone-500 mb-4 line-clamp-1">
                      📍 {p.origin}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div>
                    <div className="flex items-baseline justify-between mb-3 border-t border-stone-100 pt-3">
                      <span className="text-xs font-medium text-stone-400">{lang === 'bn' ? 'মূল্য:' : 'Price:'}</span>
                      <span className="text-base font-extrabold text-slate-900">{setPriceFormat(p.price)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id={`btn-cart-${p.id}`}
                        onClick={() => addToCart(p)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold py-2 px-1 rounded-lg transition-colors cursor-pointer border border-emerald-150 text-center"
                      >
                        {lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add Card'}
                      </button>
                      <button
                        id={`btn-buy-${p.id}`}
                        onClick={() => handleQuickBuyNow(p)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold py-2 px-1 rounded-lg transition-all cursor-pointer shadow-xs text-center"
                      >
                        {lang === 'bn' ? 'সরাসরি কিনুন' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* 4. Order History / Order Tracker UI */}
      {currentTab === 'tracking' && (
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-stone-200/70 p-6 shadow-xs">
            <h2 className="text-xl font-display font-extrabold text-stone-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              {lang === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং প্যানেল' : 'Order Status Tracker'}
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              {lang === 'bn' ? 'অর্ডার করার পর প্রাপ্ত ইনভয়েস কোড দিয়ে আপনার পণ্য ট্র্যাক করুন।' : 'Check real-time processing and commission milestones.'}
            </p>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                id="input-tracker-order-id"
                placeholder="উদাহরণ: DDJ-10022"
                value={activeTrackingOrderId}
                onChange={(e) => setActiveTrackingOrderId(e.target.value.toUpperCase())}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:border-emerald-700 font-mono font-bold uppercase"
              />
              <button
                id="btn-trigger-track"
                onClick={() => {
                  const target = orders.find(o => o.id.toUpperCase() === activeTrackingOrderId.trim().toUpperCase());
                  if (target) {
                    setOrderCompleteData(target);
                  } else {
                    alert(lang === 'bn' ? 'এই কোড সম্বলিত কোনো অর্ডার খুঁজে পাওয়া যায়নি।' : 'Order ID not found in system storage.');
                  }
                }}
                className="bg-emerald-750 hover:bg-emerald-800 text-white rounded-xl px-5 text-xs font-bold cursor-pointer transition-all"
              >
                {lang === 'bn' ? 'খুঁজুন' : 'Track'}
              </button>
            </div>

            {/* Display status details */}
            {orderCompleteData && (
              <div className="border-t border-stone-150 pt-5 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400">ORDER NO:</span>
                    <h3 className="font-mono text-sm font-bold text-stone-900">{orderCompleteData.id}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    orderCompleteData.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                    orderCompleteData.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                    orderCompleteData.status === 'Packed' ? 'bg-amber-100 text-amber-800' :
                    orderCompleteData.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-stone-100 text-stone-800'
                  }`}>
                    {orderCompleteData.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative flex items-center justify-between mb-6 pt-2">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-stone-200 z-0"></div>
                  {/* Status Steps */}
                  {['Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((stState, idx) => {
                    const states = ['Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'];
                    const currentIdx = states.indexOf(orderCompleteData.status);
                    const stateIdx = states.indexOf(stState);
                    const isDone = stateIdx <= currentIdx;
                    return (
                      <div key={stState} className="relative z-10 flex flex-col items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isDone ? 'bg-emerald-600 text-white font-mono' : 'bg-stone-100 border border-stone-300 text-stone-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-[9px] font-bold mt-1 text-stone-600">{stState}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Information */}
                <div className="bg-stone-50 p-4 rounded-xl space-y-2 border border-stone-200/50 mb-4 text-xs font-medium">
                  <div className="flex justify-between text-stone-500">
                    <span>{lang === 'bn' ? 'গ্রাহক:' : 'Customer:'}</span>
                    <span className="text-stone-800 font-semibold">{orderCompleteData.customerName}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{lang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile:'}</span>
                    <span className="text-stone-800 font-mono">{orderCompleteData.customerMobile}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</span>
                    <span className="text-stone-800 font-semibold max-w-xs text-right">{orderCompleteData.customerAddress}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{lang === 'bn' ? 'রুট অ্যাসাইনড ডিলার:' : 'Routed Dealer:'}</span>
                    <span className="text-emerald-800 font-bold">
                      {partners.find(p => p.id === orderCompleteData.assignedPartnerId)?.name || 'Central Chattogram Hub'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">{lang === 'bn' ? 'পণ্য তালিকা:' : 'Items Loaded:'}</span>
                  {orderCompleteData.items.map((it, i) => (
                    <div key={i} className="flex justify-between items-center text-xs border-b border-stone-100 pb-1.5 last:border-none">
                      <span className="text-stone-700 truncate max-w-xs">{it.name} <span className="text-stone-400 text-[11px]">x{it.quantity}</span></span>
                      <span className="font-semibold text-slate-800">{setPriceFormat(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-center font-extrabold text-sm">
                  <span>{lang === 'bn' ? 'সর্বমোট প্রদেয় মূল্য:' : 'Grand Total:'}</span>
                  <span className="text-emerald-700">{setPriceFormat(orderCompleteData.total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4.5 Dedicated Single Product Details Page View */}
      {currentTab === 'product-details' && detailedProduct && (
        <ProductDetailsPage
          product={detailedProduct}
          onBack={() => {
            setCurrentTab(previousTab);
            setDetailedProduct(null);
          }}
          addToCart={(prod, qty, openCart) => addToCart(prod, qty, openCart)}
          handleQuickBuyNow={handleQuickBuyNow}
          setPriceFormat={setPriceFormat}
          lang={lang}
          partners={partners}
        />
      )}

      {/* 5. Product Details Modal */}
      {detailedProduct && currentTab !== 'product-details' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-hidden text-left flex flex-col md:flex-row max-h-[90vh]">
            <button 
              id="btn-product-details-close"
              onClick={() => setDetailedProduct(null)}
              className="absolute top-4 right-4 bg-stone-150 hover:bg-stone-200 text-stone-700 p-1.5 rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Media */}
            <div className="w-full md:w-1/2 p-4 md:p-6 bg-stone-50 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="relative h-64 md:h-80 bg-zinc-850 rounded-2xl overflow-hidden mb-3">
                  {isVideoPlaying ? (
                    <video 
                      src={detailedProduct.videoUrl} 
                      className="w-full h-full object-cover" 
                      controls 
                      autoPlay 
                      playsInline
                    />
                  ) : (
                    <img 
                      src={activeDetailImg} 
                      alt={detailedProduct.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {!isVideoPlaying && (
                    <button
                      id="btn-product-details-play-video"
                      onClick={() => setIsVideoPlaying(true)}
                      className="absolute bottom-4 left-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow"
                    >
                      <Video className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'সোর্সিং ভিডিও দেখুন (১৫ সেকেন্ড)' : 'Sourcing Video Proof'}
                    </button>
                  )}
                </div>

                {/* 3 Product Images (Requested "Minimum 3 Product Images") */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {detailedProduct.images.map((img, index) => (
                    <button
                      key={index}
                      id={`btn-product-details-img-${index}`}
                      onClick={() => {
                        setActiveDetailImg(img);
                        setIsVideoPlaying(false);
                      }}
                      className={`h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeDetailImg === img && !isVideoPlaying ? 'border-emerald-600' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                  {/* Sourcing Video thumbnail as 4th interactive tile */}
                  <button
                    id="btn-product-details-video-tile"
                    onClick={() => setIsVideoPlaying(true)}
                    className={`h-16 rounded-xl overflow-hidden border-2 transition-all bg-emerald-950 relative flex items-center justify-center ${
                      isVideoPlaying ? 'border-emerald-600' : 'border-stone-200'
                    }`}
                  >
                    <Play className="w-5 h-5 text-emerald-450" />
                  </button>
                </div>
              </div>

              {/* 1.1 Imam Recommendation Badge & Certification badges */}
              <div className="space-y-2 mt-4 bg-emerald-50 bg-opacity-70 p-4 rounded-xl border border-emerald-100">
                {detailedProduct.certificationStatus.imamVerified && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">{lang === 'bn' ? 'ইমাম সুপারিশপ্রাপ্ত ও ভেরিফাইড' : 'Imam Verified & Endorsed'}</span>
                      <span className="text-[10px] text-emerald-750 block leading-tight">
                        {lang === 'bn' ? 'দাদাজান ইসলামি পরামর্শ বোর্ড কর্তৃক বিশুদ্ধ ও হালাল সরবরাহ।' : 'Certified genuine and ethically harvested under local guidelines.'}
                      </span>
                    </div>
                  </div>
                )}
                {detailedProduct.certificationStatus.labTested && (
                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-150">
                    <ShieldCheck className="w-5 h-5 text-emerald-750 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{lang === 'bn' ? 'ল্যাব পরীক্ষার সার্টিফিকেট' : 'Lab Certificate Verified'}</span>
                      <span className="text-[10px] text-zinc-553 block">
                        {lang === 'bn' ? 'রাসায়নিক পরীক্ষা দ্বারা শতভাগ চিনিমুক্ত ও প্রিজার্ভেটিভমুক্ত প্রমাণিত।' : '100% natural, contains zero trace moisture or processed sugars.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Description Spec & Shopping */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">{detailedProduct.category}</span>
                <span className="text-xs font-mono text-stone-400 pl-3">SKU: {detailedProduct.sku}</span>
                
                <h2 className="text-xl md:text-2xl font-display font-bold text-stone-900 mt-2 mb-3 leading-tight">{detailedProduct.name}</h2>
                
                <div className="flex items-center gap-1 mb-4 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-xs text-stone-500 font-mono font-bold pl-1.5 mt-0.5">({detailedProduct.rating}.0 / {detailedProduct.reviewsCount} reviews)</span>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-stone-600 mb-6">
                  <div>
                    <h4 className="font-bold text-stone-900 uppercase tracking-wide mb-1">{lang === 'bn' ? 'উৎপত্তির স্থান (Origin):' : 'Product Origin:'}</h4>
                    <p className="bg-stone-50 p-2 rounded-lg border border-stone-200/50">{detailedProduct.origin}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 uppercase tracking-wide mb-1">{lang === 'bn' ? 'উপাদানসমূহ (Ingredients):' : 'Key Ingredients:'}</h4>
                    <p className="bg-stone-50 p-2 rounded-lg border border-stone-200/50">{detailedProduct.ingredients}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 uppercase tracking-wide mb-1">{lang === 'bn' ? 'বর্ণনা ও স্বাস্থ্য উপকারিতা:' : 'Description:'}</h4>
                    <p className="text-stone-600 leading-relaxed text-[11px] font-sans">{detailedProduct.description}</p>
                  </div>
                </div>

                {/* 1.4 Customer Reviews section */}
                <div className="border-t border-stone-150 pt-5 mb-6">
                  <h4 className="font-display font-extrabold text-sm text-stone-900 mb-3">{lang === 'bn' ? 'গ্রাহকদের সন্তুষ্টি ও ফটো রিভিউ' : 'Customer Reviews & Feedback'}</h4>
                  <div className="space-y-3.5">
                    <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-150">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-stone-800 text-[11px]">মুহিব্বুল্লাহ আরীফ (Mawlana Arif)</span>
                        <div className="flex text-amber-500 shrink-0">
                          <Star className="w-3 h-3 fill-amber-553" />
                          <Star className="w-3 h-3 fill-amber-553" />
                          <Star className="w-3 h-3 fill-amber-553" />
                          <Star className="w-3 h-3 fill-amber-553" />
                          <Star className="w-3 h-3 fill-amber-553" />
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {lang === 'bn' 
                          ? '"মাশাআল্লাহ দাদাজানের মধু যেমন দানাদার তেমন সুস্বাদু। আমাদের ইমামের কোড দিয়ে অর্ডার করে ছাড়ও পেয়েছি। ধন্যবাদ!"' 
                          : '"Exceptional quality. Honey is granular and deeply pure. Used the local imams referral code for reward. Jazakallahu Khair."'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase button overlay */}
              <div className="border-t border-stone-200 pt-4 mt-auto">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs text-stone-400 font-bold">{lang === 'bn' ? 'প্রদেয় মূল্য (ভ্যাটসহ):' : 'Grand Price (Inclusive of VAT):'}</span>
                  <span className="text-xl font-extrabold text-slate-900 font-display">{setPriceFormat(detailedProduct.price)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-details-modal-add-cart"
                    onClick={() => {
                      addToCart(detailedProduct);
                      setDetailedProduct(null);
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer border border-emerald-150 text-center"
                  >
                    {lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                  </button>
                  <button
                    id="btn-details-modal-buy-now"
                    onClick={() => {
                      handleQuickBuyNow(detailedProduct);
                      setDetailedProduct(null);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-xs text-center"
                  >
                    {lang === 'bn' ? 'সরাসরি কিনুন' : 'Purchase Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Shopping Cart Sidebar / Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-xs">
          <div className="bg-white max-w-md w-full h-full p-6 shadow-2xl flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <h3 className="font-display font-extrabold text-lg text-stone-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-5 h-5 text-emerald-650" />
                  {lang === 'bn' ? 'আপনার শপিং কার্ট' : 'My Shopping Basket'}
                </h3>
                <button 
                  id="btn-cart-drawer-close"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-stone-400 text-xs font-semibold">{lang === 'bn' ? 'আপনার কার্ট খালি রয়েছে।' : 'Your Shopping cart is empty.'}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 items-start border-b border-stone-100 pb-4">
                      <img 
                        src={item.product.images[0]} 
                        alt="" 
                        className="w-16 h-16 object-cover rounded-xl bg-stone-50 border border-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-amber-700 tracking-wider block uppercase">{item.product.category}</span>
                        <h4 className="font-bold text-xs text-stone-900 truncate leading-snug mb-1">{item.product.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg p-1 scale-90 -ml-1">
                            <button 
                              id={`btn-cart-minus-${item.product.id}`}
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="px-1.5 text-xs font-extrabold hover:bg-white rounded transition-colors"
                            >
                              -
                            </button>
                            <span className="text-[11px] font-bold font-mono px-1 w-4 text-center">{item.quantity}</span>
                            <button 
                              id={`btn-cart-plus-${item.product.id}`}
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="px-1.5 text-xs font-extrabold hover:bg-white rounded transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-extrabold text-slate-800">{setPriceFormat(item.product.price * item.quantity)}</span>
                        </div>
                      </div>
                      <button 
                        id={`btn-cart-remove-${item.product.id}`}
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-stone-300 hover:text-red-650 cursor-pointer mt-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-stone-200 pt-5">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs font-bold text-stone-400">{lang === 'bn' ? 'উপ-মোট মূল্য:' : 'Cart Subtotal:'}</span>
                  <span className="text-lg font-extrabold text-stone-900 font-display">{setPriceFormat(cartSubtotal)}</span>
                </div>
                <button
                  id="btn-cart-go-checkout"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm tracking-wider cursor-pointer text-center block uppercase"
                >
                  {lang === 'bn' ? 'চেকআউট পাতায় যান' : 'Proceed to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Checkout Overlay Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden text-left max-h-[90vh] overflow-y-auto">
            <button 
              id="btn-checkout-close"
              onClick={() => {
                setIsCheckoutOpen(false);
                setOtpSent(false);
                setOtpCode('');
                setOtpVerified(false);
              }}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-250 text-stone-700 p-1.5 rounded-full z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-extrabold text-lg md:text-xl text-stone-950 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-5 h-5 text-emerald-650" />
              {lang === 'bn' ? 'নিরাপদ চেকআউট ও পেমেন্ট' : 'Secure Order Gateway'}
            </h3>
            <p className="text-[11px] text-stone-500 mb-6 font-medium">
              {lang === 'bn' ? 'সরাসরি প্রডিউসার থেকে পণ্য বুকিং করতে অনুগ্রহ করে নিচের তথ্য পূরণ করুন।' : 'Fill in the delivery details and secure your Sunnah selections.'}
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">{lang === 'bn' ? 'গ্রাহকের পুরো নাম:' : 'Full Name:'}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      id="input-checkout-name"
                      required
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">{lang === 'bn' ? 'মোবাইল নম্বর (লগইন ও ওটিপি):' : 'Mobile (For OTP):'}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      id="input-checkout-mobile"
                      required
                      maxLength={11}
                      value={shippingInfo.mobile}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, mobile: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs font-mono focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">{lang === 'bn' ? 'ইমেইল ঠিকানা:' : 'Email Address:'}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      id="input-checkout-email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">{lang === 'bn' ? 'জেলা:' : 'District:'}</label>
                  <select
                    id="select-checkout-district"
                    value={shippingInfo.district}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none font-semibold text-stone-700 h-9.5"
                  >
                    <option value="Chattogram">Chattogram (চট্টগ্রাম)</option>
                    <option value="Dhaka">Dhaka (ঢাকা)</option>
                    <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">{lang === 'bn' ? 'থানা / উপজেলা (সঠিক কমিশন রাউটিংয়ের জন্য):' : 'Area / Hub Location:'}</label>
                  <input
                    type="text"
                    id="input-checkout-area"
                    required
                    value={shippingInfo.area}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, area: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none font-semibold text-stone-700"
                    placeholder="যেমন- Boalkhali"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">{lang === 'bn' ? 'বিস্তারিত ঠিকানা:' : 'Full Address Details:'}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      id="input-checkout-address"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Referral Code Box */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'পার্টনার ইমাম / ডিলার রেফারেল কোড:' : 'Scholars/Dealer Referral Code:'}</span>
                  <span className="text-[10px] font-semibold text-emerald-705 lowercase">ট্রিগার কোড: IMAM100</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Percent className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      id="input-checkout-referral"
                      placeholder="যেমন- IMAM100 বা DEALERCHIT"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    id="btn-validate-referral"
                    onClick={handleValidateReferral}
                    className="bg-[#115e59] hover:bg-teal-900 border border-[#0d4f4b] text-white rounded-xl px-4 text-xs font-semibold cursor-pointer transition-all shrink-0"
                  >
                    {lang === 'bn' ? 'যাচাই করুন' : 'Verify'}
                  </button>
                </div>
                {referralError && <p className="text-red-650 text-[10px] font-bold mt-1.5 pl-2">{referralError}</p>}
                {referralSuccess && <p className="text-[#0f766e] text-[10px] font-bold mt-1.5 pl-2 flex items-center gap-1">✨ {referralSuccess}</p>}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-2">{lang === 'bn' ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন:' : 'Preferred Payment Gateway:'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['bKash', 'Nagad', 'Cash on Delivery', 'Bank Transfer'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      id={`btn-pay-method-${method.replace(/\s+/g, '-')}`}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3.5 px-2 rounded-2xl text-[11px] font-bold border transition-all cursor-pointer text-center relative flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === method 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800' 
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      {method === 'bKash' && <span className="text-[10px] bg-[#d13a7b] text-white px-2 py-0.5 rounded-md font-mono tracking-wide scale-90 font-black">bKash</span>}
                      {method === 'Nagad' && <span className="text-[10px] bg-[#ff6a00] text-white px-2 py-0.5 rounded-md font-mono tracking-wide scale-90 font-black">Nagad</span>}
                      {method === 'Cash on Delivery' && <span className="text-[10px] bg-slate-755 text-stone-105 px-2 py-0.5 rounded-md font-sans tracking-wide scale-90">COD</span>}
                      {method === 'Bank Transfer' && <span className="text-[10px] bg-sky-750 text-white px-2 py-0.5 rounded-md font-sans tracking-wide scale-90">Bank</span>}
                      <span>{lang === 'bn' ? method : method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SUMMARY OR OTP STEP */}
              {otpSent && !otpVerified && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                  <span className="text-amber-800 font-extrabold text-xs block mb-1">{lang === 'bn' ? '🔐 ৪-ডিজিটের সোর্সিং ওটিপি দিন' : '🔐 Provide 4-Digit Login OTP'}</span>
                  <span className="text-[11px] text-amber-700 block mb-3 leading-snug">
                    {lang === 'bn' ? `আপনার কোড ${shippingInfo.mobile} এ পাঠানো হয়েছে। সিমুলেশন কোড হল: 1234` : 'Simulator verification bypass code: 1234'}
                  </span>
                  <div className="flex justify-center gap-1">
                    <input
                      type="text"
                      id="input-checkout-otp"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="1234"
                      className="bg-white border border-stone-250 w-24 tracking-widest text-center py-2 text-xs font-mono font-black rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Order total list */}
              <div className="border-t border-stone-200 pt-5 space-y-1.5 text-xs font-medium text-stone-500">
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'উপ-মোট মূল্য:' : 'Subtotal:'}</span>
                  <span className="text-stone-800 font-bold">{setPriceFormat(cartSubtotal)}</span>
                </div>
                {referralDiscount > 0 && (
                  <div className="flex justify-between text-teal-700">
                    <span>{lang === 'bn' ? 'রেফারেল ডিসকাউন্ট:' : 'Referral Discount:'}</span>
                    <span className="font-bold">-{setPriceFormat(referralDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'ডেলিভারি ডেলিভারি ফি:' : 'Home Delivery Fee:'}</span>
                  <span className="text-stone-800 font-bold">{setPriceFormat(100)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm border-t border-stone-100 pt-2.5">
                  <span className="text-slate-900">{lang === 'bn' ? 'সর্বমোট প্রদেয় মূল্য:' : 'Grand Total:'}</span>
                  <span className="text-emerald-850 text-base">{setPriceFormat(cartSubtotal - referralDiscount + 100)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-checkout-confirm-place"
                  className="w-full bg-[#0d533f] hover:bg-[#093d2e] border border-[#062c21] text-white font-bold py-3.5 rounded-2xl text-xs tracking-wider cursor-pointer text-center block uppercase shadow"
                >
                  {otpSent ? (lang === 'bn' ? 'ওটিপি ভেরিফাই করে অর্ডার কনফার্ম করুন' : 'Verify & Complete Order') : (lang === 'bn' ? 'পণ্য বুকিং সম্পূর্ণ করুন' : 'Procure & Complete Checkout')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
