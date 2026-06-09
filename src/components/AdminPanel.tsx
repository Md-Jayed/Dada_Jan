import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Product, Partner, Order, Withdrawal } from '../types';
import { supabase } from '../supabaseClient';
import { SupabaseRLSConsole } from './SupabaseRLSConsole';
import { 
  Users, Layers, ShoppingCart, Percent, TrendingUp, AlertTriangle, Shield, 
  MapPin, Plus, Edit3, Trash2, Check, X, FileText, ArrowDown, ArrowUp, Activity, PieChart
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
    approveWithdrawal,
    lang,
    isAdminLoggedIn,
    logout,
    setShowAuthTab
  } = useApp();

  // Dynamic Session Protection Guard
  useEffect(() => {
    const checkAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.hash = '#/login';
        setShowAuthTab('admin');
      }
    };
    checkAdminSession();
  }, [setShowAuthTab]);

  // Admin subsystem sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'verify' | 'commissions' | 'inventory' | 'orders' | 'products' | 'finance' | 'analytics' | 'database'>('analytics');
  
  // Active simulated ERP role
  const [erpRole, setErpRole] = useState<'Super Admin' | 'Inventory Manager' | 'Finance Manager' | 'Customer Support'>('Super Admin');

  // Product CRUD states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProdData, setNewProdData] = useState({
    name: '',
    sku: '',
    category: 'Pure Food Collection',
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
      category: 'Pure Food Collection',
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
    }
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
                          const amt = Number(prompt(`Add stock amount for ${p.sku}:`, '10'));
                          if (amt && amt > 0) {
                            p.stockQty += amt;
                            editProduct(p);
                          }
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-800 font-bold py-1.5 px-3 rounded-lg flex-1 transition-colors cursor-pointer text-center"
                      >
                        + Adjust Stock holding (+qty)
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
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display font-extrabold text-base text-stone-900">📦 DadaJan Product Directory Catalog</h3>
                  <p className="text-xs text-stone-500">Insert new Sunnah collection packs, adjust retail pricing, or configure certified media flags.</p>
                </div>
                <button
                  id="btn-admin-add-prod-start"
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </button>
              </div>

              {/* Add Product Form */}
              {isAddingProduct && (
                <form onSubmit={handleCreateProductSubmit} className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/75 space-y-4 mb-6">
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
                        value={newProdData.name}
                        onChange={(e) => setNewProdData({ ...newProdData, name: e.target.value })}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">SKU identifier:</label>
                      <input
                        type="text"
                        id="input-newprod-sku"
                        required
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
                        value={newProdData.price}
                        onChange={(e) => setNewProdData({ ...newProdData, price: Number(e.target.value) })}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Cost Price BDT (For Split Profit calculation):</label>
                      <input
                        type="number"
                        id="input-newprod-cost"
                        required
                        value={newProdData.costPrice}
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
                        className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs"
                      >
                        <option value="Pure Food Collection">Pure Food Collection</option>
                        <option value="Sunnah & Lifestyle">Sunnah & Lifestyle</option>
                        <option value="Special Collections">Special Collections</option>
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
                        placeholder="जैसे- Deep forests of Sundarbans"
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

                  <button
                    type="submit"
                    id="btn-confirm-add-prod"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    🚀 Save and Deploy in Active Catalog
                  </button>
                </form>
              )}

              {/* Product list array */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-450">
                      <th className="pb-2 font-bold uppercase">Product info</th>
                      <th className="pb-2 font-bold uppercase">Category</th>
                      <th className="pb-2 font-bold uppercase">Price Retail</th>
                      <th className="pb-2 font-bold uppercase">Cost Price</th>
                      <th className="pb-2 font-bold uppercase">Remaining Holdings</th>
                      <th className="pb-2 font-bold uppercase text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-grid-row/25 transition-colors">
                        <td className="py-2.5 flex items-center gap-2.5">
                          <img src={p.images[0]} className="w-10 h-10 object-cover rounded-lg bg-stone-50 border border-stone-200" alt="" />
                          <div>
                            <span className="font-bold text-stone-900 block">{p.name}</span>
                            <span className="text-[10px] text-stone-400 block font-mono">SKU: {p.sku}</span>
                          </div>
                        </td>
                        <td className="py-2.5">{p.category}</td>
                        <td className="py-2.5 font-mono text-slate-900 font-bold">{setPriceFormat(p.price)}</td>
                        <td className="py-2.5 font-mono text-stone-500">{setPriceFormat(p.costPrice)}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stockQty <= 5 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {p.stockQty} units remaining
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            id={`btn-catalog-delete-${p.id}`}
                            onClick={() => {
                              if (confirm(`Do you want to completely drop ${p.name} from public store?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 hover:text-red-700 text-stone-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      </div>
    </div>
  );
};
