-- Run this in your Supabase SQL Editor

-- Create farmer_groups table
CREATE TABLE farmer_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  crop_type TEXT NOT NULL,
  target_quantity INTEGER NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  min_price DECIMAL(10,2),
  location TEXT,
  status TEXT CHECK (status IN ('active', 'full', 'completed', 'cancelled')) DEFAULT 'active',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create group_members table
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES farmer_groups(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  status TEXT CHECK (status IN ('pending', 'active', 'rejected')) DEFAULT 'pending',
  quantity_committed INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id, farmer_id)
);

-- Create bulk_orders table
CREATE TABLE bulk_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES farmer_groups(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_quantity INTEGER NOT NULL,
  offered_price DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  delivery_location TEXT,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE farmer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Groups viewable by everyone" ON farmer_groups FOR SELECT USING (true);
CREATE POLICY "Farmers can create groups" ON farmer_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update" ON farmer_groups FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Members viewable by group members" ON group_members FOR SELECT USING (
  farmer_id = auth.uid() OR 
  group_id IN (SELECT group_id FROM group_members WHERE farmer_id = auth.uid())
);
CREATE POLICY "Farmers can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Orders viewable by involved parties" ON bulk_orders FOR SELECT USING (
  buyer_id = auth.uid() OR
  group_id IN (SELECT group_id FROM group_members WHERE farmer_id = auth.uid())
);
CREATE POLICY "Buyers can create orders" ON bulk_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Insert sample data
INSERT INTO farmer_groups (name, description, crop_type, target_quantity, current_quantity, min_price, location, created_by) VALUES
('Tomato Farmers Union', 'Premium quality tomatoes from organic farms', 'Tomato', 1000, 750, 35, 'Bangalore', (SELECT id FROM profiles WHERE role = 'farmer' LIMIT 1)),
('Rice Collective', 'High-quality basmati rice from Punjab farmers', 'Rice', 2000, 1500, 28, 'Punjab', (SELECT id FROM profiles WHERE role = 'farmer' LIMIT 1));