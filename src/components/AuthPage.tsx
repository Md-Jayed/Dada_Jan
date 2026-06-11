import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { supabase } from '../supabaseClient';
import { 
  Lock, Mail, User, Smartphone, MapPin, Key, ShieldCheck, 
  ArrowLeft, Heart, Sparkles, FileText, Check, Landmark, Award
} from 'lucide-react';

interface AuthPageProps {
  onBack?: () => void;
  onSuccess?: (tab: 'customer' | 'partner' | 'admin') => void;
  initialTab?: 'customer' | 'partner' | 'admin';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onSuccess, initialTab = 'customer' }) => {
  const { 
    lang, 
    loginCustomer, 
    loginCustomerWithEmail,
    registerCustomer, 
    addCustomer,
    loginPartner, 
    loginPartnerWithEmail,
    registerPartner, 
    loginAdmin,
    partners,
    customers,
    setLang,
    setActivePanel
  } = useApp();

  // Navigation and mode state
  const [activeTab, setActiveTab] = useState<'customer' | 'partner' | 'admin'>(initialTab);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  // General Inputs
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [supabaseError, setSupabaseError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Email and Password Login & Registration Inputs
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('password');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Customer Register Inputs
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState('Chattogram');
  const [customerArea, setCustomerArea] = useState('Boalkhali');
  const [customerAddress, setCustomerAddress] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // Partner Register Inputs
  const [partnerName, setPartnerName] = useState('');
  const [partnerBenName, setPartnerBenName] = useState('');
  const [partnerRole, setPartnerRole] = useState<'Imam' | 'Dealer' | 'Local Partner'>('Imam');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerDistrict, setPartnerDistrict] = useState('Chattogram');
  const [partnerArea, setPartnerArea] = useState('Boalkhali');
  const [partnerNid, setPartnerNid] = useState('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600');
  const [shariahPledgeChecked, setShariahPledgeChecked] = useState(false);

  // Admin Login Inputs
  const [adminEmail, setAdminEmail] = useState('admin@dadajan.com');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [adminError, setAdminError] = useState('');

  // Sourcing list of districts/areas for easy selector
  const bangladeshHubs = [
    { district: 'Chattogram', areas: ['Boalkhali', 'Anwara', 'Patiya', 'Hathazari'] },
    { district: 'Dhaka', areas: ['Mirpur', 'Dhanmondi', 'Uttara', 'Gulshan'] },
    { district: 'Sylhet', areas: ['Zindabazar', 'Beanibazar', 'Golapganj'] },
    { district: 'Rajshahi', areas: ['Motihar', 'Boalia'] }
  ];

  const currentDistAreas = bangladeshHubs.find(h => h.district === (activeTab === 'partner' ? partnerDistrict : customerDistrict))?.areas || [];

  const handleCustomerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.match(/^01[3-9]\d{8}$/)) {
      setOtpError(lang === 'bn' ? 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)' : 'Enter a valid 11-digit mobile number starting with 01');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setOtpError(lang === 'bn' ? 'অনুগ্রহ করে কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড দিন।' : 'Password must be at least 6 characters long.');
      return;
    }

    setOtpError('');
    setSupabaseError('');
    setIsVerifying(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: customerEmail,
        password: regPassword,
      });

      if (signUpError) {
        setSupabaseError(signUpError.message);
        setOtpError(signUpError.message);
        setIsVerifying(false);
        return;
      }

      if (!signUpData?.session) {
        addCustomer({
          name: customerName,
          mobile,
          email: customerEmail,
          district: customerDistrict,
          area: customerArea,
          address: customerAddress,
          referredBy: referredBy || undefined,
          password: regPassword
        });

        setSuccessMsg(lang === 'bn' 
          ? 'নিবন্ধন অনুরোধ সফল হয়েছে। লগইন করার পূর্বে আপনার ইমেল চেক করুন এবং অ্যাকাউন্ট নিশ্চিত করুন।' 
          : 'Check your email and confirm your account before logging in.');
        setIsVerifying(false);
        return;
      }

      registerCustomer({
        name: customerName,
        mobile,
        email: customerEmail,
        district: customerDistrict,
        area: customerArea,
        address: customerAddress,
        referredBy: referredBy || undefined,
        password: regPassword
      });

      setSuccessMsg(lang === 'bn' ? 'রেজিস্ট্রেশন সফল হয়েছে! দাদাজান পরিবারে স্বাগতম।' : 'Successfully registered & logged in!');
      setIsVerifying(false);
      setActivePanel('customer');
      setTimeout(() => {
        if (onSuccess) onSuccess('customer');
      }, 1200);
    } catch (err: any) {
      setSupabaseError(err.message || 'An unexpected error occurred during signup.');
      setOtpError(err.message || 'An unexpected error occurred during signup.');
      setIsVerifying(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setSupabaseError('');
    setIsVerifying(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) {
        setSupabaseError(signInError.message);
        setOtpError(signInError.message);
        setIsVerifying(false);
        return;
      }

      if (!signInData?.session) {
        setOtpError(lang === 'bn' 
          ? 'কোনো বৈধ সেশন পাওয়া যায়নি। অনুগ্রহ করে আপনার ইমেইল নিশ্চিত করুন।' 
          : 'No valid session found. Please verify your email first.');
        setIsVerifying(false);
        return;
      }

      if (activeTab === 'customer') {
        let success = loginCustomerWithEmail(loginEmail, loginPassword);
        // Robust fallback: if user exists on Supabase but local records were reset, dynamically populate local customer object.
        if (!success) {
          success = registerCustomer({
            name: loginEmail.split('@')[0],
            mobile: '01700000000',
            email: loginEmail,
            district: 'Chattogram',
            area: 'Boalkhali',
            address: 'DADAJAN Member',
            referredBy: undefined,
            password: loginPassword
          });
        }

        if (success) {
          setSuccessMsg(lang === 'bn' ? 'কাস্টমার প্যানেলে লগইন সফল হয়েছে!' : 'Logged in, welcome to DADAJAN!');
          setIsVerifying(false);
          setActivePanel('customer');
          setTimeout(() => {
            if (onSuccess) onSuccess('customer');
          }, 1000);
        } else {
          setOtpError(lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড! পূর্বের পাসওয়ার্ড অথবা ডিফল্ট পাসওয়ার্ড "123456" দিয়ে চেষ্টা করুন।' : 'Invalid email or password! Try your registered password or default "123456".');
          setIsVerifying(false);
        }
      } else if (activeTab === 'partner') {
        let success = loginPartnerWithEmail(loginEmail, loginPassword);
        // Robust fallback: if partner exists on Supabase but local records were reset, dynamically populate local partner object.
        if (!success) {
          success = registerPartner({
            name: loginEmail.split('@')[0],
            bengaliName: loginEmail.split('@')[0],
            role: 'Local Partner',
            mobile: '01700000000',
            email: loginEmail,
            district: 'Chattogram',
            area: 'Boalkhali',
            nidPhoto: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600',
            password: loginPassword
          });
        }

        if (success) {
          setSuccessMsg(lang === 'bn' ? 'অংশীদার পোর্টালে লগইন সফল হয়েছে!' : 'Partner logged in successfully!');
          setIsVerifying(false);
          setActivePanel('partner');
          setTimeout(() => {
            if (onSuccess) onSuccess('partner');
          }, 1000);
        } else {
          setOtpError(lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড! পূর্বের পাসওয়ার্ড অথবা ডিফল্ট পাসওয়ার্ড "123456" দিয়ে চেষ্টা করুন।' : 'Invalid email or password! Try your registered password or default "123456".');
          setIsVerifying(false);
        }
      }
    } catch (err: any) {
      setSupabaseError(err.message || 'An unexpected error occurred during signin.');
      setOtpError(err.message || 'An unexpected error occurred during signin.');
      setIsVerifying(false);
    }
  };

  const handlePartnerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shariahPledgeChecked) {
      alert(lang === 'bn' 
        ? 'দাদাজান অংশীদার হতে হলে অবশ্যই শরীয়াহ সততা ও গুণগত মানের অঙ্গীকার স্বীকার করতে হবে।' 
        : 'Please accept the Shari\'ah compliance and honesty pledge to proceed.');
      return;
    }

    if (!mobile.match(/^01[3-9]\d{8}$/)) {
      setOtpError(lang === 'bn' ? 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন।' : 'Provide a valid mobile number.');
      return;
    }

    setOtpError('');
    setSupabaseError('');
    setIsVerifying(true);

    try {
      const signUpEmail = partnerEmail;
      const signUpPassword = regPassword || '123456';

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
      });

      if (signUpError) {
        setSupabaseError(signUpError.message);
        setOtpError(signUpError.message);
        setIsVerifying(false);
        return;
      }

      if (!signUpData?.session) {
        registerPartner({
          name: partnerName,
          bengaliName: partnerBenName || partnerName,
          role: partnerRole,
          mobile,
          email: partnerEmail,
          district: partnerDistrict,
          area: partnerArea,
          nidPhoto: partnerNid,
          password: regPassword || undefined
        }, false); // autoLogin = false

        setSuccessMsg(lang === 'bn' 
          ? (partnerRole === 'Dealer' 
              ? 'ডিলার নিবন্ধন আবেদন সফল হয়েছে! কাস্টমার নিজে ডিলার অ্যাকাউন্ট সরাসরি খুলতে পারেন না, এটি সক্রিয় করতে অনুগ্রহ করে এডমিন অনুমোদন করান।' 
              : 'পার্টনার নিবন্ধন অনুরোধ সফল হয়েছে। লগইন করার পূর্বে অনুগ্রহ করে আপনার ইমেইল চেক করুন এবং অ্যাকাউন্ট নিশ্চিত করুন।')
          : (partnerRole === 'Dealer' 
              ? 'Dealer registration saved! Customers cannot self-activate. Go to Admin ERP to approve this account.' 
              : 'Check your email and confirm your account before logging in.'));
        setIsVerifying(false);
        return;
      }

      registerPartner({
        name: partnerName,
        bengaliName: partnerBenName || partnerName,
        role: partnerRole,
        mobile,
        email: partnerEmail,
        district: partnerDistrict,
        area: partnerArea,
        nidPhoto: partnerNid,
        password: regPassword || undefined
      }, partnerRole !== 'Dealer'); // If role is Dealer, don't auto-login into active space directly

      setSuccessMsg(lang === 'bn' 
        ? (partnerRole === 'Dealer'
            ? 'আপনার ডিজিটাল ডিলার আবেদন দাদাজান সিস্টেমে জমা হয়েছে। ডিলার অ্যাকাউন্ট সচল করতে এডমিন প্যানেল থেকে অনুমোদন করান!'
            : 'আপনার পার্টনার আবেদন দাদাজান এডমিন বোর্ডে জমা হয়েছে। অনুগ্রহ করে এডমিন প্যানেল থেকে অনুমোদন করান!') 
        : (partnerRole === 'Dealer'
            ? 'Digital Dealer pending request submitted! Approve inside Admin ERP to activate.'
            : 'Partner application submitted! Verify/Approve inside Admin ERP to activate.'));
      setIsVerifying(false);
      
      if (partnerRole !== 'Dealer') {
        setActivePanel('partner');
        setTimeout(() => {
          if (onSuccess) onSuccess('partner');
        }, 2500);
      } else {
        // If they registered as a Dealer, lead them to view the portal which shows the Pending state
        setActivePanel('partner');
        setTimeout(() => {
          if (onSuccess) onSuccess('partner');
        }, 2500);
      }
    } catch (err: any) {
      setSupabaseError(err.message || 'An unexpected error occurred during partner signup.');
      setOtpError(err.message || 'An unexpected error occurred during partner signup.');
      setIsVerifying(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    
    const success = loginAdmin(adminEmail, adminPassword);
    if (success) {
      setSuccessMsg(lang === 'bn' ? 'এডমিন ERP প্যানেলে প্রবেশাধিকার মঞ্জুর!' : 'Admin ERP Access Granted!');
      setActivePanel('admin');
      setTimeout(() => {
        if (onSuccess) onSuccess('admin');
      }, 1000);
    } else {
      setAdminError(lang === 'bn' ? 'ভুল এডমিন ইমেইল অথবা পাসওয়ার্ড!' : 'Invalid admin credentials! Try (admin@dadajan.com / admin)');
    }
  };

  const resetAllForms = () => {
    setOtpSent(false);
    setOtpCode('');
    setOtpError('');
    setSupabaseError('');
    setMobile('');
    setSuccessMsg('');
    setIsVerifying(false);
    setLoginEmail('');
    setLoginPassword('');
    setRegPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Storefront Link */}
      {onBack && (
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-emerald-700 font-bold text-sm mb-6 pb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'bn' ? 'দোকানে ফিরে যান' : 'Back to Storefront'}</span>
        </button>
      )}

      {/* Primary Brand Signage */}
      <div className="text-center mb-8">
        <div className="inline-block bg-emerald-700 text-white font-black text-2xl px-4 py-3 rounded-2xl shadow-md tracking-wider mb-3">
          দ
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
          {lang === 'bn' ? 'দাদাজান ডিজিটাল ইকোসিস্টেম' : 'DADAJAN Digital Ecosystem'}
        </h1>
        <p className="text-stone-500 font-sans text-xs sm:text-sm mt-1 sm:mt-2">
          {lang === 'bn' 
            ? 'ধর্মপ্রাণ পরিবারের বিশ্বস্ত হালাল ই-কমার্স ও অংশীদার সমবায় নেটওয়ার্ক' 
            : 'Shari\'ah-compliant direct distribution and pure-food web workspace.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200 grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Left Visual/Info Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 text-white flex flex-col justify-between text-left relative overflow-hidden">
          {/* Subtle Ambient Mandala Ring Accent */}
          <div className="absolute right-[-40px] top-[-20px] w-52 h-52 bg-[#059669]/10 rounded-full border-[6px] border-white/5 pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div>
              <span className="text-amber-400 font-bold font-mono text-[10px] tracking-widest uppercase">
                {lang === 'bn' ? 'ঈমানী সততা ও মান' : 'Integrity & Quality'}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white mt-1">
                {lang === 'bn' ? 'দাদাজান সততা অংশীদারিত্ব' : 'Join DadaJan Cooperative'}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="p-1.5 bg-emerald-800 rounded-lg text-amber-300 self-start shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <p className="text-xs text-stone-250 leading-relaxed">
                  <strong>{lang === 'bn' ? 'শতভাগ সুনাহ মানদণ্ড:' : '100% Halal Guarantee'}</strong><br/>
                  {lang === 'bn' 
                    ? 'আমাদের প্রতিটি অর্ডারে ইমাম শরিকদের সশরীরে ভেরিফিকেশন ও ল্যাব টেস্টিং সার্টিফিকেট নিশ্চিত করা থাকে।' 
                    : 'Our local Imam partners visually verify and seal ecosystem stocks.'}
                </p>
              </div>

              <div className="flex gap-3">
                <span className="p-1.5 bg-emerald-800 rounded-lg text-amber-300 self-start shrink-0">
                  <Award className="w-4 h-4" />
                </span>
                <p className="text-xs text-stone-250 leading-relaxed">
                  <strong>{lang === 'bn' ? 'ন্যায্য লভ্যাংশ বণ্টন:' : 'Real-Time Commission Splits'}</strong><br/>
                  {lang === 'bn' 
                    ? 'আঞ্চলিক ইমাম ও ডিলারদের ডিজিটাল ওয়ালেট সিস্টেমে তাৎক্ষণিক কমিশন ভাগ করা হয়।' 
                    : 'Automated 2.5% introduces / handling splits transferred instantaneously.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800 flex items-center justify-between text-[11px] text-stone-300 font-mono relative z-10">
            <span>{lang === 'bn' ? 'ভার্সন: ২.৪ রিয়েলটাইম' : 'Ver: 2.4 (Sim-Sync)'}</span>
            <span className="text-emerald-400 font-bold">&#10004; SECURE CONNECT</span>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-[#FAF9F5]/40 text-left">
          
          {/* Roles Selector Tabs */}
          <div>
            <div className="grid grid-cols-3 bg-stone-100 rounded-xl p-1 gap-1 mb-6 border border-stone-200">
              <button 
                onClick={() => { setActiveTab('customer'); resetAllForms(); }}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center flex flex-col items-center justify-center gap-1 ${activeTab === 'customer' ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/80' : 'text-stone-500 hover:text-stone-800 hover:bg-white/40'}`}
              >
                <span>👤 {lang === 'bn' ? 'কাস্টমার' : 'Customer'}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('partner'); resetAllForms(); }}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center flex flex-col items-center justify-center gap-1 ${activeTab === 'partner' ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/80' : 'text-stone-500 hover:text-stone-800 hover:bg-white/40'}`}
              >
                <span>🕌 {lang === 'bn' ? 'পার্টনার' : 'Partner'}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('admin'); resetAllForms(); }}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center flex flex-col items-center justify-center gap-1 ${activeTab === 'admin' ? 'bg-white text-emerald-800 shadow-xs border border-stone-200/80' : 'text-stone-500 hover:text-stone-800 hover:bg-white/40'}`}
              >
                <span>⚙️ {lang === 'bn' ? 'ERP এডমিন' : 'ERP Admin'}</span>
              </button>
            </div>

            {/* Error or Success notification boxes */}
            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-900 rounded-r-lg text-xs font-semibold">
                ⚠️ {otpError}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900 rounded-r-lg text-xs font-semibold animate-pulse">
                🟢 {successMsg}
              </div>
            )}

            {/* CUSTOMER AUTHENTICATION VIEW */}
            {activeTab === 'customer' && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-150">
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                    {lang === 'bn' 
                      ? (isLoginMode ? 'গ্রাহক লগইন ক্রিয়াকলাপ' : 'নতুন গ্রাহক অ্যাকাউন্ট খুলুন') 
                      : (isLoginMode ? 'Customer Store Login' : 'Create Customer Account')}
                  </h3>
                  <button 
                    onClick={() => { setIsLoginMode(!isLoginMode); resetAllForms(); }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-extrabold hover:underline"
                  >
                    {isLoginMode 
                      ? (lang === 'bn' ? 'নতুন অ্যাকাউন্ট?' : 'New Account? Sign Up') 
                      : (lang === 'bn' ? 'ইতিপূর্বে অ্যাকাউন্ট আছে?' : 'Have account? Sign In')}
                  </button>
                </div>

                {isLoginMode ? (
                  <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                      <div className="relative font-sans text-stone-700">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input 
                          type="email" 
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. arif@gmail.com"
                          className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                      <div className="relative font-sans text-stone-700">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          type="password" 
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent"></div>
                          <span>{lang === 'bn' ? 'লগইন করা হচ্ছে...' : 'Signing in...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                        </>
                      )}
                    </button>
                    {supabaseError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[10.5px] text-red-750 font-bold leading-snug text-left mt-2 shadow-xs animate-fadeIn">
                        ⚠️ LogIn Error: {supabaseError}
                      </div>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleCustomerRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <User className="w-4 h-4" />
                          </span>
                          <input 
                            type="text" 
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ আরিফুর রহমান' : 'Ariful Rahman'}
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input 
                            type="email" 
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="arif@gmail.com"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'জেলা' : 'District'}</label>
                        <select 
                          value={customerDistrict}
                          onChange={(e) => {
                            setCustomerDistrict(e.target.value);
                            const found = bangladeshHubs.find(h => h.district === e.target.value);
                            if (found) setCustomerArea(found.areas[0]);
                          }}
                          className="w-full bg-white border border-stone-250 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        >
                          {bangladeshHubs.map(h => <option key={h.district} value={h.district}>{h.district}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'ইউনিয়ন / এলাকা' : 'Area / Union'}</label>
                        <select 
                          value={customerArea}
                          onChange={(e) => setCustomerArea(e.target.value)}
                          className="w-full bg-white border border-stone-250 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        >
                          {currentDistAreas.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'ग्राम বা ডেলিভারি ঠিকানা' : 'Village / Full Delivery Address'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <MapPin className="w-4 h-4" />
                          </span>
                          <input 
                            type="text" 
                            required
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder={lang === 'bn' ? 'চৌধুরী বাড়ি, ৩ নং ওয়ার্ড, ইউনিয়ন পরিষদ সংলগ্ন' : 'House 4, Lane 3, Block A'}
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/50 flex gap-2">
                          <span>💡</span>
                          <p className="text-[10px] text-amber-900 leading-snug">
                            {lang === 'bn' 
                              ? 'কোনো ইমাম অংশীদারের রেফারেল কোড থাকলে তা দিন। কাস্টমার অ্যাকাউন্টে প্রথম অর্ডারে আপনি নিশ্চিত ডিসকাউন্ট পাবেন!'
                              : 'Applying an Imam or Dealer code earns you instant discount at checkout.'}
                          </p>
                        </div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <Award className="w-4 h-4 text-stone-400" />
                          </span>
                          <input 
                            type="text" 
                            value={referredBy}
                            onChange={(e) => setReferredBy(e.target.value)}
                            placeholder="e.g. IMAM-492"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 font-extrabold text-xs">
                            <Smartphone className="w-4 h-4 text-stone-400 mr-1" />
                          </span>
                          <input 
                            type="tel" 
                            required
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="01815566778"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'অ্যাকাউন্টের পাসওয়ার্ড' : 'Account Password'}</label>
                        <div className="relative font-sans text-stone-700">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input 
                            type="password" 
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder={lang === 'bn' ? 'কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড দিন' : 'Enter at least 6 characters'}
                            className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent"></div>
                          <span>{lang === 'bn' ? 'রেজিস্ট্রেশন করা হচ্ছে...' : 'Registering...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'রেজিস্ট্রেশন করুন' : 'Sign Up'}</span>
                        </>
                      )}
                    </button>
                    {otpError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[10.5px] text-red-750 font-bold leading-snug text-left mt-2 shadow-xs animate-fadeIn">
                        ⚠️ SignUp Error: {otpError}
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* PARTNER APPLICATION & LOGIN VIEW */}
            {activeTab === 'partner' && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-150">
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                    {lang === 'bn' 
                      ? (isLoginMode ? 'সম্মানিত অংশীদার লগইন' : 'সম্মানিত অংশীদার হিসেবে আবেদন করুন') 
                      : (isLoginMode ? 'Imam / Partner Login' : 'Imam / Partner Registration')}
                  </h3>
                  <button 
                    onClick={() => { setIsLoginMode(!isLoginMode); resetAllForms(); }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-extrabold hover:underline"
                  >
                    {isLoginMode 
                      ? (lang === 'bn' ? 'নতুন অংশীদার?' : 'Apply? register here') 
                      : (lang === 'bn' ? 'ইতিপূর্বে প্যানেলে আছেন?' : 'Have account? Sign In')}
                  </button>
                </div>

                {isLoginMode ? (
                  <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                      <div className="relative font-sans text-stone-700">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input 
                          type="email" 
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. mahbub.dealer@gmail.com"
                          className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                      <div className="relative font-sans text-stone-700">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          type="password" 
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent"></div>
                          <span>{lang === 'bn' ? 'লগইন করা হচ্ছে...' : 'Signing in...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                        </>
                      )}
                    </button>
                    {supabaseError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[10.5px] text-red-750 font-bold leading-snug text-left mt-2 shadow-xs animate-fadeIn">
                        ⚠️ LogIn Error: {supabaseError}
                      </div>
                    )}
                  </form>
                ) : (
                  // Register/apply Partner Form
                  <form onSubmit={handlePartnerRegisterSubmit} className="space-y-4">
                    <div className="bg-emerald-50/50 p-4.5 rounded-2xl border border-emerald-100 space-y-2 text-left">
                      <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                        📢 {lang === 'bn' ? 'সম্মানিত মসজিদের ইমাম ও খতিবদের বিশেষ প্রাধান্য' : 'Imams & Community Dignitaries Support'}
                      </h4>
                      <p className="text-[10.5px] text-emerald-850 leading-relaxed">
                        {lang === 'bn' 
                          ? 'দাদাজান ইসলামি সততা ও বিশুদ্ধ জীবনযাত্রার প্রসারে ইচ্ছুক মসজিদের সম্মানিত খতিব, মুয়াজ্জিন, হাফেজ ও স্থানীয় দ্বীনদার অংশীদারদের মাধ্যমে সরাসরি গ্রাহকসেবা প্রদান করে।'
                          : 'DADAJAN supports local Imams and regional distribution handlers through direct cooperative rewards.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'পূর্ণ নাম (ইংরেজি)' : 'Full Name (English)'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <User className="w-4 h-4" />
                          </span>
                          <input 
                            type="text" 
                            required
                            value={partnerName}
                            onChange={(e) => setPartnerName(e.target.value)}
                            placeholder="e.g. Maulana Mufti Abdur Rahman"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'পূর্ণ নাম (বাংলা)' : 'Bengali Name'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <User className="w-4 h-4" />
                          </span>
                          <input 
                            type="text" 
                            required
                            value={partnerBenName}
                            onChange={(e) => setPartnerBenName(e.target.value)}
                            placeholder="যেমন: মাওলানা মুফতি আব্দুর রহমান"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 col-span-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'অংশীদারিত্বের ধরণ' : 'Cooperative Partnership Role'}</label>
                        <select 
                          value={partnerRole}
                          onChange={(e) => setPartnerRole(e.target.value as any)}
                          className="w-full bg-white border border-stone-250 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600 animate-transition"
                        >
                          <option value="Imam">{lang === 'bn' ? 'ইমাম অংশীদার (রেফারেল ও সত্যায়ক)' : 'Imam Partner (Introducer / Validator)'}</option>
                          <option value="Dealer">{lang === 'bn' ? 'ডিজিটাল ডিলার (পয়েন্ট হ্যান্ডলার ও লজিস্টিকস)' : 'Digital Dealer (Logistics / Hub Point)'}</option>
                          <option value="Local Partner">{lang === 'bn' ? 'লোকাল পার্টনার (দ্বীনি সমবায় অংশীদার)' : 'Local Partner (General Cooperative)'}</option>
                        </select>
                        {partnerRole === 'Dealer' && (
                          <div className="mt-2 p-3 bg-amber-55 border-l-4 border-amber-500 rounded-r-xl text-stone-800 animate-fadeIn">
                            <span className="font-extrabold text-[#92400e] text-[11px] block uppercase tracking-wide">⚠️ {lang === 'bn' ? 'প্রশাসনিক অনুমোদন আবশ্যক' : 'ADMINISTRATIVE APPROVAL REQUIRED'}</span>
                            <span className="text-[10.5px] leading-relaxed block mt-0.5 text-stone-700">
                              {lang === 'bn' 
                                ? 'গ্রাহকরা সরাসরি ডিলার অ্যাকাউন্ট সক্রিয় করতে পারেন না। আবেদন জমা দেয়ার পর দাদাজান সিস্টেম এডমিন দ্বারা ব্যাকগ্রাউন্ড এবং ভৌগোলিক অবস্থান যাচাইয়ের পর এটি সক্রিয় করা হবে।' 
                                : 'Customers cannot self-create active Dealer hubs. Your submission will remain pending in the DADAJAN system and requires manual review & approval by an Admin.'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile (Personal BKash/Nagad)'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <Smartphone className="w-4 h-4" />
                          </span>
                          <input 
                            type="tel" 
                            required
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="01712345678"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email address'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input 
                            type="email" 
                            required
                            value={partnerEmail}
                            onChange={(e) => setPartnerEmail(e.target.value)}
                            placeholder="cooperative@dadajan.com"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'জেলা' : 'District'}</label>
                        <select 
                          value={partnerDistrict}
                          onChange={(e) => {
                            setPartnerDistrict(e.target.value);
                            const found = bangladeshHubs.find(h => h.district === e.target.value);
                            if (found) setPartnerArea(found.areas[0]);
                          }}
                          className="w-full bg-white border border-stone-250 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        >
                          {bangladeshHubs.map(h => <option key={h.district} value={h.district}>{h.district}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'অর্গানাইজেশন এলাকা / ইউনিয়ন' : 'Hub Area / Union'}</label>
                        <select 
                          value={partnerArea}
                          onChange={(e) => setPartnerArea(e.target.value)}
                          className="w-full bg-white border border-stone-250 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        >
                          {currentDistAreas.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) স্ক্যান ছবি' : 'Photo / NID Scan Proof'}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 font-bold text-[9px]">
                            URL
                          </span>
                          <input 
                            type="text" 
                            required
                            value={partnerNid}
                            onChange={(e) => setPartnerNid(e.target.value)}
                            placeholder="Insert image link"
                            className="w-full bg-white border border-stone-250 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      {/* New Secure Password Register Field */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'অ্যাকাউন্টের পাসওয়ার্ড (ঐচ্ছিক)' : 'Account Password (Optional)'}</label>
                        <div className="relative font-sans text-stone-700">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input 
                            type="password" 
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder={lang === 'bn' ? 'পাসওয়ার্ড দিন (ইমেইল দিয়ে লগইন করতে চাইলে)' : 'Enter password (to login using mail later)'}
                            className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      {/* Islamic-aesthetic checkbox for Shariah honsty agreement */}
                      <div className="sm:col-span-2 p-3.5 bg-amber-50 rounded-2xl border border-amber-300 mt-2 space-y-2.5">
                        <div className="flex gap-2 items-start">
                          <input 
                            type="checkbox"
                            id="chk-shariah-integrity"
                            checked={shariahPledgeChecked}
                            onChange={(e) => setShariahPledgeChecked(e.target.checked)}
                            className="mt-1 accent-emerald-700 cursor-pointer w-4 h-4 rounded border-stone-300"
                          />
                          <label htmlFor="chk-shariah-integrity" className="text-[11px] text-amber-950 font-bold cursor-pointer select-none leading-relaxed">
                            {lang === 'bn' 
                              ? 'আল্লাহ রাব্বুল আলামিনকে সাক্ষী রেখে শপথ করছি যে, আমি সবসময় ১০০% খাঁটি পণ্য ও সুনাহসম্মত ব্যবসার বিশ্বস্ততা রক্ষা কাস্টমারদের সাথে সৎ আচরণ করব। আমার রেফারেল বা লজিস্টিকস দায়িত্বে কখনো ওজনে কারচুপি বা ভেজালের প্রশ্রয় দেব না।'
                              : 'Acknowledging Islamic trade honesty pledge. I will safeguard sunnah values, halal weight-handling and refrain from any deception.'}
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      {isVerifying ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent"></div>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'অংশীদারিত্ব আবেদন জমা দিন' : 'Submit Cooperative Partnership Form'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ERP ADMIN DIRECT LOGIN VIEW */}
            {activeTab === 'admin' && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-150">
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'bn' ? 'এডমিন ERP প্যানেল অ্যাক্সেস' : 'Administrator Secure Gate'}</span>
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                    {lang === 'bn' ? 'সীমিত অ্যাক্সেস' : 'RESTRICTED AREA'}
                  </span>
                </div>

                {adminError && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-900 rounded-r-lg text-xs font-semibold">
                    ❌ {adminError}
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'এডমিন আইডি / ইউজারনেম' : 'Admin Email Address'}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input 
                        type="email" 
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@dadajan.com"
                        className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{lang === 'bn' ? 'নিরাপত্তা পাসওয়ার্ড' : 'Secure Admin Key Codes'}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input 
                        type="password" 
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-extrabold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex gap-2 text-amber-900 leading-snug">
                    <span>💡</span>
                    <p>
                      {lang === 'bn' 
                        ? 'সিমুলেশন ব্যবহারের জন্য ইমেইল ও পাসওয়ার্ড পরিবর্তন ছাড়া সরাসরি নিচের সাবমিট বাটনে চাপুন।' 
                        : 'Simulator Credentials: use email (admin@dadajan.com) and password (admin) to enter.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'এডমিন কনসোল আনলক করুন' : 'Unlock ERP Controller'}</span>
                  </button>
                </form>
              </div>
            )}

          </div>

          <div className="pt-6 border-t border-stone-200 flex items-center justify-center text-[10px] text-stone-400 gap-1 mt-6">
            <span>🛡️ DadaJan Trusted Ledger Sync</span>
            <span>•</span>
            <span>ISO 9001 Sourcing Rules Applied</span>
          </div>

        </div>
      </div>
    </div>
  );
};
