"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getTotalRevenue,
  getSalesChartData,
  getTopSellingTemplates,
  getCustomerStats,
  getTemplatePerformance,
  getRevenueTrends,
  SalesData,
  TopTemplate,
  CustomerStats,
  TemplatePerformance,
  RevenueTrend,
} from "@/lib/db/analytics";

// Simple SVG Chart Component
function SimpleBarChart({ data, height = 200 }: { data: SalesData[]; height?: number }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const barWidth = 100 / data.length;
  const padding = 2;

  return (
    <svg width="100%" height={height} className="overflow-visible">
      {data.map((item, index) => {
        const barHeight = (item.revenue / maxRevenue) * (height - 40);
        const x = (index * 100) / data.length + padding;
        const y = height - barHeight - 20;

        return (
          <g key={item.date}>
            <rect
              x={`${x}%`}
              y={y}
              width={`${barWidth - padding * 2}%`}
              height={barHeight}
              fill="url(#gradient)"
              rx="4"
              className="hover:opacity-80 transition-opacity"
            />
            <text
              x={`${x + barWidth / 2 - padding}%`}
              y={height - 5}
              textAnchor="middle"
              className="text-xs fill-gray-400"
              fontSize="10"
            >
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Line Chart Component for Revenue Trends
function SimpleLineChart({ data, height = 200 }: { data: RevenueTrend[]; height?: number }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - (item.revenue / maxRevenue) * 80; // Leave 20% padding
    return { x, y, ...item };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`)
    .join(" ");

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke="#7C3AED"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-lg"
      />
      {points.map((point, index) => (
        <g key={index}>
          <circle
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="4"
            fill="#7C3AED"
            className="hover:r-6 transition-all"
          />
          <text
            x={`${point.x}%`}
            y={`${point.y - 10}%`}
            textAnchor="middle"
            className="text-xs fill-gray-300"
            fontSize="10"
          >
            ${Math.round(point.revenue)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesChartData, setSalesChartData] = useState<SalesData[]>([]);
  const [topTemplates, setTopTemplates] = useState<TopTemplate[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [templatePerformance, setTemplatePerformance] = useState<TemplatePerformance[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);

  // Chart period
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  // Fetch all analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const [
          revenue,
          salesData,
          topSelling,
          customerData,
          performance,
          trends,
        ] = await Promise.all([
          getTotalRevenue(),
          getSalesChartData(chartPeriod),
          getTopSellingTemplates(10),
          getCustomerStats(),
          getTemplatePerformance(),
          getRevenueTrends(chartPeriod),
        ]);

        setTotalRevenue(revenue);
        setSalesChartData(salesData);
        setTopTemplates(topSelling);
        setCustomerStats(customerData);
        setTemplatePerformance(performance);
        setRevenueTrends(trends);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [chartPeriod]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-azone-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azone-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
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
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">View insights and metrics for your marketplace</p>
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

        {/* C.1: Total Revenue Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-azone-purple/20 to-purple-900/20 backdrop-blur-sm border border-azone-purple/50 rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Revenue</div>
              <div className="text-5xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-gray-400 mt-2">All time sales</div>
            </div>
            <div className="w-20 h-20 bg-azone-purple/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-azone-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* C.2: Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Sales Chart</h2>
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    chartPeriod === period
                      ? "bg-azone-purple text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <SimpleBarChart data={salesChartData} height={256} />
          </div>
          <div className="mt-4 text-sm text-gray-400 text-center">
            Total Sales: {salesChartData.reduce((sum, d) => sum + d.count, 0)} purchases
          </div>
        </motion.div>

        {/* C.3: Top Selling Templates & C.4: Customer Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Selling Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Top Selling Templates</h2>
            <div className="space-y-4">
              {topTemplates.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No sales data available</p>
              ) : (
                topTemplates.map((template, index) => (
                  <div
                    key={template.templateId}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-azone-purple/20 rounded-full flex items-center justify-center text-azone-purple font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{template.templateTitle}</div>
                        <div className="text-sm text-gray-400">
                          {template.sales} {template.sales === 1 ? "sale" : "sales"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{formatCurrency(template.revenue)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Customer Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Customer Statistics</h2>
            {customerStats ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Total Purchases</div>
                  <div className="text-3xl font-bold text-white">{customerStats.totalCustomers}</div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Unique Customers</div>
                  <div className="text-3xl font-bold text-white">
                    {customerStats.uniqueCustomers}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Average Order Value</div>
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(customerStats.averageOrderValue)}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Repeat Customers</div>
                  <div className="text-3xl font-bold text-azone-purple">
                    {customerStats.repeatCustomers}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No customer data available</p>
            )}
          </motion.div>
        </div>

        {/* C.5: Template Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Template Performance Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Template
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Sales
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Avg. Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {templatePerformance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No performance data available
                    </td>
                  </tr>
                ) : (
                  templatePerformance
                    .filter((t) => t.sales > 0)
                    .map((template) => (
                      <tr key={template.templateId} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          {template.templateTitle}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{template.sales}</td>
                        <td className="px-6 py-4 text-white font-semibold">
                          {formatCurrency(template.revenue)}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {formatCurrency(template.revenue / template.sales)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* C.6: Revenue Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Revenue Trends</h2>
          <div className="h-64 mb-6">
            <SimpleLineChart data={revenueTrends} height={256} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueTrends.slice(-3).map((trend, index) => (
              <div
                key={trend.period}
                className="p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="text-sm text-gray-400 mb-1">
                  {new Date(trend.period).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(trend.revenue)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    trend.growth >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {trend.growth >= 0 ? "+" : ""}
                  {trend.growth.toFixed(1)}% growth
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
