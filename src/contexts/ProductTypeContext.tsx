import { createContext, useContext, useState, ReactNode } from "react";

export type ProductType = "paper_cups" | "tissues" | "paper_plates";

interface ProductTypeConfig {
  label: string;
  emoji: string;
  description: string;
  heroTitle: string;
  accentHue: number;
  bgGradient: string;
}

export const PRODUCT_TYPE_CONFIG: Record<ProductType, ProductTypeConfig> = {
  paper_cups: {
    label: "Paper Cups",
    emoji: "☕",
    description: "Premium quality paper cups for all your beverage needs",
    heroTitle: "Premium Paper Cups",
    accentHue: 260, // lavender
    bgGradient: "from-violet-50 via-indigo-50 to-white",
  },
  tissues: {
    label: "Tissues",
    emoji: "🧻",
    description: "Soft & absorbent tissue papers for every occasion",
    heroTitle: "Soft Tissue Papers",
    accentHue: 150, // mint green
    bgGradient: "from-emerald-50 via-teal-50 to-white",
  },
  paper_plates: {
    label: "Paper Plates",
    emoji: "🍽️",
    description: "Sturdy eco-friendly paper plates for events & dining",
    heroTitle: "Eco-Friendly Paper Plates",
    accentHue: 30, // warm amber
    bgGradient: "from-amber-50 via-orange-50 to-white",
  },
};

interface ProductTypeContextType {
  activeType: ProductType;
  setActiveType: (type: ProductType) => void;
  config: ProductTypeConfig;
}

const ProductTypeContext = createContext<ProductTypeContextType | undefined>(undefined);

export function ProductTypeProvider({ children }: { children: ReactNode }) {
  const [activeType, setActiveType] = useState<ProductType>("paper_cups");

  return (
    <ProductTypeContext.Provider
      value={{
        activeType,
        setActiveType,
        config: PRODUCT_TYPE_CONFIG[activeType],
      }}
    >
      {children}
    </ProductTypeContext.Provider>
  );
}

export function useProductType() {
  const context = useContext(ProductTypeContext);
  if (!context) {
    throw new Error("useProductType must be used within a ProductTypeProvider");
  }
  return context;
}
