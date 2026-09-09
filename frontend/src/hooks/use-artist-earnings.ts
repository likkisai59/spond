/* eslint-disable */
// @ts-nocheck
export const useArtistEarnings = () => ({
  data: {
    wallet_balance: 0,
    total_earnings: 0,
    monthly_earnings: 0,
    pending_payments: 0,
    revenue_chart: [] as any[],
    transactions: [] as any[]
  },
  loading: false,
  error: null,
  refetch: () => {}
});
