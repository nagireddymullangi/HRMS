import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginRequest, RegisterRequest } from '../../types/auth.types';
import { authApi } from '../../api/authApi';
import { storage } from '../../utils/storage';

const initialState: AuthState = {
  user:            storage.getUser(),
  accessToken:     storage.getAccessToken(),
  refreshToken:    storage.getRefreshToken(),
  isAuthenticated: !!storage.getAccessToken(),
  isLoading:       false,
  error:           null,
};

export const loginUser = createAsyncThunk('auth/login', async (creds: LoginRequest, { rejectWithValue }) => {
  try {
    const res = await authApi.login(creds);
    if (res.success && res.data) {
      storage.setAccessToken(res.data.accessToken);
      storage.setRefreshToken(res.data.refreshToken);
      storage.setUser(res.data.user);
      return res.data;
    }
    return rejectWithValue(res.message);
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data: RegisterRequest, { rejectWithValue }) => {
  try {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      storage.setAccessToken(res.data.accessToken);
      storage.setRefreshToken(res.data.refreshToken);
      storage.setUser(res.data.user);
      return res.data;
    }
    return rejectWithValue(res.message);
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to fetch user');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await authApi.logout(); } catch {}
  storage.clearAuth();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null; state.accessToken = null;
      state.refreshToken = null; state.isAuthenticated = false;
      state.error = null; storage.clearAuth();
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken  = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      storage.setAccessToken(action.payload.accessToken);
      storage.setRefreshToken(action.payload.refreshToken);
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: builder => {
    // login
    builder
      .addCase(loginUser.pending,   s => { s.isLoading = true;  s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.isLoading = false; s.isAuthenticated = true;
        s.user = a.payload.user; s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    // register
    builder
      .addCase(registerUser.pending,   s => { s.isLoading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.isLoading = false; s.isAuthenticated = true;
        s.user = a.payload.user; s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
      })
      .addCase(registerUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.fulfilled, (s, a) => { if (a.payload) { s.user = a.payload; s.isAuthenticated = true; } })
      .addCase(fetchCurrentUser.rejected,  s      => { s.isAuthenticated = false; });
    // logout
    builder.addCase(logoutUser.fulfilled, s => {
      s.user = null; s.accessToken = null; s.refreshToken = null; s.isAuthenticated = false;
    });
  },
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;