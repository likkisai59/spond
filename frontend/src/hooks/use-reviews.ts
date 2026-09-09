/* eslint-disable */
// @ts-nocheck
export const useReviews = () => ({
  reviews: [] as any[],
  averageRating: 0,
  totalReviews: 0,
  distribution: {},
  loading: false,
  error: null,
  ratingFilter: 0,
  setRatingFilter: (r: any) => {},
  search: "",
  setSearch: (s: any) => {},
  page: 1,
  setPage: (p: any) => {},
  limit: 10,
  refetch: (arg?: any) => {},
  totalPages: 1,
  totalCount: 0
});

export const useCreateReview = () => ({
  createReview: async(data:any) => false,
  replyToVenueReview: async(id: string, payload: any) => false
});

export const useCanReviewBooking = (id: string) => ({
  canReview: false, 
  alreadyReviewed: false, 
  eligibility: {reason:""}, 
  refetch: () => {}
});
export const useUpdateReview = () => ({updateReview: async() => false});
export const useDeleteReview = () => ({deleteReview: async() => false});
