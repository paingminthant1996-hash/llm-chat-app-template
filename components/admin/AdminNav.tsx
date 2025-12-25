"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, getSession } from "@/lib/auth/auth";
import Link from "next/link";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const { user: currentUser } = await getSession();
        setUser(currentUser);
      } catch (err) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400 hidden sm:inline">
        {user.email}
      </span>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        Logout
      </button>
    </div>
  );
}

