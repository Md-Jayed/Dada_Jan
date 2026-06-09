import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Product, OrderItem, Order } from '../types';
import { ProductDetailsPage } from './ProductDetailsPage';
import { UserProfile } from './UserProfile';
import { supabase } from '../supabaseClient';
import { getLocalizedProductName, getCategoryLabel } from '../utils/faithDate';
import { 
  ShoppingBag, CheckCircle, Video, FileText, BadgeHelp, Award, ShieldCheck, 
  MapPin, Phone, Mail, User, Percent, CreditCard, ChevronRight, X, Play, RefreshCw, Star, Info,
  Sparkles, Shirt, Flame, Smartphone, Apple, ArrowRight, ArrowLeft, Quote, Truck, Lock, Leaf, Check,
  Menu, LogOut
} from 'lucide-react';

export const CustomerPanel: React.FC = () => {
  const { 
    products, 
    partners, 
    orders, 
    placeOrder, 
    setPriceFormat, 
    lang,
    currentCustomer,
    setShowAuthTab,
    logout
  } = useApp();

  // Navigation states
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'tracking' | 'product-details' | 'profile'>('home');
  const [previousTab, setPreviousTab] = useState<'home' | 'shop' | 'tracking' | 'profile'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  useEffect(() => {
    if (currentCustomer) {
      setShippingInfo({
        name: currentCustomer.name,
        mobile: currentCustomer.mobile,
        email: currentCustomer.email,
        address: currentCustomer.address,
        district: currentCustomer.district,
        area: currentCustomer.area
      });
      setReferralCodeInput(currentCustomer.referredBy || '');
    } else {
      setShippingInfo({
        name: 'Ariful Islam Chowdhury',
        mobile: '01815566778',
        email: 'arif.chowdhury@outlook.com',
        address: 'Chowdhury Bari, Ward 3, Boalkhali Hub Area',
        district: 'Chattogram',
        area: 'Boalkhali'
      });
      setReferralCodeInput('');
    }
  }, [currentCustomer]);

  // Protect Customer Profile private view
  useEffect(() => {
    const checkProfileSession = async () => {
      if (currentTab === 'profile') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.hash = '#/login';
          setShowAuthTab('customer');
          setCurrentTab('home');
        }
      }
    };
    checkProfileSession();
  }, [currentTab, setShowAuthTab]);

  // Support swipe back gesture and physical back button navigation on mobile devices
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (currentTab === 'product-details') {
        setCurrentTab(previousTab);
        setDetailedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentTab, previousTab]);

  // Handle direct tab clicks to automatically pop the product-detail history state
  useEffect(() => {
    if (currentTab !== 'product-details' && window.history.state && window.history.state.isProductDetail) {
      window.history.back();
    }
  }, [currentTab]);
  
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
    'Dry Food',
    'Beauty & Cosmetics',
    'Fashion',
    'Perfume',
    'Gadgets & Electronics',
    'Spices'
  ];

  // Homepage selective lists with fallbacks
  const homeFeaturedSliderItems = products.filter(p => 
    ['prod-1', 'prod-2', 'prod-gadget-tasbeeh', 'prod-spice-saffron'].includes(p.id)
  );
  const finalSliderItems = homeFeaturedSliderItems.length > 0 ? homeFeaturedSliderItems : products.slice(0, 4);

  const homeFeaturedGrid = products.filter(p => 
    ['prod-1', 'prod-beauty-seedoil', 'prod-beauty-soap', 'prod-gadget-tasbeeh'].includes(p.id)
  );
  const finalFeaturedGrid = homeFeaturedGrid.length > 0 ? homeFeaturedGrid : products.slice(0, 4);

  const homeBestSellers = products.filter(p => 
    ['prod-2', 'prod-3', 'prod-spice-saffron', 'prod-6'].includes(p.id)
  );
  const finalBestSellers = homeBestSellers.length > 0 ? homeBestSellers : products.slice(Math.max(0, products.length - 4), products.length);

  const homeNewArrivals = products.filter(p => 
    ['prod-fashion-panjabi', 'prod-attar-wo', 'prod-gadget-trimmer', 'prod-spice-cinnamon'].includes(p.id)
  );
  const finalNewArrivals = homeNewArrivals.length > 0 ? homeNewArrivals : products.slice(0, Math.min(4, products.length));

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

    // Push states to browser history so swipe-back gesture and physical device back button work correctly
    if (!window.history.state || !window.history.state.isProductDetail) {
      window.history.pushState({ isProductDetail: true, productId: product.id }, '');
    }
  };

  const handleQuickBuyNow = (product: Product) => {
    setCart([{ product, quantity: 1 }]);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800 font-sans pb-16">
      {/* 1. Customer Top Nav */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 transition-shadow duration-200 shadow-xs hover:shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}>
            <span className="bg-emerald-600 text-white p-2.5 rounded-xl font-bold text-lg md:text-xl tracking-tight leading-none shadow-sm shadow-emerald-900/15">দ</span>
            <div className="flex flex-col animate-fade-in">
              <span className="font-display font-bold text-base md:text-lg leading-none tracking-wider text-emerald-800">DADAJAN</span>
              <span className="text-[9px] md:text-[10px] font-medium text-amber-700 tracking-widest uppercase mt-0.5 leading-tight">
                {lang === 'bn' ? 'সুন্নাহ ও হালাল কমার্স' : 'Faith-Centered Commerce'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
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
            {currentCustomer && (
              <button 
                id="customer-nav-profile"
                onClick={() => setCurrentTab('profile')}
                className={`font-semibold text-sm transition-colors ${currentTab === 'profile' ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1' : 'text-slate-600 hover:text-emerald-700'}`}
              >
                {lang === 'bn' ? 'আমার প্রোফাইল' : 'My Profile'}
              </button>
            )}
          </nav>

          {/* Right Controls Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop-only Profile Information */}
            <div className="hidden md:flex items-center gap-2">
              {currentCustomer ? (
                <>
                  <button 
                    id="btn-customer-profile-nav"
                    onClick={() => setCurrentTab('profile')}
                    className={`flex flex-col text-right hover:text-emerald-700 transition-colors cursor-pointer mr-1.5 ${currentTab === 'profile' ? 'text-emerald-700' : 'text-stone-800'}`}
                  >
                    <span className="text-xs font-bold leading-tight flex items-center gap-1">⚙️ {currentCustomer.name}</span>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-wider">{currentCustomer.area}</span>
                  </button>
                  <button 
                    id="btn-customer-logout"
                    onClick={async () => { await logout(); setCurrentTab('home'); }}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer border border-stone-200"
                  >
                    {lang === 'bn' ? 'লগআউট' : 'Logout'}
                  </button>
                </>
              ) : (
                <button 
                  id="btn-customer-login-trigger"
                  onClick={() => setShowAuthTab('customer')}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'bn' ? 'প্রবেশ' : 'Sign In'}</span>
                </button>
              )}
            </div>

            {/* Persistent Cart Icon */}
            <button 
              id="btn-customer-cart-icon"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 rounded-full transition-all flex items-center justify-center cursor-pointer-action"
              title="Open Bag"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-800" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold font-mono shadow-sm">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            {/* Desktop-only Shop Button */}
            <button 
              id="btn-nav-buy-direct"
              onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); }}
              className="hidden md:flex bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm px-4.5 py-2.5 rounded-lg transition-all shadow-sm items-center gap-1 cursor-pointer font-bold"
            >
              {lang === 'bn' ? 'বাজার করুন' : 'Shop Now'}
            </button>

            {/* Mobile-only Hamburger Menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-emerald-800 hover:bg-emerald-50 border border-stone-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Navigation List"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 animate-spin-once" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </header>

      {/* Elegant Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end">
          {/* Drawer backdrop overlay element */}
          <div className="absolute inset-0 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          {/* Sliding drawer list */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto border-l border-stone-200">
            <div className="space-y-6">
              {/* Drawer Header Brand */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}>
                  <span className="bg-emerald-600 text-white p-2 rounded-lg font-bold text-base leading-none">দ</span>
                  <span className="font-display font-bold text-md tracking-wider text-emerald-800">DADAJAN</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-stone-50 text-stone-500 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer User Card */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-left">
                {currentCustomer ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-emerald-605 bg-emerald-600 text-white rounded-full">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-stone-900 text-sm leading-tight">{currentCustomer.name}</p>
                        <p className="text-[10px] text-stone-450 font-mono mt-0.5">{currentCustomer.mobile}</p>
                      </div>
                    </div>
                    <div className="pt-2.5 border-t border-emerald-955/10 border-emerald-900/10 flex items-center justify-between text-[11px] font-medium">
                      <span className="font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-md">
                        {currentCustomer.area}
                      </span>
                      <button 
                        onClick={() => { setCurrentTab('profile'); setIsMobileMenuOpen(false); }}
                        className="text-emerald-700 hover:text-emerald-850 hover:underline font-bold"
                      >
                        {lang === 'bn' ? 'আমার প্রোফাইল ⚙️' : 'My Profile ⚙️'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-2 text-center">
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {lang === 'bn' 
                        ? 'আপনার অ্যাকাউন্ট সুসংগঠিত করতে এবং দ্রুত অর্ডার ট্র্যাকিং সেবা পেতে প্রবেশ করুন।' 
                        : 'Sign in to review details, tracking, and manage your personal details seamlessly.'}
                    </p>
                    <button 
                      onClick={() => { setShowAuthTab('customer'); setIsMobileMenuOpen(false); }}
                      className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {lang === 'bn' ? 'অ্যাকাউন্টে প্রবেশ করুন ✅' : 'Sign In To Account ✅'}
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer links */}
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest pl-2 mb-2 block">
                  {lang === 'bn' ? 'মেনু ডিরেক্টরি' : 'NAVIGATION DIRECTORY'}
                </span>
                
                <button 
                  onClick={() => { setCurrentTab('home'); setSelectedCategory('All'); setIsMobileMenuOpen(false); }}
                  className={`w-full py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${currentTab === 'home' ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <span>{lang === 'bn' ? 'হোম পেইজ' : 'Home'}</span>
                  <ChevronRight className={`w-4 h-4 mr-1 ${currentTab === 'home' ? 'text-emerald-600' : 'text-stone-300'}`} />
                </button>

                <button 
                  onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); setIsMobileMenuOpen(false); }}
                  className={`w-full py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${currentTab === 'shop' ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <span>{lang === 'bn' ? 'সকল পণ্য সংগ্রহ' : 'Our Collection'}</span>
                  <ChevronRight className={`w-4 h-4 mr-1 ${currentTab === 'shop' ? 'text-emerald-600' : 'text-stone-300'}`} />
                </button>

                <button 
                  onClick={() => { setCurrentTab('tracking'); setIsMobileMenuOpen(false); }}
                  className={`w-full py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${currentTab === 'tracking' ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক ও ট্র্যাকিং' : 'Order Tracking'}</span>
                  <ChevronRight className={`w-4 h-4 mr-1 ${currentTab === 'tracking' ? 'text-emerald-600' : 'text-stone-300'}`} />
                </button>

                {currentCustomer && (
                  <button 
                    onClick={() => { setCurrentTab('profile'); setIsMobileMenuOpen(false); }}
                    className={`w-full py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${currentTab === 'profile' ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    <span>{lang === 'bn' ? 'আমার প্রোফাইল' : 'My Profile'}</span>
                    <ChevronRight className={`w-4 h-4 mr-1 ${currentTab === 'profile' ? 'text-emerald-600' : 'text-stone-300'}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom buttons of Mobile drawer */}
            <div className="pt-6 border-t border-stone-100 space-y-3.5 text-center">
              <button 
                onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); setIsMobileMenuOpen(false); }}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all text-center block cursor-pointer"
              >
                🛒 {lang === 'bn' ? 'সরাসরি বাজার করুন' : 'Shop Collections'}
              </button>
              
              {currentCustomer && (
                <button 
                  onClick={async () => { await logout(); setCurrentTab('home'); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-stone-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === 'bn' ? 'লগআউট করুন' : 'Logout Account'}</span>
                </button>
              )}

              <p className="text-[10px] text-stone-400 font-medium">
                © {new Date().getFullYear()} DADAJAN Marketplace
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. PREMIUM HOMEPAGE DEFINITION */}
      {currentTab === 'home' && (
        <div className="space-y-16 pb-16">
          {/* SECTION A: HERO BANNER & CTA & SLIDER */}
          <div className="bg-gradient-to-br from-[#023e2b] via-[#022c22] to-[#011c15] text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 overflow-hidden shadow-xl border border-white/5 relative">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300/15 border border-amber-300/25 rounded-full text-amber-300 text-xs font-bold tracking-wider uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse"></span>
                  {lang === 'bn' ? '🔒 শতভাগ খাঁটি ও ইমাম দ্বারা প্রত্যায়িত' : '100% Halal Certified Marketplace'}
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
                  {lang === 'bn' ? (
                    <>হৃদয়ে বিশ্বাস, টেবিলে সুন্নাহ খাবার ও সামগ্রী</>
                  ) : (
                    <>Pure Faith-Centered Lifestyle Accessories</>
                  )}
                </h1>
                
                <p className="text-emerald-100 text-sm md:text-base max-w-xl leading-relaxed">
                  {lang === 'bn' 
                    ? 'আমাদের প্রতিটি উপহার, মধু, ঘি, আতর ও তসবিহ স্থানীয় আলেম-ওলামাদের উপস্থিতিতে সরাসরি পরীক্ষিত ও ল্যাব সার্টিফাইড। কোনো রকম ভেজালের সংশয়মুক্ত বিশ্বস্ত সরবরাহ।'
                    : 'Every single jar of honey, organic oil, and sunnah clothing is sourced directly and validated under rigid scholar criteria. Lab certification documents enclosed with every shipment.'}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); }}
                    className="px-8 py-3.5 bg-amber-450 hover:bg-amber-300 text-[#01221a] font-extrabold rounded-xl shadow-lg hover:shadow-amber-400/10 hover:scale-[1.01] transition-all text-xs uppercase cursor-pointer"
                  >
                    {lang === 'bn' ? 'স্টোর ঘুরে দেখুন 🛒' : 'Start Shopping'}
                  </button>
                  <button 
                    onClick={() => {
                      const reviewerSec = document.getElementById('why-choose-dadajan-sec');
                      if (reviewerSec) reviewerSec.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-3.5 border border-white/25 hover:border-white/55 text-white bg-white/5 hover:bg-white/10 font-bold rounded-xl transition-all text-xs uppercase cursor-pointer"
                  >
                    {lang === 'bn' ? 'আমাদের অনন্য বৈশিষ্ট্য 🛡️' : 'Why Choose Us'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 text-[11px] text-emerald-200/90 font-medium border-t border-emerald-900/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-amber-300 shrink-0" />
                    <span>{lang === 'bn' ? 'কঠোর হালাল গুণমান' : 'Halal Integrity'}</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-emerald-900/30 pl-4">
                    <Award className="w-4.5 h-4.5 text-amber-300 shrink-0" />
                    <span>{lang === 'bn' ? 'আলেম-ইমাম যাচাই' : 'Imam Approved'}</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-emerald-900/30 pl-4">
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-300 shrink-0" />
                    <span>{lang === 'bn' ? '১০০% রিফান্ড গ্যারান্টি' : '100% Cash Back'}</span>
                  </div>
                </div>
              </div>

              {/* Slider Right Panel */}
              <div className="lg:col-span-5 relative w-full flex flex-col items-center">
                <div className="w-full bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-2.5 right-2.5 bg-amber-500 text-emerald-950 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full z-10 shadow-sm animate-pulse">
                    {lang === 'bn' ? 'সেরা অফার' : 'Featured Highlight'}
                  </div>

                  {(() => {
                    const activeSlide = finalSliderItems[featuredIdx % finalSliderItems.length];
                    if (!activeSlide) return null;
                    const discountPercent = 15;
                    const discountedPrice = Math.round(activeSlide.price * (1 - discountPercent / 100));

                    return (
                      <div className="space-y-4">
                        <div className="relative w-full h-52 rounded-xl overflow-hidden bg-emerald-900/20 border border-white/10">
                          <img 
                            src={activeSlide.images[0]} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-lg">
                            {getCategoryLabel(activeSlide.category, lang)}
                          </div>
                        </div>

                        <div className="text-left space-y-1">
                          <h3 className="font-bold text-base text-white leading-tight min-h-[44px] flex items-center">
                            {getLocalizedProductName(activeSlide.name, lang)}
                          </h3>
                          
                          <div className="flex items-center gap-1.5">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-emerald-100 font-bold">({activeSlide.reviewsCount} {lang === 'bn' ? 'টি রিভিউ' : 'Reviews'})</span>
                          </div>

                          <div className="flex items-baseline gap-2 pt-2">
                            <span className="text-lg font-mono font-bold text-amber-300">{setPriceFormat(discountedPrice)}</span>
                            <span className="text-xs font-mono text-gray-400 line-through font-medium">{setPriceFormat(activeSlide.price)}</span>
                            <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">-{discountPercent}% OFF</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button 
                            onClick={() => openProductDetails(activeSlide)}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            {lang === 'bn' ? 'বিস্তারিত দেখুন 🔎' : 'View Specs'}
                          </button>
                          <button 
                            onClick={() => addToCart(activeSlide, 1, true)}
                            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                          >
                            {lang === 'bn' ? 'ব্যাগে রাখুন 🛍️' : 'Add to Bag'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <span className="text-[11px] text-emerald-200 font-mono">
                      {lang === 'bn' ? 'স্লাইড :' : 'Slide :'} <strong className="text-amber-300">{(featuredIdx % finalSliderItems.length) + 1}</strong> / {finalSliderItems.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setFeaturedIdx((prev) => (prev - 1 + finalSliderItems.length) % finalSliderItems.length)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-lg transition-colors cursor-pointer animate-none"
                        title="Previous Slider"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setFeaturedIdx((prev) => (prev + 1) % finalSliderItems.length)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-lg transition-colors cursor-pointer animate-none"
                        title="Next Slider"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: CATEGORIES GRID SECTION */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-extrabold text-amber-700 uppercase tracking-widest block mb-1.5">
                {lang === 'bn' ? 'প্রিমিয়াম ক্যাটাগরি' : 'PREMIUM DEPARTMENTS'}
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                {lang === 'bn' ? 'পছন্দসই পণ্যশ্রেণী বাছাই করুন' : 'Explore Certified Categories'}
              </h2>
              <div className="h-0.5 w-16 bg-emerald-600 mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
              {categories.filter(c => c !== 'All').map((cat) => {
                const count = products.filter(p => p.category === cat).length;
                const getCategoryIcon = (catName: string) => {
                  switch (catName) {
                    case 'Dry Food': return <Apple className="w-5 h-5 text-emerald-700" />;
                    case 'Beauty & Cosmetics': return <Sparkles className="w-5 h-5 text-amber-600" />;
                    case 'Fashion': return <Shirt className="w-5 h-5 text-indigo-700" />;
                    case 'Perfume': return <Flame className="w-5 h-5 text-teal-600" />;
                    case 'Gadgets & Electronics': return <Smartphone className="w-5 h-5 text-rose-600" />;
                    case 'Spices': return <Leaf className="w-5 h-5 text-amber-700" />;
                    default: return <ShoppingBag className="w-5 h-5 text-stone-600" />;
                  }
                };

                const getCategoryBannerImg = (catName: string) => {
                  switch (catName) {
                    case 'Dry Food': return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=300';
                    case 'Beauty & Cosmetics': return 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=300';
                    case 'Fashion': return 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=300';
                    case 'Perfume': return 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=300';
                    case 'Gadgets & Electronics': return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300';
                    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300';
                    default: return 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=300';
                  }
                };

                return (
                  <div 
                    key={cat}
                    onClick={() => { setCurrentTab('shop'); setSelectedCategory(cat); }}
                    className="group bg-white rounded-2xl border border-stone-200/70 p-4 text-center cursor-pointer shadow-xs hover:shadow-md hover:border-emerald-600/30 transition-all flex flex-col justify-between h-full hover:-translate-y-1 duration-300"
                  >
                    <div className="space-y-3">
                      <div className="relative w-full h-24 rounded-xl overflow-hidden bg-stone-50">
                        <img 
                          src={getCategoryBannerImg(cat)} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent flex items-end justify-center pb-2">
                          <div className="p-1.5 bg-white/95 backdrop-blur-xs rounded-lg shadow-sm">
                            {getCategoryIcon(cat)}
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-xs md:text-sm text-stone-900 leading-tight group-hover:text-emerald-700 transition-colors">
                        {getCategoryLabel(cat, lang)}
                      </h3>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-450">
                      <span className="font-mono font-medium">{count} {lang === 'bn' ? 'টি পণ্য' : 'Items'}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-emerald-700 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION C: FEATURED PRODUCTS GRID WITH COMPREHENSIVE CARDS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 pb-3 border-b border-stone-200/75">
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  {lang === 'bn' ? 'আজকের সুনাহ সংগ্রহ' : 'TODAY\'S REVELATIONS'}
                </span>
                <h3 className="text-xl md:text-3xl font-serif font-bold text-slate-900">
                  {lang === 'bn' ? 'বিশেষভাবে নির্বাচিত খাঁটি পণ্যসমূহ' : 'Featured Marketplace Goods'}
                </h3>
              </div>
              <button 
                onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>{lang === 'bn' ? 'সকল পণ্য সংগ্রহ' : 'Explore Store'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {finalFeaturedGrid.map((product) => {
                const saving = 10;
                const finalPrice = Math.round(product.price * (1 - saving / 100));
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group relative">
                    <div className="relative">
                      <div className="w-full h-32 sm:h-48 bg-stone-50 overflow-hidden relative" onClick={() => openProductDetails(product)}>
                        <img 
                          src={product.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 cursor-pointer"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.certificationStatus.imamVerified && (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-700/90 backdrop-blur-md text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm">
                              ✓ {lang === 'bn' ? 'ইমাম প্রত্যায়িত' : 'Imam Verified'}
                            </span>
                          )}
                          {product.certificationStatus.labTested && (
                            <span className="inline-flex items-center gap-0.5 bg-amber-600/90 backdrop-blur-md text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm">
                              ✓ {lang === 'bn' ? 'ল্যাব পরীক্ষিত' : 'Lab Tested'}
                            </span>
                          )}
                        </div>

                        <span className="absolute top-2 right-2 bg-red-500 text-white font-bold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded">
                          -{saving}%
                        </span>
                      </div>
                      
                      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-left">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase text-amber-700 tracking-wider font-mono">
                          {getCategoryLabel(product.category, lang)}
                        </span>

                        <h4 
                          onClick={() => openProductDetails(product)}
                          className="font-bold text-stone-900 text-xs sm:text-sm leading-snug cursor-pointer hover:text-emerald-700 transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px]"
                        >
                          {getLocalizedProductName(product.name, lang)}
                        </h4>

                        <div className="flex items-center gap-1" title={`${product.rating}/5 Rating`}>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 font-bold">({product.reviewsCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 pt-0 text-left space-y-2.5 sm:space-y-3">
                      <div className="flex flex-wrap items-baseline gap-1 sm:gap-1.5">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-stone-900">{setPriceFormat(finalPrice)}</span>
                        <span className="font-mono text-[10px] sm:text-xs text-stone-400 line-through">{setPriceFormat(product.price)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button 
                          onClick={() => openProductDetails(product)}
                          className="py-1.5 px-1 sm:px-2 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-lg text-[10px] sm:text-xs transition-colors cursor-pointer text-center"
                        >
                          {lang === 'bn' ? 'বিস্তারিত' : 'Detail'}
                        </button>
                        <button 
                          onClick={() => addToCart(product, 1, true)}
                          className="py-1.5 px-1 sm:px-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[10px] sm:text-xs transition-colors shadow-sm cursor-pointer text-center"
                        >
                          🛍️ {lang === 'bn' ? 'যুক্ত করুন' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION D: BEST SELLING PRODUCTS (HIGHEST RATED) */}
          <div className="bg-[#022c22] text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  {lang === 'bn' ? 'জনপ্রিয় ও সর্বোচ্চ বিক্রীত' : 'CROWD FAVORITES'}
                </span>
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-white">
                  {lang === 'bn' ? 'গ্রাহকদের পছন্দের তালিকার শীর্ষে' : 'Best Selling Collection'}
                </h3>
                <div className="h-0.5 w-16 bg-amber-400 mx-auto mt-4"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {finalBestSellers.map((product) => {
                  return (
                    <div key={product.id} className="bg-white/5 rounded-2xl border border-emerald-800/60 overflow-hidden shadow-md flex flex-col justify-between h-full group">
                      <div className="relative">
                        <div className="w-full h-32 sm:h-44 overflow-hidden" onClick={() => openProductDetails(product)}>
                          <img 
                            src={product.images[0]} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 cursor-pointer"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-left">
                          <span className="text-[9px] font-bold text-amber-350 font-mono tracking-widest uppercase block">
                            {getCategoryLabel(product.category, lang)}
                          </span>
                          <h4 
                            onClick={() => openProductDetails(product)}
                            className="font-bold text-white text-xs sm:text-sm cursor-pointer hover:text-amber-300 transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px]"
                          >
                            {getLocalizedProductName(product.name, lang)}
                          </h4>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                            <span className="text-[9px] text-emerald-100 font-mono">({product.reviewsCount})</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 pt-0 text-left space-y-2.5 sm:space-y-3">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-amber-300 block">{setPriceFormat(product.price)}</span>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          <button 
                            onClick={() => openProductDetails(product)}
                            className="py-1.5 px-1 sm:px-2 bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-800/85 text-emerald-100 font-bold rounded-lg text-[10px] sm:text-xs transition-colors cursor-pointer animate-none text-center"
                          >
                            {lang === 'bn' ? 'বিস্তারিত' : 'Detail'}
                          </button>
                          <button 
                            onClick={() => addToCart(product, 1, true)}
                            className="py-1.5 px-1 sm:px-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold rounded-lg text-[10px] sm:text-xs transition-colors cursor-pointer shadow-sm text-center"
                          >
                            🛍️ {lang === 'bn' ? 'যুক্ত করুন' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION E: NEW ARRIVALS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-2">
                {lang === 'bn' ? 'নতুন পণ্য সংযোজন' : 'FRESH ACQUISITIONS'}
              </span>
              <h3 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">
                {lang === 'bn' ? 'ন্যায্য মূল্যে নতুন আগমনী সামগ্রী' : 'New Arrivals'}
              </h3>
              <div className="h-0.5 w-16 bg-emerald-600 mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {finalNewArrivals.map((product) => {
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group">
                    <div className="relative">
                      <div className="w-full h-32 sm:h-44 bg-stone-50 overflow-hidden relative" onClick={() => openProductDetails(product)}>
                        <img 
                          src={product.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 cursor-pointer animate-none"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 bg-emerald-800/90 text-white font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                          {lang === 'bn' ? 'নতুন' : 'New'}
                        </span>
                      </div>
                      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-left">
                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 font-mono uppercase tracking-wider block">
                          {getCategoryLabel(product.category, lang)}
                        </span>
                        <h4 
                          onClick={() => openProductDetails(product)}
                          className="font-bold text-stone-900 text-xs sm:text-sm cursor-pointer hover:text-emerald-700 transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px]"
                        >
                          {getLocalizedProductName(product.name, lang)}
                        </h4>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-[9px] text-stone-400 font-bold ml-1">({product.reviewsCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 pt-0 text-left space-y-2.5 sm:space-y-3">
                      <span className="font-mono text-sm sm:text-base font-extrabold text-stone-900 block">{setPriceFormat(product.price)}</span>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button 
                          onClick={() => openProductDetails(product)}
                          className="py-1.5 px-1 sm:px-2 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold rounded-lg text-[10px] sm:text-xs transition-colors cursor-pointer text-center"
                        >
                          {lang === 'bn' ? 'বিস্তারিত' : 'Detail'}
                        </button>
                        <button 
                          onClick={() => addToCart(product, 1, true)}
                          className="py-1.5 px-1 sm:px-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[10px] sm:text-xs transition-colors cursor-pointer shadow-sm text-center"
                        >
                          🛍️ {lang === 'bn' ? 'যুক্ত করুন' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION F: SPECIAL OFFERS BANNER */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 md:p-10 text-emerald-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-amber-400/20 relative overflow-hidden">
              <div className="absolute -left-12 -top-12 w-44 h-44 bg-white/10 rounded-full filter blur-xl pointer-events-none"></div>
              <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-white/10 rounded-full filter blur-xl pointer-events-none"></div>

              <div className="text-left space-y-3 relative z-10 max-w-2xl">
                <span className="bg-[#022c22] text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {lang === 'bn' ? 'সীমিত সময়ের অফার' : 'FLASH CAMPAIGN'}
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-extrabold leading-tight">
                  {lang === 'bn' 
                    ? 'রবিউল আওয়াল স্পেশাল উৎসব ও ১০% অতিরিক্ত ক্যাশব্যাক!' 
                    : 'Sunnah Gathering Feast: 10% Extra Cashback!'}
                </h3>
                <p className="text-xs md:text-sm text-emerald-950/90 font-medium leading-relaxed">
                  {lang === 'bn'
                    ? 'যেকোনো ক্যাটাগরির অর্ডারে কুপন কোড "SUNNAH10" ব্যবহার করে উপভোগ করুন ১০% ছাড়। বিকাশ বা নগদ পেমেন্টে আরও অতিরিক্ত নিশ্চিত ৫% ক্যাশব্যাক সরাসরি ওয়ালেটে!'
                    : 'Apply coupon code "SUNNAH10" at secure checkout and enjoy 10% instant price reductions. Fast and safe dispatch with bKash and Nagad payment support.'}
                </p>
              </div>

              <div className="shrink-0 relative z-10 bg-[#022c22] text-amber-300 p-6 rounded-2xl flex flex-col items-center justify-center border border-amber-300/10 min-w-[220px]">
                <span className="text-[10px] text-white uppercase tracking-widest font-bold mb-1">{lang === 'bn' ? 'কুপন কোড' : 'PROMO KEY'}</span>
                <span className="text-2xl font-mono font-extrabold tracking-wider bg-emerald-900 border border-emerald-800/60 px-4 py-1.5 rounded-xl text-white select-all">
                  SUNNAH10
                </span>
                <button 
                  onClick={() => { setCurrentTab('shop'); setSelectedCategory('All'); }}
                  className="mt-4 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold rounded-lg text-xs uppercase cursor-pointer w-full text-center transition-all animate-none"
                >
                  {lang === 'bn' ? 'অফারটি নিন ⚡' : 'Claim Now'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION G: WHY CHOOSE DADAJAN */}
          <div id="why-choose-dadajan-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-2">
                {lang === 'bn' ? 'আমাদের ওয়াদা ও প্রতিশ্রুতি' : 'WHY DADAJAN IS DIFFERENT'}
              </span>
              <h3 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">
                {lang === 'bn' ? 'আমরা কেন শতভাগ বিশ্বস্ত ও অনন্য?' : 'Why Choose Dadajan'}
              </h3>
              <p className="text-xs text-stone-500 mt-2">
                {lang === 'bn' ? 'একটি সুখী ও হালাল মুসলিম পরিবারের সুস্থ দৈনন্দিন লাইফস্টাইল গঠনে আমরা প্রতিশ্রুতিবদ্ধ।' : 'Sustaining true halal guidelines to support beautiful Muslim homes.'}
              </p>
              <div className="h-0.5 w-16 bg-emerald-600 mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Option 1: Genuine Products */}
              <div className="bg-white rounded-2xl border border-stone-200/75 p-6 text-left space-y-4 shadow-xs">
                <div className="p-3 bg-emerald-50 rounded-xl w-12 h-12 flex items-center justify-center text-emerald-850 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-[#022c22] text-sm md:text-base leading-snug">{lang === 'bn' ? 'শতভাগ আসল পণ্য' : 'Genuine Products'}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {lang === 'bn' 
                      ? 'অর্গানিক ও ভেজালমুক্ত বিশুদ্ধতার নিশ্চয়তা সহ কোনো সিন্থেটিক গন্ধ বা কেমিক্যাল বিহীন খামারী বিশুদ্ধ পণ্য।'
                      : 'Authenticity confirmed. Zero chemical additives or sucrose in our wild forest honey harvests.'}
                  </p>
                </div>
              </div>

              {/* Option 2: Fast Delivery */}
              <div className="bg-white rounded-2xl border border-stone-200/75 p-6 text-left space-y-4 shadow-xs">
                <div className="p-3 bg-amber-50 rounded-xl w-12 h-12 flex items-center justify-center text-amber-700 font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-[#022c22] text-sm md:text-base leading-snug">{lang === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {lang === 'bn' 
                      ? 'খুব দ্রুত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আপনার বিশ্বস্ত এলাকা-ভিত্তিক ইমাম ও ডিলার অংশীদারদের মাধ্যমে সরাসরি ডেলিভারি।'
                      : 'Immediate dispatch directly through our local network hubs straight to your home address.'}
                  </p>
                </div>
              </div>

              {/* Option 3: Secure Payments */}
              <div className="bg-white rounded-2xl border border-stone-200/75 p-6 text-left space-y-4 shadow-xs">
                <div className="p-3 bg-teal-50 rounded-xl w-12 h-12 flex items-center justify-center text-teal-850 font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-[#022c22] text-sm md:text-base leading-snug">{lang === 'bn' ? 'নিরাপদ পেমেন্ট গেটওয়ে' : 'Secure Payments'}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {lang === 'bn' 
                      ? 'পণ্য হাতে পেয়ে আস্থার সাথে ক্যাশ অন ডেলিভারি অথবা এনক্রিপ্টেড বিকাশ/নগদে নিরাপদ পেমেন্টের সুবর্ণ সুবিধা।'
                      : 'Completely risk-free payments via SSL-certified bKash or convenient Cash on Delivery.'}
                  </p>
                </div>
              </div>

              {/* Option 4: Trusted Marketplace */}
              <div className="bg-white rounded-2xl border border-stone-200/75 p-6 text-left space-y-4 shadow-xs">
                <div className="p-3 bg-orange-50 rounded-xl w-12 h-12 flex items-center justify-center text-orange-700 font-bold">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-[#022c22] text-sm md:text-base leading-snug">{lang === 'bn' ? 'সত্যিকারের সোর্সিং' : 'Trusted Marketplace'}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {lang === 'bn' 
                      ? 'হাজারো সচেতন মুসলিম পরিবারের আস্থার ঠিকানা। আলেমদের স্বচক্ষে তত্ত্বাবধানে উৎসস্থল হতে পণ্য সংগ্রহের প্রমাণ।'
                      : 'Blessed community workspace distributing equitable shares to verified local Imams with utmost integrity.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION H: CUSTOMER REVIEWS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-2">
                {lang === 'bn' ? 'গ্রাহকদের সন্তুষ্টির প্রমাণ' : 'TESTIMONIALS OF TRUTH'}
              </span>
              <h3 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">
                {lang === 'bn' ? 'আমাদের প্রতি শুভাকাঙ্ক্ষীদের মন্তব্য' : 'What Our Buyers Say'}
              </h3>
              <div className="h-0.5 w-16 bg-emerald-600 mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Review 1 */}
              <div className="bg-white rounded-2xl border border-stone-200/70 p-6 text-left flex flex-col justify-between h-full shadow-xs">
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-450" />
                    ))}
                  </div>
                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed italic">
                    {lang === 'bn'
                      ? '"সুন্দরবনের খলিশা মধু কেনার পর সত্যিই অবাক হয়েছি। বোতল খোলার সাথেই অতুলনীয় ঘ্রাণ আর স্বাদ। সবচেয়ে বড় কথা, পণ্যটির সোর্সিং ভিডিও আমাদের মনে অগাধ বিশ্বাস এনে দিয়েছে। জাযাকাল্লাহু খাইরান!"'
                      : '"The Sundarbans Honey tastes amazing. It came beautifully packed with a lab analysis report copy. Sourcing live video gave us absolute peace of mind. Exceptional service!"'}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-stone-100 mt-6 md:mt-8">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm">
                    ম
                  </div>
                  <div>
                    <h5 className="font-extrabold text-stone-900 text-xs md:text-sm">Md. Nasir Uddin</h5>
                    <p className="text-[10px] text-stone-400 font-mono font-bold uppercase">{lang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, BD'}</p>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="bg-white rounded-2xl border border-stone-200/70 p-6 text-left flex flex-col justify-between h-full shadow-xs">
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-450" />
                    ))}
                  </div>
                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed italic">
                    {lang === 'bn'
                      ? '"দাদাজান মখমল জায়নামাজ আর জাফরান সাবান অর্ডার করেছিলাম। কাপড়ের বুনন সুনিপুণ ও জাফরান সাবানের মৃদু ঘ্রাণটি ভীষণ চমৎকার। দাড়ি ট্রিমারটির ধারণক্ষমতা দীর্ঘস্থায়ী।"'
                      : '"Ordered the Shahi Panjabi for my father and the saffron soap. The cotton is high-quality and soft. Trimmer is precise with low heat output. Highly recommended!"'}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-stone-100 mt-6 md:mt-8">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-sm">
                    ফ
                  </div>
                  <div>
                    <h5 className="font-extrabold text-stone-900 text-xs md:text-sm">Fatima Syeda</h5>
                    <p className="text-[10px] text-stone-400 font-mono font-bold uppercase">{lang === 'bn' ? 'সিলেট, বাংলাদেশ' : 'Sylhet, BD'}</p>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="bg-white rounded-2xl border border-stone-200/70 p-6 text-left flex flex-col justify-between h-full shadow-xs">
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-450" />
                    ))}
                  </div>
                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed italic">
                    {lang === 'bn'
                      ? '"স্মার্ট তসবিহ কাউন্টার আর জেন্নাতুল ফেরদৌস আতরের জোড় চমৎকার। প্রতিটি তাসবিহ জিকিরে কম্পন সংকেত দারুণ সাহায্য করে। পেমেন্ট পদ্ধতিও খুবই সাবলীল ও সৎ।"'
                      : '"The smart tasbeeh counter and white oud are outstanding. I can carry my daily dhikr with vibration cues at night easily. Alhamdulillah for DADAJAN! Barakah always."'}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-stone-100 mt-6 md:mt-8">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-850 text-sm">
                    ক
                  </div>
                  <div>
                    <h5 className="font-extrabold text-stone-900 text-xs md:text-sm">Maulana Kabir Ahmed</h5>
                    <p className="text-[10px] text-stone-400 font-mono font-bold uppercase">{lang === 'bn' ? 'চট্টগ্রাম, বাংলাদেশ' : 'Chattogram, BD'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Product Category Filters & Product List (Shop tab shows this exclusively now) */}
      {currentTab === 'shop' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-transparent">
          <div className="mb-6 pt-4">
            <h1 className="text-2xl font-display font-extrabold text-stone-900 tracking-tight">
              {lang === 'bn' ? 'দাদাজান সামগ্রী বুকশেলফ ও স্টোর' : 'DadaJan Premium Products'}
            </h1>
            <p className="text-sm text-stone-500">
              {lang === 'bn' ? 'সরাসরি প্রডিউসার থেকে সংগৃহীত খাঁটি সুনাহ খাদ্য ও সামগ্রী।' : 'Ethical, lab-tested foods, Sunnah clothes, and prayer mats.'}
            </p>
          </div>

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
                  {getCategoryLabel(cat, lang)}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-white rounded-2xl border border-stone-200/50 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  {/* Product Media Area */}
                  <div className="relative bg-stone-50 h-32 sm:h-48 overflow-hidden shrink-0 cursor-pointer" onClick={() => openProductDetails(p)}>
                    <img
                      src={p.images[0]}
                      alt={getLocalizedProductName(p.name, lang)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {p.certificationStatus.imamVerified && (
                        <span className="bg-emerald-700/90 text-white font-semibold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 sm:gap-1 backdrop-blur-xs tracking-wide">
                          <Award className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                          <span className="hidden xs:inline">{lang === 'bn' ? 'ইমাম অনুমোদিত' : 'Imam Verified'}</span>
                          <span className="xs:hidden">{lang === 'bn' ? 'ইমাম' : 'Imam'}</span>
                        </span>
                      )}
                      {p.certificationStatus.labTested && (
                        <span className="bg-stone-900/80 text-emerald-450 font-bold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 sm:gap-1 backdrop-blur-xs tracking-wide">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="hidden xs:inline">{lang === 'bn' ? 'ল্যাব সার্টিফাইড' : 'Lab Verified'}</span>
                          <span className="xs:hidden">{lang === 'bn' ? 'ল্যাব' : 'Lab'}</span>
                        </span>
                      )}
                    </div>
                    {p.stockQty <= 5 && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                        {lang === 'bn' ? 'সীমিত' : 'Low'}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-700">{getCategoryLabel(p.category, lang)}</span>
                      <h3 
                        onClick={() => openProductDetails(p)}
                        className="font-display font-extrabold text-xs sm:text-sm text-stone-900 hover:text-emerald-850 cursor-pointer mt-1 mb-1.5 line-clamp-2 h-9 sm:h-10 leading-snug"
                      >
                        {getLocalizedProductName(p.name, lang)}
                      </h3>
                      <div className="text-[9px] sm:text-[11px] text-stone-500 mb-2 sm:mb-4 line-clamp-1">
                        📍 {p.origin}
                      </div>
                    </div>

                    {/* Actions & Price */}
                    <div>
                      <div className="flex items-baseline justify-between mb-2.5 sm:mb-3 border-t border-stone-100 pt-2.5 sm:pt-3">
                        <span className="text-[10px] sm:text-xs font-medium text-stone-400">{lang === 'bn' ? 'মূল্য:' : 'Price:'}</span>
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">{setPriceFormat(p.price)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          id={`btn-cart-${p.id}`}
                          onClick={() => addToCart(p)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded-lg transition-colors cursor-pointer border border-emerald-150 text-center"
                        >
                          {lang === 'bn' ? 'কার্টে যোগ' : 'Add Card'}
                        </button>
                        <button
                          id={`btn-buy-${p.id}`}
                          onClick={() => handleQuickBuyNow(p)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] sm:text-[11px] font-bold py-2 px-1 rounded-lg transition-all cursor-pointer shadow-xs text-center"
                        >
                          {lang === 'bn' ? 'কিনুন' : 'Buy Now'}
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
                    // RLS POLICY ENFORCEMENT: Customer can only access their own data
                    if (currentCustomer && (target.customerEmail.toLowerCase() !== currentCustomer.email.toLowerCase() && target.customerMobile !== currentCustomer.mobile)) {
                      alert(lang === 'bn' 
                        ? 'অ্যাক্সেস অস্বীকৃত: আপনি কেবল নিজের অর্ডার ট্র্যাক করতে পারেন (Supabase RLS Policy সীমাবদ্ধতা)।' 
                        : 'Access Denied: You can only query your own orders (Enforced by Supabase RLS Policy Isolation).');
                    } else {
                      setOrderCompleteData(target);
                    }
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
            // Trigger browser's back navigation to pop the history state and close details via the popstate listener
            window.history.back();
          }}
          addToCart={(prod, qty, openCart) => addToCart(prod, qty, openCart)}
          handleQuickBuyNow={handleQuickBuyNow}
          setPriceFormat={setPriceFormat}
          lang={lang}
          partners={partners}
        />
      )}

      {/* 4.6 Secure User Profile View */}
      {currentTab === 'profile' && (
        <UserProfile />
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
                        <span className="text-[9px] font-bold text-amber-700 tracking-wider block uppercase">{getCategoryLabel(item.product.category, lang)}</span>
                        <h4 className="font-bold text-xs text-stone-900 truncate leading-snug mb-1">{getLocalizedProductName(item.product.name, lang)}</h4>
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
