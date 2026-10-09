import { useState, useCallback, useEffect } from "react";
import { artistService } from "@/services/artistService";
import { venueService } from "@/services/venueService";

export const useEarnings = (role: string) => {
  const [data, setData] = useState({
    wallet_balance: 0,
    total_earnings: 0,
    monthly_earnings: 0,
    pending_payments: 0,
    revenue_chart: [] as unknown[],
    transactions: [] as unknown[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let stats: Record<string, unknown>;
      if (role === "venue" || role === "venue_owner") {
        stats = (await venueService.getDashboardStats()) as unknown as Record<string, unknown>;
      } else {
        stats = (await artistService.getDashboardStats()) as unknown as Record<string, unknown>;
      }

      setData({
        wallet_balance: (stats.wallet_balance || stats.total_earnings || 0) as number,
        total_earnings: (stats.total_earnings || 0) as number,
        monthly_earnings: (stats.monthly_revenue || 0) as number,
        pending_payments: (stats.pending_payments || 0) as number,
        revenue_chart: (stats.revenue_chart || []) as unknown[],
        transactions: (stats.transactions || []) as unknown[]
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch earnings");
      } else {
        setError("Failed to fetch earnings");
      }
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return { data, loading, error, refetch: fetchEarnings };
};
