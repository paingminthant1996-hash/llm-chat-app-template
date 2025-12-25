"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth";
import { getUserPurchases, getDownloadUrl } from "@/lib/auth/purchases";
import { PurchaseWithDetails } from "@/lib/db/purchases";

function DownloadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

        // Auto-download if version_id is in query params
        const versionId = searchParams.get("version");
        if (versionId) {
          handleDownload(versionId);
        }
      } catch (error) {
        console.error("Failed to load downloads:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  const handleDownload = async (versionId: string) => {
    if (!user) return;

    setDownloading(versionId);
    setError(null);

    try {
      const { url, error: downloadError } = await getDownloadUrl(user.id, versionId);

      if (downloadError || !url) {
        setError(downloadError || "Failed to get download URL");
        setDownloading(null);
        return;
      }

      // Open download URL in new tab
      window.open(url, "_blank");
      setDownloading(null);
    } catch (err: any) {
      setError(err.message || "Failed to download template");
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azone-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading downloads...</p>
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
              <h1 className="text-4xl font-bold text-white mb-2">Downloads</h1>
              <p className="text-gray-400">Download your purchased templates</p>
            </div>
            <Link
              href="/account"
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
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

        {/* Downloads List */}
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Downloads Available</h2>
            <p className="text-gray-400 mb-8">
              You need to purchase templates before you can download them.
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {purchase.template?.title || "Unknown Template"}
                  </h3>
                  <div className="text-sm text-gray-400 mb-1">
                    Version: {purchase.template_version?.version || "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">
                    Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(purchase.template_version_id)}
                  disabled={downloading === purchase.template_version_id}
                  className="w-full px-4 py-3 bg-azone-purple text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-azone-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {downloading === purchase.template_version_id ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Preparing...
                    </>
                  ) : (
                    <>
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Template
                    </>
                  )}
                </button>
                {purchase.template?.slug && (
                  <Link
                    href={`/templates/${purchase.template.slug}`}
                    className="block mt-3 text-center text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    View Template →
                  </Link>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azone-purple mx-auto mb-4"></div>
            <p className="text-gray-400">Loading downloads...</p>
          </div>
        </div>
      }
    >
      <DownloadsContent />
    </Suspense>
  );
}

