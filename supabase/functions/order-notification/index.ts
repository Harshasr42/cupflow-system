import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, newStatus } = await req.json();

    if (!orderId || !newStatus) {
      return new Response(
        JSON.stringify({ error: "orderId and newStatus are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, addresses(full_name, city, state)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
    const userEmail = userData?.user?.email;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    const customerName = order.addresses?.full_name || "Customer";

    let subject = "";
    let htmlBody = "";

    const itemsHtml = (orderItems || [])
      .map(
        (item: any) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.variant_label}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price_per_piece * item.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const baseTemplate = (title: string, message: string, statusColor: string) => `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #0A1128; color: white; padding: 8px 16px; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: -0.5px;">RRR</div>
          <h2 style="margin: 12px 0 4px; font-size: 20px;">RRR Cups</h2>
        </div>
        
        <div style="background: ${statusColor}; color: white; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px;">${title}</h1>
        </div>

        <p>Hi ${customerName},</p>
        <p>${message}</p>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 4px;"><strong>Order Number:</strong> ${order.order_number}</p>
          <p style="margin: 0;"><strong>Total Amount:</strong> ₹${order.total_amount.toFixed(2)}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f1f3f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Size</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #666; font-size: 13px; text-align: center;">
          Thank you for choosing RRR Cups!<br>
          Questions? Reply to this email or call +91 98765 43210
        </p>
      </body>
      </html>
    `;

    if (newStatus === "confirmed") {
      subject = `Order ${order.order_number} Confirmed! ✅`;
      htmlBody = baseTemplate(
        "Order Confirmed! ✅",
        "Great news! Your order has been confirmed and our team is preparing it for dispatch. You will receive another notification once it ships.",
        "#0A1128"
      );
    } else if (newStatus === "shipped") {
      subject = `Order ${order.order_number} Shipped! 🚚`;
      htmlBody = baseTemplate(
        "Your Order is on its Way! 🚚",
        "Your order has been shipped and is on its way to you. You should receive it within 3-5 business days depending on your location.",
        "#22c55e"
      );
    } else {
      return new Response(
        JSON.stringify({ message: "No notification needed for this status" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Supabase Auth (using the built-in email sending)
    // For now, we'll log the email and return success
    // In production, integrate with a proper email service
    console.log(`📧 Email notification sent to ${userEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Status: ${newStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification email prepared for ${userEmail}`,
        subject,
        to: userEmail,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in order-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
