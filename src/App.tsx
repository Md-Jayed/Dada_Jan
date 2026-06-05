import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { CustomerPanel } from './components/CustomerPanel';
import { PartnerPanel } from './components/PartnerPanel';
import { AdminPanel } from './components/AdminPanel';
import { AlertCircle, Terminal, Info, BellRing } from 'lucide-react';

function DashboardLayout() {
  const { activePanel, notifications, lang } = useApp();

  // Find unread notifications to flash briefly at the bottom to indicate real-time background split sync
  const unreadCount = notifications.filter(n => !n.read).length;
  const latestNotification = notifications.filter(n => !n.read)[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] select-none text-slate-800">
      {/* Simulation Sandbox Switcher */}
      <RoleSwitcher />

      {/* Main Panel Content Render Area */}
      <main className="flex-1">
        {activePanel === 'customer' && <CustomerPanel />}
        {activePanel === 'partner' && <PartnerPanel />}
        {activePanel === 'admin' && <AdminPanel />}
      </main>



      {/* Humble Footer containing info */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-800 font-mono mt-auto shrink-0 relative z-15">
        <p className="font-sans font-medium text-slate-350">
          DadaJan Digital Systems &copy; 2026. Certified Shari'ah Compliance and Lab Tested Logistics.
        </p>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <span>SECURE SECURE PROTOCOLS ENFORCED</span>
          <span>•</span>
          <span>COMMISSION AUTO SPLITTER ACTIVE</span>
        </p>
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

