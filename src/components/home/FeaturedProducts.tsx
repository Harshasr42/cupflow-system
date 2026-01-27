import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with Supabase data
const products = [
  {
    id: "1",
    name: "Classic Hot Cup",
    category: "Hot Cups",
    size: "250ml",
    price: 3.5,
    originalPrice: 4.0,
    image: "☕",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Cold Beverage Cup",
    category: "Cold Cups",
    size: "350ml",
    price: 4.0,
    originalPrice: null,
    image: "🥤",
    badge: null,
  },
  {
    id: "3",
    name: "Ripple Wall Cup",
    category: "Ripple Cups",
    size: "300ml",
    price: 5.5,
    originalPrice: 6.0,
    image: "🔥",
    badge: "Popular",
  },
  {
    id: "4",
    name: "Custom Print Cup",
    category: "Custom",
    size: "200ml",
    price: 6.0,
    originalPrice: null,
    image: "🎨",
    badge: "New",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Our Products
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Featured Paper Cups
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our most popular paper cups. Quality materials, competitive pricing, 
            and bulk discounts available for all orders.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="group"
            >
              <div className="card-elevated rounded-2xl overflow-hidden">
                {/* Image Area */}
                <div className="relative h-48 bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                    {product.image}
                  </span>
                  
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-lg">
                      {product.badge}
                    </span>
                  )}
                  
                  {/* Quick Add Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-semibold text-foreground mt-1 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {product.size}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-foreground">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">/pc</span>
                    </div>
                    
                    <Link to={`/shop/${product.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                        View
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/shop">
            <Button variant="outline" size="lg" className="btn-scale rounded-xl gap-2">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
