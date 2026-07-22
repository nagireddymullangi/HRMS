import axiosInstance from './axiosConfig';
import { Leave, LeaveRequest, LeaveBalance } from '../types/leave.types';
import { ApiResponse, PageResponse, PaginationParams } from '../types/common.types';

const URL = '/leaves';

export const leaveApi = {
  getAll: (params?: PaginationParams & {
    employeeId?:   number;
    status?:       string;
    leaveTypeId?:  number;
    departmentId?: number;
    startDate?:    string;
    endDate?:      string;
  }) =>
    axiosInstance
      .get<ApiResponse<PageResponse<Leave>>>(URL, { params })
      .then((r) => r.data),
  getMyLeaveBalance: async () => {
    const response = await axiosInstance.get('/leaves/me/balance');
    return response.data; 
  },
  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<Leave>>(`${URL}/${id}`)
      .then((r) => r.data),

  apply: (data: LeaveRequest) =>
    axiosInstance
      .post<ApiResponse<Leave>>(URL, data)
      .then((r) => r.data),

  approve: (id: number, note?: string) =>
    axiosInstance
      .patch<ApiResponse<Leave>>(`${URL}/${id}/approve`, {
        leaveId: id, approvalNote: note,
      })
      .then((r) => r.data),

  reject: (id: number, note: string) =>
    axiosInstance
      .patch<ApiResponse<Leave>>(`${URL}/${id}/reject`, {
        leaveId: id, approvalNote: note,
      })
      .then((r) => r.data),

  cancel: (id: number, employeeId: number) =>
    axiosInstance
      .patch<ApiResponse<Leave>>(
        `${URL}/${id}/cancel?employeeId=${employeeId}`
      )
      .then((r) => r.data),

  getPending: () =>
    axiosInstance
      .get<ApiResponse<Leave[]>>(`${URL}/pending`)
      .then((r) => r.data),

  getBalance: (employeeId: number, year: number) =>
    axiosInstance
      .get<ApiResponse<LeaveBalance>>(`${URL}/balance`, {
        params: { employeeId, year },
      })
      .then((r) => r.data),

  getSummary: () =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/summary`)
      .then((r) => r.data),

  getTypes: () =>
    axiosInstance
      .get<ApiResponse<any[]>>(`${URL}/types/active`)
      .then((r) => r.data),

  initializeBalance: (employeeId: number, year: number) =>
    axiosInstance
      .post<ApiResponse<void>>(
        `${URL}/balance/initialize?employeeId=${employeeId}&year=${year}`
      )
      .then((r) => r.data),
};