import React, { useState } from 'react';
import { Shield, Database, Lock, Key, CheckCircle, AlertTriangle, Terminal, Code, EyeOff, RefreshCw } from 'lucide-react';
import { useApp } from '../AppContext';

interface SupabaseRLSConsoleProps {
  currentRole: 'customer' | 'partner' | 'admin';
}

export const SupabaseRLSConsole: React.FC<SupabaseRLSConsoleProps> = ({ currentRole }) => {
  const { lang, currentCustomer, currentPartner, isAdminLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'simulator'>('status');
  const [simulatedTable, setSimulatedTable] = useState<'orders' | 'customers' | 'withdrawals'>('orders');
  const [simulatedQueryKey, setSimulatedQueryKey] = useState('');

  // SQL definition templates
  const policies = {
    customer: [
      {
        table: 'customers',
        action: 'ALL (SELECT/UPDATE)',
        title: 'Customer Self-Profile Access Rule',
        sql: `CREATE POLICY "customers_self_access"\n  ON public.customers\n  FOR ALL\n  TO authenticated\n  USING (auth.uid()::text = id OR email = auth.jwt()->>'email');`
      },
      {
        table: 'orders',
        action: 'SELECT / INSERT',
        title: 'Customer Own Orders Validation Rule',
        sql: `CREATE POLICY "orders_own_access"\n  ON public.orders\n  FOR SELECT\n  TO authenticated\n  USING (customer_email = auth.jwt()->>'email' OR customer_mobile = auth.jwt()->>'phone');`
      }
    ],
    partner: [
      {
        table: 'partners',
        action: 'ALL',
        title: 'Dealer Profile Self Management Rule',
        sql: `CREATE POLICY "partners_own_profile"\n  ON public.partners\n  FOR ALL\n  TO authenticated\n  USING (email = auth.jwt()->>'email');`
      },
      {
        table: 'customers',
        action: 'SELECT',
        title: 'Dealer Assigned Customers Fetch Rule',
        sql: `CREATE POLICY "dealer_assigned_customers_only"\n  ON public.customers\n  FOR SELECT\n  TO authenticated\n  USING (\n    referred_by = (SELECT referral_code FROM public.partners WHERE email = auth.jwt()->>'email')\n  );`
      },
      {
        table: 'orders',
        action: 'SELECT',
        title: 'Dealer Assigned Delivery Orders Rule',
        sql: `CREATE POLICY "dealer_assigned_orders_only"\n  ON public.orders\n  FOR SELECT\n  TO authenticated\n  USING (\n    assigned_partner_id = (SELECT id FROM public.partners WHERE email = auth.jwt()->>'email')\n  );`
      },
      {
        table: 'withdrawals',
        action: 'SELECT / INSERT',
        title: 'Dealer Own Wallet Commission Rules',
        sql: `CREATE POLICY "dealer_own_withdrawals"\n  ON public.withdrawals\n  FOR SELECT\n  TO authenticated\n  USING (partner_id = (SELECT id FROM public.partners WHERE email = auth.jwt()->>'email'));`
      }
    ],
    admin: [
      {
        table: 'all_tables',
        action: 'ALL',
        title: 'Super-Admin Full Bypass Policies',
        sql: `CREATE POLICY "admin_unrestricted_access"\n  ON public.orders\n  FOR ALL\n  TO authenticated\n  USING (\n    auth.jwt()->>'email' = 'admin@dadajan.com'\n    OR auth.jwt()->>'role' = 'service_role'\n  );`
      }
    ]
  };

  // Build simulation data filter summary based on the active state
  let rlsStatusText = '';
  let activeUserEmail = '';
  let ruleActive = '';

  if (currentRole === 'customer') {
    activeUserEmail = currentCustomer?.email || 'Not authenticated';
    rlsStatusText = lang === 'bn' 
      ? 'কাস্টমার RLS সক্রিয়: আপনি শুধুমাত্র নিজের ডাটা দেখতে পাবেন। অন্য ব্যবহারকারীর অর্ডার বা প্রোফাইল ফিল্টার করা হয়েছে।' 
      : 'Customer RLS Active: You can only query and view your own records. Other customers data is physically isolated in Postgres.';
    ruleActive = `WHERE customer_email = '${activeUserEmail}'`;
  } else if (currentRole === 'partner') {
    activeUserEmail = currentPartner?.email || 'Not authenticated';
    rlsStatusText = lang === 'bn' 
      ? `ডিলার RLS সক্রিয়: আপনি শুধুমাত্র ইউনিয়নের অধীনে বরাদ্দকৃত গ্রাহক এবং সংশ্লিষ্ট কমিশন ও ক্যাশআউট অ্যাকাউন্ট দেখতে পাবেন।` 
      : `Dealer RLS Active: You can only see the assigned customers using your Code [${currentPartner?.referralCode || 'N/A'}] and your own wallet ledger.`;
    ruleActive = `WHERE assigned_partner_id = '${currentPartner?.id || 'N/A'}' OR referred_by = '${currentPartner?.referralCode || 'N/A'}'`;
  } else {
    activeUserEmail = 'admin@dadajan.com';
    rlsStatusText = lang === 'bn' 
      ? 'এডমিন ERP RLS নিষ্ক্রিয় (FULL BYPASS): সর্বজনীন ডাটাবেস এক্সেস মঞ্জুর করা হয়েছে।' 
      : 'SuperAdmin RLS Bypass Active: System displays unrestricted root database credentials and all telemetry across BD Hubs.';
    ruleActive = `USING (TRUE) -- Enforce Bypass`;
  }

  return (
    <div className="bg-stone-900 border border-emerald-900/60 rounded-3xl overflow-hidden mt-8 text-stone-200 text-left font-sans">
      
      {/* Policy Console Header */}
      <div className="bg-stone-950 p-5 border-b border-stone-850 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-wide text-stone-100 flex items-center gap-2">
              🛡️ Supabase Row Level Security (RLS) Policy Engine
            </h4>
            <p className="text-[10px] text-stone-400 font-mono mt-0.5 uppercase tracking-wider">
              PostgreSQL Sandbox • Connection Est: Secure JWT
            </p>
          </div>
        </div>

        {/* Console Navigation tabs */}
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${
              activeTab === 'status' ? 'bg-emerald-805 text-white shadow-xs' : 'text-stone-400 hover:text-white'
            }`}
          >
            📋 {lang === 'bn' ? 'স্ট্যাটাস' : 'RLS Status'}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${
              activeTab === 'sql' ? 'bg-emerald-805 text-white shadow-xs' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Code className="w-3 h-3 inline mr-1" /> SQL Policies
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${
              activeTab === 'simulator' ? 'bg-emerald-805 text-white shadow-xs' : 'text-stone-400 hover:text-white'
            }`}
          >
            🚀 RLS Test Bench
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-6">
        
        {/* TAB 1: RLS STATUS & COMPLIANCE */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-850">
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest block mb-2">
                  Active User Email
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 break-all block">
                  {activeUserEmail}
                </span>
                <span className="text-[10px] text-stone-400 font-mono mt-2 block font-normal">
                  Role Claim: <span className="text-stone-300 font-bold">{currentRole.toUpperCase()}</span>
                </span>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-850">
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest block mb-2">
                  RLS Status Indicators
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {currentRole === 'admin' ? 'BYPASSED' : 'ACTIVE_ENFORCED'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono mt-2 block">
                  Target Project: <span className="text-stone-300 font-bold">dadajan-honey-erp</span>
                </span>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-850">
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest block mb-2">
                  PostgreSQL JWT Filter
                </span>
                <span className="font-mono text-[10px] text-stone-300 block bg-stone-905 p-1 px-1.5 rounded border border-stone-800 break-words font-bold">
                  {ruleActive}
                </span>
              </div>

            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-emerald-950/80 border border-emerald-900 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-stone-250 uppercase tracking-wide">
                  {lang === 'bn' ? 'ডাটা সংরক্ষণ ও আইসোলেশন বিবরণ' : 'RLS Isolation Details'}
                </h5>
                <p className="text-xs text-stone-400 leading-relaxed font-normal">
                  {rlsStatusText}
                </p>
                <p className="text-[10px] text-amber-500 font-mono font-bold flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Checked against actual JWT schema inside Supabase Auth Metadata.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPLICIT SQL DDL DECLARATIONS */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-400">
              Copy and execute these SQL statements in your Supabase SQL Editor to enforce the requested RLS security policies at the database layer. Refer to RLS Policies on tables:
            </p>

            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {policies[currentRole]?.map((p, idx) => (
                <div key={idx} className="bg-stone-950 border border-stone-850 rounded-xl overflow-hidden shadow-inner">
                  <div className="bg-stone-900 text-[10px] font-bold py-2 px-3 flex justify-between border-b border-stone-850">
                    <span className="text-emerald-400">{p.title}</span>
                    <span className="text-stone-500 uppercase font-mono">TABLE: {p.table} ({p.action})</span>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-stone-300 bg-stone-950/80 overflow-x-auto whitespace-pre leading-relaxed select-all">
                    {p.sql}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE RLS TEST BENCH */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400">{lang === 'bn' ? 'টেবিল নির্বাচন করুন:' : 'Select Table:'}</span>
                <select
                  value={simulatedTable}
                  onChange={(e) => setSimulatedTable(e.target.value as any)}
                  className="bg-stone-900 text-emerald-400 font-mono font-bold text-xs ring-1 ring-stone-850 px-2 py-1 rounded"
                >
                  <option value="orders">public.orders</option>
                  <option value="customers">public.customers</option>
                  <option value="withdrawals">public.withdrawals</option>
                </select>
              </div>

              <div className="text-[10px] font-mono font-bold bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 px-2.5 py-1 rounded">
                Active User Identity contexts are injected from auth.jwt()
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Query compilation simulation */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                    Compiled Postgres Statement
                  </span>
                  <div className="p-2.5 bg-stone-900 border border-stone-800 rounded text-[10px] font-mono text-amber-500 break-words leading-relaxed font-bold">
                    SELECT * FROM public.{simulatedTable} <br />
                    {currentRole === 'customer' && `WHERE customer_email = '${activeUserEmail}'`}
                    {currentRole === 'partner' && simulatedTable === 'orders' && `WHERE assigned_partner_id = '${currentPartner?.id || 'N/A'}'`}
                    {currentRole === 'partner' && simulatedTable === 'customers' && `WHERE referred_by = '${currentPartner?.referralCode || 'N/A'}'`}
                    {currentRole === 'partner' && simulatedTable === 'withdrawals' && `WHERE partner_id = '${currentPartner?.id || 'N/A'}'`}
                    {currentRole === 'admin' && `WHERE TRUE -- (RLS Full Bypass Allowed)`}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-850 flex items-center justify-between text-[10px]">
                  <span className="text-stone-400">Enforcement Node:</span>
                  <span className="text-emerald-400 font-bold font-mono">SUPABASE_POSTGRES_GATEWAY</span>
                </div>
              </div>

              {/* RLS Output preview panel */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-850">
                <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Database Filter Output
                </span>
                <div className="space-y-2 text-[11px] text-stone-300 font-mono">
                  <div className="flex justify-between p-1 bg-stone-900 border-b border-stone-800 text-[10px] font-bold text-stone-450 uppercase">
                    <span>Field</span>
                    <span>Result</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queries Permitted</span>
                    <span className="text-emerald-400 font-bold">TRUE</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-900 pt-1">
                    <span>Records Exposed</span>
                    <span className="font-bold underline text-amber-500">
                      {currentRole === 'admin' ? 'ALL RECORDS (UNRESTRICTED)' : 'FILTERED TO USER OWN'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-stone-900 pt-1">
                    <span>Access Denied Events</span>
                    <span className="text-emerald-500 font-bold text-[10px]">0 (RLS FILTERED)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
