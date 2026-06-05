import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Partner, Order, Withdrawal, AppNotification, Customer } from '../types';
import { 
  Users, Wallet, Share2, Printer, Download, Bell, Send, CheckCircle, 
  MapPin, AlertCircle, RefreshCw, QrCode, Phone, Landmark, HelpCircle, ArrowUpRight
} from 'lucide-react';

export const PartnerPanel: React.FC = () => {
  const { 
    partners, 
    orders, 
    withdrawals, 
    notifications, 
    customers, 
    selectedPartnerId, 
    setPriceFormat, 
    requestWithdrawal, 
    markNotificationsAsRead, 
    clearNotifications,
    lang 
  } = useApp();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Bank Account'>('bKash');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [activeTab, setActiveTab] = useState<'dash' | 'qr' | 'customers' | 'wallet' | 'notif'>('dash');

  // Find active simulated partner
  const partner = partners.find(p => p.id === selectedPartnerId);

  if (!partner) {
    return (
      <div className="p-12 text-center bg-stone-55 max-w-lg mx-auto my-12 rounded-2xl border border-stone-200">
        <p className="text-sm font-bold text-stone-500">পার্টনার তথ্য লোড করা সম্ভব হচ্ছে না। অনুগ্রহ করে রুল সুইচার ব্যবহার করে পার্টনার নির্বাচন করুন।</p>
      </div>
    );
  }

  // Filter introduced customers
  const introducedCustomers = customers.filter(c => c.referredBy?.toLowerCase() === partner.referralCode.toLowerCase());
  
  // Filter current area orders (For Dealers/Partners geographic assignment)
  const currentAreaOrders = orders.filter(
    o => o.assignedPartnerId === partner.id || 
    (partner.role === 'Dealer' && o.area.toLowerCase() === partner.area.toLowerCase())
  );

  // Filter withdrawals for this partner
  const partnerWithdrawals = withdrawals.filter(w => w.partnerId === partner.id);

  // Filter partner notifications
  const partnerNotifications = notifications.filter(n => n.targetRole === 'Partner' && n.partnerId === partner.id);
  const unreadNotifications = partnerNotifications.filter(n => !n.read);

  // Stats calculation
  const calculateTodayEarnings = () => {
    // Delivered orders today/simulated. Let's filter delivered orders on simulated referrals
    const deliveredReferralOrders = orders.filter(
      o => o.status === 'Delivered' && 
      o.referralCode?.toLowerCase() === partner.referralCode.toLowerCase()
    );
    // Multiply by average commission
    return Math.round(deliveredReferralOrders.reduce((acc, o) => acc + o.total * 0.025, 0));
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে সঠিক পরিমাণ টাকা লিখুন।' : 'Please enter a valid amount.');
      return;
    }
    if (amount > partner.walletBalance) {
      alert(lang === 'bn' ? 'দুঃখিত, ওয়ালেটে পর্যাপ্ত টাকা নেই।' : 'Insufficient wallet balance.');
      return;
    }
    if (!withdrawDetails) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে ক্যাশআউট নম্বর বা ব্যাংক বিবরণ দিন।' : 'Please provide cash-out details.');
      return;
    }

    requestWithdrawal(partner.id, amount, withdrawMethod, withdrawDetails);
    setWithdrawAmount('');
    setWithdrawDetails('');
    alert(lang === 'bn' ? 'তহবিল উত্তোলনের আবেদন এডমিন প্যানেলে সফলভাবে পাঠানো হয়েছে!' : 'Payout request submitted successfully for approval!');
  };

  const currentAreaCustomers = customers.filter(c => c.area.toLowerCase() === partner.area.toLowerCase());

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800 pb-12 font-sans">
      
      {/* Elder-friendly Header Panel */}
      <div className="bg-emerald-850 text-white p-6 md:p-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <users className="w-64 h-64 text-white" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-full bg-amber-500 border-4 border-emerald-700 overflow-hidden shrink-0">
              <img src={partner.nidPhoto} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 bg-emerald-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                🕌 দাদাজান {partner.role === 'Imam' ? 'ইমাম অংশীদার' : 'ডিজিটাল ডিলার'}
              </span>
              <h1 className="text-xl md:text-2xl font-bold font-display leading-tight">{partner.bengaliName}</h1>
              <p className="text-xs text-emerald-200 mt-1 font-mono">ID: {partner.id} | এলাকা: {partner.area}, {partner.district}</p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold leading-none ${
              partner.verifiedStatus === 'Approved' ? 'bg-amber-500 text-emerald-950' : 'bg-red-500 text-white'
            }`}>
              {partner.verifiedStatus === 'Approved' ? '✓ নিবন্ধিত ও সক্রিয়' : 'আবেদন প্রক্রিয়াধীন'}
            </span>
            <button
              id="btn-partner-notif-bell"
              onClick={() => { setActiveTab('notif'); markNotificationsAsRead('Partner', partner.id); }}
              className="relative p-2.5 bg-emerald-850 hover:bg-emerald-800 text-stone-105 border border-emerald-700 hover:border-emerald-600 rounded-full cursor-pointer transition-all shrink-0"
            >
              <Bell className="w-5 h-5 text-amber-300" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-653 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold font-mono animate-bounce">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Elder-friendly Navigation tabs (Language Bengali First) */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 p-1 bg-white border border-stone-200 rounded-2xl gap-1">
          <button
            id="tab-partner-dash"
            onClick={() => setActiveTab('dash')}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'dash' ? 'bg-emerald-800 text-white shadow' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span>আজকের আয়-ব্যয়</span>
          </button>
          <button
            id="tab-partner-qr"
            onClick={() => setActiveTab('qr')}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'qr' ? 'bg-emerald-800 text-white shadow' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>আমার কিউআর কোড</span>
          </button>
          <button
            id="tab-partner-customers"
            onClick={() => setActiveTab('customers')}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'customers' ? 'bg-emerald-800 text-white shadow' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>আমার শুভাকাঙ্ক্ষী</span>
          </button>
          <button
            id="tab-partner-wallet"
            onClick={() => setActiveTab('wallet')}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'wallet' ? 'bg-emerald-800 text-white shadow' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>টাকা উত্তোলন করুন</span>
          </button>
          <button
            id="tab-partner-notif"
            onClick={() => setActiveTab('notif')}
            className={`col-span-2 md:col-span-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'notif' ? 'bg-emerald-800 text-white shadow' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>নোটিফিকেশন সেন্টার ({unreadNotifications.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content panels */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* TAB 1: DASHBOARD (Bengali First Elder-friendly) */}
        {activeTab === 'dash' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Wallet Balance Tile (Large Font) */}
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm md:col-span-3">
              <h3 className="text-xs font-bold uppercase text-amber-700 tracking-wider mb-2">উত্তোলনযোগ্য জমা সাধারণ ব্যালেন্স (Wallet Balance)</h3>
              <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
                <span className="text-4xl md:text-5xl font-mono font-extrabold text-[#065f46]">{setPriceFormat(partner.walletBalance)}</span>
                <button
                  id="btn-partner-go-withdraw-fast"
                  onClick={() => setActiveTab('wallet')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-2xl font-bold text-xs cursor-pointer shadow flex items-center gap-1.5 self-start"
                >
                  <Send className="w-4 h-4" />
                  <span>তহবিল উত্তোলন আবেদন</span>
                </button>
              </div>
            </div>

            {/* 2.1 Today's, Monthly, Cumulative balances (Requested list) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase">আজকের অর্জিত আয়</span>
              <div className="text-2xl font-mono font-bold text-stone-900 mt-1">{setPriceFormat(calculateTodayEarnings())} BDT</div>
              <p className="text-[10px] text-stone-400 mt-2">আজ ডেলিভারিকৃত অর্ডারগুলোর কমিশন হিসেব করা হয়েছে।</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <span className="text-[11px] font-bold text-stone-500 uppercase">চলতি মাসের মোট কমিশন</span>
              <div className="text-2xl font-mono font-bold text-stone-900 mt-1">{setPriceFormat(partner.walletBalance + partner.pendingBalance)} BDT</div>
              <p className="text-[10px] text-stone-400 mt-2">চলতি ৩০ দিনে সংগৃহীত মোট কমিশন ও বকেয়া পাওনা।</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">সর্বমোট অর্জিত আজীবন লাভ</span>
              <div className="text-2xl font-mono font-bold text-emerald-800 mt-1">{setPriceFormat(partner.totalWithdrawn + partner.walletBalance)} BDT</div>
              <p className="text-[10px] text-stone-400 mt-2">দাদাজান থেকে আজ পর্যন্ত সংগৃহীত মোট নগদ অর্থ ও লভ্যাংশ।</p>
            </div>

            {/* Area Activity (For geographical dealer delivery tasks) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm md:col-span-3 text-left">
              <h3 className="font-display font-extrabold text-base text-stone-900 mb-4">
                📍 এরিয়া সার্ভিস প্যানেল (এলাকা: {partner.area})
              </h3>
              {currentAreaOrders.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">আপনার রুট করা এলাকায় বর্তমানে কোনো ডেলিভারি সার্ভিস জমা নেই।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400">
                        <th className="pb-2 text-left font-bold uppercase">{lang === 'bn' ? 'অর্ডার নম্বর' : 'ORDER'}</th>
                        <th className="pb-2 text-left font-bold uppercase">{lang === 'bn' ? 'গ্রাহকের নাম' : 'CLIENT'}</th>
                        <th className="pb-2 text-left font-bold uppercase">{lang === 'bn' ? 'পণ্যমূল্য' : 'TOTAL'}</th>
                        <th className="pb-2 text-left font-bold uppercase">{lang === 'bn' ? 'স্ট্যাটাস' : 'STATUS'}</th>
                        <th className="pb-2 text-left font-bold uppercase">{lang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'PAYMENT'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {currentAreaOrders.map(o => (
                        <tr key={o.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-2.5 font-mono font-bold uppercase">{o.id}</td>
                          <td className="py-2.5">{o.customerName} ({o.customerMobile})</td>
                          <td className="py-2.5 font-mono">{setPriceFormat(o.total)}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">{o.status}</span>
                          </td>
                          <td className="py-2.5 font-semibold text-emerald-800">{o.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY QR CODE */}
        {activeTab === 'qr' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-stone-200/70 shadow-sm text-center">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-805 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-emerald-100">
              <QrCode className="w-4 h-4" /> আমার নিজস্ব রেফারেল ড্যাশবোর্ড
            </span>
            <h2 className="text-xl font-bold text-stone-900 mb-1">রেফারেল কোড: {partner.referralCode}</h2>
            <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto">
              গ্রাহক এই কোড ব্যবহার করে প্রথম অর্ডারে ৳১০০ মূল্যছাড় পাবেন এবং আপনি পাবেন আজীবন প্যাসিভ কমিশন!
            </p>

            {/* Unique Referral QR Poster (Requested details) */}
            <div className="bg-[#f0fdf4]/50 border-2 border-dashed border-emerald-300 p-6 rounded-2xl max-w-xs mx-auto mb-6 text-center">
              <div className="bg-white p-3 rounded-xl inline-block shadow-xs mb-3 border border-emerald-100">
                {/* Visual rendering of customizable high-fidelity QR Code box */}
                <div className="w-40 h-40 bg-zinc-50 border border-stone-150 flex items-center justify-center relative">
                  <div className="absolute inset-2 flex items-center justify-center border-4 border-slate-900">
                    <div className="w-full h-full bg-slate-900 opacity-10"></div>
                  </div>
                  {/* Mock QR pixels */}
                  <div className="text-stone-300 font-mono text-[9px] select-none text-center leading-none font-bold">
                    DADAJAN REFERRAL<br/>QR KEY<br/>[ {partner.referralCode} ]
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-900 text-white font-mono px-3 py-1 rounded tracking-wide">
                DADAJAN-PARTNER-{partner.id}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs mb-6 text-center font-mono select-all">
              https://dadajan.com/ref?code={partner.referralCode}
            </div>

            {/* Quick Actions (Requested items: Download, WhatsApp, Facebook, Print Poster) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                id="btn-partner-qr-whatsapp"
                onClick={() => alert('WhatsApp এ শেয়ার করা হয়েছে (ডেভেলপার নোড সিমুলেশন)')}
                className="py-3 bg-stone-50 hover:bg-stone-100 border border-stone-250 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp শেয়ার</span>
              </button>
              <button
                id="btn-partner-qr-facebook"
                onClick={() => alert('Facebook এ শেয়ার করা হয়েছে (সিমুলেশন)')}
                className="py-3 bg-stone-50 hover:bg-stone-100 border border-stone-250 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-indigo-700" />
                <span>Facebook শেয়ার</span>
              </button>
              <button
                id="btn-partner-qr-download"
                onClick={() => alert('Download Started... (সিমুলেশন)')}
                className="py-3 bg-stone-50 hover:bg-stone-100 border border-stone-250 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-amber-700" />
                <span>ডাউনলোড কিউআর</span>
              </button>
              <button
                id="btn-partner-qr-print"
                onClick={() => alert('পোস্টার প্রিন্ট মডিউল সফলভাবে সচল করা হয়েছে')}
                className="py-3 bg-emerald-700 hover:bg-emerald-800 border border-emerald-850 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>পোস্টার প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-6 text-left">
            
            {/* 2.3 Personally Introduced Customers (Lifetime passive Commission split) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm">
              <h3 className="font-display font-bold text-base text-stone-950 mb-1 flex items-center gap-1.5">
                <Users className="w-5 h-5 text-emerald-800" />
                আমার কোড ব্যবহারকারী শুভাকাঙ্ক্ষী (Introduced Customers)
              </h3>
              <p className="text-[11px] text-stone-400 mb-4">আপনার পরামর্শে সরাসরি দাদাজান অ্যাপ ডাউনলোড করেছেন ও আপনার কোড ব্যবহার করে প্রথম অর্ডার নিশ্চিত করেছেন।</p>

              {introducedCustomers.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">আপনি এখনো কোনো শুভাকাঙ্ক্ষী গ্রাহক যুক্ত করেননি।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400">
                        <th className="pb-2 font-bold uppercase">গ্রাহকের নাম (Client)</th>
                        <th className="pb-2 font-bold uppercase">যোগদানের তারিখ</th>
                        <th className="pb-2 font-bold uppercase">এলাকা</th>
                        <th className="pb-2 font-bold uppercase text-right">আপনার অর্জিত কমিশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {introducedCustomers.map(c => {
                        // Calculate commissions gained
                        const clientOrders = orders.filter(
                          o => o.customerMobile === c.mobile && 
                          o.status === 'Delivered'
                        );
                        const commissionSum = Math.round(clientOrders.reduce((acc, o) => acc + o.total * 0.025, 0));
                        return (
                          <tr key={c.id}>
                            <td className="py-2.5 font-bold text-stone-900">{c.name}</td>
                            <td className="py-2.5 text-stone-400 font-mono">{c.joinDate}</td>
                            <td className="py-2.5 text-stone-600">{c.area}, {c.district}</td>
                            <td className="py-2.5 text-emerald-800 text-right font-mono font-bold">
                              {setPriceFormat(commissionSum)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2.3 Geographic Assigned Area Customers */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm">
              <h3 className="font-display font-bold text-base text-stone-950 mb-1 flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-emerald-800" />
                আমার এলাকার গ্রাহক সেবা (Current Area Customers)
              </h3>
              <p className="text-[11px] text-stone-400 mb-4">আপনার অর্পিত অঞ্চল ({partner.area}) এ অবস্থানরত দাদাজান গ্রাহকদের তালিকা।</p>

              {currentAreaCustomers.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">আপনার এলাকায় এই মুহূর্তে সাধারণ গ্রাহক নেই।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400">
                        <th className="pb-2 font-bold uppercase">গ্রাহকের নাম</th>
                        <th className="pb-2 font-bold uppercase">মোবাইল নম্বর</th>
                        <th className="pb-2 font-bold uppercase">ঠিকানা</th>
                        <th className="pb-2 font-bold uppercase text-right">সর্বমোট ক্রয় করেছেন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {currentAreaCustomers.map(c => {
                        const purchases = orders.filter(o => o.customerMobile === c.mobile);
                        const totalSpent = purchases.reduce((acc, o) => acc + o.total, 0);
                        return (
                          <tr key={c.id}>
                            <td className="py-2.5 font-semibold text-slate-800">{c.name}</td>
                            <td className="py-2.5 text-stone-500 font-mono">{c.mobile}</td>
                            <td className="py-2.5 text-stone-500 max-w-xs truncate">{c.address}</td>
                            <td className="py-2.5 text-stone-850 text-right font-mono font-bold">
                              {purchases.length} অর্ডার ({setPriceFormat(totalSpent)})
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WALLET & WITHDRAW FUNDS */}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Withdraw form */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <span className="bg-emerald-50 text-emerald-805 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                🏦 ম্যানুয়াল ক্যাশআউট গেটওয়ে
              </span>
              <h3 className="font-display font-extrabold text-base text-stone-900 mb-1">তহবিল উত্তোলন আবেদন করুন</h3>
              <p className="text-[11px] text-stone-500 mb-6">আপনার অ্যাকাউন্ট থেকে bKash, Nagad অথবা ব্যাংক একাউন্টের মাধ্যমে টাকা উত্তোলন করতে ফর্মটি পূরণ করুন।</p>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">উত্তোলনের পরিমাণ BDT (টাকা):</label>
                  <input
                    type="number"
                    id="input-partner-withdraw-amount"
                    required
                    placeholder="যেমন- 1000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400 block mt-1">পকেটে উত্তোলনের সর্বোচ্চ সীমাবদ্ধতা: {setPriceFormat(partner.walletBalance)}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">অর্থপ্রদানের পেমেন্ট মেথড:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([ 'bKash', 'Nagad', 'Bank Account' ] as const).map(method => (
                      <button
                        key={method}
                        id={`btn-partner-wth-method-${method.replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() => setWithdrawMethod(method)}
                        className={`py-3 px-2 border rounded-xl text-xs font-bold text-center cursor-pointer transition-all ${
                          withdrawMethod === method 
                            ? 'bg-emerald-55 border-emerald-600 text-emerald-800' 
                            : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">হিসাবের বিবরণ / একাউন্ট নম্বর:</label>
                  <input
                    type="text"
                    id="input-partner-withdraw-details"
                    required
                    placeholder="যেমন- ০১৭১২৩৪৫৬৭৮ (পার্সোনাল) বা ব্যাংক হিসাবের বিবরণ"
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-700/60 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-partner-confirm-withdraw"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 border border-emerald-850 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow cursor-pointer text-center"
                >
                  উত্তোলনের আবেদন জমা দিন
                </button>
              </form>
            </div>

            {/* Withdrawal records history */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm">
              <h3 className="font-display font-bold text-base text-stone-900 mb-4">টাকা উত্তোলনের রেকর্ডসমূহ (Withdrawals Log)</h3>
              {partnerWithdrawals.length === 0 ? (
                <p className="text-xs text-stone-400 py-12 text-center">আমদের ফিন্যান্স সার্ভারে উত্তোলনের কোনো ইতিহাস নেই।</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {partnerWithdrawals.map(w => (
                    <div key={w.id} className="flex justify-between items-center bg-stone-50/50 border border-stone-150 p-3.5 rounded-xl text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono font-bold text-stone-900 uppercase">{w.id}</span>
                          <span className="text-[10px] bg-stone-200 text-stone-600 py-0.5 px-2 rounded-lg font-bold">{w.method}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block">{w.date} | {w.details}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-stone-900 block">{setPriceFormat(w.amount)}</span>
                        <span className={`text-[10px] font-bold ${
                          w.status === 'Approved' ? 'text-emerald-700' :
                          w.status === 'Rejected' ? 'text-red-650' : 'text-amber-700'
                        }`}>
                          {w.status === 'Approved' ? 'অনুমোদিত' : w.status === 'Rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমান'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notif' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm text-left">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-1.5">
                <Bell className="w-5 h-5 text-amber-500" />
                নোটিফিকেশন অ্যালার্ট সেন্টার
              </h3>
              <button
                id="btn-partner-clear-notif"
                onClick={() => { clearNotifications('Partner', partner.id); }}
                className="text-stone-400 hover:text-stone-600 font-bold text-xs"
              >
                সব মুছে ফেলুন
              </button>
            </div>

            {partnerNotifications.length === 0 ? (
              <p className="text-xs text-stone-400 py-16 text-center">আপনার জন্য এই মুহূর্তে কোনো অ্যালার্ট বা বিজ্ঞপ্তি নেই।</p>
            ) : (
              <div className="space-y-3">
                {partnerNotifications.map(n => (
                  <div key={n.id} className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                    n.read ? 'bg-stone-50/50 border-stone-150' : 'bg-emerald-50/30 border-emerald-100'
                  }`}>
                    <span className="p-2 bg-emerald-50 text-emerald-800 rounded-full shrink-0">
                      <AlertCircle className="w-4 h-4 text-emerald-600" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2.5">
                        <h4 className="font-extrabold text-xs text-stone-900">{n.title}</h4>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 leading-snug">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
