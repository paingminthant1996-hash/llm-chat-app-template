"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getAllPurchases,
  getPurchasesByDateRange,
  getPurchasesByTemplate,
  getPurchasesByEmail,
  PurchaseWithDetails,
} from "@/lib/db/purchases";
import { getAllTemplates } from "@/lib/db/queries";
import { Template } from "@/lib/types";

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseWithDetails[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithDetails | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState<"all" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [emailFilter, setEmailFilter] = useState("");

  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [purchasesData, templatesData] = await Promise.all([
          getAllPurchases(),
          getAllTemplates(),
        ]);
        setPurchases(purchasesData);
        setFilteredPurchases(purchasesData);
        setTemplates(templatesData);
      } catch (err: any) {
        setError(err.message || "Failed to load purchases");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    async function applyFilters() {
      try {
        let filtered = [...purchases];

        // Date filter
        if (dateFilter === "custom" && startDate && endDate) {
          filtered = await getPurchasesByDateRange(startDate, endDate);
        }

        // Template filter
        if (templateFilter !== "all") {
          filtered = filtered.filter(
            (p) => p.template_version?.template_id === templateFilter
          );
        }

        // Email filter
        if (emailFilter) {
          filtered = filtered.filter(
            (p) =>
              p.user?.email?.toLowerCase().includes(emailFilter.toLowerCase())
          );
        }

        setFilteredPurchases(filtered);
      } catch (err: any) {
        setError(err.message || "Failed to apply filters");
      }
    }

    applyFilters();
  }, [dateFilter, startDate, endDate, templateFilter, emailFilter, purchases]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Date",
      "Customer Email",
      "Template",
      "Version",
      "Price",
      "Currency",
      "Stripe Session ID",
      "Status",
      "Refunded",
    ];

    const rows = filteredPurchases.map((p) => [
      p.id,
      new Date(p.purchased_at).toLocaleDateString(),
      p.user?.email || "N/A",
      p.template?.title || "N/A",
      p.template_version?.version || "N/A",
      p.price.toString(),
      p.currency,
      p.stripe_session_id || "N/A",
      p.granted ? "Granted" : "Pending",
      p.refunded ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `purchases-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Calculate totals
  const totalRevenue = filteredPurchases.reduce((sum, p) => sum + p.price, 0);
  const totalPurchases = filteredPurchases.length;
  const refundedCount = filteredPurchases.filter((p) => p.refunded).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azone-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">View Purchases</h1>
              <p className="text-gray-400">Track and manage all customer purchases</p>
            </div>
            <button
              onClick={exportToCSV}
              className="px-6 py-3 text-sm font-semibold bg-azone-purple text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50"
            >
              Export to CSV
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(totalRevenue, "USD")}
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 mb-2">Total Purchases</div>
            <div className="text-3xl font-bold text-white">{totalPurchases}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 mb-2">Refunded</div>
            <div className="text-3xl font-bold text-red-400">{refundedCount}</div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as "all" | "custom")}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
              >
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateFilter === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
                  />
                </div>
              </>
            )}

            {/* Template Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Template
              </label>
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-azone-purple"
              >
                <option value="all">All Templates</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Email
              </label>
              <input
                type="email"
                placeholder="Search by email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-azone-purple"
              />
            </div>
          </div>
        </motion.div>

        {/* Purchases Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Template
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Version
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {new Date(purchase.purchased_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(purchase.purchased_at).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {purchase.user?.email || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {purchase.template?.title || "N/A"}
                        </div>
                        {purchase.template?.category && (
                          <div className="text-xs text-gray-400">
                            {purchase.template.category}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {purchase.template_version?.version || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {formatCurrency(purchase.price, purchase.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              purchase.granted
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {purchase.granted ? "Granted" : "Pending"}
                          </span>
                          {purchase.refunded && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                              Refunded
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          className="px-3 py-1.5 bg-azone-purple/20 text-azone-purple rounded-lg text-xs font-medium hover:bg-azone-purple/30 transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Purchase Details Modal */}
        {selectedPurchase && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Purchase Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Purchase ID
                    </label>
                    <p className="text-white text-sm font-mono">{selectedPurchase.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <p className="text-white text-sm">
                      {new Date(selectedPurchase.purchased_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Customer Email
                  </label>
                  <p className="text-white">{selectedPurchase.user?.email || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Template
                  </label>
                  <p className="text-white">
                    {selectedPurchase.template?.title || "N/A"}
                  </p>
                  {selectedPurchase.template?.slug && (
                    <a
                      href={`/templates/${selectedPurchase.template.slug}`}
                      target="_blank"
                      className="text-azone-purple hover:underline text-sm"
                    >
                      View Template →
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Version
                    </label>
                    <p className="text-white">
                      {selectedPurchase.template_version?.version || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Price
                    </label>
                    <p className="text-white font-semibold">
                      {formatCurrency(selectedPurchase.price, selectedPurchase.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedPurchase.granted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {selectedPurchase.granted ? "Granted" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Refunded
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedPurchase.refunded
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {selectedPurchase.refunded ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {selectedPurchase.stripe_session_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Stripe Session ID
                    </label>
                    <p className="text-white text-sm font-mono break-all">
                      {selectedPurchase.stripe_session_id}
                    </p>
                  </div>
                )}

                {selectedPurchase.stripe_payment_intent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Stripe Payment Intent
                    </label>
                    <p className="text-white text-sm font-mono break-all">
                      {selectedPurchase.stripe_payment_intent}
                    </p>
                  </div>
                )}

                {selectedPurchase.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Metadata
                    </label>
                    <pre className="text-white text-xs bg-gray-800 p-4 rounded-lg overflow-auto">
                      {JSON.stringify(selectedPurchase.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Refund Button (Placeholder) */}
                {!selectedPurchase.refunded && (
                  <div className="pt-4 border-t border-gray-800">
                    <button
                      onClick={() => {
                        alert("Refund functionality coming soon!");
                      }}
                      className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
                    >
                      Process Refund (Coming Soon)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
