import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { EmployeeState, EmployeeRequest } from '../../types/employee.types';
import { employeeApi } from '../../api/employeeApi';
import { PaginationParams } from '../../types/common.types';

const initialState: EmployeeState = {
  employees: [], selectedEmployee: null,
  totalElements: 0, totalPages: 0, currentPage: 0,
  isLoading: false, error: null,
};

export const fetchEmployees = createAsyncThunk('employee/fetchAll',
  async (params: PaginationParams & { status?: string; departmentId?: number }, { rejectWithValue }) => {
    try {
      const res = await employeeApi.getAll(params);
      return res.data;
    } catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed to fetch'); }
  });

export const fetchEmployeeById = createAsyncThunk('employee/fetchById',
  async (id: number, { rejectWithValue }) => {
    try { const res = await employeeApi.getById(id); return res.data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Not found'); }
  });

export const createEmployee = createAsyncThunk('employee/create',
  async (data: EmployeeRequest, { rejectWithValue }) => {
    try { const res = await employeeApi.create(data); return res.data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Create failed'); }
  });

export const updateEmployee = createAsyncThunk('employee/update',
  async ({ id, data }: { id: number; data: Partial<EmployeeRequest> }, { rejectWithValue }) => {
    try { const res = await employeeApi.update(id, data); return res.data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Update failed'); }
  });

export const deleteEmployee = createAsyncThunk('employee/delete',
  async (id: number, { rejectWithValue }) => {
    try { await employeeApi.delete(id); return id; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Delete failed'); }
  });

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearSelectedEmployee: s => { s.selectedEmployee = null; },
    clearError:            s => { s.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEmployees.pending,   s => { s.isLoading = true; s.error = null; })
      .addCase(fetchEmployees.fulfilled, (s, a) => {
        s.isLoading = false;
        s.employees     = a.payload?.content      || [];
        s.totalElements = a.payload?.totalElements || 0;
        s.totalPages    = a.payload?.totalPages    || 0;
        s.currentPage   = a.payload?.number        || 0;
      })
      .addCase(fetchEmployees.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    builder
      .addCase(fetchEmployeeById.pending,   s => { s.isLoading = true; })
      .addCase(fetchEmployeeById.fulfilled, (s, a) => { s.isLoading = false; s.selectedEmployee = a.payload || null; })
      .addCase(fetchEmployeeById.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    builder
      .addCase(createEmployee.fulfilled, (s, a) => {
        if (a.payload) s.employees.unshift(a.payload);
        s.totalElements += 1;
      })
      .addCase(updateEmployee.fulfilled, (s, a) => {
        if (a.payload) {
          const idx = s.employees.findIndex(e => e.id === a.payload!.id);
          if (idx !== -1) s.employees[idx] = a.payload;
          if (s.selectedEmployee?.id === a.payload.id) s.selectedEmployee = a.payload;
        }
      })
      .addCase(deleteEmployee.fulfilled, (s, a) => {
        s.employees     = s.employees.filter(e => e.id !== a.payload);
        s.totalElements -= 1;
      });
  },
});

export const { clearSelectedEmployee, clearError } = employeeSlice.actions;
export default employeeSlice.reducer;