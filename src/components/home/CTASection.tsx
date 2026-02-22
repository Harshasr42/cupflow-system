import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-hero-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-20 w-64 h-64 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-lavender rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-accent/50 text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Ready to Order?
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Get Started with Your First Order Today
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 500+ businesses who trust RRR Cups for their paper cups, tissues, and plate needs. 
              Bulk discounts, GST invoices, and fast delivery guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg" className="btn-scale rounded-xl text-base px-8 gap-2 w-full sm:w-auto">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <a href="tel:+919876543210">
                <Button size="lg" variant="outline" className="btn-scale rounded-xl text-base px-8 gap-2 w-full sm:w-auto">
                  <Phone className="h-4 w-4" />
                  Call for Bulk Quote
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>No minimum order</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Free sample available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>GST invoice included</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
