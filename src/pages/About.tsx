import { motion } from "framer-motion";
import { Award, Users, Factory, Leaf, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

const milestones = [
  { year: "2010", event: "Founded in Gujarat with a small manufacturing unit" },
  { year: "2015", event: "Expanded production capacity to 1 million cups/month" },
  { year: "2018", event: "Achieved ISO 9001:2015 certification" },
  { year: "2020", event: "Launched eco-friendly product line" },
  { year: "2023", event: "Serving 500+ businesses across India" },
];

const certifications = [
  { name: "ISO 9001:2015", description: "Quality Management System" },
  { name: "FSSAI", description: "Food Safety and Standards Authority of India" },
  { name: "FSC Certified", description: "Forest Stewardship Council" },
  { name: "BIS", description: "Bureau of Indian Standards" },
];

const stats = [
  { number: "500+", label: "Business Clients" },
  { number: "10M+", label: "Cups Produced Monthly" },
  { number: "15+", label: "Years of Experience" },
  { number: "50+", label: "Team Members" },
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-hero-gradient py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">About RRR Cups</h1>
            <p className="text-xl text-muted-foreground">
              India's trusted manufacturer of premium paper cups, tissues, and paper plates. We combine 
              quality craftsmanship with sustainable practices to deliver the best disposable products for
              your business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-primary">{stat.number}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  RRR Cups was founded in 2010 with a simple mission: to provide
                  high-quality, affordable paper cups, tissues, and paper plates to businesses across India. What started as
                  a small manufacturing unit in Gujarat has grown into one of the region's most
                  trusted disposable product suppliers.
                </p>
                <p>
                  Our founder, having worked in the hospitality industry for over a decade,
                  understood the challenges businesses face in sourcing reliable disposable
                  products. This firsthand experience drove the creation of RRR Cups – a
                  company built on the principles of quality, reliability, and customer service.
                </p>
                <p>
                  Today, we serve over 500 businesses including cafes, restaurants, corporate
                  offices, and event management companies. Our state-of-the-art manufacturing
                  facility produces millions of products each month, all meeting the highest quality
                  and safety standards.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="p-6">
                <Factory className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Modern Facility</h3>
                <p className="text-sm text-muted-foreground">
                  State-of-the-art manufacturing with latest technology
                </p>
              </Card>
              <Card className="p-6">
                <Leaf className="h-10 w-10 text-success mb-4" />
                <h3 className="font-semibold mb-2">Eco-Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  Sustainable materials and responsible manufacturing
                </p>
              </Card>
              <Card className="p-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Expert Team</h3>
                <p className="text-sm text-muted-foreground">
                  Dedicated professionals with industry expertise
                </p>
              </Card>
              <Card className="p-6">
                <Award className="h-10 w-10 text-warning mb-4" />
                <h3 className="font-semibold mb-2">Certified Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple certifications ensuring top standards
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="max-w-2xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 mb-8"
              >
                <div className="flex-shrink-0 w-20">
                  <span className="font-bold text-primary">{milestone.year}</span>
                </div>
                <div className="flex-1 pb-8 border-l-2 border-primary/20 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                  <p>{milestone.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Certifications</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our commitment to quality is validated by certifications from leading regulatory
            bodies
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center h-full">
                  <CardContent className="p-0">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
