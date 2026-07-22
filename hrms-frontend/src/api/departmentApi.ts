import axiosInstance from './axiosConfig';
import {
  Department, DepartmentRequest,
  Designation, DesignationRequest,
} from '../types/department.types';
import { ApiResponse, PageResponse, PaginationParams } from '../types/common.types';

const DEPT_URL  = '/departments';
const DESIG_URL = '/designations';

export const departmentApi = {
  getAll: (params?: PaginationParams & { isActive?: boolean }) =>
    axiosInstance
      .get<ApiResponse<PageResponse<Department>>>(DEPT_URL, { params })
      .then((r) => r.data),

  getAllList: () =>
    axiosInstance
      .get<ApiResponse<Department[]>>(`${DEPT_URL}/list`)
      .then((r) => r.data),

  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<Department>>(`${DEPT_URL}/${id}`)
      .then((r) => r.data),

  create: (data: DepartmentRequest) =>
    axiosInstance
      .post<ApiResponse<Department>>(DEPT_URL, data)
      .then((r) => r.data),

  update: (id: number, data: DepartmentRequest) =>
    axiosInstance
      .put<ApiResponse<Department>>(`${DEPT_URL}/${id}`, data)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete<ApiResponse<void>>(`${DEPT_URL}/${id}`)
      .then((r) => r.data),

  toggleStatus: (id: number) =>
    axiosInstance
      .patch<ApiResponse<Department>>(`${DEPT_URL}/${id}/toggle-status`)
      .then((r) => r.data),
};

export const designationApi = {
  getAll: (params?: PaginationParams & { departmentId?: number }) =>
    axiosInstance
      .get<ApiResponse<PageResponse<Designation>>>(DESIG_URL, { params })
      .then((r) => r.data),

  getByDepartment: (deptId: number) =>
    axiosInstance
      .get<ApiResponse<Designation[]>>(
        `${DESIG_URL}/department/${deptId}`
      )
      .then((r) => r.data),

  create: (data: DesignationRequest) =>
    axiosInstance
      .post<ApiResponse<Designation>>(DESIG_URL, data)
      .then((r) => r.data),

  update: (id: number, data: DesignationRequest) =>
    axiosInstance
      .put<ApiResponse<Designation>>(`${DESIG_URL}/${id}`, data)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete<ApiResponse<void>>(`${DESIG_URL}/${id}`)
      .then((r) => r.data),
};