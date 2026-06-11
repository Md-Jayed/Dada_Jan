import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Partner, Order, Withdrawal, AppNotification, Customer, OrderItem, Category, Coupon } from './types';
import { 
  loadDB, saveDB, calculateCommissions, getLocalTime,
  serializeProduct, deserializeProduct,
  serializeCategory, deserializeCategory,
  serializeCoupon, deserializeCoupon,
  serializeOrder, deserializeOrder,
  serializePartner, deserializePartner,
  serializeWithdrawal, deserializeWithdrawal,
  serializeNotification, deserializeNotification,
  serializeCustomer, deserializeCustomer,
  DBState, SUPABASE_SETUP_SQL
} from './dbStore';
import { supabase } from './supabaseClient';
import { performSystemLogout } from './lib/auth/logout';

interface AppContextType {
  products: Product[];
  partners: Partner[];
  orders: Order[];
  withdrawals: Withdrawal[];
  notifications: AppNotification[];
  customers: Customer[];
  categories: Category[];
  coupons: Coupon[];
  activePanel: 'customer' | 'partner' | 'admin';
  selectedPartnerId: string; // The active Imam/Dealer we are pretending to be in Partner panel
  setPriceFormat: (amount: number) => string;
  setActivePanel: (panel: 'customer' | 'partner' | 'admin') => void;
  setSelectedPartnerId: (id: string) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  
  // Supabase Status Indicator State
  supabaseStatus: 'loading' | 'connected' | 'needs_tables' | 'error';
  supabaseLoading: boolean;
  supabaseErrorMsg: string | null;
  missingTables: string[];
  supabaseSetupSql: string;
  
  // Actions
  placeOrder: (customerInfo: {
    name: string;
    mobile: string;
    email: string;
    address: string;
    district: string;
    area: string;
  }, cartItems: OrderItem[], referralCode: string, paymentMethod: string, discount: number) => Order;
  
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  approvePartner: (id: string, approve: boolean) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  syncProductsWithSupabase: () => Promise<{ success: boolean; count?: number; error?: string }>;
  requestWithdrawal: (partnerId: string, amount: number, method: Withdrawal['method'], details: string) => void;
  approveWithdrawal: (id: string, approve: boolean) => void;
  clearNotifications: (role: 'Admin' | 'Partner', partnerId?: string) => void;
  markNotificationsAsRead: (role: 'Admin' | 'Partner', partnerId?: string) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'joinDate'>) => void;
  
  // Dynamic Categories & Coupons actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  editCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  addCoupon: (cp: Omit<Coupon, 'id' | 'usageCount'>) => void;
  editCoupon: (cp: Coupon) => void;
  deleteCoupon: (id: string) => void;

  // Authentic Auth States & Actions
  currentCustomer: Customer | null;
  currentPartner: Partner | null;
  isAdminLoggedIn: boolean;
  isAuthLoading: boolean;
  loginCustomer: (mobile: string) => Customer | null;
  loginCustomerWithEmail: (email: string, pass: string) => Customer | null;
  registerCustomer: (customer: Omit<Customer, 'id' | 'joinDate'>) => Customer;
  loginPartner: (mobile: string) => Partner | null;
  loginPartnerWithEmail: (email: string, pass: string) => Partner | null;
  registerPartner: (partner: Omit<Partner, 'id' | 'walletBalance' | 'pendingBalance' | 'totalWithdrawn' | 'verifiedStatus'>, autoLogin?: boolean) => Partner;
  loginAdmin: (email: string, pass: string) => boolean;
  logout: () => Promise<void> | void;
  showAuthTab: 'customer' | 'partner' | 'admin' | null;
  setShowAuthTab: (tab: 'customer' | 'partner' | 'admin' | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState(() => loadDB());
  const [activePanel, setActivePanelState] = useState<'customer' | 'partner' | 'admin'>('customer');
  // Initialize to Maulana Mufti Abdur Rahman as default sim
  const [selectedPartnerId, setSelectedPartnerId] = useState('imam-1');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Auth Routing Overrides
  const [showAuthTab, setShowAuthTab] = useState<'customer' | 'partner' | 'admin' | null>(null);

  // Authentic Auth States
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('currentCustomer');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(() => {
    const saved = localStorage.getItem('currentPartner');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Supabase Database Connection & Schema State Tracker
  const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'connected' | 'needs_tables' | 'error'>('loading');
  const [supabaseLoading, setSupabaseLoading] = useState<boolean>(true);
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | null>(null);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const supabaseSetupSql = SUPABASE_SETUP_SQL;

  // On mount async sync from Supabase
  useEffect(() => {
    async function initSupabaseSync() {
      setSupabaseLoading(true);
      setSupabaseStatus('loading');
      try {
        const tables = [
          'products', 'partners', 'orders', 'withdrawals', 
          'notifications', 'customers', 'categories', 'coupons'
        ];
        const missing: string[] = [];
        const fetchedData: Partial<DBState> = {};
        
        // Query each table
        for (const t of tables) {
          const { data, error } = await supabase.from(t).select('*');
          if (error) {
            console.error(`Error querying table ${t} from Supabase:`, error);
            const errMsg = error.message || '';
            const errCode = error.code || '';
            if (
              errCode === '42P01' || 
              errCode === 'PGRST116' ||
              errMsg.includes('does not exist') ||
              errMsg.includes('schema cache') ||
              errMsg.includes('Could not find the table')
            ) {
              missing.push(t);
            } else {
              throw error;
            }
          } else {
            fetchedData[t as keyof DBState] = data;
          }
        }
        
        if (missing.length > 0) {
          console.warn("Supabase database tables are missing:", missing);
          setSupabaseStatus('needs_tables');
          setMissingTables(missing);
          setSupabaseLoading(false);
          return;
        }
        
        const initialDB = loadDB();
        const upserts: Promise<any>[] = [];
        let weSeededSome = false;

        const safeInsert = async (table: string, serializedData: any) => {
          try {
            await supabase.from(table).insert(serializedData);
          } catch (e) {
            console.error(`[Supabase Seed Error] Failed inserting row into ${table}:`, e);
          }
        };

        // Sync Products
        const rawProducts = fetchedData.products || [];
        let finalProducts = rawProducts.map(deserializeProduct);
        if (finalProducts.length === 0) {
          weSeededSome = true;
          finalProducts = initialDB.products;
          initialDB.products.forEach(p => {
            upserts.push(safeInsert('products', serializeProduct(p)));
          });
        }

        // Sync Categories
        const rawCategories = fetchedData.categories || [];
        let finalCategories = rawCategories.map(deserializeCategory);
        if (finalCategories.length === 0) {
          weSeededSome = true;
          finalCategories = initialDB.categories;
          initialDB.categories.forEach(c => {
            upserts.push(safeInsert('categories', serializeCategory(c)));
          });
        }

        // Sync Coupons
        const rawCoupons = fetchedData.coupons || [];
        let finalCoupons = rawCoupons.map(deserializeCoupon);
        if (finalCoupons.length === 0) {
          weSeededSome = true;
          finalCoupons = initialDB.coupons;
          initialDB.coupons.forEach(c => {
            upserts.push(safeInsert('coupons', serializeCoupon(c)));
          });
        }

        // Sync Partners
        const rawPartners = fetchedData.partners || [];
        let finalPartners = rawPartners.map(deserializePartner);
        if (finalPartners.length === 0) {
          weSeededSome = true;
          finalPartners = initialDB.partners;
          initialDB.partners.forEach(p => {
            upserts.push(safeInsert('partners', serializePartner(p)));
          });
        }

        // Sync Customers
        const rawCustomers = fetchedData.customers || [];
        let finalCustomers = rawCustomers.map(deserializeCustomer);
        if (finalCustomers.length === 0) {
          weSeededSome = true;
          finalCustomers = initialDB.customers;
          initialDB.customers.forEach(c => {
            upserts.push(safeInsert('customers', serializeCustomer(c)));
          });
        }

        // Sync Orders
        const rawOrders = fetchedData.orders || [];
        let finalOrders = rawOrders.map(deserializeOrder);
        if (finalOrders.length === 0) {
          weSeededSome = true;
          finalOrders = initialDB.orders;
          initialDB.orders.forEach(o => {
            upserts.push(safeInsert('orders', serializeOrder(o)));
          });
        }

        // Sync Withdrawals
        const rawWithdrawals = fetchedData.withdrawals || [];
        let finalWithdrawals = rawWithdrawals.map(deserializeWithdrawal);
        if (finalWithdrawals.length === 0) {
          weSeededSome = true;
          finalWithdrawals = initialDB.withdrawals;
          initialDB.withdrawals.forEach(w => {
            upserts.push(safeInsert('withdrawals', serializeWithdrawal(w)));
          });
        }

        // Sync Notifications
        const rawNotifications = fetchedData.notifications || [];
        let finalNotifications = rawNotifications.map(deserializeNotification);
        if (finalNotifications.length === 0) {
          weSeededSome = true;
          finalNotifications = initialDB.notifications;
          initialDB.notifications.forEach(n => {
            upserts.push(safeInsert('notifications', serializeNotification(n)));
          });
        }

        if (weSeededSome) {
          console.log("Automatically seeding empty Supabase database tables with initial data!");
          await Promise.allSettled(upserts);
        }

        setDbState({
          products: finalProducts,
          categories: finalCategories,
          coupons: finalCoupons,
          partners: finalPartners,
          customers: finalCustomers,
          orders: finalOrders,
          withdrawals: finalWithdrawals,
          notifications: finalNotifications
        });

        console.log("Successfully connected and synced with Supabase!");
        setSupabaseStatus('connected');
        setSupabaseErrorMsg(null);
      } catch (err: any) {
        console.error("Critical error connecting/syncing with Supabase:", err);
        setSupabaseStatus('error');
        setSupabaseErrorMsg(err.message || 'Supabase connection failed');
      } finally {
        setSupabaseLoading(false);
      }
    }
    initSupabaseSync();
  }, []);

  // Subscribe to onAuthStateChange and handle session persistence / auto refresh
  useEffect(() => {
    let active = true;
    
    const syncSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (session?.user) {
          const userEmail = session.user.email;
          if (userEmail) {
            if (userEmail === 'rashedkhanibnnazim@gmail.com') {
              setIsAdminLoggedIn(true);
            } else {
              const foundPartner = dbState.partners.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
              if (foundPartner) {
                setCurrentPartner(foundPartner);
                setSelectedPartnerId(foundPartner.id);
              } else {
                const foundCust = dbState.customers.find(c => c.email.toLowerCase() === userEmail.toLowerCase());
                if (foundCust) {
                  setCurrentCustomer(foundCust);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("onAuthStateChange dynamic session sync error:", err);
      }
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase Auth state changed: ${event}`);
      if (!active) return;
      
      if (event === 'SIGNED_OUT') {
        setCurrentCustomer(null);
        setCurrentPartner(null);
        setIsAdminLoggedIn(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const userEmail = session.user.email;
          if (userEmail) {
            if (userEmail === 'rashedkhanibnnazim@gmail.com') {
              setIsAdminLoggedIn(true);
            } else {
              const foundPartner = dbState.partners.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
              if (foundPartner) {
                setCurrentPartner(foundPartner);
                setSelectedPartnerId(foundPartner.id);
              } else {
                const foundCust = dbState.customers.find(c => c.email.toLowerCase() === userEmail.toLowerCase());
                if (foundCust) {
                  setCurrentCustomer(foundCust);
                }
              }
            }
          }
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [dbState.partners, dbState.customers]);

  // Sync to localStorage
  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('currentCustomer', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('currentCustomer');
    }
  }, [currentCustomer]);

  useEffect(() => {
    if (currentPartner) {
      localStorage.setItem('currentPartner', JSON.stringify(currentPartner));
    } else {
      localStorage.removeItem('currentPartner');
    }
  }, [currentPartner]);

  useEffect(() => {
    localStorage.setItem('isAdminLoggedIn', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  const loginCustomer = (mobile: string): Customer | null => {
    const customer = dbState.customers.find(c => c.mobile === mobile);
    if (customer) {
      setCurrentCustomer(customer);
      return customer;
    }
    return null;
  };

  const loginCustomerWithEmail = (email: string, pass: string): Customer | null => {
    const customer = dbState.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (customer) {
      const expectedPassword = customer.password || '123456';
      if (expectedPassword === pass) {
        setCurrentCustomer(customer);
        return customer;
      }
    }
    return null;
  };

  const registerCustomer = (custInfo: Omit<Customer, 'id' | 'joinDate'>): Customer => {
    const nextId = `cust-${dbState.customers.length + 1}`;
    const newCust: Customer = {
      ...custInfo,
      id: nextId,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setDbState(prev => ({
      ...prev,
      customers: [...prev.customers, newCust]
    }));
    setCurrentCustomer(newCust);
    return newCust;
  };

  const loginPartner = (mobile: string): Partner | null => {
    const partner = dbState.partners.find(p => p.mobile === mobile);
    if (partner) {
      setCurrentPartner(partner);
      setSelectedPartnerId(partner.id);
      return partner;
    }
    return null;
  };

  const loginPartnerWithEmail = (email: string, pass: string): Partner | null => {
    const partner = dbState.partners.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (partner) {
      const expectedPassword = partner.password || '123456';
      if (expectedPassword === pass) {
        setCurrentPartner(partner);
        setSelectedPartnerId(partner.id);
        return partner;
      }
    }
    return null;
  };

  const registerPartner = (partnerInfo: Omit<Partner, 'id' | 'walletBalance' | 'pendingBalance' | 'totalWithdrawn' | 'verifiedStatus'>, autoLogin: boolean = true): Partner => {
    const nextId = `partner-${dbState.partners.length + 1}`;
    const baseCode = partnerInfo.name.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PART';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const referralCode = `${baseCode}-${randomSuffix}`;

    const newPartner: Partner = {
      ...partnerInfo,
      id: nextId,
      referralCode,
      walletBalance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
      verifiedStatus: 'Pending'
    };

    setDbState(prev => ({
      ...prev,
      partners: [...prev.partners, newPartner],
      notifications: [
        {
          id: `not-adm-new-p-${Date.now()}`,
          type: 'Inquiry',
          targetRole: 'Admin',
          title: 'নতুন অংশীদার নিবন্ধন আবেদন',
          description: `${partnerInfo.bengaliName || partnerInfo.name} (${lang === 'bn' ? partnerInfo.role : partnerInfo.role}) পোর্টালে নিবন্ধনের আবেদন জমা দিয়েছেন।`,
          timestamp: getLocalTime(),
          read: false
        },
        ...prev.notifications
      ]
    }));
    
    if (autoLogin) {
      setCurrentPartner(newPartner);
      setSelectedPartnerId(newPartner.id);
    }
    return newPartner;
  };

  const loginAdmin = (email: string, pass: string): boolean => {
    if (email.trim() === 'rashedkhanibnnazim@gmail.com' && pass.trim() === 'hjahIe2NhIrza8uC') {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      const result = await performSystemLogout();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Enforce total state flush
      setCurrentCustomer(null);
      setCurrentPartner(null);
      setIsAdminLoggedIn(false);

      // Redirect to homepage /
      if (typeof window !== 'undefined') {
        window.location.hash = '';
        window.history.pushState(null, '', '/');
      }
      setActivePanelState('customer');
      setShowAuthTab(null);
    } catch (err: any) {
      console.error("Logout process exception:", err);
      alert(lang === 'bn' ? "লগআউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" : "Logout failed. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    saveDB(dbState);
  }, [dbState]);

  // Synchronize state changes to Supabase in the background
  const lastSyncedRef = React.useRef<DBState | null>(null);

  useEffect(() => {
    // Only sync if Supabase is connected and ready
    if (supabaseStatus !== 'connected' || !dbState) return;

    // Initialize the ref on the first load so we don't re-upload everything initially
    if (!lastSyncedRef.current) {
      lastSyncedRef.current = dbState;
      return;
    }

    const prev = lastSyncedRef.current;
    
    // We will collect and perform table updates dynamically
    const syncTable = async <T extends { id: string }>(
      tableName: string,
      currentList: T[],
      prevList: T[],
      serializer: (item: T) => any
    ) => {
      // 1. Find Added or Modified items
      const upserts: any[] = [];
      currentList.forEach(item => {
        const lastItem = prevList.find(pi => pi.id === item.id);
        const hasChanged = !lastItem || JSON.stringify(lastItem) !== JSON.stringify(item);
        if (hasChanged) {
          upserts.push(serializer(item));
        }
      });

      // 2. Find Deleted items
      const deletes: string[] = [];
      prevList.forEach(pi => {
        const stillExists = currentList.some(item => item.id === pi.id);
        if (!stillExists) {
          deletes.push(pi.id);
        }
      });

      // Perform Live Queries
      if (upserts.length > 0) {
        console.log(`[Supabase Sync] Upserting ${upserts.length} items to table ${tableName}...`);
        const { error } = await supabase.from(tableName).upsert(upserts);
        if (error) {
          console.error(`[Supabase Sync Error] Failed upsert in table ${tableName}:`, error);
        }
      }

      if (deletes.length > 0) {
        console.log(`[Supabase Sync] Deleting ${deletes.length} items from table ${tableName}...`, deletes);
        const { error } = await supabase.from(tableName).delete().in('id', deletes);
        if (error) {
          console.error(`[Supabase Sync Error] Failed deletion from table ${tableName}:`, error);
        }
      }
    };

    const runSync = async () => {
      try {
        await Promise.all([
          syncTable('products', dbState.products, prev.products, serializeProduct),
          syncTable('categories', dbState.categories || [], prev.categories || [], serializeCategory),
          syncTable('coupons', dbState.coupons || [], prev.coupons || [], serializeCoupon),
          syncTable('partners', dbState.partners, prev.partners, serializePartner),
          syncTable('customers', dbState.customers, prev.customers, serializeCustomer),
          syncTable('orders', dbState.orders, prev.orders, serializeOrder),
          syncTable('withdrawals', dbState.withdrawals, prev.withdrawals, serializeWithdrawal),
          syncTable('notifications', dbState.notifications, prev.notifications, serializeNotification),
        ]);
        
        // Update reference
        lastSyncedRef.current = dbState;
      } catch (err) {
        console.error("Supabase live reactive sync runtime error:", err);
      }
    };

    runSync();
  }, [dbState, supabaseStatus]);

  const setPriceFormat = (amount: number) => {
    return lang === 'bn' 
      ? `৳${amount.toLocaleString('bn-BD')}` 
      : `BDT ${amount.toLocaleString()}`;
  };

  const setActivePanel = (panel: 'customer' | 'partner' | 'admin') => {
    setActivePanelState(panel);
  };

  // 1. PLACE ORDER
  const placeOrder = (
    customerInfo: {
      name: string;
      mobile: string;
      email: string;
      address: string;
      district: string;
      area: string;
    },
    cartItems: OrderItem[],
    referralCode: string,
    paymentMethod: any,
    discount: number
  ) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 100;
    const total = subtotal - discount + shipping;
    
    const nextIdNum = dbState.orders.length + 10023;
    const orderId = `DDJ-${nextIdNum}`;

    // Geo-based assignment. Find dealer in the same district & area. 
    // Fallback is dealer-1 (Al-Haj Mohammad Mahbubur Rahman) in Boalkhali
    let assignedPartnerId = 'dealer-1'; 
    const regionalDealer = dbState.partners.find(
      p => p.role === 'Dealer' && 
      p.district.toLowerCase() === customerInfo.district.toLowerCase() && 
      p.area.toLowerCase() === customerInfo.area.toLowerCase()
    );
    if (regionalDealer) {
      assignedPartnerId = regionalDealer.id;
    }

    const newOrder: Order = {
      id: orderId,
      customerName: customerInfo.name,
      customerMobile: customerInfo.mobile,
      customerEmail: customerInfo.email,
      customerAddress: customerInfo.address,
      district: customerInfo.district,
      area: customerInfo.area,
      items: cartItems,
      subtotal,
      discount,
      shipping,
      total,
      referralCode: referralCode || undefined,
      status: 'Placed',
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      date: new Date().toISOString().split('T')[0],
      assignedPartnerId,
      commissionsCalculated: false
    };

    // Low stock alerts / Stock reduction
    const updatedProducts = dbState.products.map(p => {
      const cartItem = cartItems.find(item => item.productId === p.id);
      if (cartItem) {
        return {
          ...p,
          stockQty: Math.max(0, p.stockQty - cartItem.quantity)
        };
      }
      return p;
    });

    // Handle new customer record if phone is new
    let updatedCustomers = [...dbState.customers];
    const existing = dbState.customers.find(c => c.mobile === customerInfo.mobile);
    if (!existing) {
      const newCust: Customer = {
        id: `cust-${dbState.customers.length + 1}`,
        name: customerInfo.name,
        mobile: customerInfo.mobile,
        email: customerInfo.email,
        district: customerInfo.district,
        area: customerInfo.area,
        address: customerInfo.address,
        referredBy: referralCode || undefined,
        joinDate: new Date().toISOString().split('T')[0]
      };
      updatedCustomers.push(newCust);
    }

    // Creating initial Pending commission display
    // Although standard payout happens on delivery, we reflect "pending balance" immediately to show real-time responsive UX
    const commissions = calculateCommissions(newOrder, dbState.partners);
    const updatedPartners = dbState.partners.map(p => {
      let pendingAdd = 0;
      if (p.id === commissions.introducerId) pendingAdd += commissions.introducerAmount;
      if (p.id === commissions.handlerId) pendingAdd += commissions.handlerAmount;
      
      if (pendingAdd > 0) {
        return {
          ...p,
          pendingBalance: p.pendingBalance + pendingAdd
        };
      }
      return p;
    });

    // Notifications
    const newNotifications: AppNotification[] = [];
    
    // For Admin ERP
    newNotifications.push({
      id: `not-adm-${Date.now()}-1`,
      type: 'Order',
      targetRole: 'Admin',
      title: 'New Order Received',
      description: `Order ${orderId} of ${setPriceFormat(total)} placed by ${customerInfo.name}`,
      timestamp: getLocalTime(),
      read: false
    });

    // For Referrer Imam (Introducer)
    if (commissions.introducerId) {
      const referee = dbState.partners.find(p => p.id === commissions.introducerId);
      newNotifications.push({
        id: `not-p-${Date.now()}-2`,
        type: 'Order',
        targetRole: 'Partner',
        partnerId: commissions.introducerId,
        title: 'নতুন রেফারেল অর্ডার!',
        description: `আপনার রেফারেল কোড ব্যবহার করে ${customerInfo.name} একটি অর্ডার করেছেন (৳${total})। বিবরণ প্রক্রিয়াধীন।`,
        timestamp: getLocalTime(),
        read: false
      });
    }

    // For Local Dealer (Handler)
    if (commissions.handlerId) {
      newNotifications.push({
        id: `not-p-${Date.now()}-3`,
        type: 'Order',
        targetRole: 'Partner',
        partnerId: commissions.handlerId,
        title: 'এরিয়াতে নতুন অর্ডারের দায়িত্ব!',
        description: `আপনার অর্পিত এলাকা ${customerInfo.area} তে ${customerInfo.name} এর অর্ডারটি (${orderId}) জমা হয়েছে।`,
        timestamp: getLocalTime(),
        read: false
      });
    }

    // Check for Low Stock for admin notification
    updatedProducts.forEach(p => {
      if (p.stockQty <= 5) {
        newNotifications.push({
          id: `not-adm-low-${p.id}`,
          type: 'Inquiry',
          targetRole: 'Admin',
          title: `Low Stock Alert: ${p.sku}`,
          description: `Product ${p.name} stock level is currently ${p.stockQty}. Reorder soon.`,
          timestamp: getLocalTime(),
          read: false
        });
      }
    });

    setDbState(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      products: updatedProducts,
      partners: updatedPartners,
      notifications: [...newNotifications, ...prev.notifications],
      customers: updatedCustomers
    }));

    return newOrder;
  };

  // 2. UPDATE ORDER STATUS (WITH COMMISSION ENGINE SPLIT DIRECT CREDIT)
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setDbState(prev => {
      const orderIndex = prev.orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) return prev;

      const order = prev.orders[orderIndex];
      const prevStatus = order.status;
      if (prevStatus === status) return prev; // No change

      const updatedOrder = { ...order, status };
      
      // If moving to Delivered, trigger Commission splits
      let updatedPartners = [...prev.partners];
      let updatedNotifications = [...prev.notifications];

      if (status === 'Delivered' && !order.commissionsCalculated) {
        updatedOrder.commissionsCalculated = true;
        updatedOrder.paymentStatus = 'Paid'; // Cash on delivery is now paid on delivery

        const commissions = calculateCommissions(order, prev.partners);

        updatedPartners = prev.partners.map(p => {
          let balanceAdd = 0;
          let pendingSub = 0;
          
          if (p.id === commissions.introducerId) {
            balanceAdd += commissions.introducerAmount;
            pendingSub += commissions.introducerAmount;
          }
          if (p.id === commissions.handlerId) {
            balanceAdd += commissions.handlerAmount;
            pendingSub += commissions.handlerAmount;
          }

          if (balanceAdd > 0 || pendingSub > 0) {
            return {
              ...p,
              walletBalance: p.walletBalance + balanceAdd,
              pendingBalance: Math.max(0, p.pendingBalance - pendingSub)
            };
          }
          return p;
        });

        // Trigger notifications for commission credit
        if (commissions.introducerId) {
          updatedNotifications.unshift({
            id: `not-comm-int-${Date.now()}`,
            type: 'Commission',
            targetRole: 'Partner',
            partnerId: commissions.introducerId,
            title: 'কমিশন ওয়ালেটে যুক্ত হয়েছে! 🪙',
            description: `অর্ডার ${orderId} সম্পূর্ণ ডেলিভারি হয়েছে। আপনার রেফারেল কমিশন ৳${commissions.introducerAmount} ওয়ালেটে যোগ করা হয়েছে।`,
            timestamp: getLocalTime(),
            read: false
          });
        }

        if (commissions.handlerId) {
          updatedNotifications.unshift({
            id: `not-comm-hnd-${Date.now()}`,
            type: 'Commission',
            targetRole: 'Partner',
            partnerId: commissions.handlerId,
            title: 'ডেলিভারি হ্যান্ডেলিং কমিশন! 💰',
            description: `আপনার এলাকার অর্ডার ${orderId} ডেলিভারি সম্পন্ন হয়েছে। ডিস্ট্রিবিউটর কমিশন ৳${commissions.handlerAmount} অর্জিত হয়েছে।`,
            timestamp: getLocalTime(),
            read: false
          });
        }
      }

      // Default status update notifications
      updatedNotifications.unshift({
        id: `not-ord-status-${Date.now()}`,
        type: 'Order',
        targetRole: 'Admin',
        title: `Order Status: ${status}`,
        description: `Order ${orderId} has been successfully updated to ${status}.`,
        timestamp: getLocalTime(),
        read: false
      });

      const updatedOrders = [...prev.orders];
      updatedOrders[orderIndex] = updatedOrder;

      return {
        ...prev,
        orders: updatedOrders,
        partners: updatedPartners,
        notifications: updatedNotifications
      };
    });
  };

  // 3. APPROVE/REJECT PARTNER COOPERATIVE
  const approvePartner = (id: string, approve: boolean) => {
    setDbState(prev => {
      const partnerIndex = prev.partners.findIndex(p => p.id === id);
      if (partnerIndex === -1) return prev;

      const partner = prev.partners[partnerIndex];
      const verifiedStatus = approve ? 'Approved' : 'Rejected';
      const updatedPartner = { ...partner, verifiedStatus };

      const updatedPartners = [...prev.partners];
      updatedPartners[partnerIndex] = updatedPartner;

      const updatedNotifications = [
        {
          id: `not-prt-approval-${Date.now()}`,
          type: 'Payout' as const,
          targetRole: 'Partner' as const,
          partnerId: id,
          title: approve ? 'নিবন্ধন সফল ও অনুমোদিত! 🎉' : 'নিবন্ধন নামঞ্জুর করা হয়েছে',
          description: approve 
            ? `দাদাজান পরিবারের সম্মানিত অংশীদার হিসেবে আপনাকে স্বাগতম। আপনার রেফারেল কোড "${partner.referralCode}" এখন সচল।`
            : 'আপনার প্রদত্ত নথিপত্র আমাদের নীতিমালার সাথে মিলে নি। অনুগ্রহ করে এডমিন টিমের সাথে যোগাযোগ করুন।',
          timestamp: getLocalTime(),
          read: false
        },
        {
          id: `not-adm-apr-${Date.now()}`,
          type: 'Inquiry' as const,
          targetRole: 'Admin' as const,
          title: `Partner ${partner.role} ${verifiedStatus}`,
          description: `You have ${verifiedStatus.toLowerCase()} the registration request of ${partner.name}.`,
          timestamp: getLocalTime(),
          read: false
        },
        ...prev.notifications
      ];

      return {
        ...prev,
        partners: updatedPartners,
        notifications: updatedNotifications
      };
    });
  };

  // 4. ADD NEW PRODUCT OR MODIFY INVENTORY
  const addNewProduct = (product: Omit<Product, 'id'>) => {
    const newId = `prod-${dbState.products.length + 1}`;
    const newProd: Product = {
      ...product,
      id: newId,
      rating: 5,
      reviewsCount: 1
    };
    setDbState(prev => ({
      ...prev,
      products: [...prev.products, newProd],
      notifications: [
        {
          id: `not-prod-add-${Date.now()}`,
          type: 'Inquiry',
          targetRole: 'Admin',
          title: 'Product Added to Catalog',
          description: `Product ${product.name} (SKU: ${product.sku}) inserted successfully in ${product.category}.`,
          timestamp: getLocalTime(),
          read: false
        },
        ...prev.notifications
      ]
    }));
  };

  const editProduct = (product: Product) => {
    setDbState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setDbState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const syncProductsWithSupabase = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      // 1. Fetch live products from Supabase
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        throw error;
      }

      const liveProducts = (data || []).map(deserializeProduct);

      // 2. Identify mismatch / merge logic:
      // We upsert all local products right now so local changes are guaranteed to reach Supabase.
      const localProducts = dbState.products;
      const upserts = localProducts.map(p => serializeProduct(p));

      if (upserts.length > 0) {
        const { error: upsertError } = await supabase.from('products').upsert(upserts);
        if (upsertError) {
          throw upsertError;
        }
      }

      // 3. Merging: If there are products on Supabase that don't exist locally, add them
      const localIds = new Set(localProducts.map(p => p.id));
      const newlyPulledProducts = liveProducts.filter(lp => !localIds.has(lp.id));

      const finalMergedProducts = [...localProducts];
      newlyPulledProducts.forEach(np => {
        if (!finalMergedProducts.some(p => p.id === np.id)) {
          finalMergedProducts.push(np);
        }
      });

      // Update both local storage and current memory state
      setDbState(prev => ({
        ...prev,
        products: finalMergedProducts
      }));

      setSupabaseStatus('connected');
      setSupabaseErrorMsg(null);

      return { success: true, count: finalMergedProducts.length };
    } catch (err: any) {
      console.error("Manual products sync error:", err);
      return { success: false, error: err.message || 'Unknown error occurred' };
    }
  };

  // 5. MANUAL FUNDS WITHDRAWAL
  const requestWithdrawal = (
    partnerId: string,
    amount: number,
    method: Withdrawal['method'],
    details: string
  ) => {
    const partner = dbState.partners.find(p => p.id === partnerId);
    if (!partner || partner.walletBalance < amount) return;

    const withdrawId = `WTH-${dbState.withdrawals.length + 504}`;
    const newWithdrawal: Withdrawal = {
      id: withdrawId,
      partnerId,
      partnerName: partner.name,
      partnerRole: partner.role,
      mobile: partner.mobile,
      amount,
      method,
      details,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    // Promptly deduct walletBalance and put it in pending for visual integrity, 
    // or keep wallet balance and show pending withdrawable. Let's deduct from balance immediately 
    // so they don't request double withdrawals, and place it visually as "pending payout"
    const updatedPartners = dbState.partners.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          walletBalance: p.walletBalance - amount,
          // Let's hold it somewhere or just reduce wallet but we will see it in withdrawals
        };
      }
      return p;
    });

    const newNotifications: AppNotification[] = [
      {
        id: `not-wth-adm-${Date.now()}`,
        type: 'Payout',
        targetRole: 'Admin',
        title: 'New Withdrawal Cash-out Request',
        description: `${partner.name} requested payout of ${amount} BDT via ${method}`,
        timestamp: getLocalTime(),
        read: false
      },
      {
        id: `not-wth-p-${Date.now()}`,
        type: 'Payout',
        targetRole: 'Partner',
        partnerId,
        title: 'তহবিল উত্তোলনের আবেদন সফল! 💰',
        description: `আপনার ${method} এ ৳${amount} উত্তোলনের আবেদন দাদাজান সেন্ট্রাল ফাইন্যান্সে জমা হয়েছে। অনুমোদন প্রক্রিয়াধীন।`,
        timestamp: getLocalTime(),
        read: false
      }
    ];

    setDbState(prev => ({
      ...prev,
      withdrawals: [newWithdrawal, ...prev.withdrawals],
      partners: updatedPartners,
      notifications: [...newNotifications, ...prev.notifications]
    }));
  };

  const approveWithdrawal = (id: string, approve: boolean) => {
    setDbState(prev => {
      const wIdx = prev.withdrawals.findIndex(w => w.id === id);
      if (wIdx === -1) return prev;

      const w = prev.withdrawals[wIdx];
      if (w.status !== 'Pending') return prev;

      const status = approve ? 'Approved' : 'Rejected';
      const updatedW = { ...w, status };

      const updatedWithdrawals = [...prev.withdrawals];
      updatedWithdrawals[wIdx] = updatedW;

      // If approved, add to totalWithdrawn. If rejected, refund the wallet balance!
      const updatedPartners = prev.partners.map(p => {
        if (p.id === w.partnerId) {
          if (approve) {
            return {
              ...p,
              totalWithdrawn: p.totalWithdrawn + w.amount
            };
          } else {
            // Refund
            return {
              ...p,
              walletBalance: p.walletBalance + w.amount
            };
          }
        }
        return p;
      });

      const updatedNotifications = [
        {
          id: `not-w-app-${Date.now()}`,
          type: 'Payout' as const,
          targetRole: 'Partner' as const,
          partnerId: w.partnerId,
          title: approve ? 'অর্থ উত্তোলন অনুমোদিত ও প্রেরিত! ✅' : 'উত্তোলন আবেদন নামঞ্জুর করা হয়েছে',
          description: approve
            ? `আপনার ৳${w.amount} উত্তোলনে অ্যাকাউন্ট টিম অনুমোদন দিয়েছে ও আপনার ${w.method} এ ট্রান্সফার সম্পাদন করেছে।`
            : `আপনার ৳${w.amount} উত্তোলনের আবেদনটি বাতিল করা হয়েছে এবং অর্থ আপনার সাধারণ ওয়ালেট ব্যালেন্সে ফেরত পাঠানো হয়েছে।`,
          timestamp: getLocalTime(),
          read: false
        },
        {
          id: `not-wad-res-${Date.now()}`,
          type: 'Payout' as const,
          targetRole: 'Admin' as const,
          title: `Withdrawal Request ${status}`,
          description: `You have ${status.toLowerCase()} payment request ${id} of ${w.amount} BDT for ${w.partnerName}.`,
          timestamp: getLocalTime(),
          read: false
        },
        ...prev.notifications
      ];

      return {
        ...prev,
        withdrawals: updatedWithdrawals,
        partners: updatedPartners,
        notifications: updatedNotifications
      };
    });
  };

  // 6. CLEAR AND MARK NOTIFICATIONS
  const clearNotifications = (role: 'Admin' | 'Partner', partnerId?: string) => {
    setDbState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => {
        if (role === 'Admin') return n.targetRole !== 'Admin';
        return n.partnerId !== partnerId;
      })
    }));
  };

  const markNotificationsAsRead = (role: 'Admin' | 'Partner', partnerId?: string) => {
    setDbState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => {
        const match = role === 'Admin' ? n.targetRole === 'Admin' : n.partnerId === partnerId;
        return match ? { ...n, read: true } : n;
      })
    }));
  };

  // 7. ADD GENERAL CUSTOMER TYPE
  const addCustomer = (cust: Omit<Customer, 'id' | 'joinDate'>) => {
    const newC: Customer = {
      ...cust,
      id: `cust-${dbState.customers.length + 1}`,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setDbState(prev => ({
      ...prev,
      customers: [...prev.customers, newC]
    }));
  };

  // WooCommerce Dynamic Categories Management
  const addCategory = (category: Omit<Category, 'id'>) => {
    const nextId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...category,
      id: nextId
    };
    setDbState(prev => ({
      ...prev,
      categories: [...(prev.categories || []), newCat]
    }));
  };

  const editCategory = (category: Category) => {
    setDbState(prev => ({
      ...prev,
      categories: (prev.categories || []).map(c => c.id === category.id ? category : c)
    }));
  };

  const deleteCategory = (id: string) => {
    setDbState(prev => ({
      ...prev,
      categories: (prev.categories || []).filter(c => c.id !== id)
    }));
  };

  // WooCommerce Dynamic Coupons Management
  const addCoupon = (coupon: Omit<Coupon, 'id' | 'usageCount'>) => {
    const nextId = `cp-${Date.now()}`;
    const newCp: Coupon = {
      ...coupon,
      id: nextId,
      usageCount: 0
    };
    setDbState(prev => ({
      ...prev,
      coupons: [...(prev.coupons || []), newCp]
    }));
  };

  const editCoupon = (coupon: Coupon) => {
    setDbState(prev => ({
      ...prev,
      coupons: (prev.coupons || []).map(c => c.id === coupon.id ? coupon : c)
    }));
  };

  const deleteCoupon = (id: string) => {
    setDbState(prev => ({
      ...prev,
      coupons: (prev.coupons || []).filter(c => c.id !== id)
    }));
  };

  return (
    <AppContext.Provider value={{
      products: dbState.products,
      partners: dbState.partners,
      orders: dbState.orders,
      withdrawals: dbState.withdrawals,
      notifications: dbState.notifications,
      customers: dbState.customers,
      categories: dbState.categories || [],
      coupons: dbState.coupons || [],
      activePanel,
      selectedPartnerId,
      setPriceFormat,
      setActivePanel,
      setSelectedPartnerId,
      lang,
      setLang,
      supabaseStatus,
      supabaseLoading,
      supabaseErrorMsg,
      missingTables,
      supabaseSetupSql,
      placeOrder,
      updateOrderStatus,
      approvePartner,
      addNewProduct,
      editProduct,
      deleteProduct,
      syncProductsWithSupabase,
      requestWithdrawal,
      approveWithdrawal,
      clearNotifications,
      markNotificationsAsRead,
      addCustomer,
      addCategory,
      editCategory,
      deleteCategory,
      addCoupon,
      editCoupon,
      deleteCoupon,
      currentCustomer,
      currentPartner,
      isAdminLoggedIn,
      isAuthLoading,
      loginCustomer,
      loginCustomerWithEmail,
      registerCustomer,
      loginPartner,
      loginPartnerWithEmail,
      registerPartner,
      loginAdmin,
      logout,
      showAuthTab,
      setShowAuthTab
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
