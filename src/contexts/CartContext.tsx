import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  productName: string;
  variantLabel: string;
  pricePerPiece: number;
  gstPercentage: number;
  imageUrl?: string;
  productSlug: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  isOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Calculate slab price for quantity
const getSlabPrice = async (variantId: string, quantity: number): Promise<number> => {
  const { data: slabs } = await supabase
    .from("slab_pricing")
    .select("*")
    .eq("variant_id", variantId)
    .order("min_quantity", { ascending: true });

  if (!slabs || slabs.length === 0) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("price_per_piece")
      .eq("id", variantId)
      .single();
    return variant?.price_per_piece || 0;
  }

  for (const slab of slabs) {
    if (quantity >= slab.min_quantity && (slab.max_quantity === null || quantity <= slab.max_quantity)) {
      return slab.price_per_piece;
    }
  }

  return slabs[0].price_per_piece;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch cart items when user changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        variant_id,
        quantity,
        product_variants (
          id,
          size_label,
          price_per_piece,
          products (
            name,
            slug,
            image_url,
            gst_percentage
          )
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching cart:", error);
      setLoading(false);
      return;
    }

    const cartItems: CartItem[] = await Promise.all(
      (data || []).map(async (item: any) => {
        const slabPrice = await getSlabPrice(item.variant_id, item.quantity);
        return {
          id: item.id,
          variantId: item.variant_id,
          quantity: item.quantity,
          productName: item.product_variants.products.name,
          variantLabel: item.product_variants.size_label,
          pricePerPiece: slabPrice,
          gstPercentage: item.product_variants.products.gst_percentage,
          imageUrl: item.product_variants.products.image_url,
          productSlug: item.product_variants.products.slug,
        };
      })
    );

    setItems(cartItems);
    setLoading(false);
  };

  const addToCart = async (variantId: string, quantity: number) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Check if item already in cart
    const existingItem = items.find((item) => item.variantId === variantId);
    
    if (existingItem) {
      // Update quantity
      await updateQuantity(variantId, existingItem.quantity + quantity);
    } else {
      // Add new item
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        variant_id: variantId,
        quantity,
      });

      if (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        });
        await fetchCartItems();
        setIsOpen(true);
      }
    }
    
    setLoading(false);
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    if (!user) return;

    setLoading(true);
    
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("variant_id", variantId);

    if (error) {
      console.error("Error updating quantity:", error);
    } else {
      await fetchCartItems();
    }
    
    setLoading(false);
  };

  const removeFromCart = async (variantId: string) => {
    if (!user) return;

    setLoading(true);
    
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("variant_id", variantId);

    if (error) {
      console.error("Error removing from cart:", error);
    } else {
      await fetchCartItems();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    }
    
    setLoading(false);
  };

  const clearCart = async () => {
    if (!user) return;

    setLoading(true);
    
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing cart:", error);
    } else {
      setItems([]);
    }
    
    setLoading(false);
  };

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.pricePerPiece * item.quantity, 0);
  const gstAmount = items.reduce((sum, item) => {
    const itemTotal = item.pricePerPiece * item.quantity;
    return sum + (itemTotal * item.gstPercentage) / 100;
  }, 0);
  const total = subtotal + gstAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        gstAmount,
        total,
        isOpen,
        loading,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
