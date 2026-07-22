import axiosInstance from './axiosConfig';
import { ApiResponse, PageResponse, PaginationParams } from '../types/common.types';

const URL = '/performance';

export const performanceApi = {
  // ── Cycles ───────────────────────────────────────
  getCycles: (year?: number) =>
    axiosInstance
      .get<ApiResponse<any[]>>(`${URL}/cycles`, {
        params: year ? { year } : {},
      })
      .then((r) => r.data),

  getCycleById: (id: number) =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/cycles/${id}`)
      .then((r) => r.data),

  createCycle: (data: any) =>
    axiosInstance
      .post<ApiResponse<any>>(`${URL}/cycles`, data)
      .then((r) => r.data),

  updateCycleStatus: (id: number, status: string) =>
    axiosInstance
      .patch<ApiResponse<any>>(
        `${URL}/cycles/${id}/status?status=${status}`
      )
      .then((r) => r.data),

  // ── Goals ────────────────────────────────────────
  getGoals: (employeeId: number, cycleId?: number) =>
    axiosInstance
      .get<ApiResponse<any[]>>(`${URL}/goals`, {
        params: { employeeId, cycleId },
      })
      .then((r) => r.data),

  createGoal: (data: any) =>
    axiosInstance
      .post<ApiResponse<any>>(`${URL}/goals`, data)
      .then((r) => r.data),

  updateGoal: (id: number, data: any) =>
    axiosInstance
      .put<ApiResponse<any>>(`${URL}/goals/${id}`, data)
      .then((r) => r.data),

  deleteGoal: (id: number) =>
    axiosInstance
      .delete<ApiResponse<void>>(`${URL}/goals/${id}`)
      .then((r) => r.data),

  // ── Reviews ──────────────────────────────────────
  getReviews: (params?: PaginationParams & {
    cycleId?:      number;
    status?:       string;
    employeeId?:   number;
    departmentId?: number;
  }) =>
    axiosInstance
      .get<ApiResponse<PageResponse<any>>>(`${URL}/reviews`, { params })
      .then((r) => r.data),

  getReviewById: (id: number) =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/reviews/${id}`)
      .then((r) => r.data),

  initiateReview: (data: any) =>
    axiosInstance
      .post<ApiResponse<any>>(`${URL}/reviews/initiate`, data)
      .then((r) => r.data),

  submitSelfAssessment: (id: number, data: any) =>
    axiosInstance
      .patch<ApiResponse<any>>(
        `${URL}/reviews/${id}/self-assessment`, data
      )
      .then((r) => r.data),

  submitManagerReview: (id: number, data: any) =>
    axiosInstance
      .patch<ApiResponse<any>>(
        `${URL}/reviews/${id}/manager-review`, data
      )
      .then((r) => r.data),

  // ── Summary ──────────────────────────────────────
  getSummary: () =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/summary`)
      .then((r) => r.data),
};