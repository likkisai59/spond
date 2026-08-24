import {
  createSlice,
  nanoid,
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
import { MOCK_GROUPS } from "@/sports/mocks/groups.mock";

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
}

const initialState: GroupsState = { groups: MOCK_GROUPS };

const groupsSlice = createSlice({
  name: "sports/groups",
  initialState,
  reducers: {
    groupAdded: {
      reducer(state, action: PayloadAction<SportsGroup>) {
        state.groups.unshift(action.payload);
      },
      prepare(input: NewGroupInput) {
        const now = new Date().toISOString();
        const group: SportsGroup = {
          id: nanoid(8),
          createdAt: now,
          updatedAt: now,
          memberCount: 1,
          members: [],
          ...input,
        };
        return { payload: group };
      },
    },
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
});

export const {
  groupAdded,
  memberRemoved,
  memberAdded,
  memberRoleChanged,
} = groupsSlice.actions;
export default groupsSlice.reducer;
