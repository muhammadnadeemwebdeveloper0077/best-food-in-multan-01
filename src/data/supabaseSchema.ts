export const SUPABASE_SQL_SCHEMA = `-- =========================================================
-- Best Food In Multan - Supabase Database Schema
-- Multi-Tenant Multan Restaurant Discovery & Direct Orders
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Restaurants Table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id TEXT PRIMARY KEY DEFAULT ('rest-' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    tagline TEXT,
    tagline_ur TEXT,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    cover_image_url TEXT,
    neighbourhood TEXT NOT NULL,
    address TEXT NOT NULL,
    address_ur TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    maps_url TEXT,
    website_url TEXT,
    rating NUMERIC(2,1) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    delivery_time_min INTEGER DEFAULT 30,
    delivery_time_max INTEGER DEFAULT 45,
    delivery_fee_pkr INTEGER DEFAULT 150,
    min_order_pkr INTEGER DEFAULT 500,
    is_verified BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    accepting_orders BOOLEAN DEFAULT true,
    cuisines TEXT[] DEFAULT ARRAY['desi'],
    owner_email TEXT,
    opening_hours TEXT DEFAULT '12:00 PM - 12:00 AM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY DEFAULT ('item-' || substr(md5(random()::text), 1, 8)),
    restaurant_id TEXT REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    description TEXT,
    description_ur TEXT,
    price_pkr INTEGER NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_spicy BOOLEAN DEFAULT false,
    is_speciality BOOLEAN DEFAULT false,
    preparation_time_min INTEGER DEFAULT 20,
    options_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customer Profiles Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    neighbourhood TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table (Direct Restaurant Delivery Model)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_neighbourhood TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    restaurant_id TEXT REFERENCES public.restaurants(id),
    restaurant_name TEXT NOT NULL,
    items_json JSONB NOT NULL,
    subtotal_pkr INTEGER NOT NULL,
    delivery_fee_pkr INTEGER NOT NULL,
    total_pkr INTEGER NOT NULL,
    payment_method TEXT NOT NULL, -- 'cod', 'jazzcash', 'easypaisa', 'bank_transfer'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
    special_instructions TEXT,
    estimated_delivery_mins INTEGER DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read of published restaurants and items
CREATE POLICY "Public can view published restaurants" ON public.restaurants
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view available menu items" ON public.menu_items
    FOR SELECT USING (true);

-- Allow customers to view and insert orders
CREATE POLICY "Anyone can create an order" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view order by ID" ON public.orders
    FOR SELECT USING (true);
`;

export const CSV_SAMPLE_TEMPLATE = `id,name,name_ur,neighbourhood,address,phone,whatsapp,cuisines,min_order_pkr,delivery_fee_pkr,is_verified,is_published
rest-hafiz-halwa,Hafiz Ka Multani Sohan Halwa,حافظ کا ملتانی سوہن حلوہ,Old City (Ghanta Ghar),"Hussain Agahi Road, Multan",+92 61 4541234,923006301234,sohan_halwa;desi,800,150,true,true
rest-shahjahan-grill,Shahjahan Grill & Shinwari Karahi,شاہ جہاں گرل اور شینواری کڑاہی,Bosan Road,"Main Bosan Road, Multan",+92 61 6214567,923017205678,karahi;bbq;desi,1200,180,true,true
rest-bbq-tonight,BBQ Tonight Gulgasht,باربی کیو ٹونائٹ گلگشت,Gulgasht Colony,"Gol Bagh Market, Multan",+92 61 6523990,923028604321,bbq;desi;karahi,1000,150,true,true
rest-bundu-khan,Bundu Khan Restaurant Multan Cantt,بندو خان ریسٹورنٹ ملتان کینٹ,Multan Cantt,"Nusrat Road, Cantt, Multan",+92 61 4589911,923035508822,desi;biryani;karahi;bbq,1500,200,true,true
rest-14th-street,14th Street Pizza Multan,فورتینتھ اسٹریٹ پیزا ملتان,Bosan Road,"Gulshan Market, Bosan Road, Multan",+92 61 111363636,923059914140,pizza;fast_food,900,120,true,true
rest-ranchers,Ranchers Cafe Gulgasht,رانچرز کیفے گلگشت,Gulgasht Colony,"Jalal Park Road, Gulgasht, Multan",+92 61 6228765,923067809911,burgers;fast_food,700,140,true,true
rest-alkaif-dera,Al-Kaif Shinwari Dera,الکیف شینواری ڈیرہ,Northern Bypass,"Northern Bypass, Multan",+92 61 6774321,923071239876,karahi;bbq;desi,1800,250,true,true
rest-rewari-sweets,Rewari Sweets & Rabri Falooda,ریواڑی سوئٹس اور ربڑی فالودہ,Chowk Kutchery,"Abdali Road, Multan",+92 61 4516789,923089901122,sohan_halwa;desi;beverages,600,120,true,true
`;
