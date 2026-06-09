-- ==========================================
-- DADAJAN HONEY ERP - SUPABASE POSTGRES MIGRATION
-- AUTHOR: Google AI Studio Build Agent
-- PURPOSE: Complete database schema with indexes, constraints, triggers, and Row Level Security (RLS)
-- TARGET: PostgreSQL (Supabase compatibility)
-- ==========================================

BEGIN;

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. DROP EXISTING CONSTRAINTS AND TABLES (FOR CLEAN SEEDING/MIGRATION)
-- ==========================================
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- ==========================================
-- 2. CREATE SCHEMAS & TABLES
-- ==========================================

-- A. Products Table
CREATE TABLE public.products (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'prod-' || uuid_generate_v4()::text,
    name TEXT NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INT NOT NULL CHECK (price >= 0),
    cost_price INT NOT NULL CHECK (cost_price >= 0),
    stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    images TEXT[] NOT NULL,
    video_url TEXT,
    certification_status JSONB NOT NULL DEFAULT '{"imamVerified": false, "labTested": false, "certifiedAuthentic": false}'::jsonb,
    origin TEXT NOT NULL,
    ingredients TEXT,
    description TEXT,
    rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    reviews_count INT DEFAULT 0 CHECK (reviews_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- B. Partners (Dealers/Imams/Coordinators) Table
CREATE TABLE public.partners (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'partner-' || uuid_generate_v4()::text,
    name TEXT NOT NULL,
    bengali_name TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Imam', 'Dealer', 'Local Partner')),
    mobile VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT, -- Stores hashed password safely if custom auth is used
    referral_code VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    verified_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (verified_status IN ('Pending', 'Approved', 'Suspended', 'Rejected')),
    nid_photo TEXT NOT NULL,
    wallet_balance INT NOT NULL DEFAULT 0 CHECK (wallet_balance >= 0),
    pending_balance INT NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
    total_withdrawn INT NOT NULL DEFAULT 0 CHECK (total_withdrawn >= 0),
    rating NUMERIC(3, 2) DEFAULT 5.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- C. Customers Table
CREATE TABLE public.customers (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'cust-' || uuid_generate_v4()::text,
    name TEXT NOT NULL,
    mobile VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    district VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    referred_by VARCHAR(100) REFERENCES public.partners(referral_code) ON DELETE SET NULL,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- D. Orders Table
CREATE TABLE public.orders (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'DDJ-' || floor(10000 + random() * 89999)::text,
    customer_name TEXT NOT NULL,
    customer_mobile VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    items JSONB NOT NULL, -- Array of OrderItems: {productId, name, quantity, price, image}
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    discount INT NOT NULL DEFAULT 0 CHECK (discount >= 0),
    shipping INT NOT NULL DEFAULT 0 CHECK (shipping >= 0),
    total INT NOT NULL CHECK (total >= 0),
    referral_code VARCHAR(100) REFERENCES public.partners(referral_code) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Placed' CHECK (status IN ('Placed', 'Processing', 'Packed', 'Shipped', 'Delivered')),
    payment_method VARCHAR(100) NOT NULL CHECK (payment_method IN ('Cash on Delivery', 'bKash', 'Nagad', 'Bank Transfer')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid')),
    date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_partner_id VARCHAR(100) REFERENCES public.partners(id) ON DELETE SET NULL,
    commissions_calculated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- E. Withdrawals Table
CREATE TABLE public.withdrawals (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'WTH-' || floor(100 + random() * 899)::text,
    partner_id VARCHAR(100) NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    partner_name TEXT NOT NULL,
    partner_role VARCHAR(50) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    amount INT NOT NULL CHECK (amount > 0),
    method VARCHAR(50) NOT NULL CHECK (method IN ('bKash', 'Nagad', 'Bank Account')),
    details TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- F. App Notifications Table
CREATE TABLE public.notifications (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'not-' || uuid_generate_v4()::text,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Order', 'Commission', 'Payout', 'Inquiry')),
    target_role VARCHAR(50) NOT NULL CHECK (target_role IN ('Admin', 'Partner')),
    partner_id VARCHAR(100) REFERENCES public.partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. PERMANENT DATABASE INDEXES
-- ==========================================
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_sku ON public.products(sku);

CREATE INDEX idx_partners_referral ON public.partners(referral_code);
CREATE INDEX idx_partners_role ON public.partners(role);
CREATE INDEX idx_partners_geo ON public.partners(district, area);

CREATE INDEX idx_customers_mobile ON public.customers(mobile);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_referral ON public.customers(referred_by);

CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_customer_mobile ON public.orders(customer_mobile);
CREATE INDEX idx_orders_partner ON public.orders(assigned_partner_id);
CREATE INDEX idx_orders_referral ON public.orders(referral_code);

CREATE INDEX idx_withdrawals_partner ON public.withdrawals(partner_id);
CREATE INDEX idx_notifications_partner ON public.notifications(partner_id);

-- ==========================================
-- 4. DATABASE AUTOMATION & AUDIT TRIGGERS
-- ==========================================

-- Trigger Function: Automatically update updated_at on record changes
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Timestamp audit trigger across active tables
CREATE TRIGGER trg_products_timestamp BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
CREATE TRIGGER trg_partners_timestamp BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
CREATE TRIGGER trg_customers_timestamp BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
CREATE TRIGGER trg_orders_timestamp BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
CREATE TRIGGER trg_withdrawals_timestamp BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

-- Trigger Function: Subtract or Adjust Wallet Balances automatically upon Withdrawal Status confirmation
CREATE OR REPLACE FUNCTION public.fn_manage_partner_balances()
RETURNS TRIGGER AS $$
BEGIN
    -- If a payout is approved (transition from Pending/Rejected to Approved)
    IF NEW.status = 'Approved' AND (OLD.status IS NULL OR OLD.status <> 'Approved') THEN
        -- Verify partner exists and has sufficient balance
        IF (SELECT wallet_balance FROM public.partners WHERE id = NEW.partner_id) >= NEW.amount THEN
            UPDATE public.partners
            SET wallet_balance = wallet_balance - NEW.amount,
                total_withdrawn = total_withdrawn + NEW.amount
            WHERE id = NEW.partner_id;
        ELSE
            RAISE EXCEPTION 'Insufficient wallet balance to approve payout requests.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_withdrawals_ledger AFTER UPDATE ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.fn_manage_partner_balances();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) ARCHITECTURE
-- ==========================================

-- Enable Row Level Security across our central relational ledger
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RULE 1: superadmin-bypass-role
-- Provides complete unrestricted SELECT, INSERT, UPDATE, DELETE permissions across all database files.
-- Super Admin identifies securely via 'admin@dadajan.com' inside their Supabase JWT claim list.

-- HELPER: Check if active session represents the SuperAdmin
CREATE OR REPLACE FUNCTION public.fn_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt()->>'email' = 'admin@dadajan.com'
        OR auth.jwt()->>'role' = 'service_role'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- products Policies
CREATE POLICY "products_unrestricted_read" 
    ON public.products FOR SELECT 
    USING (TRUE);

CREATE POLICY "products_admin_all" 
    ON public.products FOR ALL 
    TO authenticated 
    USING (public.fn_is_admin()) 
    WITH CHECK (public.fn_is_admin());


-- partners Policies
CREATE POLICY "partners_admin_all" 
    ON public.partners FOR ALL 
    TO authenticated 
    USING (public.fn_is_admin()) 
    WITH CHECK (public.fn_is_admin());

CREATE POLICY "partners_dealer_self" 
    ON public.partners FOR SELECT 
    TO authenticated 
    USING (email = auth.jwt()->>'email');

CREATE POLICY "partners_dealer_self_update" 
    ON public.partners FOR UPDATE 
    TO authenticated 
    USING (email = auth.jwt()->>'email')
    WITH CHECK (email = auth.jwt()->>'email');


-- customers Policies
CREATE POLICY "customers_admin_all" 
    ON public.customers FOR ALL 
    TO authenticated 
    USING (public.fn_is_admin()) 
    WITH CHECK (public.fn_is_admin());

CREATE POLICY "customers_self" 
    ON public.customers FOR ALL 
    TO authenticated 
    USING (email = auth.jwt()->>'email' OR auth.uid()::text = id)
    WITH CHECK (email = auth.jwt()->>'email' OR auth.uid()::text = id);

CREATE POLICY "customers_dealer_select_assigned" 
    ON public.customers FOR SELECT 
    TO authenticated 
    USING (
        referred_by = (
            SELECT referral_code FROM public.partners WHERE email = auth.jwt()->>'email' LIMIT 1
        )
    );


-- orders Policies
CREATE POLICY "orders_admin_all" 
    ON public.orders FOR ALL 
    TO authenticated 
    USING (public.fn_is_admin()) 
    WITH CHECK (public.fn_is_admin());

CREATE POLICY "orders_customer_access" 
    ON public.orders FOR SELECT 
    TO authenticated 
    USING (customer_email = auth.jwt()->>'email' OR customer_mobile = auth.jwt()->>'phone');

CREATE POLICY "orders_customer_insert" 
    ON public.orders FOR INSERT 
    TO authenticated 
    WITH CHECK (customer_email = auth.jwt()->>'email' OR customer_mobile = auth.jwt()->>'phone');

CREATE POLICY "orders_dealer_select_assigned" 
    ON public.orders FOR SELECT 
    TO authenticated 
    USING (
        assigned_partner_id = (
            SELECT id FROM public.partners WHERE email = auth.jwt()->>'email' LIMIT 1
        )
        OR referral_code = (
            SELECT referral_code FROM public.partners WHERE email = auth.jwt()->>'email' LIMIT 1
        )
    );


-- withdrawals Policies
CREATE POLICY "withdrawals_admin_all" 
    ON public.withdrawals FOR ALL 
    TO authenticated 
    USING (public.fn_is_admin()) 
    WITH CHECK (public.fn_is_admin());

CREATE POLICY "withdrawals_dealer_own" 
    ON public.withdrawals FOR SELECT 
    TO authenticated 
    USING (
        partner_id = (
            SELECT id FROM public.partners WHERE email = auth.jwt()->>'email' LIMIT 1
        )
    );

CREATE POLICY "withdrawals_dealer_insert" 
    ON public.withdrawals FOR INSERT 
    TO authenticated 
    WITH CHECK (
        partner_id = (
            SELECT id FROM public.partners WHERE email = auth.jwt()->>'email' LIMIT 1
        )
    );


-- notifications Policies
CREATE POLICY "notifications_admin_all" 
    ON public.notifications FOR ALL 
    TO authenticated 
    USING (public.fn_is_admin()) 
    WITH CHECK (public.fn_is_admin());

CREATE POLICY "notifications_dealer" 
    ON public.notifications FOR SELECT 
    TO authenticated 
    USING (
        partner_id = (
            SELECT id FROM public.partners WHERE email = auth.jwt()->>'email' LIMIT 1
        )
        OR (target_role = 'Partner' AND partner_id IS NULL)
    );

COMMIT;
