"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { Search, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAdminDropdownOpen(false);
      }
    };

    if (isAdminDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdminDropdownOpen]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/templates?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
          ? "bg-azone-black/80 backdrop-blur-md shadow-sm border-b border-gray-800"
          : "bg-azone-black"
        }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            aria-label="Azone.store Home"
          >
            <div className="text-2xl md:text-3xl font-bold">
              <span className="text-white">Azone</span>
              <span className="text-azone-purple">.store</span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-4 py-2 pl-10 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-azone-purple transition-colors text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </form>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/templates"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/case-studies"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
            {/* Admin Dropdown */}
            <div className="relative" ref={adminDropdownRef}>
              <button
                onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                className="text-sm font-medium text-azone-purple hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                Admin
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isAdminDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {/* Dropdown Menu */}
              {isAdminDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
                  <Link
                    href="/admin/upload"
                    onClick={() => setIsAdminDropdownOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload Template
                    </div>
                  </Link>
                  <Link
                    href="/admin/templates"
                    onClick={() => setIsAdminDropdownOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      Manage Templates
                    </div>
                  </Link>
                  <Link
                    href="/admin/purchases"
                    onClick={() => setIsAdminDropdownOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      View Purchases
                    </div>
                  </Link>
                  <div className="border-t border-gray-800">
                    <Link
                      href="/admin/analytics"
                      onClick={() => setIsAdminDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Analytics
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center space-x-5">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {pathname?.startsWith("/admin") ? (
              <AdminNav />
            ) : (
              <>
                <Link
                  href="/contact"
                  className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/templates"
                  className="hidden sm:inline-block px-6 py-2.5 text-sm font-semibold bg-azone-purple text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50"
                  aria-label="Get Started"
                >
                  Get Started
                </Link>
              </>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 px-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-4 py-2 pl-10 pr-10 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-azone-purple transition-colors text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/templates"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/case-studies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </Link>
            {/* Mobile Admin Section */}
            <div className="border-t border-gray-800 pt-2 mt-2">
              <div className="px-4 py-2 text-xs font-semibold text-azone-purple uppercase tracking-wider">
                Admin
              </div>
              <Link
                href="/admin/upload"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-azone-purple hover:text-purple-400 transition-colors"
              >
                Upload Template
              </Link>
              <Link
                href="/admin/templates"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Manage Templates
              </Link>
              <Link
                href="/admin/purchases"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                View Purchases
              </Link>
              <Link
                href="/admin/analytics"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Analytics
              </Link>
            </div>
            <Link
              href="/templates"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block mx-4 mt-4 px-6 py-2.5 text-sm font-semibold bg-azone-purple text-white rounded-lg text-center transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

