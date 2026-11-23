import { apiClient } from "@/services/api-client";
import type { ApiResponse, Paginated, SportsGroup, GroupRolePermissions, PCMADashboardData } from "@/types";

export interface GroupQuery {
  category?: string;
}

export interface GroupsService {
  list(query?: GroupQuery): Promise<ApiResponse<Paginated<SportsGroup>>>;
  getById(id: string): Promise<ApiResponse<SportsGroup>>;
  create(input: unknown): Promise<ApiResponse<SportsGroup>>;
  addMember(groupId: string, input: unknown): Promise<ApiResponse<SportsGroup>>;
  removeMember(groupId: string, memberId: string): Promise<ApiResponse<void>>;
  updateMemberRole(groupId: string, memberId: string, role: string): Promise<ApiResponse<void>>;
  updatePermissions(groupId: string, permissions: GroupRolePermissions): Promise<ApiResponse<SportsGroup>>;
  updatePcmaSettings(groupId: string, data: { is_pcma_enabled: boolean; assigned_doctor_email?: string }): Promise<ApiResponse<SportsGroup>>;
  getMedicalDashboard(groupId: string): Promise<ApiResponse<PCMADashboardData>>;
  submitQuestionnaire(groupId: string, data: any): Promise<ApiResponse<any>>;
  getClinicalDetails(groupId: string, playerId: string): Promise<ApiResponse<any>>;
  submitAssessment(groupId: string, data: any): Promise<ApiResponse<any>>;
  verifyCertificate(certificateId: string): Promise<ApiResponse<any>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

export const groupsService: GroupsService = {
  list: async (query) => {
    const { data } = await apiClient.get("/api/v1/sports/groups", { params: query });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/api/v1/sports/groups/${id}`);
    return data;
  },
  create: async (input) => {
    const { data } = await apiClient.post("/api/v1/sports/groups", input);
    return data;
  },
  addMember: async (groupId, input) => {
    const { data } = await apiClient.post(`/api/v1/sports/groups/${groupId}/members`, input);
    return data;
  },
  removeMember: async (groupId, memberId) => {
    const { data } = await apiClient.delete(`/api/v1/sports/groups/${groupId}/members/${memberId}`);
    return data;
  },
  updateMemberRole: async (groupId, memberId, role) => {
    const { data } = await apiClient.put(`/api/v1/sports/groups/${groupId}/members/${memberId}/role`, { role });
    return data;
  },
  updatePermissions: async (groupId, permissions) => {
    const { data } = await apiClient.patch(`/api/v1/sports/groups/${groupId}/permissions`, {
      role_permissions: permissions,
    });
    return data;
  },
  updatePcmaSettings: async (groupId, settings) => {
    const { data } = await apiClient.patch(`/api/v1/sports/groups/${groupId}/pcma-settings`, settings);
    return data;
  },
  getMedicalDashboard: async (groupId) => {
    const { data } = await apiClient.get(`/api/v1/sports/groups/${groupId}/medical-dashboard`);
    return data;
  },
  submitQuestionnaire: async (groupId, questionnaireData) => {
    const { data } = await apiClient.post(`/api/v1/sports/groups/${groupId}/pcma/questionnaire`, questionnaireData);
    return data;
  },
  getClinicalDetails: async (groupId, playerId) => {
    const { data } = await apiClient.get(`/api/v1/sports/groups/${groupId}/pcma/player/${playerId}/clinical`);
    return data;
  },
  submitAssessment: async (groupId, assessmentData) => {
    const { data } = await apiClient.post(`/api/v1/sports/groups/${groupId}/pcma/assessments`, assessmentData);
    return data;
  },
  verifyCertificate: async (certificateId) => {
    const { data } = await apiClient.get(`/api/v1/sports/pcma/certificates/${certificateId}/verify`);
    return data;
  },
  delete: async (id) => {
    const { data } = await apiClient.delete(`/api/v1/sports/groups/${id}`);
    return data;
  },
};

