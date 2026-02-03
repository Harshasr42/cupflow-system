import { motion } from "framer-motion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqCategories = [
  {
    title: "Ordering & Pricing",
    questions: [
      {
        q: "What is the minimum order quantity (MOQ)?",
        a: "Our standard minimum order quantity is 100 pieces per product variant. For custom printed cups, the MOQ may vary depending on the design complexity. Please contact us for specific requirements.",
      },
      {
        q: "How does volume pricing work?",
        a: "We offer tiered pricing based on order quantity. The more you order, the lower the price per piece. You can see the pricing slabs on each product page. For example, ordering 1000+ pieces typically gives you a 10-15% discount compared to smaller quantities.",
      },
      {
        q: "Do you offer GST invoices?",
        a: "Yes, we provide proper GST invoices for all orders. During checkout, you can choose to add your GSTIN and business name to receive a GST-compliant invoice. We are a registered GST dealer.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We currently accept UPI payments and direct bank transfers. For regular customers, we also offer credit terms based on order history. Payment gateway integration is coming soon.",
      },
    ],
  },
  {
    title: "Products & Customization",
    questions: [
      {
        q: "What sizes of paper cups do you offer?",
        a: "We offer a wide range of sizes from 65ml (2oz) espresso cups to 450ml (16oz) large cups. Our most popular sizes are 150ml, 210ml, and 350ml cups suitable for hot and cold beverages.",
      },
      {
        q: "Can I get custom printed cups with my logo?",
        a: "Absolutely! We offer custom printing on all our cup sizes. You can upload your design during checkout, and our team will create a proof for your approval before production. Custom printing adds 3-5 days to the delivery timeline.",
      },
      {
        q: "What materials are used in your cups?",
        a: "Our cups are made from food-grade paper with a PE (polyethylene) coating for liquid resistance. We also offer eco-friendly options with PLA coating that are compostable. All materials are FSSAI approved.",
      },
      {
        q: "Are your cups microwave safe?",
        a: "Our standard PE-coated cups are not recommended for microwave use. However, our hot cups are designed to withstand beverages up to 85°C. For microwave-safe options, please inquire about our specialized product line.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    questions: [
      {
        q: "What are your delivery timelines?",
        a: "Standard orders ship within 2-3 business days. Delivery typically takes 3-7 days depending on your location. Custom printed orders may take an additional 3-5 days for production.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free shipping on orders above ₹10,000. For orders below this amount, shipping charges are calculated based on weight and delivery location.",
      },
      {
        q: "Which areas do you deliver to?",
        a: "We deliver across India through our logistics partners. Metro cities typically receive orders within 3-4 days, while Tier 2 and Tier 3 cities may take 5-7 days.",
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your order is shipped, you will receive a tracking number via email and SMS. You can track your order status through our website or the courier partner's website.",
      },
    ],
  },
  {
    title: "Returns & Support",
    questions: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for manufacturing defects. Please note that custom printed items cannot be returned unless there's a defect. Contact us with photos of the issue for quick resolution.",
      },
      {
        q: "How do I report a quality issue?",
        a: "If you receive damaged or defective products, please email us at support@papercuppro.com with your order number and photos of the issue. We'll process a replacement or refund within 48 hours.",
      },
      {
        q: "Do you offer samples?",
        a: "Yes, we offer sample packs for businesses looking to evaluate our products. Sample packs are available at a nominal charge which is adjusted against your first bulk order.",
      },
      {
        q: "How can I become a dealer?",
        a: "We welcome partnership inquiries from distributors and dealers. Please contact our sales team at dealers@papercuppro.com with your business details and we'll get back to you within 24 hours.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-hero-gradient py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <HelpCircle className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our products, ordering process, and
              services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          {faqCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-6">{category.title}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.title}-${index}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle className="text-2xl">Still have questions?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/contact">
                  <Button>Contact Us</Button>
                </Link>
                <Button variant="outline" asChild>
                  <a href="tel:+917912345678">Call Now</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
