import { motion } from "framer-motion";
import { useProductType, PRODUCT_TYPE_CONFIG, ProductType } from "@/contexts/ProductTypeContext";

const types: ProductType[] = ["paper_cups", "tissues", "paper_plates"];

export function ProductTypeToggle() {
  const { activeType, setActiveType } = useProductType();

  return (
    <div className="flex justify-center">
      <div className="inline-flex bg-secondary/80 backdrop-blur-sm rounded-2xl p-1.5 gap-1">
        {types.map((type) => {
          const config = PRODUCT_TYPE_CONFIG[type];
          const isActive = activeType === type;

          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="product-type-bg"
                  className="absolute inset-0 bg-primary rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span>{config.emoji}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
