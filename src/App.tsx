import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { CustomerPanel } from './components/CustomerPanel';
import { PartnerPanel } from './components/PartnerPanel';
import { AdminPanel } from './components/AdminPanel';
import { AuthPage } from './components/AuthPage';
import { supabase } from './supabaseClient';
import { AlertCircle, Terminal, Info, BellRing } from 'lucide-react';
import { parseCurrentRoute, navigateToRoute, updateDocumentMetadata } from './navigation';

function DashboardLayout() {
  const { activePanel, setActivePanel, notifications, lang, setLang, showAuthTab, setShowAuthTab, logout, isAuthLoading } = useApp();

  // Validate session/user robustness (especially handling deleted users)
  useEffect(() => {
    const validateSupabaseUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.warn("Supabase auth check found an error:", error.message);
          if (
            error.message.includes('sub claim') || 
            error.message.includes('does not exist') || 
            error.status === 403 || 
            error.status === 401
          ) {
            console.warn("Clearing obsolete or invalid session cookie/localStorage token.");
            await supabase.auth.signOut();
            logout();
          }
        }
      } catch (err) {
        console.error("Failed to fetch user session details dynamically:", err);
      }
    };
    validateSupabaseUser();
  }, [logout]);

  // Synchronize layout panels & auth tabs with the browser route (pathname or hash)
  useEffect(() => {
    const syncRouteWithState = async () => {
      const route = parseCurrentRoute();
      
      if (route.type === 'login') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setShowAuthTab('customer');
        } else {
          // If already logged in, navigate back home
          navigateToRoute({ type: 'home' }, true);
        }
      } else if (route.type === 'partner') {
        setActivePanel('partner');
        setShowAuthTab(null);
      } else if (route.type === 'admin') {
        setActivePanel('admin');
        setShowAuthTab(null);
      } else {
        // Any customer store tab or product details
        setActivePanel('customer');
        setShowAuthTab(null);
      }
    };

    syncRouteWithState();

    window.addEventListener('popstate', syncRouteWithState);
    window.addEventListener('hashchange', syncRouteWithState);
    window.addEventListener('routechange', syncRouteWithState);

    return () => {
      window.removeEventListener('popstate', syncRouteWithState);
      window.removeEventListener('hashchange', syncRouteWithState);
      window.removeEventListener('routechange', syncRouteWithState);
    };
  }, [setActivePanel, setShowAuthTab]);

  // Dynamic document title update for Portals / Auth routes
  useEffect(() => {
    const route = parseCurrentRoute();
    if (route.type === 'login' || showAuthTab) {
      updateDocumentMetadata({
        title: lang === 'bn' ? 'লগইন করুন | দাদাজান' : 'Sign In | Dadajan Store',
        description: 'Secure authenticate page for Dadejan customers, partners, and administrators.'
      });
    } else if (route.type === 'partner' || activePanel === 'partner') {
      updateDocumentMetadata({
        title: lang === 'bn' ? 'ইমাম ও ডিলার পোর্টাল | দাদাজান' : 'Imam & Dealer Portal | Dadajan',
        description: 'Authorized access portal for verified Islamic Imams and regional distribution partners.'
      });
    } else if (route.type === 'admin' || activePanel === 'admin') {
      updateDocumentMetadata({
        title: lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড | দাদাজান' : 'Admin Panel | Dadajan Hub',
        description: 'Management controls for products, stock synchronization, active logistics, and partnership requests.'
      });
    }
  }, [activePanel, showAuthTab, lang]);

  // Find unread notifications to flash briefly at the bottom to indicate real-time background split sync
  const unreadCount = notifications.filter(n => !n.read).length;
  const latestNotification = notifications.filter(n => !n.read)[0];

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-[#FAF9F5]/90 backdrop-blur-xs flex flex-col items-center justify-center z-50 text-center p-6 select-none font-sans">
        <div className="relative flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-emerald-600"></div>
          <span className="absolute text-xl">🍯</span>
        </div>
        <h3 className="font-display font-extrabold text-stone-900 text-lg">
          {lang === 'bn' ? 'অনুরোধ প্রক্রিয়াকরণ করা হচ্ছে...' : 'Processing Secure Request...'}
        </h3>
        <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-mono">
          {lang === 'bn' ? 'অনুগ্রহ করে অপেক্ষা করুন - নিরাপদ লগআউট সক্রিয় হচ্ছে' : 'Enforcing cryptographic state flush, please wait...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] select-none text-slate-800">
      {/* Main Panel Content Render Area */}
      <main className="flex-1">
        {showAuthTab ? (
          <AuthPage 
            initialTab={showAuthTab}
            onBack={() => {
              setShowAuthTab(null);
              navigateToRoute({ type: 'home' });
            }}
            onSuccess={(tab) => {
              setShowAuthTab(null);
              if (tab === 'partner') {
                navigateToRoute({ type: 'partner' });
              } else if (tab === 'admin') {
                navigateToRoute({ type: 'admin' });
              } else {
                navigateToRoute({ type: 'home' });
              }
            }}
          />
        ) : (
          <>
            {activePanel === 'customer' && <CustomerPanel />}
            {activePanel === 'partner' && <PartnerPanel />}
            {activePanel === 'admin' && <AdminPanel />}
          </>
        )}
      </main>

      {/* Humble Footer containing info */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 md:px-8 border-t border-slate-800 mt-auto shrink-0 relative z-15 text-left font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div>
            <h5 className="font-display font-black text-white text-base tracking-wider uppercase">DADAJAN Faith Commerce</h5>
            <p className="text-xs text-slate-400 mt-1 max-w-md font-normal leading-relaxed">
              DadaJan Digital Systems &copy; 2026. Certified Shari'ah Compliance and Lab Tested organic procurement, distributing premium honey and blackseed products across Bangladesh.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => { navigateToRoute({ type: 'home' }); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePanel === 'customer' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              🛒 {lang === 'bn' ? 'কাস্টমার স্টোর' : 'Customer Store'}
            </button>
            <button
              onClick={() => { navigateToRoute({ type: 'partner' }); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePanel === 'partner' 
                  ? 'bg-emerald-650 text-white shadow' 
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              Imam & Dealer Portal
            </button>
            <button
              onClick={() => { navigateToRoute({ type: 'admin' }); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePanel === 'admin' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
            >
              Admin ERP Portal
            </button>
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-804 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700/50 transition-all cursor-pointer"
            >
              🌐 {lang === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono tracking-wider uppercase">
          <span>SECURE POSTGRESQL PROTOCOLS ENFORCED</span>
          <span>•</span>
          <span>COMMISSION AUTO SPLITTER ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardLayout />
    </AppProvider>
  );
}

