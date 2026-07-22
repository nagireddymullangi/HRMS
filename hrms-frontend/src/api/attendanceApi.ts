import axiosInstance from './axiosConfig';
import {
  Attendance, AttendanceRequest, AttendanceSummary,
} from '../types/attendance.types';
import { ApiResponse, PageResponse, PaginationParams } from '../types/common.types';

const URL = '/attendance';

export const attendanceApi = {
  getAll: (params?: PaginationParams & {
    employeeId?:   number;
    month?:        number;
    year?:         number;
    status?:       string;
    departmentId?: number;
  }) =>
    axiosInstance
      .get<ApiResponse<PageResponse<Attendance>>>(URL, { params })
      .then((r) => r.data),
  getMyAttendance: async () => {
    const response = await axiosInstance.get(`${URL}/me`);
    return response.data;
  },
  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<Attendance>>(`${URL}/${id}`)
      .then((r) => r.data),

  checkIn: (employeeId: number, notes?: string) =>
    axiosInstance
      .post<ApiResponse<Attendance>>(`${URL}/check-in`, {
        employeeId, notes,
      })
      .then((r) => r.data),

  checkOut: (employeeId: number) =>
    axiosInstance
      .post<ApiResponse<Attendance>>(
        `${URL}/check-out?employeeId=${employeeId}`
      )
      .then((r) => r.data),

  create: (data: AttendanceRequest) =>
    axiosInstance
      .post<ApiResponse<Attendance>>(URL, data)
      .then((r) => r.data),

  update: (id: number, data: Partial<AttendanceRequest>) =>
    axiosInstance
      .put<ApiResponse<Attendance>>(`${URL}/${id}`, data)
      .then((r) => r.data),

  getSummary: (employeeId: number, month: number, year: number) =>
    axiosInstance
      .get<ApiResponse<AttendanceSummary>>(`${URL}/summary`, {
        params: { employeeId, month, year },
      })
      .then((r) => r.data),

  getTodayStatus: (employeeId: number) =>
    axiosInstance
      .get<ApiResponse<Attendance>>(`${URL}/today/${employeeId}`)
      .then((r) => r.data),

  getTodayOverview: () =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/today/overview`)
      .then((r) => r.data),

  getHolidays: (year: number) =>
    axiosInstance
      .get<ApiResponse<any[]>>(`${URL}/holidays`, { params: { year } })
      .then((r) => r.data),
};