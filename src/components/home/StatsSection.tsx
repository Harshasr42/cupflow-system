import { motion } from "framer-motion";
import { Package, Users, Factory, MapPin } from "lucide-react";

const stats = [
  {
    icon: Package,
    value: "50,000+",
    label: "Orders Delivered",
    description: "Successfully fulfilled orders",
  },
  {
    icon: Users,
    value: "500+",
    label: "Happy Clients",
    description: "Businesses trust us daily",
  },
  {
    icon: Factory,
    value: "10M+",
    label: "Cups Produced",
    description: "Quality cups manufactured",
  },
  {
    icon: MapPin,
    value: "28",
    label: "States Covered",
    description: "Pan-India delivery network",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Numbers That Speak
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            Our commitment to quality and service has helped us build lasting relationships 
            with businesses across India.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mb-4">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-primary-foreground/60">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
