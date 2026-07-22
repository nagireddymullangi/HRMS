import { Role } from '../types/auth.types';

export const ROUTES = {
  LOGIN:           '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD:  '/reset-password',
  UNAUTHORIZED:    '/unauthorized',
  DASHBOARD:       '/dashboard',
  EMPLOYEES:       '/employees',
  EMPLOYEE_ADD:    '/employees/add',
  EMPLOYEE_EDIT:   '/employees/edit/:id',
  EMPLOYEE_VIEW:   '/employees/:id',
  DEPARTMENTS:     '/departments',
  ATTENDANCE:      '/attendance',
  LEAVES:          '/leaves',
  PAYROLL:         '/payroll',
  PERFORMANCE:     '/performance',
  REPORTS:         '/reports',
  SETTINGS:        '/settings',
  PROFILE:         '/profile',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  HR_ADMIN:    'HR Admin',
  HR_MANAGER:  'HR Manager',
  EMPLOYEE:    'Employee',
};

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'red',
  HR_ADMIN:    'orange',
  HR_MANAGER:  'blue',
  EMPLOYEE:    'green',
};

export const EMPLOYEE_STATUS_COLORS: Record<string, string> = {
  ACTIVE:     'success',
  INACTIVE:   'default',
  TERMINATED: 'error',
  ON_LEAVE:   'warning',
};

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  PRESENT:  'success',
  ABSENT:   'error',
  HALF_DAY: 'warning',
  LATE:     'orange',
  ON_LEAVE: 'processing',
  HOLIDAY:  'purple',
  WEEKEND:  'default',
};

export const LEAVE_STATUS_COLORS: Record<string, string> = {
  PENDING:   'warning',
  APPROVED:  'success',
  REJECTED:  'error',
  CANCELLED: 'default',
};

export const LEAVE_TYPE_COLORS: Record<string, string> = {
  ANNUAL:       'blue',
  SICK:         'red',
  CASUAL:       'green',
  MATERNITY:    'pink',
  PATERNITY:    'cyan',
  UNPAID:       'default',
  COMPENSATORY: 'purple',
};

export const PAGE_SIZE         = 10;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
export const DATE_FORMAT         = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD-MM-YYYY';
export const DATETIME_FORMAT     = 'DD MMM YYYY HH:mm';

export const GENDER_OPTIONS = [
  { label: 'Male',   value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other',  value: 'OTHER' },
];

export const BLOOD_GROUP_OPTIONS = [
  { label: 'A+',  value: 'A+' },
  { label: 'A-',  value: 'A-' },
  { label: 'B+',  value: 'B+' },
  { label: 'B-',  value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+',  value: 'O+' },
  { label: 'O-',  value: 'O-' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: 'Full Time', value: 'FULL_TIME' },
  { label: 'Part Time', value: 'PART_TIME' },
  { label: 'Contract',  value: 'CONTRACT' },
  { label: 'Intern',    value: 'INTERN' },
];

export const MARITAL_STATUS_OPTIONS = [
  { label: 'Single',   value: 'SINGLE' },
  { label: 'Married',  value: 'MARRIED' },
  { label: 'Divorced', value: 'DIVORCED' },
  { label: 'Widowed',  value: 'WIDOWED' },
];

export const LEAVE_TYPE_OPTIONS = [
  { label: 'Annual Leave',       value: 'ANNUAL' },
  { label: 'Sick Leave',         value: 'SICK' },
  { label: 'Casual Leave',       value: 'CASUAL' },
  { label: 'Maternity Leave',    value: 'MATERNITY' },
  { label: 'Paternity Leave',    value: 'PATERNITY' },
  { label: 'Unpaid Leave',       value: 'UNPAID' },
  { label: 'Compensatory Leave', value: 'COMPENSATORY' },
];

export const APP_NAME    = 'HRMS Portal';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'POTLA TECH SOLUTIONS PVT LTD';

export const SIDEBAR_MENU_ITEMS = [
  {
    key:   '/dashboard',
    label: 'Dashboard',
    icon:  'DashboardOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE],
  },
  {
    key:   '/employees',
    label: 'Employees',
    icon:  'TeamOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER],
  },
  {
    key:   '/departments',
    label: 'Departments',
    icon:  'ApartmentOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER],
  },
  {
    key:   '/attendance',
    label: 'Attendance',
    icon:  'ClockCircleOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE],
  },
  {
    key:   '/leaves',
    label: 'Leave',
    icon:  'CalendarOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE],
  },
  {
    key:   '/payroll',
    label: 'Payroll',
    icon:  'DollarOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER],
  },
  {
    key:   '/performance',
    label: 'Performance',
    icon:  'TrophyOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE],
  },
  {
    key:   '/reports',
    label: 'Reports',
    icon:  'BarChartOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER],
  },
  {
    key:   '/settings',
    label: 'Settings',
    icon:  'SettingOutlined',
    roles: [Role.SUPER_ADMIN, Role.HR_ADMIN],
  },
];