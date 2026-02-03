import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Check, Minus, Plus, Package, Truck, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  moq: number;
  gst_percentage: number;
  supports_custom_print: boolean | null;
  categories: { name: string } | null;
}

interface Variant {
  id: string;
  size_label: string;
  size_ml: number;
  price_per_piece: number;
}

interface SlabPricing {
  min_quantity: number;
  max_quantity: number | null;
  price_per_piece: number;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [slabPricing, setSlabPricing] = useState<SlabPricing[]>([]);
  const [quantity, setQuantity] = useState(100);
  const [customPrintFile, setCustomPrintFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (selectedVariant) {
      fetchSlabPricing(selectedVariant.id);
    }
  }, [selectedVariant]);

  const fetchProduct = async () => {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select(`*, categories(name)`)
      .eq("slug", slug)
      .single();

    if (productError) {
      console.error("Error fetching product:", productError);
      setLoading(false);
      return;
    }

    setProduct(productData);

    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productData.id)
      .order("size_ml", { ascending: true });

    if (variantsData && variantsData.length > 0) {
      setVariants(variantsData);
      setSelectedVariant(variantsData[0]);
    }

    setLoading(false);
  };

  const fetchSlabPricing = async (variantId: string) => {
    const { data } = await supabase
      .from("slab_pricing")
      .select("*")
      .eq("variant_id", variantId)
      .order("min_quantity", { ascending: true });

    setSlabPricing(data || []);
  };

  const getCurrentPrice = (): number => {
    if (!selectedVariant) return 0;

    for (const slab of slabPricing) {
      if (quantity >= slab.min_quantity && (slab.max_quantity === null || quantity <= slab.max_quantity)) {
        return slab.price_per_piece;
      }
    }

    return selectedVariant.price_per_piece;
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta * 100;
    if (product && newQuantity >= product.moq) {
      setQuantity(newQuantity);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPrintFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} has been selected for custom printing.`,
      });
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVariant) return;

    setAddingToCart(true);
    await addToCart(selectedVariant.id, quantity);
    setAddingToCart(false);
  };

  const currentPrice = getCurrentPrice();
  const subtotal = currentPrice * quantity;
  const gstAmount = product ? (subtotal * product.gst_percentage) / 100 : 0;
  const total = subtotal + gstAmount;

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden bg-secondary">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-32 w-32 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                Free shipping on bulk orders
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Quality guaranteed
              </div>
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {product.categories && (
              <Badge variant="secondary">{product.categories.name}</Badge>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>

            {product.description && (
              <p className="text-muted-foreground text-lg">{product.description}</p>
            )}

            {/* Size Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Size</label>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedVariant?.id === variant.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">{variant.size_label}</span>
                    <span className="text-muted-foreground ml-1">({variant.size_ml}ml)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slab Pricing Table */}
            {slabPricing.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Volume Pricing</h3>
                  <div className="space-y-2">
                    {slabPricing.map((slab, index) => {
                      const isActive =
                        quantity >= slab.min_quantity &&
                        (slab.max_quantity === null || quantity <= slab.max_quantity);

                      return (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                            isActive ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isActive && <Check className="h-4 w-4 text-primary" />}
                            {slab.min_quantity}
                            {slab.max_quantity ? ` - ${slab.max_quantity}` : "+"} pcs
                          </span>
                          <span className="font-semibold">₹{slab.price_per_piece.toFixed(2)}/pc</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Quantity (MOQ: {product.moq})</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= product.moq}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 py-2 font-semibold min-w-[100px] text-center">
                    {quantity}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-muted-foreground">pieces</span>
              </div>
            </div>

            {/* Custom Print Upload */}
            {product.supports_custom_print && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Custom Print Design (Optional)</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.ai,.eps,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="custom-print"
                  />
                  <label htmlFor="custom-print" className="cursor-pointer">
                    {customPrintFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Check className="h-5 w-5" />
                        {customPrintFile.name}
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Upload your design (PDF, AI, EPS, PNG, JPG)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <Card className="bg-secondary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Price per piece</span>
                  <span className="font-semibold">₹{currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal ({quantity} pcs)</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST ({product.gst_percentage}%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariant}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
