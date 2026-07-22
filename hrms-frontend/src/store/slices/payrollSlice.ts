import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payrollApi, Payroll } from '../../api/payrollApi';

interface PayrollState {
  payrolls: Payroll[]; selectedPayroll: Payroll | null;
  totalElements: number; isLoading: boolean; error: string | null;
}

const initialState: PayrollState = {
  payrolls: [], selectedPayroll: null,
  totalElements: 0, isLoading: false, error: null,
};

export const fetchPayrolls = createAsyncThunk('payroll/fetchAll', async (params: any, { rejectWithValue }) => {
  try { return (await payrollApi.getAll(params)).data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const slice = createSlice({
  name: 'payroll', initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchPayrolls.pending,   s => { s.isLoading = true; s.error = null; })
      .addCase(fetchPayrolls.fulfilled, (s, a) => {
        s.isLoading = false;
        s.payrolls      = a.payload?.content      || [];
        s.totalElements = a.payload?.totalElements || 0;
      })
      .addCase(fetchPayrolls.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});
export default slice.reducer;