import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AttendanceState, AttendanceRequest } from '../../types/attendance.types';
import { attendanceApi } from '../../api/attendanceApi';

const initialState: AttendanceState = {
  attendances: [], summary: null,
  totalElements: 0, isLoading: false, error: null,
};

export const fetchAttendances = createAsyncThunk('attendance/fetchAll', async (params: any, { rejectWithValue }) => {
  try { const res = await attendanceApi.getAll(params); return res.data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const checkIn  = createAsyncThunk('attendance/checkIn',  async (empId: number, { rejectWithValue }) => {
  try { return (await attendanceApi.checkIn(empId)).data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Check-in failed'); }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (empId: number, { rejectWithValue }) => {
  try { return (await attendanceApi.checkOut(empId)).data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Check-out failed'); }
});

export const fetchSummary = createAsyncThunk('attendance/fetchSummary',
  async ({ empId, month, year }: { empId: number; month: number; year: number }, { rejectWithValue }) => {
    try { return (await attendanceApi.getSummary(empId, month, year)).data; }
    catch (e: any) { return rejectWithValue('Failed to fetch summary'); }
  });

const slice = createSlice({
  name: 'attendance', initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchAttendances.pending,   s => { s.isLoading = true; s.error = null; })
      .addCase(fetchAttendances.fulfilled, (s, a) => {
        s.isLoading = false;
        s.attendances   = a.payload?.content      || [];
        s.totalElements = a.payload?.totalElements || 0;
      })
      .addCase(fetchAttendances.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    builder.addCase(fetchSummary.fulfilled, (s, a) => { s.summary = a.payload || null; });
  },
});
export default slice.reducer;