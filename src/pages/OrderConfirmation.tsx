import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user?.id)
      .single();

    if (data) {
      setOrder(data);
    }
  };

  if (!order) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p>Loading order details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-12 w-12 text-success" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll start processing it right away.
          </p>
        </motion.div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-mono font-semibold text-lg">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-lg">₹{order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-lg">What's Next?</h3>
          
          <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Confirmation Email</p>
              <p className="text-sm text-muted-foreground">
                We've sent an order confirmation to your email address.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Order Processing</p>
              <p className="text-sm text-muted-foreground">
                Our team will verify your payment and start preparing your order within 24 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Shipping Updates</p>
              <p className="text-sm text-muted-foreground">
                You'll receive tracking information once your order ships.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link to="/orders">
            <Button>View My Orders</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
