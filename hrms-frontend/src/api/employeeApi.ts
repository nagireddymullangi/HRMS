import axiosInstance from './axiosConfig';
import { Employee, EmployeeRequest } from '../types/employee.types';
import { ApiResponse, PageResponse, PaginationParams } from '../types/common.types';

const URL = '/employees';

export const employeeApi = {
  // ── GET ALL ──────────────────────────────────────
  getAll: (params?: PaginationParams & {
    status?:         string;
    departmentId?:   number;
    employmentType?: string;
    gender?:         string;
  }) =>
    axiosInstance
      .get<ApiResponse<PageResponse<Employee>>>(URL, { params })
      .then((r) => r.data),

  // ── GET BY ID ────────────────────────────────────
  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<Employee>>(`${URL}/${id}`)
      .then((r) => r.data),

  // ── CREATE ───────────────────────────────────────
  create: (data: EmployeeRequest) =>
    axiosInstance
      .post<ApiResponse<Employee>>(URL, data)
      .then((r) => r.data),

  // ── UPDATE ───────────────────────────────────────
  update: (id: number, data: Partial<EmployeeRequest>) =>
    axiosInstance
      .put<ApiResponse<Employee>>(`${URL}/${id}`, data)
      .then((r) => r.data),

  // ── DELETE ───────────────────────────────────────
  delete: (id: number) =>
    axiosInstance
      .delete<ApiResponse<void>>(`${URL}/${id}`)
      .then((r) => r.data),

  // ── UPDATE STATUS ────────────────────────────────
  updateStatus: (id: number, status: string) =>
    axiosInstance
      .patch<ApiResponse<Employee>>(`${URL}/${id}/status`, { status })
      .then((r) => r.data),

  // ── UPLOAD PHOTO ─────────────────────────────────
  uploadPhoto: (id: number, file: FormData) =>
    axiosInstance
      .post<ApiResponse<string>>(`${URL}/${id}/photo`, file, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  // ── BY DEPARTMENT ─────────────────────────────────
  getByDepartment: (deptId: number) =>
    axiosInstance
      .get<ApiResponse<Employee[]>>(`${URL}/department/${deptId}`)
      .then((r) => r.data),

  // ── SEARCH ───────────────────────────────────────
  search: (q: string) =>
    axiosInstance
      .get<ApiResponse<Employee[]>>(`${URL}/search`, { params: { q } })
      .then((r) => r.data),

  // ── DASHBOARD STATS ───────────────────────────────
  getDashboardStats: () =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/stats/dashboard`)
      .then((r) => r.data),

  // ── EXPORT ───────────────────────────────────────
  exportExcel: () =>
    axiosInstance
      .get(`${URL}/export`, { responseType: 'blob' })
      .then((r) => r.data),
};