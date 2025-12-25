"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TemplateCardSkeleton from "@/components/shared/TemplateCardSkeleton";
import { getAllTemplates } from "@/lib/db/queries";
import { Template } from "@/lib/types";
import { useToast } from "@/lib/utils/toast";
import { getErrorMessage } from "@/lib/utils/errors";
import { fetchWithCache, CacheKeys } from "@/lib/utils/cache";

// Lazy load TemplateCard for code splitting
const TemplateCard = lazy(() => import("@/components/marketplace/TemplateCard"));

type SortOption = "newest" | "price-low" | "price-high" | "popular";
type ViewMode = "grid" | "list";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Get search query from URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search");
      if (urlSearch) {
        setSearchQuery(urlSearch);
      }
      const urlCategory = params.get("category");
      if (urlCategory) {
        setSelectedCategory(urlCategory);
      }
    }
  }, []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const toast = useToast();

  // Fetch templates with caching
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const data = await fetchWithCache(
          CacheKeys.TEMPLATES,
          () => getAllTemplates(),
          10 * 60 * 1000 // 10 minutes cache
        );
        setTemplates(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Failed to load templates:", error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, [toast]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category))).sort();
    return cats;
  }, [templates]);

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.techStack.some((tech) =>
            tech.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(
      (t) => t.price >= priceRange[0] && t.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        // Sort by featured first, then by creation date
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [templates, searchQuery, selectedCategory, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTemplates.length / itemsPerPage);
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTemplates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTemplates, currentPage]);

  // Update page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  // Get price range from templates
  const maxPrice = useMemo(() => {
    if (templates.length === 0) return 1000;
    return Math.ceil(Math.max(...templates.map((t) => t.price)));
  }, [templates]);

  return (
    <div className="min-h-screen bg-azone-black pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Browse <span className="text-azone-purple">Templates</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Production-ready templates built for scale. Designed for funded startup founders and senior engineers.
          </p>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8"
        >
          {/* Search and View Toggle */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-azone-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-label="Grid view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-azone-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-label="List view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="flex-1"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$0</span>
                <span>${maxPrice}</span>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {paginatedTemplates.length} of {filteredAndSortedTemplates.length} templates
          </div>
        </motion.div>

        {/* Templates Grid/List */}
        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-4"
            }
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TemplateCardSkeleton key={i} />
            ))}
          </div>
        ) : paginatedTemplates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No templates found</p>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8"
                  : "space-y-4 mb-8"
              }
            >
              {paginatedTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Suspense fallback={<TemplateCardSkeleton />}>
                    <TemplateCard
                      id={template.id}
                      title={template.title}
                      category={template.category}
                      price={template.price}
                      techStack={template.techStack}
                      imageUrl={template.imageUrl}
                      slug={template.slug}
                      updatedAt={template.updatedAt}
                      featured={template.featured}
                      index={index}
                    />
                  </Suspense>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center gap-2">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? "bg-azone-purple text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
