

# PaperCup Pro - Phase 1 Implementation Plan
### A Modern Ecommerce System for Paper Cup Manufacturing

---

## 🎨 Design Vision (Inspired by Agentio)

**Color Palette:**
- Primary: Deep Navy (#0A1128) for CTAs and headers
- Background: Pure White with soft gradient accents
- Accents: Soft purple/lavender gradients for depth
- Secondary: Slate grays for body text

**Design Elements:**
- Clean, spacious "bento-box" grid layout
- Large border-radius on cards and containers
- Bold sans-serif typography (Inter font)
- Generous white space for focus
- High-quality SVG illustrations

**Animations:**
- Smooth fade-in + slide-up on scroll
- Subtle hover scale effects on cards/buttons
- Infinite logo marquee for trust signals
- Layered 3D card effects

---

## 📱 Phase 1 Features (Core Shop Experience)

### Public Website Pages

1. **Home Page**
   - Hero section with bold headline + "Order Now" CTA
   - Featured products grid with hover animations
   - Trust badges (GST registered, Quality certified)
   - Customer logo marquee
   - Quick stats section (Orders delivered, Cups produced, etc.)

2. **Products Page (Shop)**
   - Filter by category (Hot cups, Cold cups, Ripple, Custom print)
   - Filter by size (150ml, 200ml, 250ml, etc.)
   - Grid layout with product cards
   - Quick-add to cart functionality
   - Bulk pricing preview

3. **Product Detail Page**
   - Product images with gallery
   - Size/variant selection
   - Quantity slab pricing table
   - MOQ indicator
   - Custom print option (file upload placeholder)
   - Add to cart with quantity selector

4. **About Us**
   - Company story with fade-in animations
   - Manufacturing capabilities
   - Quality certifications

5. **Contact Us**
   - Contact form
   - Factory address with map
   - Phone/WhatsApp contact button

6. **FAQ Page**
   - Accordion-style Q&A
   - GST, shipping, ordering questions

---

### 🛒 Shopping Cart & Checkout Flow

**Cart Features:**
- Slide-out cart drawer
- Quantity adjustment
- Live price updates
- GST preview
- Proceed to checkout button

**Checkout Flow:**
1. **Step 1: Shipping Address**
   - Delivery address form
   - Save address for future orders

2. **Step 2: GST Details (Optional)**
   - Business name input
   - GSTIN validation
   - Toggle for GST invoice

3. **Step 3: Order Review**
   - Products summary
   - GST breakdown (CGST + SGST / IGST)
   - Shipping charges
   - Total amount

4. **Step 4: Payment**
   - UPI option (manual for now - QR code display)
   - Bank transfer details
   - Order confirmation

---

### 👤 User Authentication

- Clean login/register pages
- Email + password authentication
- Role system foundation (Customer, Dealer, Admin)
- "Forgot password" flow
- Mobile-friendly forms

---

### 📊 Basic Admin Dashboard

**Dashboard Home:**
- Today's orders count
- Pending orders
- Revenue summary widget

**Orders Management:**
- Order list with status filters
- Update order status (Pending → Processing → Shipped → Delivered)
- View order details

**Products Management:**
- Add/Edit products
- Set prices and slab pricing
- Manage stock/MOQ
- Category assignment

**Basic Settings:**
- Company GST details (placeholders)
- Shipping rates configuration

---

## 🗄️ Database Structure (Supabase)

**Core Tables:**
- `profiles` - User profiles with role
- `products` - Product catalog
- `product_variants` - Sizes, prices
- `categories` - Product categories
- `orders` - Order records
- `order_items` - Line items
- `addresses` - Customer addresses
- `cart_items` - Shopping cart

---

## 🔧 Technology Stack

- **Frontend:** React + Tailwind CSS + Framer-style animations
- **Backend:** Supabase (Auth + Database + Storage)
- **Payments:** Manual UPI/Bank transfer (Phase 1)
- **Notifications:** Email via Supabase (WhatsApp in Phase 2)

---

## ✅ Phase 1 Deliverables

1. Beautiful, animated public website (6 pages)
2. Full shopping cart experience
3. Simple checkout with GST calculation
4. User registration and login
5. Admin dashboard for orders & products
6. Mobile-responsive design throughout
7. Placeholder GST invoicing structure

---

## 🚀 What's Deferred to Phase 2

- Dealer/Distributor portal with special pricing
- WhatsApp API integration
- Payment gateway (Razorpay/Stripe)
- PDF invoice generation
- Advanced reporting
- Credit system for dealers

---

This plan focuses on getting your core shop experience live quickly with a stunning, professional design. Once this foundation is solid, we can layer on dealer features and payment automation.

