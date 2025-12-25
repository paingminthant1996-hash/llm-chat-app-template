"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Eye, 
  CalendarDays, 
  Code2, 
  GitBranch, 
  Database, 
  Server, 
  LayoutDashboard, 
  Globe, 
  CreditCard, 
  Zap, 
  Figma, 
  Palette, 
  Code, 
  Layers, 
  BarChart, 
  Shield, 
  MessageSquare, 
  ShoppingCart, 
  Rocket, 
  Briefcase, 
  Bitcoin, 
  DollarSign,
  Star
} from "lucide-react";

interface TemplateCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  techStack: string[];
  imageUrl?: string;
  slug: string;
  updatedAt?: string;
  featured?: boolean;
  index?: number;
}

// Comprehensive tech stack icon mapping - Control Panel Size
const getTechIcon = (tech: string, size: 'default' | 'small' = 'default') => {
  const techLower = tech.toLowerCase();
  const iconSize = size === 'small' ? "w-3 h-3" : "w-4 h-4";
  
  // Framework & Libraries
  if (techLower.includes('next.js') || techLower.includes('nextjs')) return <Code2 className={iconSize} />;
  if (techLower.includes('react')) return <Zap className={iconSize} />;
  if (techLower.includes('vue')) return <Zap className={iconSize} />;
  if (techLower.includes('angular')) return <Code2 className={iconSize} />;
  
  // Styling
  if (techLower.includes('tailwind')) return <Palette className={iconSize} />;
  if (techLower.includes('css') && !techLower.includes('tailwind')) return <Palette className={iconSize} />;
  
  // Database & Backend
  if (techLower.includes('supabase')) return <Database className={iconSize} />;
  if (techLower.includes('firebase')) return <Server className={iconSize} />;
  if (techLower.includes('postgres') || techLower.includes('postgresql')) return <Database className={iconSize} />;
  if (techLower.includes('mongodb')) return <Database className={iconSize} />;
  if (techLower.includes('database')) return <Database className={iconSize} />;
  
  // Services & APIs
  if (techLower.includes('stripe')) return <CreditCard className={iconSize} />;
  if (techLower.includes('graphql')) return <GitBranch className={iconSize} />;
  if (techLower.includes('aws')) return <Globe className={iconSize} />;
  if (techLower.includes('coingecko') || techLower.includes('crypto')) return <Bitcoin className={iconSize} />;
  
  // Design & Tools
  if (techLower.includes('figma')) return <Figma className={iconSize} />;
  
  // Animation & UI
  if (techLower.includes('framer') || techLower.includes('motion')) return <Layers className={iconSize} />;
  if (techLower.includes('animation')) return <Zap className={iconSize} />;
  
  // Charts & Analytics
  if (techLower.includes('recharts') || techLower.includes('chart')) return <BarChart className={iconSize} />;
  
  // State Management
  if (techLower.includes('redux') || techLower.includes('zustand')) return <Layers className={iconSize} />;
  
  // CMS
  if (techLower.includes('sanity') || techLower.includes('cms')) return <MessageSquare className={iconSize} />;
  
  // Infrastructure
  if (techLower.includes('docker') || techLower.includes('kubernetes')) return <Shield className={iconSize} />;
  if (techLower.includes('node')) return <Server className={iconSize} />;
  
  // WebSocket & Real-time
  if (techLower.includes('websocket') || techLower.includes('socket')) return <Zap className={iconSize} />;
  
  // 3D & Graphics
  if (techLower.includes('three.js') || techLower.includes('threejs')) return <Layers className={iconSize} />;
  
  // TypeScript
  if (techLower.includes('typescript') || techLower.includes('ts')) return <Code className={iconSize} />;
  
  // Default
  return <Code2 className={iconSize} />;
};

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "Recently updated";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Updated today";
    if (diffDays === 1) return "Updated yesterday";
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return "Recently updated";
  }
};

export default function TemplateCard({
  title,
  category,
  price,
  techStack,
  imageUrl,
  slug,
  updatedAt,
  featured = false,
  index = 0,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative rounded-3xl overflow-visible transition-all duration-250 ${
        featured 
          ? 'md:col-span-2 lg:col-span-2 scale-[1.02] md:scale-100' 
          : ''
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 left-6 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-azone-purple/90 backdrop-blur-md border border-azone-purple/50 rounded-full shadow-lg shadow-azone-purple/30">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Featured</span>
        </div>
      )}

      {/* Card Background - Darker Neutral (Almost Black) */}
      <div className={`absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950 to-gray-900 backdrop-blur-2xl border rounded-3xl transition-all duration-250 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-2xl ${
        featured 
          ? 'border-gray-800/40 shadow-black/50 group-hover:border-gray-700/60' 
          : 'border-gray-800/40 shadow-black/50 group-hover:border-gray-700/60'
      }`}></div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Image Section */}
        <div className={`relative overflow-hidden rounded-t-3xl ${
          featured ? 'h-80 md:h-96' : 'h-64'
        }`}>
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800/30 via-gray-800/20 to-transparent">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-800/40 to-gray-800/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-gray-700/30">
                <svg
                  className="w-16 h-16 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}
          
          {/* Price Badge - Purple only for featured, neutral for others */}
          <motion.div
            className={`absolute top-4 right-4 backdrop-blur-md border text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1 ${
              featured 
                ? 'bg-azone-purple/90 border-azone-purple/50 shadow-lg shadow-azone-purple/30' 
                : 'bg-gray-900/95 border-gray-800/50'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Sparkles className={`w-4 h-4 ${featured ? 'text-white' : 'text-gray-400'}`} />
            ${Math.round(price)}
          </motion.div>
        </div>

        {/* Content Section */}
        <div className={featured ? 'p-8' : 'p-6'}>
          <div className={featured ? 'mb-6' : 'mb-5'}>
            <span className="inline-block text-xs font-medium uppercase tracking-wider mb-3 px-3 py-1.5 rounded-md border text-gray-400 bg-gray-900/40 border-gray-800/30">
              {category}
            </span>
            <h3 className={`font-semibold text-white mt-4 mb-4 leading-relaxed ${
              featured ? 'text-3xl' : 'text-2xl'
            }`}>
              {title}
            </h3>
          </div>

          {/* Tech Stack Tags with Enhanced Styling */}
          <div className="flex flex-wrap gap-2 mb-6">
            {techStack.slice(0, 4).map((tech, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.03,
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 text-xs font-medium bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-full border border-gray-700/40 hover:border-gray-600/60 hover:text-gray-200 transition-all duration-200 cursor-default"
              >
                {tech}
              </motion.span>
            ))}
            {techStack.length > 4 && (
              <span className="px-3 py-1.5 text-xs font-medium bg-gray-800/50 backdrop-blur-sm text-gray-500 rounded-full border border-gray-700/40">
                +{techStack.length - 4}
              </span>
            )}
          </div>

          {/* View Details Button - CTA with Purple */}
          <Link href={`/templates/${slug}`}>
            <motion.button
              className="w-full py-3.5 px-4 bg-azone-purple text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50 flex items-center justify-center gap-2 group/btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.05
              }}
            >
              View Details
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300 ease-out" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Sliding Side Panel - Developer-Core Style */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 35,
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="absolute top-0 right-0 h-full w-80 z-50 pointer-events-auto"
            style={{ right: '-320px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Control Panel Background - Unified Dark Tone */}
            <div className="h-full w-full bg-gray-950 border-l border-gray-800/20 rounded-r-xl shadow-2xl p-4 flex flex-col justify-between">
              {/* Panel Header - Control Panel Style */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-gray-800/20">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest font-mono">
                      Control
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-600 font-mono">
                    {slug}
                  </div>
                </div>

                {/* Tech Stack - Control Panel Grid */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2.5">
                    <Code2 className="w-2.5 h-2.5 text-gray-600" />
                    <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider font-mono">
                      Stack
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {techStack.slice(0, 6).map((tech, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: index * 0.02,
                          duration: 0.15,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-800/40 hover:bg-gray-800/60 rounded transition-all duration-200 group/tech cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <div className="text-gray-600 group-hover/tech:text-gray-400 transition-colors duration-200">
                          {getTechIcon(tech, 'small')}
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 truncate font-mono group-hover/tech:text-gray-400">
                          {tech}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  {techStack.length > 6 && (
                    <div className="mt-1.5 text-[9px] text-gray-600 text-center font-mono">
                      +{techStack.length - 6}
                    </div>
                  )}
                </div>

                {/* Last Updated - Control Panel Style */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    <CalendarDays className="w-2.5 h-2.5 text-gray-600" />
                    <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider font-mono">
                      Updated
                    </span>
                  </div>
                  <div className="px-2 py-1 bg-gray-800/40 rounded">
                    <span className="text-[10px] font-medium text-gray-500 font-mono">
                      {formatDate(updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Control Panel Style */}
              <div className="space-y-2">
                <Link href={`/templates/${slug}`}>
                  <motion.button
                    className="w-full py-2 px-3 bg-azone-purple text-white rounded font-semibold text-[11px] transition-all duration-250 hover:bg-azone-purple/90 flex items-center justify-center gap-1.5 group/quick"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: 0.03
                    }}
                  >
                    <Eye className="w-3 h-3" />
                    View
                    <ArrowRight className="w-3 h-3 group-hover/quick:translate-x-0.5 transition-transform duration-200 ease-out" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

