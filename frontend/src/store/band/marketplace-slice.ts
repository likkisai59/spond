import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bandService } from "@/services";
import { Artist, Band, Venue, Booking, BookingRequest, CustomerEvent, CustomerEventCreate } from "@/types/band";

export interface MarketplaceState {
  artists: Artist[];
  bands: Band[];
  venues: Venue[];
  myBookings: Booking[];
  myEvents: CustomerEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: MarketplaceState = {
  artists: [],
  bands: [],
  venues: [],
  myBookings: [],
  myEvents: [],
  loading: false,
  error: null,
};

export const fetchArtists = createAsyncThunk("marketplace/fetchArtists", async () => {
  return await bandService.getArtists();
});

export const fetchBands = createAsyncThunk("marketplace/fetchBands", async () => {
  return await bandService.getBands();
});

export const fetchVenues = createAsyncThunk("marketplace/fetchVenues", async () => {
  return await bandService.getVenues();
});

export const fetchMyBookings = createAsyncThunk(
  "marketplace/fetchMyBookings",
  async (roleView: "customer" | "provider" = "customer") => {
    return await bandService.getMyBookings(roleView);
  }
);

export const createBooking = createAsyncThunk(
  "marketplace/createBooking",
  async (request: BookingRequest) => {
    return await bandService.createBooking(request);
  }
);

export const updateBookingStatus = createAsyncThunk(
  "marketplace/updateBookingStatus",
  async ({ id, status }: { id: string; status: string }) => {
    return await bandService.updateBookingStatus(id, status);
  }
);

export const simulatePayment = createAsyncThunk(
  "marketplace/simulatePayment",
  async ({ id, paymentStatus }: { id: string; paymentStatus: string }) => {
    return await bandService.simulatePayment(id, paymentStatus);
  }
);

export const createCustomerEvent = createAsyncThunk(
  "marketplace/createCustomerEvent",
  async (request: CustomerEventCreate) => {
    return await bandService.createEvent(request);
  }
);

export const fetchCustomerEvents = createAsyncThunk("marketplace/fetchCustomerEvents", async () => {
  return await bandService.getCustomerEvents();
});

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Artists
      .addCase(fetchArtists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.artists = action.payload;
      })
      .addCase(fetchArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch artists";
      })
      // Fetch Bands
      .addCase(fetchBands.fulfilled, (state, action) => {
        state.bands = action.payload;
      })
      // Fetch Venues
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.venues = action.payload;
      })
      // Fetch My Bookings
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.myBookings = action.payload;
      })
      // Create Booking
      .addCase(createBooking.fulfilled, (state, action) => {
        state.myBookings.push(action.payload);
      })
      // Update Booking
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      // Simulate Payment
      .addCase(simulatePayment.fulfilled, (state, action) => {
        const index = state.myBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      // Fetch Customer Events
      .addCase(fetchCustomerEvents.fulfilled, (state, action) => {
        state.myEvents = action.payload;
      })
      // Create Customer Event
      .addCase(createCustomerEvent.fulfilled, (state, action) => {
        state.myEvents.push(action.payload);
      });
  },
});

export default marketplaceSlice.reducer;
