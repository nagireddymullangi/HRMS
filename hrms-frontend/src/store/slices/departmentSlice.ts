import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DepartmentState, DepartmentRequest } from '../../types/department.types';
import { departmentApi } from '../../api/departmentApi';

const initialState: DepartmentState = {
  departments: [], designations: [], selectedDepartment: null,
  totalElements: 0, isLoading: false, error: null,
};

export const fetchDepartments = createAsyncThunk('department/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await departmentApi.getAll(params); return res.data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchDepartmentList = createAsyncThunk('department/fetchList', async (_, { rejectWithValue }) => {
  try { const res = await departmentApi.getAllList(); return res.data; }
  catch (e: any) { return rejectWithValue('Failed to fetch department list'); }
});

export const createDepartment = createAsyncThunk('department/create', async (data: DepartmentRequest, { rejectWithValue }) => {
  try { const res = await departmentApi.create(data); return res.data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Create failed'); }
});

export const updateDepartment = createAsyncThunk('department/update',
  async ({ id, data }: { id: number; data: DepartmentRequest }, { rejectWithValue }) => {
    try { const res = await departmentApi.update(id, data); return res.data; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Update failed'); }
  });

export const deleteDepartment = createAsyncThunk('department/delete', async (id: number, { rejectWithValue }) => {
  try { await departmentApi.delete(id); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Delete failed'); }
});

const departmentSlice = createSlice({
  name: 'department', initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchDepartments.pending,   s => { s.isLoading = true; s.error = null; })
      .addCase(fetchDepartments.fulfilled, (s, a) => {
        s.isLoading = false;
        s.departments   = a.payload?.content      || [];
        s.totalElements = a.payload?.totalElements || 0;
      })
      .addCase(fetchDepartments.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    builder.addCase(fetchDepartmentList.fulfilled, (s, a) => { s.departments = a.payload || []; });

    builder.addCase(createDepartment.fulfilled, (s, a) => {
      if (a.payload) { s.departments.unshift(a.payload); s.totalElements += 1; }
    });
    builder.addCase(updateDepartment.fulfilled, (s, a) => {
      if (a.payload) { const i = s.departments.findIndex(d => d.id === a.payload!.id); if (i !== -1) s.departments[i] = a.payload; }
    });
    builder.addCase(deleteDepartment.fulfilled, (s, a) => {
      s.departments = s.departments.filter(d => d.id !== a.payload); s.totalElements -= 1;
    });
  },
});
export const { clearError } = departmentSlice.actions;
export default departmentSlice.reducer;