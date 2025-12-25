"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { getSession, signOut } from "@/lib/auth/auth";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const { user: currentUser } = await getSession();
        if (!currentUser) {
          router.push("/admin/login");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azone-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
              <p className="text-gray-400">Manage your account preferences</p>
            </div>
            <Link
              href="/account"
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg"
          >
            <p className="text-green-400 text-sm">{success}</p>
          </motion.div>
        )}

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white opacity-50 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">
                Email cannot be changed. Contact support if you need to update your email.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Security</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white mb-1">Password</div>
                  <div className="text-sm text-gray-400">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Change Password
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Password management is handled by Supabase Auth. Visit your Supabase dashboard to change your password.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-red-500/50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white mb-1">Sign Out</div>
                  <div className="text-sm text-gray-400">
                    Sign out of your account on this device
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

