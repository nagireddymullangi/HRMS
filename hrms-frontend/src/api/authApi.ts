import axiosInstance from './axiosConfig';
import {
  LoginRequest, RegisterRequest, ForgotPasswordRequest,
  ResetPasswordRequest, ChangePasswordRequest,
  AuthResponse, UserInfo,
} from '../types/auth.types';
import { ApiResponse } from '../types/common.types';

const URL = '/auth';

export const authApi = {
  login:           (d: LoginRequest)          => axiosInstance.post<ApiResponse<AuthResponse>>(`${URL}/login`, d).then(r => r.data),
  register:        (d: RegisterRequest)        => axiosInstance.post<ApiResponse<AuthResponse>>(`${URL}/register`, d).then(r => r.data),
  logout:          ()                          => axiosInstance.post<ApiResponse<void>>(`${URL}/logout`).then(r => r.data),
  getMe:           ()                          => axiosInstance.get<ApiResponse<UserInfo>>(`${URL}/me`).then(r => r.data),
  forgotPassword:  (d: ForgotPasswordRequest)  => axiosInstance.post<ApiResponse<void>>(`${URL}/forgot-password`, d).then(r => r.data),
  resetPassword:   (d: ResetPasswordRequest)   => axiosInstance.post<ApiResponse<void>>(`${URL}/reset-password`, d).then(r => r.data),
  changePassword:  (d: ChangePasswordRequest)  => axiosInstance.post<ApiResponse<void>>(`${URL}/change-password`, d).then(r => r.data),
  refreshToken:    (token: string)             =>
    axiosInstance.post<ApiResponse<AuthResponse>>(`${URL}/refresh-token`, null, {
      headers: { 'Refresh-Token': token },
    }).then(r => r.data),
};