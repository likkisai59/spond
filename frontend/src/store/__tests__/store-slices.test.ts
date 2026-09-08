import { describe, it, expect, beforeEach } from "vitest";
import authReducer, {
  credentialsReceived,
  userUpdated,
  authStatusChanged,
  authFailed,
  loggedOut,
} from "../slices/auth-slice";
import groupsReducer, {
  memberAdded,
  memberRemoved,
  memberRoleChanged,
} from "../sports/groups-slice";
import notificationReducer, {
  notificationAdded,
  notificationRead,
  notificationRemoved,
  notificationsCleared,
  notificationsMarkedAllAsRead,
} from "../slices/notification-slice";
import type { User, SportsGroup, GroupMember } from "@/types";

describe("Redux Slices Unit Tests", () => {
  describe("authSlice", () => {
    const mockUser: User = {
      id: "u123",
      email: "player@spond.com",
      name: "Virat Kohli",
      role: "player",
      accessibleModules: ["sports"],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it("handles credentialsReceived correctly", () => {
      const initialState = {
        user: null,
        accessToken: null,
        refreshToken: null,
        status: "idle" as const,
        error: null,
      };

      const state = authReducer(
        initialState,
        credentialsReceived({
          user: mockUser,
          accessToken: "access_token_1",
          refreshToken: "refresh_token_1",
        })
      );

      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe("access_token_1");
      expect(state.refreshToken).toBe("refresh_token_1");
      expect(state.status).toBe("succeeded");
    });

    it("handles userUpdated correctly", () => {
      const initialState = {
        user: mockUser,
        accessToken: "access_token_1",
        refreshToken: null,
        status: "succeeded" as const,
        error: null,
      };

      const updatedUser = { ...mockUser, name: "Virat King Kohli" };
      const state = authReducer(initialState, userUpdated(updatedUser));

      expect(state.user?.name).toBe("Virat King Kohli");
    });

    it("handles authFailed correctly", () => {
      const initialState = {
        user: null,
        accessToken: null,
        refreshToken: null,
        status: "loading" as const,
        error: null,
      };

      const state = authReducer(initialState, authFailed("Invalid credentials"));
      expect(state.status).toBe("failed");
      expect(state.error).toBe("Invalid credentials");
    });

    it("handles loggedOut by resetting state to empty", () => {
      const initialState = {
        user: mockUser,
        accessToken: "access_token_1",
        refreshToken: "refresh_token_1",
        status: "succeeded" as const,
        error: null,
      };

      const state = authReducer(initialState, loggedOut());
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.status).toBe("idle");
    });
  });

  describe("groupsSlice", () => {
    const mockGroup: SportsGroup = {
      id: "grp_1",
      name: "Titans FC",
      description: "Football Team",
      category: "adults",
      location: "Hyderabad",
      createdBy: "u123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1,
      members: [
        {
          id: "m1",
          userId: "u123",
          name: "Captain",
          role: "coach",
          status: "active",
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    it("handles memberAdded by pushing member and increasing memberCount", () => {
      const initialState = {
        groups: [mockGroup],
        status: "succeeded" as const,
        error: null,
      };

      const newMember: GroupMember = {
        id: "m2",
        userId: "u456",
        name: "New Player",
        role: "player",
        status: "active",
        joinedAt: new Date().toISOString(),
      };

      const state = groupsReducer(
        initialState,
        memberAdded({ groupId: "grp_1", member: newMember })
      );

      const group = state.groups.find((g) => g.id === "grp_1");
      expect(group?.members).toHaveLength(2);
      expect(group?.memberCount).toBe(2);
    });

    it("handles memberRoleChanged correctly", () => {
      const initialState = {
        groups: [mockGroup],
        status: "succeeded" as const,
        error: null,
      };

      const state = groupsReducer(
        initialState,
        memberRoleChanged({ groupId: "grp_1", memberId: "m1", role: "admin" })
      );

      const group = state.groups.find((g) => g.id === "grp_1");
      const member = group?.members.find((m) => m.id === "m1");
      expect(member?.role).toBe("admin");
    });

    it("handles memberRemoved correctly", () => {
      const initialState = {
        groups: [mockGroup],
        status: "succeeded" as const,
        error: null,
      };

      const state = groupsReducer(
        initialState,
        memberRemoved({ groupId: "grp_1", memberId: "m1" })
      );

      const group = state.groups.find((g) => g.id === "grp_1");
      expect(group?.members).toHaveLength(0);
      expect(group?.memberCount).toBe(0);
    });
  });

  describe("notificationSlice", () => {
    it("handles notificationAdded and prepends with unread state", () => {
      const state = notificationReducer(
        { notifications: [] },
        notificationAdded({ title: "New Match", message: "Match scheduled tomorrow" })
      );

      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].title).toBe("New Match");
      expect(state.notifications[0].read).toBe(false);
      expect(state.notifications[0].id).toBeDefined();
    });

    it("handles notificationRead and markAllRead", () => {
      const n1 = { id: "n1", title: "N1", read: false, createdAt: "" };
      const n2 = { id: "n2", title: "N2", read: false, createdAt: "" };
      let state = { notifications: [n1, n2] };

      state = notificationReducer(state, notificationRead("n1"));
      expect(state.notifications.find((n) => n.id === "n1")?.read).toBe(true);
      expect(state.notifications.find((n) => n.id === "n2")?.read).toBe(false);

      state = notificationReducer(state, notificationsMarkedAllAsRead());
      expect(state.notifications.every((n) => n.read)).toBe(true);
    });

    it("handles notificationsCleared", () => {
      const state = notificationReducer(
        { notifications: [{ id: "n1", title: "N1", read: false, createdAt: "" }] },
        notificationsCleared()
      );
      expect(state.notifications).toHaveLength(0);
    });
  });
});
