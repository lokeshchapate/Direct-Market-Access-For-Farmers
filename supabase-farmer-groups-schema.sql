-- Farmer Groups Schema for Bulk Selling and Price Negotiation

-- Create farmer_groups table
CREATE TABLE farmer_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  crop_type TEXT NOT NULL,
  target_quantity INTEGER NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  min_price DECIMAL(10,2),
  negotiated_price DECIMAL(10,2),
  location TEXT,
  status TEXT CHECK (status IN ('active', 'full', 'negotiating', 'completed', 'cancelled')) DEFAULT 'active',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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

-- Create bulk_orders table for group orders
CREATE TABLE bulk_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES farmer_groups(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_quantity INTEGER NOT NULL,
  offered_price DECIMAL(10,2) NOT NULL,
  negotiated_price DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'negotiating', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  delivery_location TEXT,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create price_negotiations table
CREATE TABLE price_negotiations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bulk_order_id UUID REFERENCES bulk_orders(id) ON DELETE CASCADE,
  proposed_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  proposed_price DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE farmer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_negotiations ENABLE ROW LEVEL SECURITY;

-- Policies for farmer_groups
CREATE POLICY "Groups are viewable by everyone" ON farmer_groups
  FOR SELECT USING (true);

CREATE POLICY "Farmers can create groups" ON farmer_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON farmer_groups
  FOR UPDATE USING (auth.uid() = created_by);

-- Policies for group_members
CREATE POLICY "Group members are viewable by group members" ON group_members
  FOR SELECT USING (
    farmer_id = auth.uid() OR 
    group_id IN (SELECT group_id FROM group_members WHERE farmer_id = auth.uid())
  );

CREATE POLICY "Farmers can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Group admins can update member status" ON group_members
  FOR UPDATE USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE farmer_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for bulk_orders
CREATE POLICY "Bulk orders viewable by group members and buyers" ON bulk_orders
  FOR SELECT USING (
    buyer_id = auth.uid() OR
    group_id IN (SELECT group_id FROM group_members WHERE farmer_id = auth.uid())
  );

CREATE POLICY "Buyers can create bulk orders" ON bulk_orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Group admins and buyers can update bulk orders" ON bulk_orders
  FOR UPDATE USING (
    buyer_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE farmer_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for price_negotiations
CREATE POLICY "Negotiations viewable by involved parties" ON price_negotiations
  FOR SELECT USING (
    proposed_by = auth.uid() OR
    bulk_order_id IN (
      SELECT id FROM bulk_orders WHERE buyer_id = auth.uid()
    ) OR
    bulk_order_id IN (
      SELECT bo.id FROM bulk_orders bo
      JOIN group_members gm ON bo.group_id = gm.group_id
      WHERE gm.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create negotiations" ON price_negotiations
  FOR INSERT WITH CHECK (auth.uid() = proposed_by);

-- Function to update group quantity when members join
CREATE OR REPLACE FUNCTION update_group_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    UPDATE farmer_groups 
    SET current_quantity = current_quantity + NEW.quantity_committed
    WHERE id = NEW.group_id;
  ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE farmer_groups 
    SET current_quantity = current_quantity - OLD.quantity_committed
    WHERE id = NEW.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating group quantity
CREATE TRIGGER update_group_quantity_trigger
  AFTER UPDATE ON group_members
  FOR EACH ROW EXECUTE PROCEDURE update_group_quantity();

-- Add updated_at triggers
CREATE TRIGGER update_farmer_groups_updated_at BEFORE UPDATE ON farmer_groups
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bulk_orders_updated_at BEFORE UPDATE ON bulk_orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();