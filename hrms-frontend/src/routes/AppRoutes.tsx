import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from './ProtectedRoute';
import MainLayout     from '../components/layout/MainLayout';
import { ROUTES }     from '../constants';
import { Role }       from '../types/auth.types';
import { useAuth }    from '../hooks/useAuth';

// Lazy Loaded Pages
const Login          = lazy(() => import('../pages/Auth/Login'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('../pages/Auth/ResetPassword'));
const Unauthorized   = lazy(() => import('../pages/Auth/Unauthorized'));
const Dashboard      = lazy(() => import('../pages/Dashboard/Dashboard'));
const EmployeeList   = lazy(() => import('../pages/Employee/EmployeeList'));
const EmployeeForm   = lazy(() => import('../pages/Employee/EmployeeForm'));
const EmployeeDetail = lazy(() => import('../pages/Employee/EmployeeDetail'));
const DepartmentList = lazy(() => import('../pages/Department/DepartmentList'));
const AttendanceList = lazy(() => import('../pages/Attendance/AttendanceList'));
const LeaveList      = lazy(() => import('../pages/Leave/LeaveList'));
const PayrollList    = lazy(() => import('../pages/Payroll/PayrollList'));
const Settings       = lazy(() => import('../pages/Settings/Settings'));

const Fallback = () => <LoadingSpinner fullPage tip="Loading page..." />;

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN}
          element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD}  element={<ResetPassword />} />
        <Route path={ROUTES.UNAUTHORIZED}    element={<Unauthorized />} />

        {/* Protected + Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

            {/* Employee */}
            <Route path="/employees" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE]} />}>
              <Route index       element={<EmployeeList />} />
              <Route path="add"  element={<EmployeeForm />} />
              <Route path="edit/:id" element={<EmployeeForm />} />
              <Route path=":id"  element={<EmployeeDetail />} />
            </Route>

            {/* Department */}
            <Route path="/departments" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER]} />}>
              <Route index element={<DepartmentList />} />
            </Route>

            <Route path={ROUTES.ATTENDANCE}  element={<AttendanceList />} />
            <Route path={ROUTES.LEAVES}      element={<LeaveList />} />

            {/* Payroll */}
            <Route path="/payroll" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER,Role.EMPLOYEE]} />}>
              <Route index element={<PayrollList />} />
            </Route>

            {/* Settings */}
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.HR_ADMIN]} />}>
              <Route index element={<Settings />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
};
export default AppRoutes;