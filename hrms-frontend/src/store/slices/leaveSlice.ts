import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LeaveState, LeaveRequest } from '../../types/leave.types';
import { leaveApi } from '../../api/leaveApi';

const initialState: LeaveState = {
  leaves: [], leaveBalance: null,
  totalElements: 0, isLoading: false, error: null,
};

export const fetchLeaves = createAsyncThunk('leave/fetchAll', async (params: any, { rejectWithValue }) => {
  try { return (await leaveApi.getAll(params)).data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const applyLeave = createAsyncThunk('leave/apply', async (data: LeaveRequest, { rejectWithValue }) => {
  try { return (await leaveApi.apply(data)).data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Apply failed'); }
});

export const approveLeave = createAsyncThunk('leave/approve', async ({ id, note }: { id: number; note?: string }, { rejectWithValue }) => {
  try { return (await leaveApi.approve(id, note)).data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Approve failed'); }
});

export const rejectLeave = createAsyncThunk('leave/reject', async ({ id, note }: { id: number; note: string }, { rejectWithValue }) => {
  try { return (await leaveApi.reject(id, note)).data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Reject failed'); }
});

export const fetchLeaveBalance = createAsyncThunk('leave/fetchBalance',
  async ({ employeeId, year }: { employeeId: number; year: number }, { rejectWithValue }) => {
    try { return (await leaveApi.getBalance(employeeId, year)).data; }
    catch (e: any) { return rejectWithValue('Failed to fetch balance'); }
  });

const slice = createSlice({
  name: 'leave', initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchLeaves.pending,   s => { s.isLoading = true; s.error = null; })
      .addCase(fetchLeaves.fulfilled, (s, a) => {
        s.isLoading = false;
        s.leaves        = a.payload?.content      || [];
        s.totalElements = a.payload?.totalElements || 0;
      })
      .addCase(fetchLeaves.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    builder.addCase(fetchLeaveBalance.fulfilled, (s, a) => { s.leaveBalance = a.payload || null; });
    builder.addCase(applyLeave.fulfilled, (s, a) => { if (a.payload) s.leaves.unshift(a.payload); });
    builder.addCase(approveLeave.fulfilled, (s, a) => {
      if (a.payload) { const i = s.leaves.findIndex(l => l.id === a.payload!.id); if (i !== -1) s.leaves[i] = a.payload; }
    });
    builder.addCase(rejectLeave.fulfilled, (s, a) => {
      if (a.payload) { const i = s.leaves.findIndex(l => l.id === a.payload!.id); if (i !== -1) s.leaves[i] = a.payload; }
    });
  },
});
export default slice.reducer;