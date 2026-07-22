import * as yup from 'yup';

const pwd = yup
  .string()
  .min(8, 'At least 8 characters')
  .matches(/[A-Z]/,        'One uppercase letter')
  .matches(/[a-z]/,        'One lowercase letter')
  .matches(/[0-9]/,        'One number')
  .matches(/[@$!%*?&]/,   'One special character (@$!%*?&)')
  .required('Password is required');

export const loginSchema = yup.object({
  usernameOrEmail: yup.string().required('Username or email is required'),
  password:        yup.string().required('Password is required'),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

export const resetPasswordSchema = yup.object({
  newPassword: pwd,
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: pwd,
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const employeeSchema = yup.object({
  firstName:      yup.string().min(2).max(50).required('First name is required'),
  lastName:       yup.string().min(2).max(50).required('Last name is required'),
  email:          yup.string().email('Invalid email').required('Email is required'),
  phone:          yup.string()
    .matches(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number')
    .required('Phone is required'),
  gender:         yup.string().required('Gender is required'),
  dateOfBirth:    yup.string().required('Date of birth is required'),
  joiningDate:    yup.string().required('Joining date is required'),
  employmentType: yup.string().required('Employment type is required'),
  departmentId:   yup.number().required('Department is required'),
  designationId:  yup.number().required('Designation is required'),
});

export const departmentSchema = yup.object({
  name: yup.string().min(2).max(100).required('Department name is required'),
  code: yup.string().min(2).max(20).required('Department code is required'),
  description: yup.string().max(500).optional(),
});