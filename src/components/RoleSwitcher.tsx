import React from 'react';
import { useApp } from '../AppContext';
import { navigateToRoute } from '../navigation';
import { Eye, ShieldCheck, Users, ShoppingBag, Languages, Award } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { 
    activePanel, 
    setActivePanel, 
    partners, 
    selectedPartnerId, 
    setSelectedPartnerId, 
    lang, 
    setLang 
  } = useApp();

  const activePartner = partners.find(p => p.id === selectedPartnerId);

  return (
    <div className="bg-slate-900 border-b border-emerald-920 text-slate-100 px-4 py-2 text-xs relative z-50 flex flex-wrap gap-4 items-center justify-between shadow-md">
      {/* Simulation Info */}
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-emerald-400 font-display">DadaJan Simulator Sandbox</span>
        <span className="text-slate-400 border-l border-slate-700 pl-2">
          {lang === 'bn' ? 'বাস্তব সময়ে কমিশন ও ক্যাশআউট ট্র্যাক করুন' : 'Track live commissions & balance changes'}
        </span>
      </div>

      {/* Primary Role Switchers */}
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
        <button
          id="btn-switch-customer"
          onClick={() => {
            setActivePanel('customer');
            navigateToRoute({ type: 'home' });
          }}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all ${
            activePanel === 'customer' 
              ? 'bg-emerald-650 text-white shadow' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? '🛒 কাস্টমার প্যানেল' : '🛒 Customer Store'}</span>
        </button>
        <button
          id="btn-switch-partner"
          onClick={() => {
            setActivePanel('partner');
            navigateToRoute({ type: 'partner' });
          }}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all ${
            activePanel === 'partner' 
              ? 'bg-emerald-650 text-white shadow' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? '🕌 ইমাম ও পার্টনার' : '🕌 Imam & Dealer'}</span>
        </button>
        <button
          id="btn-switch-admin"
          onClick={() => {
            setActivePanel('admin');
            navigateToRoute({ type: 'admin' });
          }}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all ${
            activePanel === 'admin' 
              ? 'bg-amber-600 text-white shadow' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? '⚙️ এডমিন ERP' : '⚙️ Admin ERP'}</span>
        </button>
      </div>

      {/* Simulated Agent Quick Changer */}
      {activePanel === 'partner' && (
        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-750">
          <span className="text-slate-400 font-medium">
            {lang === 'bn' ? 'সক্রিয় পার্টনার সিমুলেশন:' : 'Simulating Partner:'}
          </span>
          <select
            id="simulated-partner-select"
            value={selectedPartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-emerald-300 font-semibold px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
          >
            {partners.map(p => (
              <option key={p.id} value={p.id}>
                {p.bengaliName} ({lang === 'bn' ? p.role : p.role}) {p.verifiedStatus === 'Pending' ? '৳0 [Pending]' : `৳${p.walletBalance}`}
              </option>
            ))}
          </select>
          {activePartner && activePartner.verifiedStatus === 'Approved' && (
            <div className="bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
              {lang === 'bn' ? 'কোড' : 'CODE'}: {activePartner.referralCode}
            </div>
          )}
        </div>
      )}

      {/* Language Switch */}
      <div className="flex items-center gap-2">
        <button
          id="btn-lang-toggle"
          onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-semibold"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}</span>
        </button>
      </div>
    </div>
  );
};
