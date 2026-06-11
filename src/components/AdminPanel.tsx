import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { navigateToRoute } from '../navigation';
import { Product, Partner, Order, Withdrawal, Category, Coupon } from '../types';
import { supabase } from '../supabaseClient';
import { SupabaseRLSConsole } from './SupabaseRLSConsole';
import { getCategoryLabel, getLocalizedProductName } from '../utils/faithDate';
import { 
  Users, Layers, ShoppingCart, Percent, TrendingUp, AlertTriangle, Shield, 
  MapPin, Plus, Edit3, Trash2, Check, X, FileText, ArrowDown, ArrowUp, Activity, PieChart,
  Database, RefreshCw
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    products, 
    partners, 
    orders, 
    withdrawals, 
    notifications, 
    customers, 
    setPriceFormat, 
    updateOrderStatus, 
    approvePartner, 
    addNewProduct, 
    editProduct, 
    deleteProduct, 
    syncProductsWithSupabase,
    supabaseStatus,
    supabaseErrorMsg,
    approveWithdrawal,
    lang,
    isAdminLoggedIn,
    logout,
    setShowAuthTab,
    categories,
    coupons,
    addCategory,
    editCategory,
    deleteCategory,
    addCoupon,
    editCoupon,
    deleteCoupon,
    placeOrder
  } = useApp();

  // Dynamic Session Protection Guard
  useEffect(() => {
    const checkAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !isAdminLoggedIn) {
        navigateToRoute({ type: 'login' });
        setShowAuthTab('admin');
      }
    };
    checkAdminSession();
  }, [isAdminLoggedIn, setShowAuthTab]);

  // Admin subsystem sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'verify' | 'commissions' | 'inventory' | 'orders' | 'products' | 'finance' | 'analytics' | 'database' | 'categories' | 'coupons' | 'manual-orders'>('analytics');
  
  // Active simulated ERP role
  const [erpRole, setErpRole] = useState<'Super Admin' | 'Inventory Manager' | 'Finance Manager' | 'Customer Support'>('Super Admin');

  // Product CRUD states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);
  const [syncStatusIcon, setSyncStatusIcon] = useState<'idle' | 'success' | 'fail'>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Product Search, Filtering and Multi-Selection States
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('All');
  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([]);

  // Dynamic Category Creation and Catalog states
  const [newCatName, setNewCatName] = useState('');
  const [newCatBnName, setNewCatBnName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  // Dynamic Coupon States
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCouponData, setNewCouponData] = useState({
    code: '',
    discountType: 'Percentage' as 'Percentage' | 'Fixed',
    amount: 0,
    minOrderAmount: 0,
    usageLimit: 0,
    isActive: true
  });

  // Manual Order states
  const [manualOrderItems, setManualOrderItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [manualCustDetails, setManualCustDetails] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    district: '',
    area: '',
    referralCode: '',
    paymentMethod: 'Cash on Delivery' as any
  });
  const [manualOrderCoupon, setManualOrderCoupon] = useState<Coupon | null>(null);

  // Custom modals as replacement for window.alert and window.confirm within iframe sandbox
  const [modalConfirm, setModalConfirm] = useState<{
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [modalAlert, setModalAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: '',
    message: ''
  });

  const triggerAlert = (title: string, message: string) => {
    setModalAlert({ show: true, title, message });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => {
    setModalConfirm({
      show: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const allCategoriesList = Array.from(new Set([
    ...categories.filter(c => c.isActive).map(c => c.name),
    ...products.map(p => p.category)
  ])).filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(prodSearchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(prodSearchQuery.toLowerCase());
    const matchesCategory = prodCategoryFilter === 'All' || p.category === prodCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProdIds.includes(p.id));

  const toggleProdSelection = (id: string) => {
    setSelectedProdIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllFilteredProducts = () => {
    if (allFilteredSelected) {
      const filteredIds = filteredProducts.map(p => p.id);
      setSelectedProdIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredProducts.map(p => p.id);
      setSelectedProdIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const [newProdData, setNewProdData] = useState({
    name: '',
    sku: '',
    category: 'Dry Food',
    price: 0,
    costPrice: 0,
    stockQty: 10,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-dripping-olive-oil-42289-large.mp4',
    origin: '',
    ingredients: '',
    description: '',
    images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=400']
  });

  // Calculate ERP KPIs
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  
  const calculateTotalCost = () => {
    let totalCost = 0;
    orders.forEach(o => {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const unitCost = prod ? prod.costPrice : item.price * 0.7;
        totalCost += unitCost * item.quantity;
      });
    });
    return totalCost;
  };
  
  const totalCost = calculateTotalCost();
  const totalCommissionExpense = withdrawals.filter(w => w.status === 'Approved').reduce((acc, w) => acc + w.amount, 0) + 
                                 orders.reduce((acc, o) => {
                                   if (o.status === 'Delivered') {
                                     // Imam 2.5%, Dealer 6%
                                     let comm = o.total * (o.referralCode ? 0.085 : 0.06);
                                     return acc + comm;
                                   }
                                   return acc;
                                 }, 0);

  const netCompanyProfit = totalRevenue - totalCost - totalCommissionExpense;

  // Handles export simulations
  const handleExport = (format: 'Excel' | 'PDF' | 'CSV') => {
    alert(`Exporting DadaJan Enterprise Reports in ${format} format... Please wait while system compiles CSV sheets.`);
    setTimeout(() => {
      alert(`Download complete! DadaJan_Financials_ActiveWorkspace_${Date.now()}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`);
    }, 1000);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdData.name || !newProdData.sku) return;

    addNewProduct({
      name: newProdData.name,
      sku: newProdData.sku,
      category: newProdData.category,
      price: Number(newProdData.price),
      costPrice: Number(newProdData.costPrice),
      stockQty: Number(newProdData.stockQty),
      videoUrl: newProdData.videoUrl,
      certificationStatus: {
        imamVerified: true,
        labTested: true,
        certifiedAuthentic: true
      },
      origin: newProdData.origin || 'Imported Sourcing',
      ingredients: newProdData.ingredients || 'Organic ingredients blend',
      description: newProdData.description || 'Premium ethical supply Chain.',
      images: newProdData.images,
    });

    setIsAddingProduct(false);
    setNewProdData({
      name: '',
      sku: '',
      category: 'Dry Food',
      price: 0,
      costPrice: 0,
      stockQty: 10,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-dripping-olive-oil-42289-large.mp4',
      origin: '',
      ingredients: '',
      description: '',
      images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=400']
    });
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      editProduct(editingProduct);
      setEditingProduct(null);
      alert(lang === 'bn' ? 'প্রোডাক্ট তথ্য সফলভাবে আপডেট করা হয়েছে!' : 'Product catalog updated successfully!');
    }
  };

  const triggerProductsSync = async () => {
    setIsSyncingProducts(true);
    setSyncStatusIcon('idle');
    setSyncMessage(lang === 'bn' ? 'Supabase এর সাথে প্রোডাক্ট মেলাচ্ছি...' : 'Syncing products with Supabase...');
    
    let success = false;
    let errMsg = '';
    
    try {
      const res = await syncProductsWithSupabase();
      if (res.success) {
        success = true;
        setSyncStatusIcon('success');
        setSyncMessage(
          lang === 'bn' 
            ? `সফলভাবে মোট ${res.count} টি প্রোডাক্ট সিঙ্ক করা হয়েছে!` 
            : `Success! Synchronized ${res.count} products with Database.`
        );
      } else {
        errMsg = res.error || 'Unknown error';
        setSyncStatusIcon('fail');
        setSyncMessage(
          lang === 'bn' 
            ? `ব্যর্থ হয়েছে: ${errMsg}` 
            : `Failed: ${errMsg}`
        );
      }
    } catch (err: any) {
      errMsg = err.message || 'Sync failed.';
      setSyncStatusIcon('fail');
      setSyncMessage(errMsg);
    } finally {
      setIsSyncingProducts(false);
      
      const isColumnErr = errMsg.toLowerCase().includes('column') || errMsg.toLowerCase().includes('is_featured') || errMsg.toLowerCase().includes('not found');
      if (!isColumnErr && success) {
        setTimeout(() => {
          setSyncMessage(null);
        }, 5000);
      }
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;
    if (allCategoriesList.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
      alert(lang === 'bn' ? 'এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে!' : 'This category already exists!');
      return;
    }
    // Router to global context
    addCategory({ name: cleanName, bnName: cleanName, description: '', isActive: true });
    setNewCatName('');
    setShowNewCatInput(false);
    alert(lang === 'bn' ? 'নতুন ক্যাটাগরি তৈরি সফল হয়েছে!' : 'New category created successfully!');
  };

  // Find Pending Imam Verifications
  const pendingPartners = partners.filter(p => p.verifiedStatus === 'Pending');

  // Withdrawal requests
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'Pending');

  return (
    <div className="bg-[#FAF9F5] min-h-screen pb-16 font-sans">
      
      {/* ERP Top Branding Bar */}
      <div className="bg-slate-900 text-white p-5 border-b border-amber-500/35 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
        <div>
          <span className="text-[10px] bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded tracking-widest uppercase">
            DADAJAN CLOUD ERP
          </span>
          <h1 className="text-lg md:text-xl font-display font-extrabold tracking-tight mt-1 flex items-center gap-2">
            Enterprise Resources Administration
          </h1>
        </div>

        {/* Roles Select element (Requested "Super Admin, Inventory Manager, Support", etc) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Shield className="w-4 h-4 text-amber-505" />
            <span className="text-xs text-slate-400 font-medium">Active Department:</span>
            <select
              id="erp-role-switcher"
              value={erpRole}
              onChange={(e) => setErpRole(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-amber-400 font-bold px-2.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              <option value="Super Admin">Super Admin (সুপার এডমিন)</option>
              <option value="Inventory Manager">Inventory Manager (ইনভেন্টরি)</option>
              <option value="Finance Manager">Finance Manager (হিসাবরক্ষক)</option>
              <option value="Customer Support">Customer Support (সার্ভিস)</option>
            </select>
          </div>
          {isAdminLoggedIn && (
            <button
              id="btn-admin-logout"
              onClick={async () => { await logout(); }}
              className="px-3 py-2 bg-red-653 hover:bg-red-700 text-white border border-red-800 rounded-lg text-xs font-bold font-sans cursor-pointer transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs nav for CRM/ERP functions */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex gap-1 pt-1.5 scrollbar-none">
          <button
            id="tab-erp-analytics"
            onClick={() => setActiveSubTab('analytics')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'analytics' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '📊 পারফরম্যান্স অ্যানালিটিক্স' : '📊 Performance Analytics'}
          </button>
          <button
            id="tab-erp-verify"
            onClick={() => setActiveSubTab('verify')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'verify' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '🕌 পার্টনার ভেরিফিকেশন' : '🕌 Partner Verification'}
            {pendingPartners.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {pendingPartners.length}
              </span>
            )}
          </button>
          <button
            id="tab-erp-orders"
            onClick={() => setActiveSubTab('orders')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'orders' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '🗺️ ভূ-স্থানিক অর্ডার বন্টন' : '🗺️ Order Geo-Assignment'}
          </button>
          <button
            id="tab-erp-commissions"
            onClick={() => setActiveSubTab('commissions')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'commissions' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '🪙 স্বয়ংক্রিয় কমিশন বন্টন' : '🪙 Auto Commission Splits'}
          </button>
          <button
            id="tab-erp-inventory"
            onClick={() => setActiveSubTab('inventory')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'inventory' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '📦 হাব ইনভেন্টরি ম্যানেজমেন্ট' : '📦 Hub Inventory Management'}
          </button>
          <button
            id="tab-erp-products"
            onClick={() => setActiveSubTab('products')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'products' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '⚙️ প্রোডাক্ট ক্যাটালগ ম্যানেজার' : '⚙️ Product Catalog Manager'}
          </button>
          <button
            id="tab-erp-finance"
            onClick={() => setActiveSubTab('finance')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'finance' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '💵 পেআউট ও ফাইন্যান্স বই' : '💵 Financial Payouts Ledger'}
            {pendingWithdrawals.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>
          <button
            id="tab-erp-database"
            onClick={() => setActiveSubTab('database')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'database' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '🛡️ সুপাবেস আরএলএস ডাটা সিকিউরিটি' : '🛡️ Supabase RLS Policies'}
          </button>
          <button
            id="tab-erp-categories"
            onClick={() => setActiveSubTab('categories')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'categories' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '📂 ক্যাটাগরি ম্যানেজার' : '📂 WooCommerce Categories'}
          </button>
          <button
            id="tab-erp-coupons"
            onClick={() => setActiveSubTab('coupons')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'coupons' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '🎟️ ডিসকাউন্ট কুপন বুক' : '🎟️ WooCommerce Coupons'}
          </button>
          <button
            id="tab-erp-manual-orders"
            onClick={() => setActiveSubTab('manual-orders')}
            className={`py-3 px-4 rounded-t-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'manual-orders' 
                ? 'bg-amber-600 text-white border-b-2 border-amber-600' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '🛒 ম্যানুয়াল অর্ডার (POS)' : '🛒 Manual Order (POS)'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* TAB A: ANALYTICS (Requested Pie/Bar reports via custom high fidelity SVG indicators) */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6 text-left">
            {/* Quick KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/50 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Total Gross Sales</span>
                  <span className="text-xl font-mono font-black text-slate-900 block mt-1">{setPriceFormat(totalRevenue)}</span>
                </div>
                <span className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/50 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Net Profit Margin</span>
                  <span className="text-xl font-mono font-black text-emerald-805 block mt-1">{setPriceFormat(netCompanyProfit)}</span>
                </div>
                <span className="p-3 bg-teal-50 text-teal-800 rounded-xl">
                  <Activity className="w-5 h-5 text-teal-655" />
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/50 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Subscribers/Users</span>
                  <span className="text-xl font-mono font-black text-slate-900 block mt-1">{customers.length}</span>
                </div>
                <span className="p-3 bg-blue-50 text-blue-800 rounded-xl">
                  <Users className="w-5 h-5 text-blue-600" />
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/50 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Comm Expense Outflow</span>
                  <span className="text-xl font-mono font-black text-amber-900 block mt-1">{setPriceFormat(totalCommissionExpense)}</span>
                </div>
                <span className="p-3 bg-amber-50 text-amber-805 rounded-xl">
                  <Percent className="w-5 h-5 text-amber-600" />
                </span>
              </div>
            </div>

            {/* Custom High-Quality SVG Charts (Guarantees zero-dependency compilation) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Daily Sales Bar Diagram */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-sm text-stone-900">Weekly Gross Revenue (BDT Chart)</h3>
                  <span className="text-[10px] text-stone-400">Past 5 Days Logs</span>
                </div>
                {/* SVG layout */}
                <div className="h-44 flex items-end justify-between gap-4 pt-4 border-b border-stone-105 font-mono">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-stone-400 font-bold">1.2K</span>
                    <div className="w-8 bg-amber-500 rounded-t-lg transition-all" style={{ height: '50px' }}></div>
                    <span className="text-[9px] mt-1 text-stone-500">Mon</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-stone-400 font-bold">3.2K</span>
                    <div className="w-8 bg-amber-500 rounded-t-lg transition-all" style={{ height: '110px' }}></div>
                    <span className="text-[9px] mt-1 text-stone-500">Tue</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-stone-400 font-bold">850</span>
                    <div className="w-8 bg-amber-500 rounded-t-lg transition-all" style={{ height: '35px' }}></div>
                    <span className="text-[9px] mt-1 text-stone-500">Wed</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-stone-400 font-bold">4.5K</span>
                    <div className="w-8 bg-emerald-700 rounded-t-lg transition-all shadow-sm" style={{ height: '140px' }}></div>
                    <span className="text-[9px] mt-1 text-stone-500 font-bold">Thu</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-stone-400 font-bold">2.1K</span>
                    <div className="w-8 bg-amber-500 rounded-t-lg transition-all" style={{ height: '80px' }}></div>
                    <span className="text-[9px] mt-1 text-stone-500">Fri</span>
                  </div>
                </div>
              </div>

              {/* Best Sellers pie simulator visualization */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-stone-900 mb-4">Stock Distribution by Hub locations</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                        {/* Boalkhali Hub - 60% */}
                        <circle cx="16" cy="16" r="14" fill="transparent" stroke="#047857" strokeWidth="4" strokeDasharray="60 100" />
                        {/* Chattogram main - 30% */}
                        <circle cx="16" cy="16" r="14" fill="transparent" stroke="#b45309" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-60" />
                        {/* Other - 10% */}
                        <circle cx="16" cy="16" r="14" fill="transparent" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-90" />
                      </svg>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-700"></span>
                        <span className="font-bold text-stone-700">Boalkhali Hub (৬০%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-700"></span>
                        <span className="font-bold text-stone-700">Chattogram Head Warehouse (৩০%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                        <span className="text-stone-500 font-bold">Regional Distribution nodes (১০%)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 mt-4">Hub inventory reports are automatically synchronized with logistics routes.</p>
              </div>
            </div>

            {/* Top performing Imams ranking / metrics (Requested section) */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm text-left">
              <h3 className="font-display font-extrabold text-sm text-stone-900 mb-4">Top Performing Scholars / Direct Referrals Ranking</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-450">
                      <th className="pb-2 font-bold uppercase">Partner</th>
                      <th className="pb-2 font-bold uppercase">Role</th>
                      <th className="pb-2 font-bold uppercase">Registered Area</th>
                      <th className="pb-2 font-bold uppercase text-center">Referral Key</th>
                      <th className="pb-2 font-bold uppercase text-right">Aggregate Wallet Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                    {partners.map((p, idx) => {
                      const commGained = p.totalWithdrawn + p.walletBalance;
                      return (
                        <tr key={p.id}>
                          <td className="py-2.5 flex items-center gap-2">
                            <span className="font-bold text-stone-400 w-4">{idx + 1}</span>
                            <span className="font-bold text-stone-900">{p.name}</span>
                          </td>
                          <td className="py-2.5">
                            <span className="text-[10px] bg-sky-50 text-sky-850 px-2 py-0.5 rounded font-bold border border-sky-200">{p.role}</span>
                          </td>
                          <td className="py-2.5">{p.area}, {p.district}</td>
                          <td className="py-2.5 font-mono text-center font-bold text-amber-700">{p.referralCode}</td>
                          <td className="py-2.5 text-right text-slate-900 font-mono font-bold">{setPriceFormat(commGained)} BDT</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: IMAM/DEALER VERIFICATION */}
        {activeSubTab === 'verify' && (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <h3 className="font-display font-bold text-base text-stone-900 mb-2">🕌 Digital Partner Registrations Board</h3>
              <p className="text-xs text-stone-500 mb-6">Ensure document compliance, inspect National ID documents, and approve or suspend referral keys.</p>

              {partners.length === 0 ? (
                <p className="text-xs text-stone-400 py-12 text-center">No registrants currently exists in database.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partners.map(p => (
                    <div key={p.id} className="bg-stone-50/55 p-5 rounded-2xl border border-stone-250 flex flex-col justify-between">
                      <div>
                        {/* Header info */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2.5 items-center">
                            <div className="w-11 h-11 bg-stone-200 rounded-full overflow-hidden border">
                              <img src={p.nidPhoto} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-stone-900 leading-snug">{p.name}</h4>
                              <p className="text-[10px] text-stone-400 mt-0.5">{p.bengaliName} • {p.mobile}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            p.verifiedStatus === 'Approved' ? 'bg-emerald-110 text-emerald-800' :
                            p.verifiedStatus === 'Pending' ? 'bg-amber-100 text-amber-80 *' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.verifiedStatus}
                          </span>
                        </div>

                        {/* 3.1 NID display simulation overlay */}
                        <div className="bg-white border rounded-xl p-3 mb-4 space-y-1.5 text-[10px] font-medium text-stone-500">
                          <div className="flex justify-between">
                            <span>REGISTRATION ROLE:</span>
                            <span className="text-stone-900 font-bold">{p.role}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GEOGRAPHIC ROUTING AREA:</span>
                            <span className="text-stone-800 font-semibold">{p.area}, {p.district}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>NID VERIFICATION CARD:</span>
                            <span className="text-emerald-705 font-bold">19912034918204-VERIFIED-OK</span>
                          </div>
                        </div>
                      </div>

                      {p.verifiedStatus === 'Pending' ? (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            id={`btn-verify-reject-${p.id}`}
                            onClick={() => approvePartner(p.id, false)}
                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                          >
                            × Reject Application
                          </button>
                          <button
                            id={`btn-verify-approve-${p.id}`}
                            onClick={() => approvePartner(p.id, true)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                          >
                            ✓ Verify & Approve Imam
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-bold pt-2 border-t border-stone-200 mt-2">
                          <Check className="text-emerald-600 w-4.5 h-4.5" /> Approved and Assigned Code "{p.referralCode}" for Live Commissions.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB C: ORDER GEOROUTING AND DISTRIBUTOR */}
        {activeSubTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm text-left">
            <h3 className="font-display font-extrabold text-base text-stone-950 mb-1 flex items-center gap-1.5">
              🗺️ Routing Logistics & Auto Geo-Assigned Orders
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              When orders are placed, DadaJan algorithms automatically route delivery coordinator credits and dispatch tasks based on the client postcode and area.
            </p>

            {orders.length === 0 ? (
              <p className="text-xs text-stone-400 py-12 text-center">No transactions currently exists in database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400">
                      <th className="pb-2 font-bold uppercase">Order ID</th>
                      <th className="pb-2 font-bold uppercase">Customer</th>
                      <th className="pb-2 font-bold uppercase">Geography Location</th>
                      <th className="pb-2 font-bold uppercase">Assigned Local Handler</th>
                      <th className="pb-2 font-bold uppercase">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 font-mono font-bold text-stone-900 uppercase">{o.id}</td>
                        <td className="py-3">
                          <span className="block font-bold">{o.customerName}</span>
                          <span className="text-[10px] text-stone-400 block">{o.customerMobile}</span>
                        </td>
                        <td className="py-3 text-stone-600 font-mono text-[11px]">
                          {o.area}, {o.district}
                        </td>
                        <td className="py-3 font-bold text-emerald-805">
                          📍 {partners.find(p => p.id === o.assignedPartnerId)?.name || 'Central Warehouse Logistics'}
                        </td>
                        <td className="py-3">
                          <select
                            id={`select-order-status-${o.id}`}
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                            className="bg-stone-50 border border-stone-250 font-bold rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="Placed">Placed (অর্ডার গৃহীত)</option>
                            <option value="Processing">Processing (প্রক্রিয়াধীন)</option>
                            <option value="Packed">Packed (প্যাকিং সম্পন্ন)</option>
                            <option value="Shipped">Shipped (পাঠানো হয়েছে)</option>
                            <option value="Delivered">Delivered (বিতরণ সম্পন্ন - কমিশন ক্রেডিট)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB D: AUTO COMMISSION SPLIT HISTORY */}
        {activeSubTab === 'commissions' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm text-left">
            <h3 className="font-display font-extrabold text-base text-stone-900 mb-1 flex items-center gap-1.5">
              🪙 Real-Time Commission Splitting Ledger Engine
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              When standard deliverStatus is flagged as "Delivered", the splitter immediately calculates: Introducer passive commission (2.5%) and Area Dealer handling commission (6.0%).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400">
                    <th className="pb-2 font-bold uppercase">Order Reference</th>
                    <th className="pb-2 font-bold uppercase">Items Total</th>
                    <th className="pb-2 font-bold uppercase">Introducer Imam Split (2.5%)</th>
                    <th className="pb-2 font-bold uppercase">Dealer Handling Split (6%)</th>
                    <th className="pb-2 font-bold uppercase">Rest (Company Vault Share)</th>
                    <th className="pb-2 font-bold uppercase">Distribution Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {orders.map(o => {
                    // Splits
                    const introComm = o.referralCode ? Math.round(o.total * 0.025) : 0;
                    const handlerComm = Math.round(o.total * 0.06);
                    const companyShare = o.total - introComm - handlerComm;
                    return (
                      <tr key={o.id}>
                        <td className="py-3 font-mono font-bold uppercase">{o.id}</td>
                        <td className="py-3 font-mono font-bold text-stone-900">{setPriceFormat(o.total)}</td>
                        <td className="py-3">
                          <span className="block text-sky-850 font-bold">{setPriceFormat(introComm)} BDT</span>
                          <span className="text-[10px] text-stone-400">Key: {o.referralCode || 'None'}</span>
                        </td>
                        <td className="py-3">
                          <span className="block text-[#0f766e] font-bold">{setPriceFormat(handlerComm)} BDT</span>
                          <span className="text-[10px] text-stone-400">ID: {o.assignedPartnerId || 'Central'}</span>
                        </td>
                        <td className="py-3 font-mono font-extrabold text-stone-900">{setPriceFormat(companyShare)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.commissionsCalculated 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.commissionsCalculated ? '✓ Distributed To Wallet' : '⌛ Pending Delivery flag'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB E: HUB INVENTORY WAREHOUSE */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <h3 className="font-display font-extrabold text-base text-stone-900 mb-1 flex items-center gap-1.5">
                📦 Hub-Based Multi-Warehouse Logistics & Tracking
              </h3>
              <p className="text-xs text-stone-500 mb-6">Manage stock holdings across Boalkhali Hub and central warehouses instantly.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-amber-700 tracking-wider block">{p.category}</span>
                          <h4 className="font-bold text-stone-900 text-xs truncate max-w-xs">{p.name}</h4>
                        </div>
                        <span className="font-mono text-[10px] text-stone-400 font-bold">{p.sku}</span>
                      </div>

                      {/* Display warning flag */}
                      {p.stockQty <= 5 && (
                        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-2.5 rounded-lg text-[10px] font-bold mb-3 flex items-center gap-1.5 animate-pulse">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>LOW STOCK WARNING: Remaining holdings in Boalkhali is only {p.stockQty} items!</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-4">
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-400 block font-bold uppercase">Boalkhali Hub</span>
                          <span className="font-mono font-black text-slate-800 block mt-1">{Math.round(p.stockQty * 0.6)} items</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-400 block font-bold uppercase">Chattogram Head</span>
                          <span className="font-mono font-black text-slate-800 block mt-1">{Math.round(p.stockQty * 0.3)} items</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-400 block font-bold uppercase">Central Catalog</span>
                          <span className="font-mono font-black text-emerald-800 block mt-1">{p.stockQty} total</span>
                        </div>
                      </div>
                    </div>

                    {/* Adjust holdings manually */}
                    <div className="flex gap-2 border-t border-stone-200 pt-3 text-xs">
                      <button
                        id={`btn-adjust-stock-add-${p.id}`}
                        onClick={() => {
                          const amt = Number(prompt(lang === 'bn' ? `স্টক যোগ করুন ${p.sku}:` : `Add stock amount for ${p.sku}:`, '10'));
                          if (amt && amt > 0) {
                            p.stockQty += amt;
                            editProduct(p);
                          }
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-800 font-bold py-1.5 px-3 rounded-lg flex-1 transition-colors cursor-pointer text-center"
                      >
                        + {lang === 'bn' ? 'স্টক পরিবর্তন' : 'Adjust Stock holding'} (+qty)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB F: PRODUCT CATALOG MANAGER */}
        {activeSubTab === 'products' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Category Manager */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display font-extrabold text-base text-stone-900 flex items-center gap-1.5 font-sans">
                      📁 {lang === 'bn' ? 'ক্যাটাগরি ডিরেক্টরি' : 'Category Directory'}
                    </h3>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                      {allCategoriesList.length} {lang === 'bn' ? 'টি' : 'Total'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-4">
                    {lang === 'bn' 
                      ? 'নতুন ক্যাটাগরি তৈরি করতে পারেন বা সক্রিয় ক্যাটাগরিগুলোর পণ্য সংখ্যা দেখতে পারেন।' 
                      : 'Create new custom product classification tiers or track current inventory counts.'}
                  </p>

                  {/* Active categories with item count */}
                  <div className="space-y-2 mb-6">
                    {allCategoriesList.map((cat) => {
                      const itemCount = products.filter(p => p.category === cat).length;
                      return (
                        <div key={cat} className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-150 text-xs">
                          <div>
                            <span className="font-bold text-stone-900 block">{cat}</span>
                            <span className="text-[10px] text-stone-400 block font-medium">
                              {getCategoryLabel(cat, lang)}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] font-black bg-white border px-2 py-0.5 rounded-md text-stone-600">
                            {itemCount} {lang === 'bn' ? 'পণ্য' : 'Items'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Inline Creation Form */}
                  {!showNewCatInput ? (
                    <button
                      type="button"
                      id="btn-admin-add-cat-start"
                      onClick={() => setShowNewCatInput(true)}
                      className="w-full bg-[#FAF9F5] hover:bg-amber-50/50 text-[#92400e] border border-amber-200/50 rounded-xl py-2 px-3 text-xs font-bold font-sans cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-amber-600" /> {lang === 'bn' ? 'নতুন ক্যাটাগরি তৈরি করুন' : 'Create New Category'}
                    </button>
                  ) : (
                    <form onSubmit={handleCreateCategory} className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-3 animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-bold text-[#92400e] uppercase mb-1">
                          {lang === 'bn' ? 'ক্যাটাগরির নাম (ইংরেজি):' : 'New Category Name (English identifier):'}
                        </label>
                        <input
                          type="text"
                          id="input-newcat-name"
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. Raw Honey, Organic Seeds"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          id="btn-newcat-cancel"
                          onClick={() => {
                            setNewCatName('');
                            setShowNewCatInput(false);
                          }}
                          className="flex-1 bg-white border text-stone-600 border-stone-200 font-bold text-[11px] py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          id="btn-newcat-submit"
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          {lang === 'bn' ? 'তৈরি করুন' : 'Save'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: Catalog List or Form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Edit Product Form */}
                {editingProduct && (
                  <div className="bg-white rounded-3xl p-6 border-2 border-amber-500 shadow-md animate-fadeIn">
                    <form onSubmit={handleEditProductSubmit} className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-3 border-stone-200 mb-2">
                        <div>
                          <span className="text-[10px] bg-amber-600 text-slate-950 font-black px-2 py-0.5 rounded tracking-wider uppercase">
                            {lang === 'bn' ? 'পণ্য সংশোধন করুন' : 'Product Modification Utility'}
                          </span>
                          <h4 className="font-extrabold text-sm text-stone-900 mt-1">{editingProduct.name}</h4>
                        </div>
                        <button 
                          type="button" 
                          id="btn-edit-prod-cancel"
                          onClick={() => setEditingProduct(null)} 
                          className="text-stone-400 font-extrabold text-sm hover:text-stone-750 p-1 bg-stone-50 rounded-lg hover:bg-stone-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Product Name / Title (with Bengali parenthesis):</label>
                          <input
                            type="text"
                            id="input-editprod-name"
                            required
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">SKU identification key:</label>
                          <input
                            type="text"
                            id="input-editprod-sku"
                            required
                            value={editingProduct.sku}
                            onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Price Retail BDT:</label>
                          <input
                            type="number"
                            id="input-editprod-price"
                            required
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Cost Price BDT:</label>
                          <input
                            type="number"
                            id="input-editprod-cost"
                            required
                            value={editingProduct.costPrice}
                            onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Available Stock Qty:</label>
                          <input
                            type="number"
                            id="input-editprod-stock"
                            required
                            value={editingProduct.stockQty}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stockQty: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-150 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Category tier:</label>
                          <select
                            id="select-editprod-category"
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                          >
                            {allCategoriesList.map(cat => (
                              <option key={cat} value={cat}>{getCategoryLabel(cat, lang)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Fulfillment Origin description:</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.origin}
                            onChange={(e) => setEditingProduct({ ...editingProduct, origin: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Video Stream proof URL:</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.videoUrl}
                            onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Product Specifications (Ingredients):</label>
                          <input
                            type="text"
                            value={editingProduct.ingredients || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, ingredients: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                            placeholder="e.g. Pure nectar extraction, Organic compounds"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Product Hero Image URL (Unsplash):</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.images[0] || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Detailed Description Storybook:</label>
                        <textarea
                          required
                          rows={2}
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs leading-relaxed"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          id="btn-editprod-form-cancel"
                          onClick={() => setEditingProduct(null)}
                          className="flex-1 bg-stone-150 hover:bg-stone-200 text-stone-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Cancel Changes
                        </button>
                        <button
                          type="submit"
                          id="btn-editprod-form-save"
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          💾 Save & Update Active Listing
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 2. Add Product Form */}
                {isAddingProduct && (
                  <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm animate-fadeIn">
                    <form onSubmit={handleCreateProductSubmit} className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-3 border-stone-200 mb-2">
                        <h4 className="font-bold text-xs text-stone-900 uppercase">New Product Creation Flow</h4>
                        <button 
                          type="button" 
                          id="btn-add-prod-cancel"
                          onClick={() => setIsAddingProduct(false)} 
                          className="text-stone-400 font-extrabold text-sm hover:text-stone-750"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Product Name:</label>
                          <input
                            type="text"
                            id="input-newprod-name"
                            required
                            placeholder="e.g. Organic Chia Seed (প্রাকৃতিক চিয়া সিড)"
                            value={newProdData.name}
                            onChange={(e) => setNewProdData({ ...newProdData, name: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">SKU identifier:</label>
                          <input
                            type="text"
                            id="input-newprod-sku"
                            required
                            placeholder="e.g. SKU-CHIA-ORG-500"
                            value={newProdData.sku}
                            onChange={(e) => setNewProdData({ ...newProdData, sku: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Price Retail BDT:</label>
                          <input
                            type="number"
                            id="input-newprod-price"
                            required
                            value={newProdData.price || ''}
                            onChange={(e) => setNewProdData({ ...newProdData, price: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Cost Price BDT (For Profit split):</label>
                          <input
                            type="number"
                            id="input-newprod-cost"
                            required
                            value={newProdData.costPrice || ''}
                            onChange={(e) => setNewProdData({ ...newProdData, costPrice: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Immediate Stock holdings:</label>
                          <input
                            type="number"
                            id="input-newprod-stock font-mono"
                            required
                            value={newProdData.stockQty}
                            onChange={(e) => setNewProdData({ ...newProdData, stockQty: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Category:</label>
                          <select
                            id="select-newprod-category"
                            value={newProdData.category}
                            onChange={(e) => setNewProdData({ ...newProdData, category: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                          >
                            {allCategoriesList.map(cat => (
                              <option key={cat} value={cat}>{getCategoryLabel(cat, lang)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Origin story address:</label>
                          <input
                            type="text"
                            id="input-newprod-origin"
                            value={newProdData.origin}
                            onChange={(e) => setNewProdData({ ...newProdData, origin: e.target.value })}
                            placeholder="যেমন- Deep forests of Sundarbans"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Video Source Proof URL (15s):</label>
                          <input
                            type="text"
                            id="input-newprod-video"
                            value={newProdData.videoUrl}
                            onChange={(e) => setNewProdData({ ...newProdData, videoUrl: e.target.value })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Organic specifications (Ingredients):</label>
                          <input
                            type="text"
                            value={newProdData.ingredients}
                            onChange={(e) => setNewProdData({ ...newProdData, ingredients: e.target.value })}
                            placeholder="e.g. 100% Raw unrefined botanical seed extract"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Main Cover Image URL (Unsplash):</label>
                          <input
                            type="text"
                            value={newProdData.images[0]}
                            onChange={(e) => setNewProdData({ ...newProdData, images: [e.target.value] })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Fulfillment Description details:</label>
                        <textarea
                          rows={2}
                          value={newProdData.description}
                          onChange={(e) => setNewProdData({ ...newProdData, description: e.target.value })}
                          placeholder="Provide deep descriptions on standard purity proof logs and sourcing process..."
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-xs leading-relaxed"
                        />
                      </div>

                      <button
                        type="submit"
                        id="btn-confirm-add-prod"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
                      >
                        🚀 Save and Deploy in Active Catalog
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. Product Directory Catalog List */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-display font-extrabold text-[#0f766e] text-base">📦 {lang === 'bn' ? 'সিস্টেম প্রোডাক্ট ক্যাটালগ' : 'System Product Catalog'}</h3>
                      <p className="text-xs text-stone-505 shadow-sm">{lang === 'bn' ? 'সরাসরি পণ্য সংশোধন, কমিশন এবং স্টক তদারকি করুন।' : 'Review direct product pricing, reference commissions and edit catalog indexes.'}</p>
                    </div>
                    {!isAddingProduct && !editingProduct && (
                      <button
                        id="btn-admin-add-prod-start-alt"
                        onClick={() => setIsAddingProduct(true)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> {lang === 'bn' ? 'নতুন পণ্য যোগ' : 'Add New Product'}
                      </button>
                    )}
                  </div>

                  {/* Real-time sync & control panel */}
                  <div className="mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${
                        supabaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                        supabaseStatus === 'needs_tables' ? 'bg-amber-500 animate-pulse' :
                        'bg-rose-500'
                      }`} />
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block font-mono">
                          Database Connection Engine
                        </span>
                        <div className="text-xs text-stone-800 font-bold flex items-center gap-1">
                          <span>Supabase Status:</span>
                          <span className={`${
                            supabaseStatus === 'connected' ? 'text-emerald-700 font-extrabold' :
                            supabaseStatus === 'needs_tables' ? 'text-amber-700 font-bold' :
                            'text-rose-600'
                          }`}>
                            {supabaseStatus === 'connected' ? (lang === 'bn' ? 'সংযুক্ত (লাইভ সিঙ্ক চালু)' : 'Connected (Live Auto-Sync Active)') : 
                             supabaseStatus === 'needs_tables' ? (lang === 'bn' ? 'টেবিল নেই (সেটআপ প্রয়োজন)' : 'Disconnected / Needs Setup') : 
                             (lang === 'bn' ? 'ত্রুটি' : 'Offline / Connection Failure')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={triggerProductsSync}
                        disabled={isSyncingProducts}
                        className={`font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer border transition-all ${
                          isSyncingProducts 
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed animate-pulse'
                            : 'bg-white text-[#0f766e] border-[#0f766e]/30 hover:bg-stone-50 shadow-sm active:scale-95'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProducts ? 'animate-spin' : ''}`} />
                        <span>{lang === 'bn' ? 'Supabase এর সাথে সিঙ্ক করুন' : 'Sync Products with Supabase'}</span>
                      </button>
                    </div>
                  </div>

                  {syncMessage && (
                    <div className={`mb-4 px-4 py-3 rounded-xl border flex flex-col gap-2 text-xs font-bold leading-relaxed ${
                      syncStatusIcon === 'success' 
                        ? 'bg-emerald-50 border-emerald-205 text-emerald-800' 
                        : syncStatusIcon === 'fail' 
                        ? 'bg-rose-50 border-rose-200 text-rose-800' 
                        : 'bg-stone-50 border-stone-200 text-[#0f766e]'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 shrink-0" />
                        <span>{syncMessage}</span>
                      </div>
                      
                      {syncStatusIcon === 'fail' && (syncMessage.toLowerCase().includes('column') || syncMessage.toLowerCase().includes('is_featured')) && (
                        <div className="mt-2 p-3 bg-stone-950 text-[#fca5a5] rounded-xl border border-rose-950/40 font-mono text-[11px] font-normal leading-relaxed space-y-2">
                          <p className="text-[11px] text-stone-200 font-sans font-bold">
                            💡 {lang === 'bn' ? 'কীভাবে এই ত্রুটি সমাধান করবেন:' : 'How to resolve this schema mismatch error:'}
                          </p>
                          <p className="text-[10px] text-stone-300 font-sans">
                            {lang === 'bn' 
                              ? 'আপনার Supabase এ থাকা products টেবিলে কিছু নতুন কলাম নেই। আপনার বর্তমান পন্যের ডাটা অক্ষত রেখে টেবিলটি লেটেস্ট কলামে আপডেট করার জন্য নিচের কোডটি কপি করে Supabase SQL Editor এ রান করলেই সমস্যার সমাধান হয়ে যাবে:' 
                              : 'Your database has outdated tables. Copy and execute the following SQL code inside your Supabase Dashboard > SQL Editor to add the missing metadata columns instantly while preserving all existing products:'}
                          </p>
                          <pre className="p-2.5 bg-stone-900 text-amber-400 rounded-lg border border-stone-800 text-[10px] select-all overflow-x-auto whitespace-pre leading-relaxed font-bold">
{`-- Run this patch script inside Supabase SQL Editor:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sale_price NUMERIC;

-- Add updated coupon tracking metadata columns
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS expires_date TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS usage_limit INT;`}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search, Category Filter, and Selection Console */}
                  <div className="mb-5 grid grid-cols-1 md:grid-cols-12 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/60 shadow-xs">
                    {/* Search Input */}
                    <div className="md:col-span-5 relative">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'পণ্যের নাম বা SKU খুঁজুন...' : 'Search product name or SKU...'}
                        value={prodSearchQuery}
                        onChange={(e) => setProdSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-600 outline-none text-stone-800"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <select
                        value={prodCategoryFilter}
                        onChange={(e) => setProdCategoryFilter(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-bold text-stone-700 outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                      >
                        <option value="All">{lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                        {allCategoriesList.map(cat => (
                          <option key={cat} value={cat}>{getCategoryLabel(cat, lang)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-3 flex items-center justify-end text-[11px] font-bold text-stone-500 font-sans">
                      {lang === 'bn' ? `মোট পাওয়া গেছে: ${filteredProducts.length} টি` : `Found: ${filteredProducts.length} items`}
                    </div>
                  </div>

                  {/* Selected Multi-Products Batch Action operations console */}
                  {selectedProdIds.length > 0 && (
                    <div className="mb-5 p-4 rounded-2xl bg-[#eff6ff] border border-blue-150 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-center gap-2.5">
                        <div className="px-2.5 py-1 bg-blue-100/90 rounded-lg text-blue-800 shrink-0 font-extrabold text-xs">
                          {selectedProdIds.length}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-stone-800">
                            {lang === 'bn' ? `${selectedProdIds.length} টি প্রোডাক্ট নির্বাচন করা হয়েছে` : `${selectedProdIds.length} Products Selected`}
                          </h4>
                          <p className="text-[10px] text-stone-550 leading-relaxed font-normal">
                            {lang === 'bn' ? 'একসাথে নির্বাচিত পণ্যগুলোর উপর বাল্ক কার্যক্রম সম্পাদন করুন।' : 'Perform batch operations/deletions on all highlighted items concurrently.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Quick Increase stock or reset stock */}
                        <button
                          type="button"
                          onClick={() => {
                            triggerConfirm(
                              lang === 'bn' ? 'বাল্ক স্টক সেটআপ' : 'Bulk Stock Reset',
                              lang === 'bn'
                                ? `আপনি কি সত্যিই নির্বাচিত ${selectedProdIds.length} টি প্রোডাক্টের স্টক ৫০ এ আপডেট করতে চান?`
                                : `Do you want to batch update the remaining stock of ${selectedProdIds.length} selected items to 50 units?`,
                              () => {
                                selectedProdIds.forEach(id => {
                                  const prod = products.find(p => p.id === id);
                                  if (prod) {
                                    editProduct({ ...prod, stockQty: 50 });
                                  }
                                });
                                triggerAlert(
                                  lang === 'bn' ? 'স্টক সফল' : 'Batch Done',
                                  lang === 'bn' ? 'স্টক সফলভাবে ৫০ সেটে আপডেট করা হয়েছে।' : 'Stock quantities configured successfully!'
                                );
                                setSelectedProdIds([]);
                              }
                            );
                          }}
                          className="px-3 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition shadow-xs"
                        >
                          {lang === 'bn' ? 'স্টক ৫০ করুন' : 'Set Stock to 50'}
                        </button>

                        {/* Batch Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            triggerConfirm(
                              lang === 'bn' ? 'গণ মুছে ফেলা নিশ্চিতকরণ' : 'Confirm Bulk Erase',
                              lang === 'bn'
                                ? `আপনি কি নিশ্চিতভাবে এই ${selectedProdIds.length} টি প্রোডাক্ট ডিরেক্টরি থেকে একদম মুছে ফেলতে চান?`
                                : `Are you sure you want to permanently erase all ${selectedProdIds.length} highlighted products from public store directories?`,
                              () => {
                                selectedProdIds.forEach(id => {
                                  deleteProduct(id);
                                });
                                triggerAlert(
                                  lang === 'bn' ? 'অনুশীলন সম্পন্ন' : 'Batch Removed',
                                  lang === 'bn' ? 'প্রোডাক্টগুলো সফলভাবে মুছে ফেলা হয়েছে।' : 'Highlighted inventory rows successfully removed!'
                                );
                                setSelectedProdIds([]);
                              }
                            );
                          }}
                          className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition flex items-center gap-1 shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Selected'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedProdIds([])}
                          className="px-2.5 py-1.5 text-stone-500 hover:text-stone-700 text-[10px] font-bold rounded-lg cursor-pointer transition border border-stone-200 bg-white shadow-xs"
                        >
                          {lang === 'bn' ? 'বাতিল' : 'Deselect'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-450">
                          {/* Multi select checkbox column in header */}
                          <th className="pb-2 pl-1 w-8">
                            <input
                              type="checkbox"
                              checked={allFilteredSelected}
                              onChange={toggleAllFilteredProducts}
                              className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title={lang === 'bn' ? 'সব নির্বাচন করুন' : 'Select All Filtered'}
                            />
                          </th>
                          <th className="pb-2 font-bold uppercase">Product info</th>
                          <th className="pb-2 font-bold uppercase">Category</th>
                          <th className="pb-2 font-bold uppercase">Price Retail</th>
                          <th className="pb-2 font-bold uppercase">Cost Price</th>
                          <th className="pb-2 font-bold uppercase">Remaining Stock</th>
                          <th className="pb-2 font-bold uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                        {filteredProducts.map(p => {
                          const isSelected = selectedProdIds.includes(p.id);
                          return (
                            <tr key={p.id} className={`hover:bg-grid-row/25 transition-colors ${isSelected ? 'bg-emerald-50/20' : ''}`}>
                              {/* Row Checkbox Selection Cell */}
                              <td className="py-2.5 pl-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleProdSelection(p.id)}
                                  className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 flex items-center gap-2.5">
                                <img src={p.images[0] || 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=400'} className="w-10 h-10 object-cover rounded-lg bg-stone-50 border border-stone-200" alt="" referrerPolicy="no-referrer" />
                                <div>
                                  <span className="font-bold text-stone-900 block">{p.name}</span>
                                  <span className="text-[10px] text-stone-400 block font-mono">SKU: {p.sku}</span>
                                </div>
                              </td>
                              <td className="py-2.5">
                                <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                  {getCategoryLabel(p.category, lang)}
                                </span>
                              </td>
                              <td className="py-2.5 font-mono text-slate-900 font-bold">{setPriceFormat(p.price)}</td>
                              <td className="py-2.5 font-mono text-stone-500">{setPriceFormat(p.costPrice)}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.stockQty <= 5 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800'
                                }`}>
                                  {p.stockQty} {lang === 'bn' ? 'টি মজুদ' : 'units'}
                                </span>
                              </td>
                              <td className="py-2.5 text-right whitespace-nowrap">
                                <button
                                  id={`btn-catalog-edit-${p.id}`}
                                  onClick={() => startEditProduct(p)}
                                  className="p-1.5 hover:bg-amber-50 hover:text-amber-700 text-amber-600 rounded-lg transition-colors cursor-pointer mr-1"
                                  title="Edit Product details"
                                >
                                  <Edit3 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  id={`btn-catalog-delete-${p.id}`}
                                  onClick={() => {
                                    triggerConfirm(
                                      lang === 'bn' ? 'মুছে ফেলার নিশ্চিতকরণ' : 'Delete Confirmation',
                                      lang === 'bn' 
                                        ? `আপনি কি সত্যি "${p.name}" ড্রপ বা মুছে ফেলতে চান?` 
                                        : `Do you want to completely drop "${p.name}" from the public store?`,
                                      () => {
                                        deleteProduct(p.id);
                                        // Also clear selection for this item if single deleted
                                        setSelectedProdIds(prev => prev.filter(id => id !== p.id));
                                      }
                                    );
                                  }}
                                  className="p-1.5 hover:bg-red-50 hover:text-red-700 text-red-550 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB G: FINANCIAL REPORT & PAYOUT APPROVALS */}
        {activeSubTab === 'finance' && (
          <div className="space-y-6 text-left animate-fadeIn">
            
            {/* Quick Export Panel (Requested details) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-extrabold text-[#065f46] text-base leading-tight">Financial Reports & Accounts Statement</h3>
                <p className="text-xs text-stone-400 mt-1">Export daily margins, commission liabilities, or net payout histories seamlessly.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  id="btn-export-excel"
                  onClick={() => handleExport('Excel')}
                  className="bg-[#22c55e]/90 text-white hover:bg-emerald-700 text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-emerald-600"
                >
                  <FileText className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button 
                  id="btn-export-pdf"
                  onClick={() => handleExport('PDF')}
                  className="bg-red-650 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-red-500"
                >
                  <FileText className="w-3.5 h-3.5" /> Export PDF statement
                </button>
                <button 
                  id="btn-export-csv"
                  onClick={() => handleExport('CSV')}
                  className="bg-stone-850 hover:bg-stone-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Export CSV sheet
                </button>
              </div>
            </div>

            {/* Income Statement Ledgers */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <h3 className="font-display font-bold text-sm text-stone-900 mb-4">Central Margin Ledger sheet</h3>
              <div className="space-y-3 test-xs font-semibold">
                <div className="flex justify-between items-center text-xs pb-2.5 border-b">
                  <span className="text-stone-500">Gross Sales Income (Total Inflow):</span>
                  <span className="font-mono text-slate-900 font-extrabold text-sm">{setPriceFormat(totalRevenue)} BDT</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2.5 border-b">
                  <span className="text-stone-500">Less: Production Cost baseline:</span>
                  <span className="font-mono text-red-650">-{setPriceFormat(totalCost)} BDT</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2.5 border-b text-amber-805">
                  <span className="text-stone-500">Less: Partner Commission split outflow:</span>
                  <span className="font-mono">-{setPriceFormat(totalCommissionExpense)} BDT</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 bg-stone-50 p-3 rounded-xl border border-stone-200/60 font-black">
                  <span className="text-emerald-805 text-xs">Net DadaJan Company Vault Surplus:</span>
                  <span className="font-mono text-base text-emerald-800">{setPriceFormat(netCompanyProfit)} BDT</span>
                </div>
              </div>
            </div>

            {/* Manual Withdrawal Handlers (Requested "Admin Manual Payout Approval workflow") */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <h3 className="font-display font-bold text-sm text-stone-950 mb-1">💵 Active Cash-out Withdrawal Requests ({pendingWithdrawals.length})</h3>
              <p className="text-[11px] text-stone-400 mb-4">Verify balance availability and click to approve/reject manual bKash/Nagad withdrawals.</p>

              {pendingWithdrawals.length === 0 ? (
                <p className="text-xs text-stone-400 py-12 text-center">No pending withdrawal requests in system queue.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingWithdrawals.map(w => (
                    <div key={w.id} className="bg-stone-50/75 p-4 rounded-2xl border border-stone-300 flex flex-col justify-between">
                      <div className="space-y-1.5 text-xs text-stone-500">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-stone-900 uppercase font-mono">{w.id}</span>
                          <span className="bg-amber-100 text-amber-80 * px-2 py-0.5 rounded font-mono text-[9px] font-bold">PENDING WTH</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>REQUESTING PARTNER:</span>
                          <span className="text-stone-900 font-bold">{w.partnerName} ({w.partnerRole})</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>MOBILE SPEC:</span>
                          <span className="text-stone-700 font-mono">{w.mobile}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>METHOD & BENEFICIARY DETAILS:</span>
                          <span className="text-amber-900 font-bold">{w.method}: {w.details}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-stone-200/60 pt-2 text-stone-900">
                          <span>REQUESTED Payout Amount:</span>
                          <span className="font-mono text-base font-extrabold text-slate-920">{setPriceFormat(w.amount)} BDT</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-200">
                        <button
                          id={`btn-withdrawal-reject-${w.id}`}
                          onClick={() => approveWithdrawal(w.id, false)}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                        >
                          × Cancel & Refund Wallet
                        </button>
                        <button
                          id={`btn-withdrawal-approve-${w.id}`}
                          onClick={() => approveWithdrawal(w.id, true)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                        >
                          ✓ Approve & Pay Out BDT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'database' && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-left">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm mb-6">
              <h3 className="font-display font-extrabold text-lg text-stone-900 mb-1">🛡️ Database Access Control & Row Level Security (RLS)</h3>
              <p className="text-xs text-stone-500">
                Configure and verify PostgreSQL schemas, tables access, and policies under DadaJan ERP. Admins bypass all limitations. Tested against production credentials.
              </p>
            </div>
            <SupabaseRLSConsole currentRole="admin" />
          </div>
        )}

        {/* WooCommerce Categories Subtab */}
        {activeSubTab === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-left space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-display font-extrabold text-lg text-stone-900">📂 Dynamic WooCommerce Category Catalog</h3>
                <p className="text-xs text-stone-505">
                  Manage active taxonomies, Bengali linguistic translations, descriptions, and publish states shown on client storefront categories.
                </p>
              </div>
              <button
                onClick={() => setEditingCategory({ id: '', name: '', bnName: '', description: '', isActive: true })}
                className="w-full md:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Custom Category
              </button>
            </div>

            {/* Editing / Creating Modal Form */}
            {editingCategory && (
              <div className="bg-amber-50/50 border-2 border-amber-500/10 rounded-3xl p-6 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2.5 border-b border-stone-250">
                  <h4 className="font-bold text-sm text-stone-900">
                    {editingCategory.id ? '✏️ Edit Category Taxonomy' : '📂 Create Brand New Storefront Category'}
                  </h4>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-1 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingCategory.name || !editingCategory.bnName) {
                      alert('Please specify both English and Bengali names!');
                      return;
                    }
                    if (editingCategory.id) {
                      editCategory(editingCategory);
                      alert('Category updated securely.');
                    } else {
                      addCategory({
                        name: editingCategory.name,
                        bnName: editingCategory.bnName,
                        description: editingCategory.description || '',
                        isActive: editingCategory.isActive
                      });
                      alert('Category added safely.');
                    }
                    setEditingCategory(null);
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">English Category Title *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                      placeholder="e.g., Sundarbans Honey Specials"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">Bengali Translated Title *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                      placeholder="যেমন: সুন্দরবনের খাঁটি মধু"
                      value={editingCategory.bnName}
                      onChange={(e) => setEditingCategory({ ...editingCategory, bnName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">Operational Description (Bengali or English)</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                      placeholder="Describe scope, supply chain logistics or verified standards of items..."
                      value={editingCategory.description || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2 md:col-span-2">
                    <input
                      type="checkbox"
                      id="cat-active-checkbox"
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={editingCategory.isActive}
                      onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                    />
                    <label htmlFor="cat-active-checkbox" className="text-xs font-semibold text-stone-700">
                      Enable category instantly on user storefront grids & dropdown list menus
                    </label>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List Table Grid */}
            {categories.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-stone-400">
                No custom categories minted yet. Click the add button to configure dynamic taxonomies.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const count = products.filter(p => p.category === cat.name).length;
                  return (
                    <div key={cat.id} className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm flex flex-col justify-between hover:border-amber-500/20 transition-all text-left">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono font-bold uppercase bg-stone-100 text-stone-500 px-2 py-0.5 rounded">ID: {cat.id}</span>
                            <h4 className="font-bold text-sm text-stone-900 mt-1">{cat.name}</h4>
                            <span className="text-xs text-emerald-805 font-medium font-sans">Bengali Name: {cat.bnName}</span>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                            cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-850'
                          }`}>
                            {cat.isActive ? '● PUBLIC' : '● DEACTIVATED'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-2 line-clamp-2 italic">{cat.description || 'No detailed description annotated for this taxonomy.'}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 mt-4 border-t border-stone-100">
                        <span className="text-xs font-medium text-stone-400">Products Linked: <strong className="text-stone-950 font-bold">{count} products</strong></span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="p-1 px-2.5 bg-stone-50 border hover:bg-stone-100 rounded-lg text-stone-705 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-500" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (count > 0) {
                                triggerAlert(
                                  lang === 'bn' ? 'মুছে ফেলা অসম্ভব' : 'Cannot Delete Category',
                                  lang === 'bn'
                                    ? `ক্যাটাগরি "${cat.name}" মুছে ফেলা সম্ভব নয় কারণ এতে ${count} টি প্রোডাক্ট যুক্ত আছে।`
                                    : `Cannot delete category "${cat.name}" as there are ${count} products currently assigned to this tab tag.`
                                );
                                return;
                              }
                              triggerConfirm(
                                lang === 'bn' ? 'ক্যাটাগরি মুছুন' : 'Delete Category',
                                lang === 'bn'
                                  ? `আপনি কি নিশ্চিতভাবে "${cat.name}" ক্যাটাগরি মুছে ফেলতে চান?`
                                  : `Are you sure you want to permanently delete taxonomy category "${cat.name}"?`,
                                () => {
                                  deleteCategory(cat.id);
                                  triggerAlert(
                                    lang === 'bn' ? 'সফল হয়েছে' : 'Success',
                                    lang === 'bn' ? 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।' : 'Category removed successfully.'
                                  );
                                }
                              );
                            }}
                            className="p-1 px-2 text-red-600 bg-red-50 border border-red-200 hover:bg-stone-100 rounded-lg text-xs font-bold font-sans cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WooCommerce Coupons Subtab */}
        {activeSubTab === 'coupons' && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-left space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-display font-extrabold text-lg text-stone-900">🎟️ Dynamic WooCommerce Coupon & Promo codes</h3>
                <p className="text-xs text-stone-500">
                  Control active promo rewards, set customized percent or flat discount rules, limit redemptions, and monitor usage rates.
                </p>
              </div>
              <button
                onClick={() => setEditingCoupon({ id: '', code: '', discountType: 'Percentage', amount: 10, minOrderAmount: 0, usageLimit: 0, usageCount: 0, isActive: true })}
                className="w-full md:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Mint Global Promo Coupon
              </button>
            </div>

            {/* Create/Edit coupon modal area */}
            {editingCoupon && (
              <div className="bg-amber-50/50 border-2 border-amber-500/10 rounded-3xl p-6 space-y-4 animate-fade-in">
                <h4 className="font-bold text-sm text-stone-900 pb-2.5 border-b">
                  {editingCoupon.id ? `Ticket Config: ${editingCoupon.code}` : '🎟️ Mint Elegant Global Discount Code'}
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingCoupon.code || !editingCoupon.amount) {
                      alert('Coupon code and discount amount are mandatory fields!');
                      return;
                    }
                    const codeUpper = editingCoupon.code.toUpperCase().trim();
                    if (editingCoupon.id) {
                      editCoupon({ ...editingCoupon, code: codeUpper });
                      alert('Discount coupon parameters updated securely.');
                    } else {
                      addCoupon({
                        code: codeUpper,
                        discountType: editingCoupon.discountType,
                        amount: Number(editingCoupon.amount),
                        minOrderAmount: Number(editingCoupon.minOrderAmount || 0),
                        usageLimit: Number(editingCoupon.usageLimit || 0),
                        isActive: editingCoupon.isActive
                      });
                      alert('Coupon code issued on production system successfully!');
                    }
                    setEditingCoupon(null);
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">Alphanumeric Promo Code *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-mono uppercase focus:ring-1 focus:ring-emerald-600 outline-none font-bold text-stone-800"
                      placeholder="e.g. BARAKAH20"
                      value={editingCoupon.code}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">Deduction Method *</label>
                    <select
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600 outline-none font-semibold text-stone-700"
                      value={editingCoupon.discountType}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                    >
                      <option value="Percentage">Percentage % Off Order</option>
                      <option value="Fixed">Fixed Amount Local Currency (৳) Off Order</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">Discount Worth Amount *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600 outline-none font-mono font-semibold"
                      value={editingCoupon.amount}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">Min Purchase Threshold (৳)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600 outline-none font-mono"
                      value={editingCoupon.minOrderAmount || 0}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrderAmount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase">Global Max Usage Limit (Redemptions)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600 outline-none font-mono"
                      value={editingCoupon.usageLimit || 0}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="coupon-active-check"
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      checked={editingCoupon.isActive}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                    />
                    <label htmlFor="coupon-active-check" className="text-xs font-semibold text-stone-700">
                      Instantly Active & Apply-ready
                    </label>
                  </div>
                  <div className="lg:col-span-3 flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingCoupon(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold text-stone-505 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* coupons list view cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((cp) => (
                <div key={cp.id} className="relative bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm hover:border-amber-500/25 transition-all overflow-hidden flex flex-col justify-between text-left">
                  <div className="absolute right-0 top-0 text-[60px] font-mono select-none pointer-events-none text-stone-50 font-black pr-3 pt-1">
                    %
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono font-bold text-xs uppercase bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-xl">
                        {cp.code}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        cp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cp.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-stone-900 mt-2">
                      {cp.discountType === 'Percentage' ? `${cp.amount}% Off Order` : `${setPriceFormat(cp.amount)} Flat Discount`}
                    </div>
                    <div className="text-xs text-stone-500 font-medium space-y-1.5 mt-3">
                      <div>Min Purchase Requirement: <span className="text-stone-900 font-mono font-bold">{setPriceFormat(cp.minOrderAmount || 0)}</span></div>
                      <div>Global Usage cap: <span className="text-stone-900 font-bold">{cp.usageLimit ? `${cp.usageLimit} redemptions` : 'No limits'}</span></div>
                      <div>Total Redeemed: <span className="text-stone-900 font-mono font-bold">{cp.usageCount} times Used</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 mt-4 border-t border-stone-100 justify-end relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cp.code);
                        alert(`Copied "${cp.code}" code to clipboard.`);
                      }}
                      className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border text-stone-600 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Copy Code
                    </button>
                    <button
                      onClick={() => setEditingCoupon(cp)}
                      className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border text-stone-600 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Edit Config
                    </button>
                    <button
                      onClick={() => {
                        triggerConfirm(
                          lang === 'bn' ? 'কুপন মুছে ফেলুন' : 'Delete Promo Coupon',
                          lang === 'bn'
                            ? `আপনি কি নিশ্চিতভাবে "${cp.code}" কুপনটি মুছে ফেলতে চান?`
                            : `Do you want to permanently delete coupon code "${cp.code}"?`,
                          () => {
                            deleteCoupon(cp.id);
                            triggerAlert(
                              lang === 'bn' ? 'সফল হয়েছে' : 'Success',
                              lang === 'bn' ? 'কুপন সফলভাবে ডিলিট করা হয়েছে।' : 'Coupon removed successfully.'
                            );
                          }
                        );
                      }}
                      className="px-2 py-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WooCommerce Manual Orders (POS) Subtab */}
        {activeSubTab === 'manual-orders' && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-left space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <h3 className="font-display font-bold text-lg text-stone-900">🛒 POS Manual Invoice & Order Creator</h3>
              <p className="text-xs text-stone-500">
                Create new orders directly on behalf of retail buyers, specify custom items, adjust quantities, apply dynamic coupons, and attribute referral credit to partners.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Product selector catalog */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-stone-200/50 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-900 mb-3 block">📦 Live Product Catalog Selector ({products.length} Items)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {products.map((p) => {
                      const qtyInPOS = manualOrderItems.find(item => item.product.id === p.id)?.quantity || 0;
                      return (
                        <div key={p.id} className="bg-stone-50 border border-stone-200/70 p-3 rounded-2xl flex gap-3 items-center justify-between text-left">
                          <img src={p.images[0]} className="w-12 h-12 object-cover rounded-xl shrink-0" alt="" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-[11px] text-stone-900 truncate leading-snug">{getLocalizedProductName(p.name, lang)}</h5>
                            <span className="text-[10px] text-stone-400 font-mono tracking-wide block">Stock: {p.stockQty} items</span>
                            <div className="font-mono text-xs font-bold text-emerald-800 mt-0.5">{setPriceFormat(p.price)}</div>
                          </div>
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            {qtyInPOS > 0 ? (
                              <div className="flex items-center gap-1 bg-white border rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setManualOrderItems(prev => {
                                      const matched = prev.find(item => item.product.id === p.id);
                                      if (matched && matched.quantity > 1) {
                                        return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity - 1 } : item);
                                      }
                                      return prev.filter(item => item.product.id !== p.id);
                                    });
                                  }}
                                  className="w-5 h-5 bg-stone-100 rounded text-stone-800 flex items-center justify-center font-bold text-xs hover:bg-stone-200 cursor-pointer"
                                    id={`btn-manual-pos-dec-${p.id}`}
                                >
                                  -
                                </button>
                                <span className="text-xs font-mono font-bold w-4 text-center">{qtyInPOS}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (qtyInPOS >= p.stockQty) {
                                      alert('Overstock quantity not available!');
                                      return;
                                    }
                                    setManualOrderItems(prev => prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
                                  }}
                                  className="w-5 h-5 bg-stone-100 rounded text-stone-850 flex items-center justify-center font-bold text-xs hover:bg-stone-200 cursor-pointer"
                                    id={`btn-manual-pos-inc-${p.id}`}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (p.stockQty <= 0) {
                                    alert('Out of stock!');
                                    return;
                                  }
                                  setManualOrderItems(prev => [...prev, { product: p, quantity: 1 }]);
                                }}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-805 text-white rounded-lg text-[10px] font-bold cursor-pointer font-sans"
                                id={`btn-manual-pos-add-${p.id}`}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected active invoice lines */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200/50 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-stone-900 block border-b pb-2">🛒 Active Invoice Draft Items ({manualOrderItems.length} lines)</h4>
                  {manualOrderItems.length === 0 ? (
                    <p className="text-xs text-stone-400 py-12 text-center font-medium">No catalog products selected in manual invoice draft.</p>
                  ) : (
                    <div className="space-y-2">
                       {manualOrderItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs border-b pb-2 text-left">
                          <div className="min-w-0">
                            <span className="font-bold text-stone-900 block truncate">{getLocalizedProductName(item.product.name, lang)}</span>
                            <span className="text-stone-400 text-[10px]">Unit Price: {setPriceFormat(item.product.price)}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-stone-500 font-semibold">{item.quantity} units</span>
                            <span className="font-mono font-bold text-stone-800 text-right w-20">{setPriceFormat(item.product.price * item.quantity)}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setManualOrderItems(prev => prev.filter(p => p.product.id !== item.product.id));
                              }}
                              className="text-stone-400 hover:text-red-500 font-bold p-1 cursor-pointer"
                              id={`btn-manual-pos-remove-${item.product.id}`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Billing and Placement checkout */}
              <div className="lg:col-span-5 space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualOrderItems.length === 0) {
                      alert('Manual invoice has no items selected!');
                      return;
                    }
                    if (!manualCustDetails.name || !manualCustDetails.mobile || !manualCustDetails.address) {
                      alert('Customer Name, Mobile and Address details are mandatory!');
                      return;
                    }

                    const formattedOrderItems = manualOrderItems.map(item => ({
                      productId: item.product.id,
                      name: item.product.name,
                      quantity: item.quantity,
                      price: item.product.price,
                      image: item.product.images[0]
                    }));

                    const subtotal = manualOrderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

                    let couponDiscountValue = 0;
                    if (manualOrderCoupon) {
                      if (subtotal >= (manualOrderCoupon.minOrderAmount || 0)) {
                        if (manualOrderCoupon.discountType === 'Percentage') {
                          couponDiscountValue = Math.round((subtotal * manualOrderCoupon.amount) / 100);
                        } else {
                          couponDiscountValue = manualOrderCoupon.amount;
                        }
                      }
                    }

                    const placed = placeOrder(
                      {
                        name: manualCustDetails.name,
                        mobile: manualCustDetails.mobile,
                        email: manualCustDetails.email || `${manualCustDetails.mobile}@dadajan.com`,
                        address: manualCustDetails.address,
                        district: manualCustDetails.district || 'Dhaka',
                        area: manualCustDetails.area || 'Gulshan'
                      },
                      formattedOrderItems,
                      manualCustDetails.referralCode,
                      manualCustDetails.paymentMethod,
                      couponDiscountValue
                    );

                    alert(`✓ WooCommerce manual invoice placed successfully!\n\nSystem Generated Order ID: ${placed.id}\nBuyer: ${placed.customerName}\nSubtotal: ${setPriceFormat(placed.subtotal)}\nDiscount: -${setPriceFormat(placed.discount)}\nTotal Payable: ${setPriceFormat(placed.total)}\nAssigned Dealer Hub: ${placed.assignedPartnerId}`);

                    setManualOrderItems([]);
                    setManualCustDetails({
                      name: '',
                      mobile: '',
                      email: '',
                      address: '',
                      district: 'Dhaka',
                      area: '',
                      referralCode: '',
                      paymentMethod: 'Cash on Delivery'
                    });
                    setManualOrderCoupon(null);
                  }}
                  className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm space-y-4"
                >
                  <h4 className="font-bold text-sm text-stone-900 border-b pb-2 block">📋 Buyer Details & Invoice Summary</h4>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 block uppercase">Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="e.g. Al-Amin Chowdhury"
                        value={manualCustDetails.name}
                        onChange={(e) => setManualCustDetails({ ...manualCustDetails, name: e.target.value })}
                        id="input-manual-cust-name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 block uppercase">Customer Mobile Number *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-mono outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="e.g. 0172XXXXXXXX"
                        value={manualCustDetails.mobile}
                        onChange={(e) => setManualCustDetails({ ...manualCustDetails, mobile: e.target.value })}
                        id="input-manual-cust-phone"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 block uppercase">District *</label>
                        <select
                          className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white font-semibold text-stone-705 focus:outline-none"
                          value={manualCustDetails.district}
                          onChange={(e) => setManualCustDetails({ ...manualCustDetails, district: e.target.value })}
                          id="select-manual-cust-district"
                        >
                          <option value="Dhaka">Dhaka (ঢাকা)</option>
                          <option value="Chattogram">Chattogram (চট্টগ্রাম)</option>
                          <option value="Sylhet">Sylhet (সিলেট)</option>
                          <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                          <option value="Khulna">Khulna (খুলনা)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 block uppercase">Area / Upazila *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-emerald-600"
                          placeholder="e.g. Boalkhali / Mirpur"
                          value={manualCustDetails.area}
                          onChange={(e) => setManualCustDetails({ ...manualCustDetails, area: e.target.value })}
                          id="input-manual-cust-area"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 block uppercase">Detailed Delivery Address *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-emerald-600"
                        placeholder="House / Flat, Village, Post office info..."
                        value={manualCustDetails.address}
                        onChange={(e) => setManualCustDetails({ ...manualCustDetails, address: e.target.value })}
                        id="input-manual-cust-address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 block uppercase">Promo Coupon Code</label>
                        <select
                          className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white text-stone-700 font-mono font-bold focus:outline-none"
                          value={manualOrderCoupon?.code || ''}
                          onChange={(e) => {
                            const code = e.target.value;
                            const found = coupons.find(c => c.code === code);
                            if (found) {
                              setManualOrderCoupon(found);
                            } else {
                              setManualOrderCoupon(null);
                            }
                          }}
                          id="select-manual-cust-coupon"
                        >
                          <option value="">-- No Coupon --</option>
                          {coupons.filter(c => c.isActive).map(c => (
                            <option key={c.id} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 block uppercase">Referral Imam Code</label>
                        <select
                          className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white text-stone-700 font-mono focus:outline-none"
                          value={manualCustDetails.referralCode}
                          onChange={(e) => setManualCustDetails({ ...manualCustDetails, referralCode: e.target.value })}
                          id="select-manual-cust-referral"
                        >
                          <option value="">-- Direct Sales (Admin) --</option>
                          {partners.filter(p => p.role === 'Imam' && p.verifiedStatus === 'Approved').map(p => (
                            <option key={p.id} value={p.referralCode}>{p.name} ({p.referralCode})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 block uppercase">Payment Mode</label>
                      <select
                        className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white font-semibold text-stone-700 focus:outline-none"
                        value={manualCustDetails.paymentMethod}
                        onChange={(e) => setManualCustDetails({ ...manualCustDetails, paymentMethod: e.target.value })}
                        id="select-manual-cust-payment"
                      >
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="bKash">bKash (বিকাশ ম্যানুয়াল)</option>
                        <option value="Nagad">Nagad (নগদ ম্যানুয়াল)</option>
                        <option value="Bank Transfer">Bank Wire Transfer</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                    {(() => {
                      const subtotal = manualOrderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
                      const shipping = manualOrderItems.length > 0 ? 100 : 0;
                      
                      let discount = 0;
                      let couponMsg = '';
                      if (manualOrderCoupon) {
                        if (subtotal >= (manualOrderCoupon.minOrderAmount || 0)) {
                          if (manualOrderCoupon.discountType === 'Percentage') {
                            discount = Math.round((subtotal * manualOrderCoupon.amount) / 100);
                          } else {
                            discount = manualOrderCoupon.amount;
                          }
                          couponMsg = `✓ Standard applied (${manualOrderCoupon.discountType === 'Percentage' ? `${manualOrderCoupon.amount}%` : '৳' + manualOrderCoupon.amount})`;
                        } else {
                          couponMsg = `⚠ Requires min. checkout BDT ${manualOrderCoupon.minOrderAmount}`;
                        }
                      }
                      
                      const totalPayable = Math.max(0, subtotal - discount + shipping);

                      return (
                        <div className="space-y-2 text-xs font-semibold text-stone-500">
                          <div className="flex justify-between">
                            <span>Cart Gross Subtotal:</span>
                            <span className="font-mono text-stone-900 font-bold">{setPriceFormat(subtotal)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-emerald-800">
                              <span>Coupon Discount:</span>
                              <span className="font-mono font-black">-{setPriceFormat(discount)}</span>
                            </div>
                          )}
                          {couponMsg && (
                            <div className="text-[10px] text-emerald-700 font-bold text-right italic block">
                              {couponMsg}
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Standard Shipping Fee:</span>
                            <span className="font-mono text-stone-900">{setPriceFormat(shipping)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200/90 text-sm font-black text-stone-900 mt-2">
                            <span className="text-stone-950 uppercase font-sans tracking-wide">Total Payable:</span>
                            <span className="font-mono text-emerald-800 text-base">{setPriceFormat(totalPayable)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg cursor-pointer"
                    id="btn-manual-pos-submit"
                  >
                    ✓ Complete Checkout & Recalculate Commissions
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ Custom State-Based Confirm Modal */}
      {modalConfirm.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-stone-200 text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm text-stone-900">{modalConfirm.title}</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed font-sans">{modalConfirm.message}</p>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalConfirm(prev => ({ ...prev, show: false }))}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {modalConfirm.cancelText || (lang === 'bn' ? 'বাতিল' : 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalConfirm(prev => ({ ...prev, show: false }));
                  modalConfirm.onConfirm();
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {modalConfirm.confirmText || (lang === 'bn' ? 'হ্যাঁ, নিশ্চিত' : 'Yes, Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ℹ️ Custom State-Based Alert Modal */}
      {modalAlert.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-stone-200 text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-sm text-stone-900">{modalAlert.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">{modalAlert.message}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalAlert(prev => ({ ...prev, show: false }))}
                className="px-4 py-2 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {lang === 'bn' ? 'ঠিক আছে' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
