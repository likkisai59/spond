import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  GroupCategory,
  GroupMember,
  GroupVisibility,
  MemberRole,
  SportType,
  SportsGroup,
} from "@/types";
import { groupsService } from "@/services/sports/groups.service";

export interface NewGroupInput {
  name: string;
  description: string;
  sportType?: SportType;
  category: GroupCategory;
  location: string;
  visibility?: GroupVisibility;
}

export interface GroupsState {
  groups: SportsGroup[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GroupsState = { 
  groups: [],
  status: 'idle',
  error: null
};

export const fetchGroupsThunk = createAsyncThunk(
  "sports/groups/fetchGroups",
  async () => {
    const response = await groupsService.list();
    const data = response.data as any;
    return Array.isArray(data) ? data : (data?.items || []);
  }
);

export const createGroupThunk = createAsyncThunk(
  "sports/groups/createGroup",
  async (input: NewGroupInput) => {
    const response = await groupsService.create(input);
    const data = response.data as any;
    return data?.data || data;
  }
);

export const addMemberThunk = createAsyncThunk(
  "sports/groups/addMember",
  async ({ groupId, input }: { groupId: string; input: unknown }) => {
    const response = await groupsService.addMember(groupId, input);
    const data = response.data as any;
    return data?.data || data;
  }
);

const groupsSlice = createSlice({
  name: "sports/groups",
  initialState,
  reducers: {
    memberRemoved(
      state,
      action: PayloadAction<{ groupId: string; memberId: string }>
    ) {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return;
      group.members = group.members.filter(
        (m) => m.id !== action.payload.memberId
      );
      group.memberCount = group.members.length;
      group.updatedAt = new Date().toISOString();
    },
    memberAdded(
      state,
      action: PayloadAction<{ groupId: string; member: GroupMember }>
    ) {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return;
      group.members.push(action.payload.member);
      group.memberCount = group.members.length;
      group.updatedAt = new Date().toISOString();
    },
    memberRoleChanged(
      state,
      action: PayloadAction<{
        groupId: string;
        memberId: string;
        role: MemberRole;
      }>
    ) {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return;
      const member = group.members.find(
        (m) => m.id === action.payload.memberId
      );
      if (!member) return;
      member.role = action.payload.role;
      group.updatedAt = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGroupsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groups = action.payload;
      })
      .addCase(fetchGroupsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch groups';
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        state.groups.unshift(action.payload);
      })
      .addCase(addMemberThunk.fulfilled, (state, action) => {
        const updatedGroup = action.payload;
        const index = state.groups.findIndex((g) => g.id === updatedGroup.id);
        if (index !== -1) {
          state.groups[index] = updatedGroup;
        }
      });
  },
});

export const {
  memberRemoved,
  memberAdded,
  memberRoleChanged,
} = groupsSlice.actions;

export default groupsSlice.reducer;
