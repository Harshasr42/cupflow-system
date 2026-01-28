-- Create role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'dealer', 'admin');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  business_name TEXT,
  gstin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  moq INT NOT NULL DEFAULT 100,
  gst_percentage DECIMAL(4,2) NOT NULL DEFAULT 18.00,
  hsn_code TEXT DEFAULT '4823',
  is_active BOOLEAN DEFAULT true,
  supports_custom_print BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_variants table (for sizes)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size_ml INT NOT NULL,
  size_label TEXT NOT NULL,
  price_per_piece DECIMAL(10,4) NOT NULL,
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slab_pricing table (quantity-based pricing)
CREATE TABLE public.slab_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE NOT NULL,
  min_quantity INT NOT NULL,
  max_quantity INT,
  price_per_piece DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addresses table
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  custom_print_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, variant_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  gst_amount DECIMAL(12,2) NOT NULL,
  cgst_amount DECIMAL(12,2) DEFAULT 0,
  sgst_amount DECIMAL(12,2) DEFAULT 0,
  igst_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  buyer_gstin TEXT,
  buyer_business_name TEXT,
  is_gst_invoice BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  quantity INT NOT NULL,
  price_per_piece DECIMAL(10,4) NOT NULL,
  gst_percentage DECIMAL(4,2) NOT NULL,
  hsn_code TEXT,
  custom_print_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slab_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products (public read)
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for product_variants (public read)
CREATE POLICY "Anyone can view variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage variants" ON public.product_variants
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for slab_pricing (public read)
CREATE POLICY "Anyone can view pricing" ON public.slab_pricing
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pricing" ON public.slab_pricing
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for addresses
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for cart_items
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Hot Cups', 'hot-cups', 'Premium paper cups for hot beverages like tea and coffee', 1),
  ('Cold Cups', 'cold-cups', 'Paper cups designed for cold drinks and juices', 2),
  ('Ripple Cups', 'ripple-cups', 'Double-walled ripple cups with superior insulation', 3),
  ('Custom Print', 'custom-print', 'Fully customizable cups with your brand logo', 4);

-- Insert sample products
INSERT INTO public.products (category_id, name, slug, description, base_price, moq, gst_percentage, supports_custom_print) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'hot-cups'), 'Classic Hot Cup', 'classic-hot-cup', 'Perfect for tea and coffee service. Single wall design with excellent heat retention.', 1.50, 100, 18.00, true),
  ((SELECT id FROM public.categories WHERE slug = 'hot-cups'), 'Premium Hot Cup', 'premium-hot-cup', 'Double-coated for extra durability. Ideal for cafes and restaurants.', 2.00, 100, 18.00, true),
  ((SELECT id FROM public.categories WHERE slug = 'cold-cups'), 'Chilled Beverage Cup', 'chilled-beverage-cup', 'Designed for cold drinks with condensation-resistant coating.', 1.75, 100, 18.00, true),
  ((SELECT id FROM public.categories WHERE slug = 'ripple-cups'), 'Ripple Wall Cup', 'ripple-wall-cup', 'Three-layer construction for maximum insulation. No sleeve needed.', 3.50, 50, 18.00, true),
  ((SELECT id FROM public.categories WHERE slug = 'custom-print'), 'Branded Custom Cup', 'branded-custom-cup', 'Full-color printing with your logo and design. Minimum order applies.', 4.00, 500, 18.00, true);

-- Insert product variants (sizes)
INSERT INTO public.product_variants (product_id, size_ml, size_label, price_per_piece, stock_quantity) VALUES
  ((SELECT id FROM public.products WHERE slug = 'classic-hot-cup'), 150, '150ml (5oz)', 1.20, 10000),
  ((SELECT id FROM public.products WHERE slug = 'classic-hot-cup'), 200, '200ml (7oz)', 1.50, 10000),
  ((SELECT id FROM public.products WHERE slug = 'classic-hot-cup'), 250, '250ml (8oz)', 1.80, 10000),
  ((SELECT id FROM public.products WHERE slug = 'classic-hot-cup'), 350, '350ml (12oz)', 2.20, 10000),
  ((SELECT id FROM public.products WHERE slug = 'premium-hot-cup'), 200, '200ml (7oz)', 2.00, 5000),
  ((SELECT id FROM public.products WHERE slug = 'premium-hot-cup'), 250, '250ml (8oz)', 2.30, 5000),
  ((SELECT id FROM public.products WHERE slug = 'premium-hot-cup'), 350, '350ml (12oz)', 2.80, 5000),
  ((SELECT id FROM public.products WHERE slug = 'chilled-beverage-cup'), 300, '300ml (10oz)', 1.75, 8000),
  ((SELECT id FROM public.products WHERE slug = 'chilled-beverage-cup'), 400, '400ml (14oz)', 2.10, 8000),
  ((SELECT id FROM public.products WHERE slug = 'chilled-beverage-cup'), 500, '500ml (16oz)', 2.50, 8000),
  ((SELECT id FROM public.products WHERE slug = 'ripple-wall-cup'), 250, '250ml (8oz)', 3.50, 3000),
  ((SELECT id FROM public.products WHERE slug = 'ripple-wall-cup'), 350, '350ml (12oz)', 4.00, 3000),
  ((SELECT id FROM public.products WHERE slug = 'ripple-wall-cup'), 450, '450ml (16oz)', 4.50, 3000),
  ((SELECT id FROM public.products WHERE slug = 'branded-custom-cup'), 200, '200ml (7oz)', 4.00, 0),
  ((SELECT id FROM public.products WHERE slug = 'branded-custom-cup'), 250, '250ml (8oz)', 4.50, 0),
  ((SELECT id FROM public.products WHERE slug = 'branded-custom-cup'), 350, '350ml (12oz)', 5.00, 0);

-- Insert slab pricing
INSERT INTO public.slab_pricing (variant_id, min_quantity, max_quantity, price_per_piece)
SELECT id, 100, 499, price_per_piece FROM public.product_variants;

INSERT INTO public.slab_pricing (variant_id, min_quantity, max_quantity, price_per_piece)
SELECT id, 500, 999, price_per_piece * 0.95 FROM public.product_variants;

INSERT INTO public.slab_pricing (variant_id, min_quantity, max_quantity, price_per_piece)
SELECT id, 1000, 4999, price_per_piece * 0.90 FROM public.product_variants;

INSERT INTO public.slab_pricing (variant_id, min_quantity, max_quantity, price_per_piece)
SELECT id, 5000, NULL, price_per_piece * 0.85 FROM public.product_variants;