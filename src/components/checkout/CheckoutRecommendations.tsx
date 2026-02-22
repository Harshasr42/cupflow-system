import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { PRODUCT_TYPE_CONFIG, ProductType } from "@/contexts/ProductTypeContext";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  base_price: number;
  description: string | null;
  productType: ProductType;
  categories: { name: string; slug: string } | null;
  product_variants: { id: string; size_label: string; price_per_piece: number }[];
}

// Determine what product types are in the cart based on category names
function detectCartProductTypes(items: { productName: string }[]): Set<ProductType> {
  const types = new Set<ProductType>();
  items.forEach((item) => {
    const name = item.productName.toLowerCase();
    if (name.includes("tissue") || name.includes("napkin")) {
      types.add("tissues");
    } else if (name.includes("plate") || name.includes("bowl")) {
      types.add("paper_plates");
    } else {
      types.add("paper_cups");
    }
  });
  return types;
}

function getRecommendationMessage(cartTypes: Set<ProductType>, recType: ProductType): string {
  const config = PRODUCT_TYPE_CONFIG[recType];
  if (cartTypes.size === 1) {
    const cartType = [...cartTypes][0];
    if (cartType === "paper_cups") return `Complete your setup with our ${config.label.toLowerCase()}`;
    if (cartType === "tissues") return `Pair your tissues with our ${config.label.toLowerCase()}`;
    return `Don't forget to check our ${config.label.toLowerCase()}`;
  }
  return `You might also like our ${config.label.toLowerCase()}`;
}

export function CheckoutRecommendations() {
  const { items, addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [items]);

  const fetchRecommendations = async () => {
    if (items.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const cartTypes = detectCartProductTypes(items);
    const allTypes: ProductType[] = ["paper_cups", "tissues", "paper_plates"];
    const missingTypes = allTypes.filter((t) => !cartTypes.has(t));

    if (missingTypes.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    // Fetch products from categories that match missing types
    const categoryKeywords = missingTypes.flatMap((t) => {
      if (t === "paper_cups") return ["cup", "hot", "cold", "ripple"];
      if (t === "tissues") return ["tissue", "napkin"];
      return ["plate", "bowl"];
    });

    const { data } = await supabase
      .from("products")
      .select(`*, categories(name, slug), product_variants(id, size_label, price_per_piece)`)
      .eq("is_active", true)
      .limit(6);

    if (data) {
      // Filter to products that match missing types by name/category
      const filtered = data
        .filter((p: any) => {
          const name = (p.name + " " + (p.categories?.name || "")).toLowerCase();
          return categoryKeywords.some((kw) => name.includes(kw));
        })
        .slice(0, 3)
        .map((p: any) => ({
          ...p,
          productType: detectProductType(p.name, p.categories?.name),
        }));

      // If no keyword matches, just show random products not in cart
      if (filtered.length === 0 && data.length > 0) {
        const cartVariantIds = new Set(items.map((i) => i.variantId));
        const notInCart = data
          .filter((p: any) => !p.product_variants.some((v: any) => cartVariantIds.has(v.id)))
          .slice(0, 3)
          .map((p: any) => ({
            ...p,
            productType: detectProductType(p.name, p.categories?.name),
          }));
        setRecommendations(notInCart);
      } else {
        setRecommendations(filtered);
      }
    }
    setLoading(false);
  };

  const handleQuickAdd = async (product: RecommendedProduct) => {
    if (product.product_variants.length === 0) return;
    setAddingId(product.id);
    await addToCart(product.product_variants[0].id, 100);
    setAddingId(null);
  };

  if (dismissed || loading || recommendations.length === 0) return null;

  const cartTypes = detectCartProductTypes(items);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-accent/30 via-secondary/20 to-accent/30 rounded-2xl p-6 border border-accent/20"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-sm">
          {recommendations.length > 0
            ? getRecommendationMessage(cartTypes, recommendations[0].productType)
            : "You might also like"}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recommendations.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            className="bg-background rounded-xl p-3 flex gap-3 items-center border border-border/50"
          >
            <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">
                  {PRODUCT_TYPE_CONFIG[product.productType]?.emoji || "📦"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                From ₹{product.product_variants[0]?.price_per_piece.toFixed(2)}/pc
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 flex-shrink-0"
              onClick={() => handleQuickAdd(product)}
              disabled={addingId === product.id}
            >
              {addingId === product.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShoppingCart className="h-3 w-3" />
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function detectProductType(name: string, categoryName?: string): ProductType {
  const combined = (name + " " + (categoryName || "")).toLowerCase();
  if (combined.includes("tissue") || combined.includes("napkin")) return "tissues";
  if (combined.includes("plate") || combined.includes("bowl")) return "paper_plates";
  return "paper_cups";
}
