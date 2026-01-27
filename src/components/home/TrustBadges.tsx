import { motion } from "framer-motion";
import { Shield, Award, Truck, CreditCard, Leaf, CheckCircle } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "GST Registered",
    description: "Compliant invoices with proper tax breakup",
  },
  {
    icon: Award,
    title: "Quality Certified",
    description: "ISO 9001:2015 certified manufacturing",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    description: "Reliable shipping across all states",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "UPI, Cards & Bank Transfer accepted",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Sustainable & recyclable materials",
  },
  {
    icon: CheckCircle,
    title: "Bulk Discounts",
    description: "Better rates for larger orders",
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Why Choose PaperCup Pro?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by 500+ businesses across India for quality, reliability, and service.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <badge.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {badge.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
