// Analytics query functions for Supabase
import { getAllPurchases, PurchaseWithDetails } from "./purchases";
import { getAllTemplates } from "./queries";
import { Template } from "../types";

// Analytics data interfaces
export interface SalesData {
  date: string;
  revenue: number;
  count: number;
}

export interface TopTemplate {
  templateId: string;
  templateTitle: string;
  sales: number;
  revenue: number;
}

export interface CustomerStats {
  totalCustomers: number;
  uniqueCustomers: number;
  averageOrderValue: number;
  repeatCustomers: number;
}

export interface TemplatePerformance {
  templateId: string;
  templateTitle: string;
  views: number; // Placeholder - would need tracking
  sales: number;
  revenue: number;
  conversionRate: number; // Placeholder
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  growth: number; // Percentage change
}

/**
 * Get total revenue
 */
export async function getTotalRevenue(): Promise<number> {
  const purchases = await getAllPurchases();
  return purchases
    .filter((p) => !p.refunded)
    .reduce((sum, p) => sum + p.price, 0);
}

/**
 * Get sales chart data (daily/weekly/monthly)
 */
export async function getSalesChartData(
  period: "daily" | "weekly" | "monthly"
): Promise<SalesData[]> {
  const purchases = await getAllPurchases();
  const filtered = purchases.filter((p) => !p.refunded);

  const grouped = new Map<string, { revenue: number; count: number }>();

  filtered.forEach((purchase) => {
    const date = new Date(purchase.purchased_at);
    let key: string;

    if (period === "daily") {
      key = date.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (period === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      key = weekStart.toISOString().split("T")[0];
    } else {
      // monthly
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = grouped.get(key) || { revenue: 0, count: 0 };
    grouped.set(key, {
      revenue: existing.revenue + purchase.price,
      count: existing.count + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top selling templates
 */
export async function getTopSellingTemplates(limit: number = 10): Promise<TopTemplate[]> {
  const purchases = await getAllPurchases();
  const filtered = purchases.filter((p) => !p.refunded && p.template);

  const grouped = new Map<
    string,
    { title: string; sales: number; revenue: number }
  >();

  filtered.forEach((purchase) => {
    const templateId = purchase.template_version?.template_id || "";
    const templateTitle = purchase.template?.title || "Unknown";

    if (!templateId) return;

    const existing = grouped.get(templateId) || {
      title: templateTitle,
      sales: 0,
      revenue: 0,
    };

    grouped.set(templateId, {
      title: templateTitle,
      sales: existing.sales + 1,
      revenue: existing.revenue + purchase.price,
    });
  });

  return Array.from(grouped.values())
    .map((data) => ({
      templateId: data.title, // Using title as ID for display
      templateTitle: data.title,
      sales: data.sales,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  const purchases = await getAllPurchases();
  const filtered = purchases.filter((p) => !p.refunded);

  const uniqueCustomers = new Set(
    filtered.map((p) => p.user?.email).filter(Boolean)
  );

  const customerPurchaseCount = new Map<string, number>();
  filtered.forEach((p) => {
    const email = p.user?.email;
    if (email) {
      customerPurchaseCount.set(
        email,
        (customerPurchaseCount.get(email) || 0) + 1
      );
    }
  });

  const repeatCustomers = Array.from(customerPurchaseCount.values()).filter(
    (count) => count > 1
  ).length;

  const totalRevenue = filtered.reduce((sum, p) => sum + p.price, 0);
  const averageOrderValue =
    filtered.length > 0 ? totalRevenue / filtered.length : 0;

  return {
    totalCustomers: filtered.length,
    uniqueCustomers: uniqueCustomers.size,
    averageOrderValue,
    repeatCustomers,
  };
}

/**
 * Get template performance metrics
 */
export async function getTemplatePerformance(): Promise<TemplatePerformance[]> {
  const [purchases, templates] = await Promise.all([
    getAllPurchases(),
    getAllTemplates(),
  ]);

  const filtered = purchases.filter((p) => !p.refunded);

  const templateMap = new Map<string, TemplatePerformance>();

  // Initialize with all templates
  templates.forEach((template) => {
    templateMap.set(template.id, {
      templateId: template.id,
      templateTitle: template.title,
      views: 0, // Placeholder - would need tracking
      sales: 0,
      revenue: 0,
      conversionRate: 0, // Placeholder
    });
  });

  // Count sales and revenue
  filtered.forEach((purchase) => {
    const templateId = purchase.template_version?.template_id;
    if (!templateId) return;

    const existing = templateMap.get(templateId);
    if (existing) {
      existing.sales += 1;
      existing.revenue += purchase.price;
      templateMap.set(templateId, existing);
    }
  });

  return Array.from(templateMap.values()).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Get revenue trends (with growth percentage)
 */
export async function getRevenueTrends(
  period: "daily" | "weekly" | "monthly"
): Promise<RevenueTrend[]> {
  const salesData = await getSalesChartData(period);
  const trends: RevenueTrend[] = [];

  salesData.forEach((data, index) => {
    const previousRevenue = index > 0 ? salesData[index - 1].revenue : 0;
    const growth =
      previousRevenue > 0
        ? ((data.revenue - previousRevenue) / previousRevenue) * 100
        : 0;

    trends.push({
      period: data.date,
      revenue: data.revenue,
      growth: Math.round(growth * 100) / 100, // Round to 2 decimal places
    });
  });

  return trends;
}

