"use client";

import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Founder & CEO",
    company: "TechFlow",
    content: "Azone templates saved us months of development time. The code quality is production-ready, and the documentation is excellent. We shipped our MVP in 3 weeks instead of 3 months.",
    rating: 5,
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    role: "Senior Engineer",
    company: "ScaleUp Inc",
    content: "Best investment we made. The templates are well-structured, follow best practices, and are easy to customize. Our team can focus on building features instead of setting up infrastructure.",
    rating: 5,
  },
  {
    id: "3",
    name: "Emily Watson",
    role: "Product Lead",
    company: "StartupXYZ",
    content: "The templates are exactly what we needed. Clean code, modern design, and everything works out of the box. Highly recommend for any serious startup.",
    rating: 5,
  },
  {
    id: "4",
    name: "David Kim",
    role: "CTO",
    company: "InnovateLab",
    content: "Enterprise-grade quality at startup-friendly prices. The templates are battle-tested and production-ready. We've used them for multiple projects.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-azone-black to-gray-950">
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
            Trusted by <span className="text-azone-purple">Builders</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See what founders and engineers are saying about Azone templates
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-azone-purple/50 transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-azone-purple to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

