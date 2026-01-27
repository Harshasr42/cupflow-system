import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroFeatures = [
  "GST Registered & Compliant",
  "Bulk Discounts Available",
  "Pan-India Delivery",
  "Custom Printing Options",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-lavender rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-accent/50 border border-accent-foreground/10 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-sm font-medium text-foreground">Now shipping across India</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              Premium Paper Cups for{" "}
              <span className="relative">
                <span className="relative z-10">Every Business</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 4 150 4 298 10"
                    stroke="hsl(var(--lavender-dark))"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Quality paper cups for cafes, restaurants, events, and bulk orders. 
              GST-compliant invoicing, competitive pricing, and reliable delivery nationwide.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Link to="/shop">
                <Button size="lg" className="btn-scale rounded-xl text-base px-8 gap-2 w-full sm:w-auto">
                  Order Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="btn-scale rounded-xl text-base px-8 w-full sm:w-auto">
                  Get Bulk Quote
                </Button>
              </Link>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0"
            >
              {heroFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Bento Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Large Card */}
              <div className="col-span-2 bento-item h-48 flex items-center justify-center bg-gradient-to-br from-accent to-secondary">
                <div className="text-center">
                  <div className="text-6xl mb-2">☕</div>
                  <p className="font-semibold text-foreground">Hot Beverage Cups</p>
                </div>
              </div>
              
              {/* Small Cards */}
              <div className="bento-item h-32 flex items-center justify-center bg-gradient-to-br from-lavender to-accent">
                <div className="text-center">
                  <div className="text-4xl mb-1">🥤</div>
                  <p className="text-sm font-medium text-foreground">Cold Cups</p>
                </div>
              </div>
              
              <div className="bento-item h-32 flex items-center justify-center bg-gradient-to-br from-secondary to-lavender">
                <div className="text-center">
                  <div className="text-4xl mb-1">🎨</div>
                  <p className="text-sm font-medium text-foreground">Custom Print</p>
                </div>
              </div>
              
              {/* Stats Card */}
              <div className="col-span-2 bento-item py-4 bg-primary text-primary-foreground">
                <div className="grid grid-cols-3 divide-x divide-primary-foreground/20">
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-xs text-primary-foreground/70">Orders Delivered</div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-xs text-primary-foreground/70">Happy Clients</div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold">10M+</div>
                    <div className="text-xs text-primary-foreground/70">Cups Produced</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-success text-success-foreground px-4 py-2 rounded-xl shadow-lg text-sm font-medium"
            >
              ✓ ISO Certified
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
