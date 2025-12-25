"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code2, ShoppingCart, BarChart, Shield, Rocket, Palette, Database } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const categories: Category[] = [
  {
    id: "1",
    name: "SaaS Dashboards",
    slug: "saas",
    icon: <BarChart className="w-6 h-6" />,
    description: "Complete admin panels and analytics dashboards",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    name: "E-commerce",
    slug: "ecommerce",
    icon: <ShoppingCart className="w-6 h-6" />,
    description: "Online stores and marketplace templates",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "3",
    name: "Landing Pages",
    slug: "landing",
    icon: <Rocket className="w-6 h-6" />,
    description: "High-converting landing page templates",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "4",
    name: "Authentication",
    slug: "auth",
    icon: <Shield className="w-6 h-6" />,
    description: "Login, signup, and auth flow templates",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "5",
    name: "UI Components",
    slug: "components",
    icon: <Palette className="w-6 h-6" />,
    description: "Reusable component libraries",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "6",
    name: "Full Stack",
    slug: "fullstack",
    icon: <Database className="w-6 h-6" />,
    description: "Complete full-stack applications",
    color: "from-indigo-500 to-purple-500",
  },
];

export default function CategoryLinks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-azone-black">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Browse by <span className="text-azone-purple">Category</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Find the perfect template for your project
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={`/templates?category=${category.slug}`}
                className="block h-full"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-azone-purple/50 transition-all duration-300 h-full group">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-azone-purple transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {category.description}
                  </p>

                  {/* Link */}
                  <div className="flex items-center gap-2 text-azone-purple text-sm font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

