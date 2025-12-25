"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, TrendingUp, Clock, Users, Zap } from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  result: string;
  metrics: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
  imageUrl: string;
  templateUsed: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "1",
    title: "Scaling FinTech UI in 4 Weeks",
    company: "PayFlow",
    industry: "Financial Technology",
    challenge:
      "PayFlow needed a production-ready dashboard for their payment processing platform. Building from scratch would take 3-4 months, delaying their Series A launch.",
    solution:
      "They purchased our Analytics Dashboard template and customized it for their payment data. The template's architecture handled their scale requirements out of the box.",
    result:
      "Launched in 4 weeks instead of 4 months. Saved $120K in development costs. Successfully raised Series A with a polished product.",
    metrics: [
      { label: "Time Saved", value: "3 months", icon: <Clock className="w-5 h-5" /> },
      { label: "Cost Saved", value: "$120K", icon: <TrendingUp className="w-5 h-5" /> },
      { label: "Users", value: "50K+", icon: <Users className="w-5 h-5" /> },
      { label: "Performance", value: "99.9%", icon: <Zap className="w-5 h-5" /> },
    ],
    imageUrl: "/images/case-studies/payflow.jpg",
    templateUsed: "Analytics Dashboard",
  },
  {
    id: "2",
    title: "E-commerce MVP in 2 Weeks",
    company: "StyleHub",
    industry: "E-commerce",
    challenge:
      "StyleHub needed to validate their fashion marketplace concept quickly. They couldn't afford a 6-month custom development cycle.",
    solution:
      "Used our E-commerce template as the foundation. Customized the design to match their brand and integrated their payment and inventory systems.",
    result:
      "Launched MVP in 2 weeks. Generated $50K in first month. Proved product-market fit before investing in custom development.",
    metrics: [
      { label: "Launch Time", value: "2 weeks", icon: <Clock className="w-5 h-5" /> },
      { label: "First Month Revenue", value: "$50K", icon: <TrendingUp className="w-5 h-5" /> },
      { label: "Conversion Rate", value: "3.2%", icon: <Users className="w-5 h-5" /> },
      { label: "Uptime", value: "99.8%", icon: <Zap className="w-5 h-5" /> },
    ],
    imageUrl: "/images/case-studies/stylehub.jpg",
    templateUsed: "E-commerce Platform",
  },
  {
    id: "3",
    title: "SaaS Dashboard for 10K Users",
    company: "DataViz Pro",
    industry: "Business Intelligence",
    challenge:
      "DataViz Pro needed a scalable dashboard that could handle 10K+ concurrent users. Their previous solution couldn't handle the load.",
    solution:
      "Implemented our SaaS Dashboard template with built-in performance optimizations. The template's architecture was designed for scale from day one.",
    result:
      "Handled 10K concurrent users without issues. Reduced server costs by 40%. Improved user satisfaction scores by 35%.",
    metrics: [
      { label: "Concurrent Users", value: "10K+", icon: <Users className="w-5 h-5" /> },
      { label: "Cost Reduction", value: "40%", icon: <TrendingUp className="w-5 h-5" /> },
      { label: "Satisfaction", value: "+35%", icon: <Zap className="w-5 h-5" /> },
      { label: "Response Time", value: "<200ms", icon: <Clock className="w-5 h-5" /> },
    ],
    imageUrl: "/images/case-studies/dataviz.jpg",
    templateUsed: "Analytics Dashboard",
  },
];

export default function CaseStudiesClient() {
  return (
    <div className="min-h-screen bg-azone-black pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-[1.15] tracking-tight">
            <span className="text-white">Case</span>
            <span className="text-azone-purple ml-3">Studies</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real-world implementations. Production deployments. Proven results.
            <br />
            <span className="text-gray-500 text-base mt-1 block">
              How funded startups accelerate their product development with Azone templates.
            </span>
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-24">
          {caseStudies.map((study, index) => (
            <CaseStudyCard key={study.id} study={study} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CaseStudyCardProps {
  study: CaseStudy;
  index: number;
}

function CaseStudyCard({ study, index }: CaseStudyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Image Section */}
        <div className="relative h-64 lg:h-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800/40 to-gray-800/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-gray-700/30">
              <TrendingUp className="w-16 h-16 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12">
          <div className="mb-6">
            <span className="inline-block text-xs font-medium uppercase tracking-wider mb-3 px-3 py-1.5 rounded-md border text-azone-purple bg-azone-purple/10 border-azone-purple/30">
              {study.industry}
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-2">
              {study.title}
            </h2>
            <p className="text-lg text-gray-400 mb-1">{study.company}</p>
            <p className="text-sm text-gray-500">
              Template: <span className="text-azone-purple">{study.templateUsed}</span>
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Challenge</h3>
              <p className="text-gray-400 leading-relaxed">{study.challenge}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Solution</h3>
              <p className="text-gray-400 leading-relaxed">{study.solution}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Result</h3>
              <p className="text-gray-400 leading-relaxed">{study.result}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {study.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                  {metric.icon}
                  <span className="text-xs font-medium">{metric.label}</span>
                </div>
                <div className="text-xl font-bold text-white">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

