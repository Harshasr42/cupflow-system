import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, FileText, ShoppingBag, CreditCard, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Address {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean | null;
}

const steps = [
  { id: 1, name: "Shipping", icon: MapPin },
  { id: 2, name: "GST Details", icon: FileText },
  { id: 3, name: "Review", icon: ShoppingBag },
  { id: 4, name: "Payment", icon: CreditCard },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, gstAmount, total, clearCart } = useCart();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  // GST details
  const [isGstInvoice, setIsGstInvoice] = useState(false);
  const [gstDetails, setGstDetails] = useState({
    gstin: "",
    business_name: "",
  });

  // Order notes
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      navigate("/shop");
      return;
    }

    fetchAddresses();
  }, [user, items]);

  const fetchAddresses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (data) {
      setAddresses(data);
      const defaultAddr = data.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    }
  };

  const handleSaveNewAddress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        ...newAddress,
        is_default: addresses.length === 0,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id);
      setShowNewAddressForm(false);
      setNewAddress({
        label: "Home",
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddressId) return;

    setLoading(true);

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Calculate GST split (assuming same-state for simplicity)
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        address_id: selectedAddressId,
        subtotal,
        gst_amount: gstAmount,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: 0,
        total_amount: total,
        is_gst_invoice: isGstInvoice,
        buyer_gstin: isGstInvoice ? gstDetails.gstin : null,
        buyer_business_name: isGstInvoice ? gstDetails.business_name : null,
        notes: orderNotes || null,
        status: "pending",
        payment_status: "pending",
        payment_method: "upi",
      })
      .select()
      .single();

    if (orderError) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      product_name: item.productName,
      variant_label: item.variantLabel,
      quantity: item.quantity,
      price_per_piece: item.pricePerPiece,
      gst_percentage: item.gstPercentage,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
    }

    // Clear cart
    await clearCart();

    toast({
      title: "Order placed!",
      description: `Your order ${orderNumber} has been placed successfully.`,
    });

    navigate(`/order-confirmation/${order.id}`);
    setLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedAddressId !== "";
      case 2:
        return !isGstInvoice || (gstDetails.gstin && gstDetails.business_name);
      case 3:
        return true;
      default:
        return true;
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`ml-2 hidden sm:block ${
                  currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping Address */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          onClick={() => setSelectedAddressId(address.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-medium">{address.full_name}</span>
                              {address.label && (
                                <span className="ml-2 text-xs bg-secondary px-2 py-1 rounded">
                                  {address.label}
                                </span>
                              )}
                            </div>
                            {selectedAddressId === address.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mt-2">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                            <br />
                            {address.city}, {address.state} - {address.pincode}
                            <br />
                            Phone: {address.phone}
                          </p>
                        </div>
                      ))}

                      {!showNewAddressForm ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowNewAddressForm(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      ) : (
                        <div className="space-y-4 p-4 border rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label>Full Name</Label>
                              <Input
                                value={newAddress.full_name}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, full_name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <Input
                                value={newAddress.phone}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, phone: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Label</Label>
                              <Input
                                value={newAddress.label}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, label: e.target.value })
                                }
                                placeholder="Home, Office, etc."
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Address Line 1</Label>
                              <Input
                                value={newAddress.address_line1}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, address_line1: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Address Line 2 (Optional)</Label>
                              <Input
                                value={newAddress.address_line2}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, address_line2: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>City</Label>
                              <Input
                                value={newAddress.city}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, city: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>State</Label>
                              <Input
                                value={newAddress.state}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, state: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Pincode</Label>
                              <Input
                                value={newAddress.pincode}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, pincode: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveNewAddress}>Save Address</Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowNewAddressForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: GST Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        GST Details (Optional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gst-invoice"
                          checked={isGstInvoice}
                          onCheckedChange={(checked) => setIsGstInvoice(checked as boolean)}
                        />
                        <label
                          htmlFor="gst-invoice"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I need a GST Invoice
                        </label>
                      </div>

                      {isGstInvoice && (
                        <div className="space-y-4">
                          <div>
                            <Label>GSTIN</Label>
                            <Input
                              value={gstDetails.gstin}
                              onChange={(e) =>
                                setGstDetails({ ...gstDetails, gstin: e.target.value.toUpperCase() })
                              }
                              placeholder="22AAAAA0000A1Z5"
                              maxLength={15}
                            />
                          </div>
                          <div>
                            <Label>Business Name</Label>
                            <Input
                              value={gstDetails.business_name}
                              onChange={(e) =>
                                setGstDetails({ ...gstDetails, business_name: e.target.value })
                              }
                              placeholder="Your company name"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Order Notes (Optional)</Label>
                        <Input
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Any special instructions for your order"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Order Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Address Summary */}
                      {selectedAddress && (
                        <div className="p-4 bg-secondary/30 rounded-lg">
                          <h4 className="font-medium mb-2">Shipping to:</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedAddress.full_name}
                            <br />
                            {selectedAddress.address_line1}
                            {selectedAddress.address_line2 && `, ${selectedAddress.address_line2}`}
                            <br />
                            {selectedAddress.city}, {selectedAddress.state} -{" "}
                            {selectedAddress.pincode}
                          </p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Items ({items.length})</h4>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <ShoppingBag className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.variantLabel} • Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ₹{(item.pricePerPiece * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* GST Details Summary */}
                      {isGstInvoice && (
                        <div className="p-4 bg-secondary/30 rounded-lg">
                          <h4 className="font-medium mb-2">GST Invoice Details:</h4>
                          <p className="text-sm text-muted-foreground">
                            GSTIN: {gstDetails.gstin}
                            <br />
                            Business: {gstDetails.business_name}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center p-8 bg-secondary/30 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Pay via UPI</h3>
                        <div className="w-48 h-48 mx-auto bg-background border rounded-lg flex items-center justify-center mb-4">
                          <div className="text-center text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm">UPI QR Code</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          Scan the QR code or use the UPI ID below
                        </p>
                        <p className="font-mono font-semibold text-lg">papercuppro@upi</p>
                        <p className="text-2xl font-bold mt-4">₹{total.toFixed(2)}</p>
                      </div>

                      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-sm text-warning">
                          <strong>Note:</strong> After completing the payment, click "Place Order"
                          below. Our team will verify your payment and confirm the order within 24
                          hours.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep((prev) => prev + 1)} disabled={!canProceed()}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {item.productName} x {item.quantity}
                      </span>
                      <span>₹{(item.pricePerPiece * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{items.length - 3} more items
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>CGST (9%)</span>
                    <span>₹{(gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>SGST (9%)</span>
                    <span>₹{(gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
