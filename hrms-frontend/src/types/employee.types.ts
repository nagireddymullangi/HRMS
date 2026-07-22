export type Gender         = 'MALE' | 'FEMALE' | 'OTHER';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
export type BloodGroup     = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MaritalStatus  = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

export interface Address {
  street:  string;
  city:    string;
  state:   string;
  country: string;
  zipCode: string;
}

export interface EmergencyContact {
  name:         string;
  relationship: string;
  phone:        string;
  email?:       string;
}

export interface Employee {
  id:              number;
  employeeId:      string;
  firstName:       string;
  lastName:        string;
  fullName:        string;
  email:           string;
  phone:           string;
  gender:          Gender;
  dateOfBirth:     string;
  joiningDate:     string;
  status:          EmployeeStatus;
  employmentType:  EmploymentType;
  departmentId:    number;
  departmentName:  string;
  designationId:   number;
  designationName: string;
  managerId?:      number;
  managerName?:    string;
  profilePicture?: string;
  address?:        Address;
  emergencyContact?: EmergencyContact;
  bloodGroup?:     BloodGroup;
  maritalStatus?:  MaritalStatus;
  userId?:         number;
  salary?:         number;
  createdAt:       string;
  updatedAt:       string;
}

export interface EmployeeRequest {
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string;
  gender:          Gender;
  dateOfBirth:     string;
  joiningDate:     string;
  employmentType:  EmploymentType;
  departmentId:    number;
  designationId:   number;
  managerId?:      number;
  bloodGroup?:     BloodGroup;
  maritalStatus?:  MaritalStatus;
  salary?:         number;
  address?:        Address;
  emergencyContact?: EmergencyContact;
}

export interface EmployeeState {
  employees:     Employee[];
  selectedEmployee: Employee | null;
  totalElements: number;
  totalPages:    number;
  currentPage:   number;
  isLoading:     boolean;
  error:         string | null;
}