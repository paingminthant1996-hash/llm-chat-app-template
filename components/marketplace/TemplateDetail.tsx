"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  ShoppingCart,
  ArrowRight,
  Code2,
  GitBranch,
  Database,
  Server,
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
  Rocket,
  Eye,
  Folder,
  File,
  ExternalLink,
  Copy,
  CheckCircle,
  Download,
  AlertCircle,
  X,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon
} from "lucide-react";
import { Template } from "@/lib/types";
import { supabase } from "@/lib/db/supabase";
import { getTemplateDetail, requestDownloadSource } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/auth";
import { hasUserPurchasedTemplate, getDownloadUrl } from "@/lib/auth/purchases";
import { getAllTemplates } from "@/lib/db/queries";
import Link from "next/link";

interface TemplateDetailProps {
  template: Template;
}

// Tech icon mapping
const getTechIcon = (tech: string) => {
  const techLower = tech.toLowerCase();
  const iconSize = "w-5 h-5";

  if (techLower.includes('next.js') || techLower.includes('nextjs')) return <Code2 className={iconSize} />;
  if (techLower.includes('react')) return <Zap className={iconSize} />;
  if (techLower.includes('tailwind')) return <Palette className={iconSize} />;
  if (techLower.includes('supabase')) return <Database className={iconSize} />;
  if (techLower.includes('typescript') || techLower.includes('ts')) return <Code className={iconSize} />;
  if (techLower.includes('framer') || techLower.includes('motion')) return <Layers className={iconSize} />;
  if (techLower.includes('stripe')) return <CreditCard className={iconSize} />;
  if (techLower.includes('graphql')) return <GitBranch className={iconSize} />;
  if (techLower.includes('aws')) return <Globe className={iconSize} />;
  if (techLower.includes('figma')) return <Figma className={iconSize} />;
  if (techLower.includes('chart')) return <BarChart className={iconSize} />;
  if (techLower.includes('docker')) return <Shield className={iconSize} />;
  if (techLower.includes('node')) return <Server className={iconSize} />;

  return <Code2 className={iconSize} />;
};

// Generate folder structure tree (mock data for now)
const generateFolderStructure = (): TreeNode[] => {
  return [
    {
      name: "app",
      type: "folder",
      children: [
        { name: "layout.tsx", type: "file" as const },
        { name: "page.tsx", type: "file" as const },
        {
          name: "components",
          type: "folder" as const,
          children: [
            { name: "Header.tsx", type: "file" as const },
            { name: "Footer.tsx", type: "file" as const },
          ],
        },
      ],
    },
    {
      name: "components",
      type: "folder" as const,
      children: [
        { name: "ui", type: "folder" as const, children: [{ name: "Button.tsx", type: "file" as const }] },
        { name: "forms", type: "folder" as const, children: [{ name: "ContactForm.tsx", type: "file" as const }] },
      ],
    },
    { name: "lib", type: "folder" as const, children: [{ name: "utils.ts", type: "file" as const }] },
    { name: "public", type: "folder" as const, children: [{ name: "images", type: "folder" as const, children: [] }] },
    { name: "package.json", type: "file" as const },
    { name: "tsconfig.json", type: "file" as const },
    { name: "tailwind.config.ts", type: "file" as const },
  ];
};

interface TreeNode {
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
  path?: string; // Full path for files
}

// Sample code snippets
const codeSnippets: Record<string, string> = {
  "Button.tsx": `"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300",
          {
            "bg-azone-purple text-white hover:shadow-lg hover:shadow-azone-purple/50": variant === "primary",
            "bg-transparent border-2 border-gray-800 text-gray-300 hover:border-gray-700": variant === "secondary",
            "bg-transparent text-gray-400 hover:text-white": variant === "ghost",
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;`,
  "layout.tsx": `import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Azone.store - Production-Ready Templates",
  description: "Built for production. Designed for scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className="min-h-screen flex flex-col bg-azone-black">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}`,
};

// Helper to get full path for a file
const getFilePath = (node: TreeNode, parentPath = ""): string => {
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  if (node.type === "file") {
    return currentPath;
  }
  return currentPath;
};

interface FolderTreeProps {
  node: TreeNode;
  level?: number;
  onFileClick?: (filePath: string) => void;
  selectedFile?: string;
  parentPath?: string;
}

const FolderTree = ({ node, level = 0, onFileClick, selectedFile, parentPath = "" }: FolderTreeProps) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
  const filePath = getFilePath(node, parentPath);
  const isSelected = selectedFile === filePath && node.type === "file";

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded transition-colors ${node.type === "folder"
          ? "cursor-pointer hover:bg-gray-800/30"
          : `cursor-pointer hover:bg-gray-800/40 ${isSelected ? "bg-azone-purple/20 border-l-2 border-azone-purple" : ""
          }`
          }`}
        style={{ paddingLeft: `${level * 1.25}rem` }}
        onClick={() => {
          if (node.type === "folder") {
            setIsOpen(!isOpen);
          } else {
            onFileClick?.(filePath);
          }
        }}
      >
        {node.type === "folder" ? (
          <>
            <Folder className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-300">{node.name}</span>
          </>
        ) : (
          <>
            <File className={`w-3.5 h-3.5 ml-1 ${isSelected ? "text-azone-purple" : "text-gray-600"}`} />
            <span className={`text-sm ${isSelected ? "text-azone-purple font-medium" : "text-gray-400"}`}>
              {node.name}
            </span>
          </>
        )}
      </div>
      {node.type === "folder" && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FolderTree
              key={index}
              node={child}
              level={level + 1}
              onFileClick={onFileClick}
              selectedFile={selectedFile}
              parentPath={filePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Code Preview Component
const CodePreview = ({ filePath, code, onCopy }: { filePath: string; code: string | null; onCopy: () => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-gray-950/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <File className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300 font-mono">{filePath}</span>
        </div>
        {code && (
          <motion.button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Code Content */}
      <div className="p-0 bg-gray-950">
        {code ? (
          <div className="overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300 leading-relaxed m-0">
              <code className="block">
                {code.split("\n").map((line, index) => (
                  <div key={index} className="flex hover:bg-gray-900/50 transition-colors">
                    <span className="text-gray-600 mr-4 select-none w-10 text-right text-xs py-1">{index + 1}</span>
                    <span
                      className="flex-1 py-1 pr-4"
                      dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")
                          .replace(/(".*?")/g, '<span class="text-green-400">$1</span>')
                          .replace(/(\'[^\']*\')/g, '<span class="text-green-400">$1</span>')
                          .replace(/(\bimport\b|\bexport\b|\bdefault\b|\bconst\b|\blet\b|\bvar\b|\bfunction\b|\breturn\b|\bif\b|\belse\b|\binterface\b|\btype\b|\bextends\b|\bfrom\b|\bas\b)/g, '<span class="text-purple-400">$1</span>')
                          .replace(/(\btrue\b|\bfalse\b|\bnull\b|\bundefined\b)/g, '<span class="text-orange-400">$1</span>')
                          .replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>')
                          .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>')
                          .replace(/(\bclassName\b|\bhtmlFor\b|\bkey\b|\bwhileHover\b|\bwhileTap\b)/g, '<span class="text-blue-400">$1</span>')
                          .replace(/(\{[^}]*\})/g, '<span class="text-yellow-400">$1</span>'),
                      }}
                    />
                  </div>
                ))}
              </code>
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
              <Code2 className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Purchase to View Full Source</h3>
            <p className="text-sm text-gray-400 max-w-md mb-6">
              This file is part of the premium template. Purchase to access the complete source code and all files.
            </p>
            <motion.button
              className="px-6 py-3 bg-azone-purple text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4" />
              Purchase Now
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function TemplateDetail({ template }: TemplateDetailProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const folderStructure = generateFolderStructure();

  // Download functionality state
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [templateVersions, setTemplateVersions] = useState<any[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [relatedTemplates, setRelatedTemplates] = useState<Template[]>([]);

  // Fetch user and template details on mount
  useEffect(() => {
    const initDownload = async () => {
      try {
        // Get current user session
        const { user: currentUser } = await getSession();
        setUser(currentUser);

        // Fetch template detail with versions
        const templateDetail = await getTemplateDetail(template.slug);
        if (templateDetail) {
          const versions = templateDetail.template_versions || [];
          setTemplateVersions(versions);
          if (versions.length > 0) {
            setSelectedVersionId(versions[0].id);
          }
        }

        // Check if user has purchased this template
        if (currentUser) {
          const purchased = await hasUserPurchasedTemplate(currentUser.id, template.id);
          setHasAccess(purchased);
        }
      } catch (err) {
        console.error("Failed to initialize download:", err);
      } finally {
        setCheckingAccess(false);
      }
    };

    initDownload();

    // Load related templates
    const loadRelatedTemplates = async () => {
      try {
        const allTemplates = await getAllTemplates();
        // Get templates from same category, excluding current template
        const related = allTemplates
          .filter(t => t.id !== template.id && t.category === template.category)
          .slice(0, 4);
        // If not enough from same category, add featured templates
        if (related.length < 4) {
          const featured = allTemplates
            .filter(t => t.id !== template.id && t.featured && !related.find(r => r.id === t.id))
            .slice(0, 4 - related.length);
          setRelatedTemplates([...related, ...featured]);
        } else {
          setRelatedTemplates(related);
        }
      } catch (err) {
        console.error("Failed to load related templates:", err);
      }
    };
    loadRelatedTemplates();
  }, [template.slug, template.id, template.category]);

  // Download handler
  const handleDownload = async () => {
    if (!selectedVersionId) {
      setDownloadError("No version selected");
      return;
    }

    if (!user) {
      setDownloadError("Please sign in to download");
      router.push("/admin/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!hasAccess) {
      setDownloadError("You need to purchase this template first");
      return;
    }

    setDownloadLoading(true);
    setDownloadError(null);

    try {
      // Get download URL using new purchase utilities
      const { url, error: downloadError } = await getDownloadUrl(user.id, selectedVersionId);

      if (downloadError || !url) {
        throw new Error(downloadError || "Failed to get download URL");
      }

      // Open signed URL in new tab to trigger download
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      console.error("Download error:", err);
      setDownloadError(err?.message || "Download failed. Please ensure you have purchased this template.");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Get all images (main image + screenshots)
  const allImages = template.imageUrl
    ? [template.imageUrl, ...(template.screenshotUrls || [])]
    : template.screenshotUrls || [];

  // Social sharing functions
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${template.title} on Azone.store - ${template.shortDescription || template.description}`;

  const handleShare = async (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'copy':
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        }
        break;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cinematic entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className="min-h-screen bg-azone-black relative">
      {/* Floating Sticky CTA Button */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-24 right-6 z-50"
          >
            <motion.button
              className="px-6 py-3 bg-azone-purple text-white rounded-xl font-semibold shadow-lg shadow-azone-purple/50 flex items-center gap-2 backdrop-blur-xl border border-azone-purple/40"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.05,
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Get Started
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Header - Full-width Glassmorphic Container */}
      <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
        {/* Background Image */}
        {template.imageUrl ? (
          <Image
            src={template.imageUrl}
            alt={template.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        )}

        {/* Glassmorphic Overlay Container */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-gray-950/98 via-gray-950/85 to-gray-950/98 border-b border-gray-800/30">
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-4xl"
              >
                {/* Category Badge */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="inline-block text-xs font-medium uppercase tracking-wider mb-4 px-3 py-1.5 rounded-md border text-gray-400 bg-gray-900/40 border-gray-800/30"
                >
                  {template.category}
                </motion.span>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.15] tracking-tight"
                >
                  {template.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-lg text-gray-400 mb-8 max-w-2xl leading-relaxed"
                >
                  {template.description}
                </motion.p>

                {/* Dynamic Animated Tech Stack Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-wrap gap-3"
                >
                  {template.techStack.slice(0, 6).map((tech, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.7 + index * 0.1,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-950/90 backdrop-blur-xl border border-gray-800/60 rounded-xl text-white group/tech shadow-lg shadow-black/30"
                    >
                      <motion.div
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: index * 0.15,
                          ease: "easeInOut",
                        }}
                        className="text-gray-400 group-hover/tech:text-azone-purple transition-colors duration-200"
                      >
                        {getTechIcon(tech)}
                      </motion.div>
                      <span className="text-sm font-medium">{tech}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section - Two Column Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Image Gallery & Features */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-semibold text-white mb-6">Gallery</h2>

              {/* Main Image with Lightbox */}
              <div 
                className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-gray-950 border border-gray-800/50 cursor-pointer group"
                onClick={() => {
                  if (allImages.length > 0) {
                    setLightboxImage(allImages[selectedImage]);
                    setLightboxOpen(true);
                  }
                }}
              >
                {allImages.length > 0 ? (
                  <>
                    <Image
                      src={allImages[selectedImage]}
                      alt={`${template.title} - Screenshot ${selectedImage + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={selectedImage === 0}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-sm rounded-full p-3">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
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
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {allImages.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${selectedImage === index
                        ? "border-azone-purple shadow-lg shadow-azone-purple/30"
                        : "border-gray-800/50 hover:border-gray-700"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Production Features - Glassmorphic Cards */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-semibold text-white mb-6">Production Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-start gap-3 p-5 bg-gray-950/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl hover:border-gray-700/60 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-azone-purple/20 flex items-center justify-center group-hover:bg-azone-purple/30 transition-colors">
                      <Check className="w-4 h-4 text-azone-purple" />
                    </div>
                    <span className="text-gray-300 leading-relaxed">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Look - Folder Structure */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-semibold text-white mb-6">Quick Look</h2>
              <div className="bg-gray-950/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-800/50">
                  <Code2 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Project Structure</span>
                </div>
                <div className="space-y-1 font-mono text-xs max-h-[400px] overflow-y-auto">
                  {folderStructure.map((node, index) => (
                    <FolderTree
                      key={index}
                      node={node}
                      onFileClick={(filePath) => setSelectedFile(filePath)}
                      selectedFile={selectedFile || undefined}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Code Preview Section */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-semibold text-white mb-6">Code Preview</h2>
              <AnimatePresence mode="wait">
                {selectedFile ? (
                  <CodePreview
                    key={selectedFile}
                    filePath={selectedFile}
                    code={codeSnippets[selectedFile.split("/").pop() || ""] || null}
                    onCopy={() => { }}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-gray-950/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center"
                  >
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Code2 className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Click on a file in the project structure to preview its code
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Full Tech Stack */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-semibold text-white mb-6">Technology Stack</h2>
              <div className="flex flex-wrap gap-3">
                {template.techStack.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-950/80 backdrop-blur-xl border border-gray-800/50 rounded-xl text-white group/tech hover:border-gray-700/60 transition-all duration-300"
                  >
                    <div className="text-gray-400 group-hover/tech:text-azone-purple transition-colors">
                      {getTechIcon(tech)}
                    </div>
                    <span className="text-sm font-medium">{tech}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sticky Purchase Card */}
          <div className="lg:col-span-1">
            <motion.div
              variants={itemVariants}
              className="sticky top-24 space-y-6"
            >
              {/* Purchase Card - Glassmorphic */}
              <div className="bg-gray-950/90 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl shadow-black/50">
                {/* Price */}
                <div className="mb-8">
                  <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-azone-purple" />
                    Price
                  </div>
                  <div className="text-5xl font-semibold text-white mb-1">
                    ${Math.round(template.price)}
                  </div>
                  <p className="text-sm text-gray-500">One-time payment</p>
                </div>

                {/* Primary CTA - Purchase Now or Download */}
                {checkingAccess ? (
                  <div className="w-full py-4 px-6 bg-gray-800/50 text-gray-500 rounded-xl font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking access...</span>
                  </div>
                ) : hasAccess ? (
                  <>
                    {/* Download Button - User has purchased */}
                    <motion.button
                      onClick={handleDownload}
                      disabled={downloadLoading || !selectedVersionId}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 group/download relative overflow-hidden mb-4 ${downloadLoading || !selectedVersionId
                          ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                          : "bg-green-600/90 hover:bg-green-600 text-white border-2 border-green-500/50"
                        }`}
                      whileHover={!downloadLoading && selectedVersionId ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!downloadLoading && selectedVersionId ? { scale: 0.98 } : {}}
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        {downloadLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Preparing Download...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            Download Template
                            <ArrowRight className="w-5 h-5 group-hover/download:translate-x-1 transition-transform duration-300 ease-out" />
                          </>
                        )}
                      </div>
                    </motion.button>
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 text-center">
                      ✓ You own this template
                    </div>
                  </>
                ) : (
                  <>
                    {/* Purchase Button - User hasn't purchased */}
                    <motion.button
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const response = await fetch("/api/checkout", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              templateId: template.id,
                              templateSlug: template.slug,
                              templateTitle: template.title,
                              price: template.price,
                            }),
                          });

                          const data = await response.json();

                          if (data.url) {
                            // Redirect to Stripe Checkout
                            window.location.href = data.url;
                          } else {
                            console.error("Failed to create checkout session");
                            alert("Failed to initiate checkout. Please try again.");
                            setIsLoading(false);
                          }
                        } catch (error) {
                          console.error("Checkout error:", error);
                          alert("An error occurred. Please try again.");
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-azone-purple text-white rounded-xl font-semibold text-lg transition-all duration-300 mb-4 flex items-center justify-center gap-2 group/btn relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.05,
                      }}
                    >
                      {/* Purple Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-azone-purple via-purple-600 to-azone-purple opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-xl"></div>
                      <div className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Purchase Now
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300 ease-out" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </>
                )}

                {/* Download Error Message */}
                {downloadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-sm text-red-400 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{downloadError}</span>
                  </motion.div>
                )}

                {/* Version Selector (if multiple versions) */}
                {templateVersions.length > 1 && (
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 mb-2 block">Select Version:</label>
                    <select
                      value={selectedVersionId || ""}
                      onChange={(e) => setSelectedVersionId(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-azone-purple"
                    >
                      {templateVersions.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.version} {v.is_public ? "(Public)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* User Status */}
                {user ? (
                  <div className="mb-4 text-xs text-gray-500 text-center">
                    Signed in as: {user.email || user.id}
                  </div>
                ) : (
                  <div className="mb-4 text-xs text-gray-500 text-center">
                    Sign in to download purchased templates
                  </div>
                )}

                {/* Secondary CTA - Live Preview with Pulse Animation */}
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (template.demoUrl) {
                      try {
                        const url = new URL(template.demoUrl);
                        const currentUrl = new URL(window.location.href);

                        // Always open Live Preview in a new tab for better UX
                        // This prevents navigation issues and allows users to compare
                        window.open(template.demoUrl, '_blank', 'noopener,noreferrer');
                      } catch (e) {
                        // If URL parsing fails, try opening directly
                        if (template.demoUrl.startsWith('/')) {
                          // Relative URL - construct full URL
                          const fullUrl = `${window.location.origin}${template.demoUrl}`;
                          window.open(fullUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          // Absolute URL - open directly
                          window.open(template.demoUrl, '_blank', 'noopener,noreferrer');
                        }
                      }
                    }
                  }}
                  disabled={!template.demoUrl}
                  className={`w-full py-3.5 px-6 bg-transparent border-2 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 group/preview relative overflow-hidden ${template.demoUrl
                    ? "border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white cursor-pointer"
                    : "border-gray-800/30 text-gray-600 cursor-not-allowed opacity-50"
                    }`}
                  whileHover={template.demoUrl ? { scale: 1.02, y: -2 } : {}}
                  whileTap={template.demoUrl ? { scale: 0.98 } : {}}
                  animate={
                    template.demoUrl
                      ? {
                        boxShadow: [
                          "0 0 0px rgba(124, 58, 237, 0)",
                          "0 0 20px rgba(124, 58, 237, 0.3)",
                          "0 0 0px rgba(124, 58, 237, 0)",
                        ],
                      }
                      : {}
                  }
                  transition={{
                    duration: 0.25,
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: 0.05,
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  {/* Subtle Purple Glow on Hover */}
                  {template.demoUrl && (
                    <div className="absolute inset-0 bg-azone-purple/10 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <motion.div
                      animate={
                        template.demoUrl
                          ? {
                            scale: [1, 1.1, 1],
                          }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.div>
                    Live Preview
                    <ExternalLink className="w-4 h-4 group-hover/preview:translate-x-0.5 transition-transform duration-300 ease-out" />
                  </div>
                </motion.button>

                {/* Included Items */}
                <div className="pt-8 mt-8 border-t border-gray-800/50">
                  <h3 className="text-white font-semibold mb-4 text-lg">Included</h3>
                  <ul className="space-y-3 text-sm">
                    {[
                      "Full source code",
                      "Production-ready components",
                      "Commercial license",
                      "Technical documentation",
                      "Lifetime updates",
                      "Priority support",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-azone-purple mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Specs */}
                <div className="pt-8 mt-8 border-t border-gray-800/50">
                  <h3 className="text-white font-semibold mb-4 text-lg">Tech Specs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Framework</span>
                      <span className="text-white text-sm font-medium">
                        {template.techStack.find(t => t.toLowerCase().includes('next')) || 'Next.js'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Language</span>
                      <span className="text-white text-sm font-medium">TypeScript</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Styling</span>
                      <span className="text-white text-sm font-medium">Tailwind CSS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Components</span>
                      <span className="text-white text-sm font-medium">50+</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Social Sharing Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-azone-purple" />
                Share this Template
              </h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => handleShare('twitter')}
                  className="px-4 py-2.5 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] rounded-lg font-medium transition-all flex items-center gap-2 border border-[#1DA1F2]/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </motion.button>
                <motion.button
                  onClick={() => handleShare('facebook')}
                  className="px-4 py-2.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] rounded-lg font-medium transition-all flex items-center gap-2 border border-[#1877F2]/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </motion.button>
                <motion.button
                  onClick={() => handleShare('linkedin')}
                  className="px-4 py-2.5 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#0A66C2] rounded-lg font-medium transition-all flex items-center gap-2 border border-[#0A66C2]/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </motion.button>
                <motion.button
                  onClick={() => handleShare('copy')}
                  className="px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-lg font-medium transition-all flex items-center gap-2 border border-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Templates / You May Also Like Section */}
        {relatedTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedTemplates.map((relatedTemplate) => (
                  <Link
                    key={relatedTemplate.id}
                    href={`/templates/${relatedTemplate.slug}`}
                    className="group"
                  >
                    <motion.div
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-azone-purple/50 transition-all duration-300"
                      whileHover={{ y: -4 }}
                    >
                      <div className="relative aspect-video overflow-hidden bg-gray-950">
                        {relatedTemplate.imageUrl ? (
                          <Image
                            src={relatedTemplate.imageUrl}
                            alt={relatedTemplate.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-azone-purple transition-colors">
                          {relatedTemplate.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {relatedTemplate.shortDescription || relatedTemplate.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-azone-purple font-bold">
                            ${Math.round(relatedTemplate.price)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-azone-purple group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-900/80 hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={lightboxImage}
                  alt={`${template.title} - Full view`}
                  fill
                  className="object-contain"
                />
              </div>
              {/* Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = allImages.indexOf(lightboxImage);
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
                      setLightboxImage(allImages[prevIndex]);
                      setSelectedImage(prevIndex);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900/80 hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = allImages.indexOf(lightboxImage);
                      const nextIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
                      setLightboxImage(allImages[nextIndex]);
                      setSelectedImage(nextIndex);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900/80 hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
