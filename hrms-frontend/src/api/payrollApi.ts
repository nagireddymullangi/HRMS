import axiosInstance from './axiosConfig';
import { ApiResponse, PageResponse, PaginationParams } from '../types/common.types';

const URL = '/payroll';

export interface Payroll {
  id:             number;
  employeeId:     number;
  employeeName:   string;
  month:          number;
  year:           number;
  monthName:      string;
  basicSalary:    number;
  hra:            number;
  da:             number;
  allowances:     number;
  grossSalary:    number;
  pfDeduction:    number;
  esiDeduction:   number;
  tdsDeduction:   number;
  profTax:        number;
  totalDeductions:number;
  netSalary:      number;
  workingDays:    number;
  presentDays:    number;
  absentDays:     number;
  leaveDays:      number;
  status:         'PENDING' | 'PROCESSED' | 'PAID' | 'CANCELLED';
  paidOn?:        string;
  paymentMode?:   string;
  processedAt?:   string;
  createdAt:      string;
  deductions:     number;
  taxDeduction:   number;
}

export const payrollApi = {
  getAll: (params?: PaginationParams & {
    month?:        number;
    year?:         number;
    status?:       string;
    departmentId?: number;
    employeeId?:   number;
  }) =>
    axiosInstance
      .get<ApiResponse<PageResponse<Payroll>>>(URL, { params })
      .then((r) => r.data),

  getMyLatestPayroll: async () => {
    const response = await axiosInstance.get(`${URL}/me/latest`);
    return response.data;
  },

  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<Payroll>>(`${URL}/${id}`)
      .then((r) => r.data),

  process: (data: {
    month: number; year: number; remarks?: string;
    employeeIds?: number[];
  }) =>
    axiosInstance
      .post<ApiResponse<any>>(`${URL}/process`, data)
      .then((r) => r.data),

  markAsPaid: (id: number, data: {
    paidOn: string; paymentMode?: string; remarks?: string;
  }) =>
    axiosInstance
      .patch<ApiResponse<Payroll>>(`${URL}/${id}/mark-paid`, data)
      .then((r) => r.data),

  bulkMarkPaid: (
    month: number, year: number,
    data: { paidOn: string; paymentMode?: string }
  ) =>
    axiosInstance
      .patch<ApiResponse<string>>(
        `${URL}/bulk-mark-paid?month=${month}&year=${year}`, data
      )
      .then((r) => r.data),

  cancel: (id: number) =>
    axiosInstance
      .patch<ApiResponse<Payroll>>(`${URL}/${id}/cancel`)
      .then((r) => r.data),

  getPayslip: (employeeId: number, month: number, year: number) =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/payslip`, {
        params: { employeeId, month, year },
      })
      .then((r) => r.data),

  getHistory: (employeeId: number) =>
    axiosInstance
      .get<ApiResponse<Payroll[]>>(`${URL}/history/${employeeId}`)
      .then((r) => r.data),

  getSummary: (month: number, year: number) =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/summary`, {
        params: { month, year },
      })
      .then((r) => r.data),

  createSalaryStructure: (data: any) =>
    axiosInstance
      .post<ApiResponse<any>>(`${URL}/salary-structure`, data)
      .then((r) => r.data),

  getSalaryStructure: (employeeId: number) =>
    axiosInstance
      .get<ApiResponse<any>>(`${URL}/salary-structure/${employeeId}`)
      .then((r) => r.data),

  downloadPayslip: (id: number) =>
    axiosInstance
      .get(`${URL}/${id}/download`, { responseType: 'blob' })
      .then((r) => r.data),
};