import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { supabase } from '../supabaseClient';
import { SupabaseRLSConsole } from './SupabaseRLSConsole';
import { 
  User, Mail, Smartphone, MapPin, Check, RefreshCw, 
  Settings, ShieldAlert, Award, FileText, Globe, BellRing 
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { 
    lang, 
    currentCustomer, 
    currentPartner,
    customers,
    partners,
    setLang,
    activePanel,
    logout
  } = useApp();

  // Supabase Auth states
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [mobileNum, setMobileNum] = useState('');
  const [districtVal, setDistrictVal] = useState('Chattogram');
  const [areaVal, setAreaVal] = useState('Boalkhali');
  const [addressVal, setAddressVal] = useState('');

  // Preferences
  const [prefLanguage, setPrefLanguage] = useState<'bn' | 'en'>('bn');
  const [prefNotification, setPrefNotification] = useState(true);
  const [prefNewsletter, setPrefNewsletter] = useState(false);
  const [prefShariahAlerts, setPrefShariahAlerts] = useState(true);

  const bangladeshHubs = [
    { district: 'Chattogram', areas: ['Boalkhali', 'Anwara', 'Patiya', 'Hathazari'] },
    { district: 'Dhaka', areas: ['Mirpur', 'Dhanmondi', 'Uttara', 'Gulshan'] },
    { district: 'Sylhet', areas: ['Zindabazar', 'Beanibazar', 'Golapganj'] },
    { district: 'Rajshahi', areas: ['Motihar', 'Boalia'] }
  ];

  const currentDistAreas = bangladeshHubs.find(h => h.district === districtVal)?.areas || [];

  // Fetch Supabase Auth user details
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Supabase user fetch error: ", error.message);
          if (
            error.message.includes('sub claim') || 
            error.message.includes('does not exist') ||
            error.status === 403 ||
            error.status === 401
          ) {
            console.warn("UserProfile cleaning invalid user session");
            await supabase.auth.signOut();
            logout();
            return;
          }
        }
        if (user) {
          setSupabaseUser(user);
          // Prepopulate inputs with Supabase metadata or local DB
          const metaName = user.user_metadata?.display_name || user.user_metadata?.full_name || '';
          setDisplayName(metaName);

          // Deep sync with Local Preferences stored in Supabase Metadata
          if (user.user_metadata?.preferences) {
            const prefs = user.user_metadata.preferences;
            if (prefs.prefLanguage) setPrefLanguage(prefs.prefLanguage);
            if (prefs.prefNotification !== undefined) setPrefNotification(prefs.prefNotification);
            if (prefs.prefNewsletter !== undefined) setPrefNewsletter(prefs.prefNewsletter);
            if (prefs.prefShariahAlerts !== undefined) setPrefShariahAlerts(prefs.prefShariahAlerts);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error details');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [logout]);

  // Sync inputs with local context if initialized / logged in
  useEffect(() => {
    if (activePanel === 'customer' && currentCustomer) {
      setDisplayName(currentCustomer.name);
      setMobileNum(currentCustomer.mobile);
      setDistrictVal(currentCustomer.district);
      setAreaVal(currentCustomer.area);
      setAddressVal(currentCustomer.address);
    } else if (activePanel === 'partner' && currentPartner) {
      setDisplayName(currentPartner.name);
      setMobileNum(currentPartner.mobile);
      setDistrictVal(currentPartner.district);
      setAreaVal(currentPartner.area);
    }
    setPrefLanguage(lang);
  }, [currentCustomer, currentPartner, activePanel, lang]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Update Supabase Auth user_metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          preferences: {
            prefLanguage,
            prefNotification,
            prefNewsletter,
            prefShariahAlerts
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
        setSaving(false);
        return;
      }

      // Update local storage / state context
      if (activePanel === 'customer' && currentCustomer) {
        currentCustomer.name = displayName;
        currentCustomer.mobile = mobileNum;
        currentCustomer.district = districtVal;
        currentCustomer.area = areaVal;
        currentCustomer.address = addressVal;
        localStorage.setItem('currentCustomer', JSON.stringify(currentCustomer));
        
        // Update in DB store dynamically
        const savedDBStr = localStorage.getItem('DADAJAN_DB');
        if (savedDBStr) {
          const db = JSON.parse(savedDBStr);
          db.customers = db.customers.map((c: any) => c.id === currentCustomer.id ? { ...c, name: displayName, mobile: mobileNum, district: districtVal, area: areaVal, address: addressVal } : c);
          localStorage.setItem('DADAJAN_DB', JSON.stringify(db));
        }
      } else if (activePanel === 'partner' && currentPartner) {
        currentPartner.name = displayName;
        currentPartner.bengaliName = displayName;
        currentPartner.mobile = mobileNum;
        currentPartner.district = districtVal;
        currentPartner.area = areaVal;
        localStorage.setItem('currentPartner', JSON.stringify(currentPartner));

        const savedDBStr = localStorage.getItem('DADAJAN_DB');
        if (savedDBStr) {
          const db = JSON.parse(savedDBStr);
          db.partners = db.partners.map((p: any) => p.id === currentPartner.id ? { ...p, name: displayName, bengaliName: displayName, mobile: mobileNum, district: districtVal, area: areaVal } : p);
          localStorage.setItem('DADAJAN_DB', JSON.stringify(db));
        }
      }

      // Sync central language
      if (prefLanguage !== lang) {
        setLang(prefLanguage);
      }

      setSupabaseUser(data.user);
      setSuccessMsg(lang === 'bn' ? 'প্রোফাইল তথ্য ও শরিয়াহ অগ্রাধিকার সফলভাবে পরিমার্জিত হয়েছে!' : 'Profile preferences and details updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update credentials.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-500 gap-2">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
        <p className="text-sm font-bold font-mono uppercase tracking-wider">
          {lang === 'bn' ? 'প্রোফাইল লোড হচ্ছে...' : 'Loading secure profile...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="user-profile-wrapper">
      <div className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xs hover:border-stone-300 transition-all duration-300">
        
        {/* Banner with Status Indicators */}
        <div className="bg-emerald-800 p-6 md:p-8 text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-emerald-900/60 border border-emerald-700 text-emerald-300 text-[9px] font-mono py-1 px-2.5 rounded-full font-bold uppercase tracking-wider">
              🟢 Supabase Auth Core Enabled
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center text-left">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-white shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white mb-1">
                {displayName || (supabaseUser?.email ? supabaseUser.email.split('@')[0] : 'Member')}
              </h2>
              <p className="text-xs text-emerald-200 flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5" /> {supabaseUser?.email || 'N/A'}
              </p>
              {supabaseUser && (
                <p className="text-[10px] text-emerald-300/80 font-mono mt-1">
                  ID: {supabaseUser.id} | Joined: {new Date(supabaseUser.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informational Message Boxes */}
        {errorMsg && (
          <div className="m-4 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-2xl text-red-900 text-xs font-bold font-sans text-left">
            ⚠️ Error: {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="m-4 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-2xl text-emerald-900 text-xs font-bold font-sans text-left animate-pulse">
            🟢 {successMsg}
          </div>
        )}

        {/* Profile and Preference Controls */}
        <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-8">
          
          {/* Section 1: Core User Metadata details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Settings className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                {lang === 'bn' ? 'মৌলিক প্রোফাইল তথ্য' : 'Core Identification Profile'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'bn' ? 'সম্পূর্ণ নাম (সুফিয়ানি শংসাপত্র অনুযায়ী)' : 'Display Name / Full Name'}
                </label>
                <div className="relative font-sans text-stone-700">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                    <User className="w-4 h-4 text-stone-405" />
                  </span>
                  <input 
                    type="text" 
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Arif Chowdhury"
                    className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'bn' ? 'মোবাইল নম্বর' : 'Primary Contact Mobile'}
                </label>
                <div className="relative font-sans text-stone-700">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                    <Smartphone className="w-4 h-4 text-stone-405" />
                  </span>
                  <input 
                    type="tel" 
                    required
                    value={mobileNum}
                    onChange={(e) => setMobileNum(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {activePanel === 'customer' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {lang === 'bn' ? 'জেলা' : 'District Hub'}
                    </label>
                    <select 
                      value={districtVal}
                      onChange={(e) => {
                        setDistrictVal(e.target.value);
                        const found = bangladeshHubs.find(h => h.district === e.target.value);
                        if (found) setAreaVal(found.areas[0]);
                      }}
                      className="w-full bg-white border border-stone-250 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600"
                    >
                      {bangladeshHubs.map(h => <option key={h.district} value={h.district}>{h.district}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {lang === 'bn' ? 'ইউনিয়ন / এলাকা' : 'Union / Area'}
                    </label>
                    <select 
                      value={areaVal}
                      onChange={(e) => setAreaVal(e.target.value)}
                      className="w-full bg-white border border-stone-250 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600"
                    >
                      {currentDistAreas.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {lang === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Detailed Dispatch Address'}
                    </label>
                    <div className="relative font-sans text-stone-700">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                        <MapPin className="w-4 h-4 text-stone-405" />
                      </span>
                      <input 
                        type="text" 
                        required
                        value={addressVal}
                        onChange={(e) => setAddressVal(e.target.value)}
                        placeholder="House No, Village, Ward..."
                        className="w-full bg-white border border-stone-250 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Preferences Metadata on Supabase */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Globe className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                {lang === 'bn' ? 'পোর্টাল ব্যবহারের অগ্রাধিকারসমূহ' : 'Preferences & Shari\'ah Settings'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'bn' ? 'পছন্দনীয় ভাষা' : 'Preferred Language'}
                </label>
                <select 
                  value={prefLanguage}
                  onChange={(e) => setPrefLanguage(e.target.value as 'bn' | 'en')}
                  className="w-full bg-white border border-stone-250 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:border-emerald-600"
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>

              {/* Shari'ah Compliance / Quality update alert opt-in */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-150 flex items-start gap-3">
                <input 
                  type="checkbox"
                  id="prefShariahAlerts"
                  checked={prefShariahAlerts}
                  onChange={(e) => setPrefShariahAlerts(e.target.checked)}
                  className="mt-1 accent-emerald-700 rounded cursor-pointer"
                />
                <div className="space-y-1">
                  <label htmlFor="prefShariahAlerts" className="text-xs font-bold text-stone-850 cursor-pointer block leading-none">
                    {lang === 'bn' ? 'শরিয়াহ গুণমান আপডেট' : 'Shari\'ah Quality Bulletins'}
                  </label>
                  <p className="text-[10px] text-stone-500 leading-snug">
                    {lang === 'bn' ? 'আমাদের নতুন পণ্য ও হালাল ল্যাব পরীক্ষার লাইভ আপডেট সরাসরি নোটিফিকেশনে গ্রহণ করুন।' : 'Get certified lab testing and honey batch origin verifications.'}
                  </p>
                </div>
              </div>

              {/* Transaction Notifications preference */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-150 flex items-start gap-3">
                <input 
                  type="checkbox"
                  id="prefNotification"
                  checked={prefNotification}
                  onChange={(e) => setPrefNotification(e.target.checked)}
                  className="mt-1 accent-emerald-700 rounded cursor-pointer"
                />
                <div className="space-y-1">
                  <label htmlFor="prefNotification" className="text-xs font-bold text-stone-850 cursor-pointer block leading-none">
                    {lang === 'bn' ? 'অর্ডার ও লজিস্টিক ট্র্যাকিং এলার্ট' : 'Immediate Dispatch Alerts'}
                  </label>
                  <p className="text-[10px] text-stone-500 leading-snug">
                    {lang === 'bn' ? 'অর্ডারের অবস্থান পরিবর্তন হলে সাথে সাথে ইমেইলে তথ্য পাঠান।' : 'Instantly receive confirmation mail and tracking milestones.'}
                  </p>
                </div>
              </div>

              {/* Promotional preference */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-150 flex items-start gap-3">
                <input 
                  type="checkbox"
                  id="prefNewsletter"
                  checked={prefNewsletter}
                  onChange={(e) => setPrefNewsletter(e.target.checked)}
                  className="mt-1 accent-emerald-700 rounded cursor-pointer"
                />
                <div className="space-y-1">
                  <label htmlFor="prefNewsletter" className="text-xs font-bold text-stone-850 cursor-pointer block leading-none">
                    {lang === 'bn' ? 'সাপ্তাহিক সুন্নাহ নিউজলেটার' : 'Sunnah Weekly Newsletter'}
                  </label>
                  <p className="text-[10px] text-stone-500 leading-snug">
                    {lang === 'bn' ? 'নতুন মৌসুমি ফলন ও ইসলামী ব্যবসায়ী সংস্কৃতির ঐতিহাসিক নিবন্ধসমূহ।' : 'Access health tips, Islamic business practice insights, and grower features.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <RefreshCw className="animate-spin w-4 h-4" />
                  <span>{lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Preferences...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অগ্রাধিকার সমূহ সংরক্ষণ করুন' : 'Apply Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* Database Security Engine (Supabase Row Level Security) */}
      <SupabaseRLSConsole currentRole={activePanel} />
    </div>
  );
};
