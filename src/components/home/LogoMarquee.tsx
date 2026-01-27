import { motion } from "framer-motion";

// Mock client logos - will be replaced with actual logos
const clients = [
  { name: "Cafe Royale", logo: "☕" },
  { name: "Tea Time", logo: "🍵" },
  { name: "Quick Bites", logo: "🍔" },
  { name: "Fresh Juice", logo: "🧃" },
  { name: "Party Supplies", logo: "🎉" },
  { name: "Hotel Grand", logo: "🏨" },
  { name: "Catering Co", logo: "🍽️" },
  { name: "Office Cafe", logo: "🏢" },
];

export function LogoMarquee() {
  // Duplicate the array for seamless looping
  const duplicatedClients = [...clients, ...clients];

  return (
    <section className="py-12 bg-background overflow-hidden border-y border-border">
      <div className="container mx-auto px-4 mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground uppercase tracking-wider"
        >
          Trusted by leading businesses across India
        </motion.p>
      </div>

      <div className="relative">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Marquee */}
        <div className="flex animate-marquee">
          {duplicatedClients.map((client, index) => (
            <div
              key={`${client.name}-${index}`}
              className="flex-shrink-0 mx-8 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-3xl">{client.logo}</span>
              <span className="text-lg font-medium text-muted-foreground whitespace-nowrap">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
