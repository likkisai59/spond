import {
  createAsyncThunk,
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { SportsPoll } from "@/types";
import { pollsService } from "@/services/sports/polls.service";
import { MOCK_POLLS } from "@/sports/mocks/polls.mock";

export interface NewPollInput {
  groupId: string;
  question: string;
  optionLabels: string[];
  multipleChoice: boolean;
  expiresAt: string;
}

export interface PollsState {
  polls: SportsPoll[];
}

const initialState: PollsState = { polls: [] };

export const fetchPollsThunk = createAsyncThunk(
  "sports/polls/fetchPolls",
  async (groupId?: string) => {
    const response = await pollsService.list(groupId ? { groupId } : undefined);
    const resData = (response?.data as any)?.data || response?.data || response;
    const items = Array.isArray(resData) ? resData : (resData?.items || []);
    return items as SportsPoll[];
  }
);

export const createPollThunk = createAsyncThunk(
  "sports/polls/createPoll",
  async (input: NewPollInput) => {
    const response = await pollsService.create({
      groupId: input.groupId,
      question: input.question,
      optionLabels: input.optionLabels,
      multipleChoice: input.multipleChoice,
      expiresAt: input.expiresAt,
    });
    const resData = (response?.data as any)?.data || response?.data || response;
    return resData as SportsPoll;
  }
);

export const votePollThunk = createAsyncThunk(
  "sports/polls/votePoll",
  async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
    const response = await pollsService.vote(pollId, [optionId]);
    const resData = (response?.data as any)?.data || response?.data || response;
    return resData as SportsPoll;
  }
);

const pollsSlice = createSlice({
  name: "sports/polls",
  initialState,
  reducers: {
    pollAdded: {
      reducer(state, action: PayloadAction<SportsPoll>) {
        state.polls.unshift(action.payload);
      },
      prepare(input: NewPollInput) {
        const now = new Date().toISOString();
        const poll: SportsPoll = {
          id: nanoid(8),
          createdAt: now,
          updatedAt: now,
          status: "Active",
          createdBy: "You",
          votedOptionIds: [],
          groupId: input.groupId,
          question: input.question,
          multipleChoice: input.multipleChoice,
          expiresAt: input.expiresAt,
          options: input.optionLabels.map((label) => ({
            id: nanoid(6),
            label,
            votes: 0,
          })),
        };
        return { payload: poll };
      },
    },
    voteToggled(
      state,
      action: PayloadAction<{ pollId: string; optionId: string }>
    ) {
      const poll = state.polls.find((p) => p.id === action.payload.pollId);
      if (!poll || poll.status !== "Active") return;

      const optionId = action.payload.optionId;
      const alreadyVoted = poll.votedOptionIds.includes(optionId);

      if (poll.multipleChoice) {
        const option = poll.options.find((o) => o.id === optionId);
        if (!option) return;
        if (alreadyVoted) {
          option.votes = Math.max(0, option.votes - 1);
          poll.votedOptionIds = poll.votedOptionIds.filter(
            (id) => id !== optionId
          );
        } else {
          option.votes += 1;
          poll.votedOptionIds.push(optionId);
        }
      } else {
        poll.votedOptionIds.forEach((votedId) => {
          const voted = poll.options.find((o) => o.id === votedId);
          if (voted) voted.votes = Math.max(0, voted.votes - 1);
        });
        if (alreadyVoted) {
          poll.votedOptionIds = [];
        } else {
          const option = poll.options.find((o) => o.id === optionId);
          if (!option) return;
          option.votes += 1;
          poll.votedOptionIds = [optionId];
        }
      }
      poll.updatedAt = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPollsThunk.fulfilled, (state, action) => {
        state.polls = action.payload;
      })
      .addCase(createPollThunk.fulfilled, (state, action) => {
        state.polls.unshift(action.payload);
      })
      .addCase(votePollThunk.fulfilled, (state, action) => {
        const index = state.polls.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.polls[index] = action.payload;
        }
      });
  },
});

export const { pollAdded, voteToggled } = pollsSlice.actions;
export default pollsSlice.reducer;
