import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { ProductTypeToggle } from "@/components/home/ProductTypeToggle";
import { useProductType, PRODUCT_TYPE_CONFIG, ProductType } from "@/contexts/ProductTypeContext";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  size_ml: number;
  size_label: string;
  price_per_piece: number;
  stock_quantity: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  base_price: number;
  moq: number;
  gst_percentage: number;
  category_id: string;
  categories: Category;
  product_variants: ProductVariant[];
}

const sizeFilters = [
  { label: "All Sizes", value: null },
  { label: "150ml", value: 150 },
  { label: "200ml", value: 200 },
  { label: "250ml", value: 250 },
  { label: "300ml", value: 300 },
  { label: "350ml", value: 350 },
  { label: "400ml+", value: 400 },
];

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (*),
        product_variants (*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const handleQuickAdd = async (variantId: string) => {
    setAddingToCart(variantId);
    await addToCart(variantId, 100); // MOQ is typically 100
    setAddingToCart(null);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategory && product.category_id !== selectedCategory) {
      return false;
    }

    // Size filter
    if (selectedSize) {
      const hasSize = product.product_variants.some((v) =>
        selectedSize === 400 ? v.size_ml >= 400 : v.size_ml === selectedSize
      );
      if (!hasSize) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getLowestPrice = (variants: ProductVariant[]) => {
    if (variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.price_per_piece));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
         <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            {/* Product Type Toggle */}
            <div className="mb-8">
              <ProductTypeToggle />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Our Products
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Premium quality paper cups, tissues, and plates for all your needs. Bulk orders welcome.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mx-auto mt-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-background/80 backdrop-blur-sm"
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 shrink-0"
            >
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div className="bento-card p-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === null
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="bento-card p-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizeFilters.map((size) => (
                      <button
                        key={size.label}
                        onClick={() => setSelectedSize(size.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedSize === size.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredProducts.length} products
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bento-card overflow-hidden"
                      >
                        {/* Product Image */}
                        <Link to={`/product/${product.slug}`}>
                          <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/50 relative overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-6xl">☕</div>
                              </div>
                            )}
                            <Badge
                              variant="secondary"
                              className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
                            >
                              {product.categories?.name}
                            </Badge>
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="p-4">
                          <Link to={`/product/${product.slug}`}>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Sizes Available */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {product.product_variants.slice(0, 3).map((variant) => (
                              <span
                                key={variant.id}
                                className="text-xs bg-secondary px-2 py-0.5 rounded"
                              >
                                {variant.size_label.split(" ")[0]}
                              </span>
                            ))}
                            {product.product_variants.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{product.product_variants.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Price & Add to Cart */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">From</p>
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(getLowestPrice(product.product_variants))}
                                <span className="text-xs font-normal text-muted-foreground">
                                  /pc
                                </span>
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="rounded-lg gap-1"
                              onClick={() => {
                                if (product.product_variants.length > 0) {
                                  handleQuickAdd(product.product_variants[0].id);
                                }
                              }}
                              disabled={
                                addingToCart === product.product_variants[0]?.id ||
                                product.product_variants.length === 0
                              }
                            >
                              {addingToCart === product.product_variants[0]?.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4" />
                                  Add
                                </>
                              )}
                            </Button>
                          </div>

                          {/* MOQ */}
                          <p className="text-xs text-muted-foreground mt-2">
                            Min. order: {product.moq} pcs
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
