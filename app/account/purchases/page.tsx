"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth";
import { getUserPurchases } from "@/lib/auth/purchases";
import { PurchaseWithDetails } from "@/lib/db/purchases";

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPurchases() {
      try {
        const { user: currentUser } = await getSession();
        if (!currentUser) {
          router.push("/admin/login");
          return;
        }

        setUser(currentUser);
        const userPurchases = await getUserPurchases(currentUser.id);
        setPurchases(userPurchases);
      } catch (error) {
        console.error("Failed to load purchases:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPurchases();
  }, [router]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

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

  if (!user) {
    return null;
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
              <h1 className="text-4xl font-bold text-white mb-2">Purchase History</h1>
              <p className="text-gray-400">View all your template purchases</p>
            </div>
            <Link
              href="/account"
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-400"
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
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Purchases Yet</h2>
            <p className="text-gray-400 mb-8">
              You haven&apos;t purchased any templates yet. Browse our collection to get started!
            </p>
            <Link
              href="/templates"
              className="inline-block px-6 py-3 bg-azone-purple text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-azone-purple/50 transition-all"
            >
              Browse Templates
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Template
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Version
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {purchase.template?.title || "Unknown Template"}
                        </div>
                        {purchase.template?.category && (
                          <div className="text-sm text-gray-400">
                            {purchase.template.category}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {purchase.template_version?.version || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {new Date(purchase.purchased_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {formatCurrency(purchase.price, purchase.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {purchase.template?.slug && (
                            <Link
                              href={`/templates/${purchase.template.slug}`}
                              className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 transition-all"
                            >
                              View
                            </Link>
                          )}
                          <Link
                            href={`/account/downloads?version=${purchase.template_version_id}`}
                            className="px-3 py-1.5 bg-azone-purple/20 text-azone-purple rounded-lg text-xs font-medium hover:bg-azone-purple/30 transition-all"
                          >
                            Download
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

