import { useSelector, useDispatch } from 'react-redux';
import { useNavigate }              from 'react-router-dom';
import { RootState, AppDispatch }   from '../store/store';
import { loginUser, logoutUser, registerUser, clearError } from '../store/slices/authSlice';
import { LoginRequest, RegisterRequest, Role } from '../types/auth.types';
import { ROUTES } from '../constants';

export const useAuth = () => {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const authState = useSelector((s: RootState) => s.auth);

  const login = async (creds: LoginRequest) => {
    const result = await dispatch(loginUser(creds));
    if (loginUser.fulfilled.match(result)) { navigate(ROUTES.DASHBOARD); return true; }
    return false;
  };

  const register = async (data: RegisterRequest) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) { navigate(ROUTES.DASHBOARD); return true; }
    return false;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  const hasRole  = (roles: Role[]) => !!authState.user && roles.includes(authState.user.role);
  const isAdmin  = hasRole([Role.SUPER_ADMIN, Role.HR_ADMIN]);
  const isHR     = hasRole([Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]);
  const isEmployee = authState.user?.role === Role.EMPLOYEE;

  return {
    ...authState,
    login, register, logout,
    clearAuthError: () => dispatch(clearError()),
    hasRole, isAdmin, isHR, isEmployee,
  };
};