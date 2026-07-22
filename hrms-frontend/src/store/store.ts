import { configureStore } from '@reduxjs/toolkit';
import authReducer       from './slices/authSlice';
import employeeReducer   from './slices/employeeSlice';
import departmentReducer from './slices/departmentSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer      from './slices/leaveSlice';
import payrollReducer    from './slices/payrollSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    employee:   employeeReducer,
    department: departmentReducer,
    attendance: attendanceReducer,
    leave:      leaveReducer,
    payroll:    payrollReducer,
  },
  middleware: gDM => gDM({ serializableCheck: false }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;