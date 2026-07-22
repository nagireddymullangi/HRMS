export interface Department {
  id:                   number;
  name:                 string;
  code:                 string;
  description?:         string;
  headId?:              number;
  headName?:            string;
  parentDepartmentId?:  number;
  parentDepartmentName?: string;
  employeeCount:        number;
  active:             boolean;
  createdAt:            string;
}

export interface DepartmentRequest {
  name:                string;
  code:                string;
  description?:        string;
  headId?:             number;
  parentDepartmentId?: number;
  isActive:            boolean;
}

export interface Designation {
  id:             number;
  title:          string;
  code:           string;
  departmentId:   number;
  departmentName: string;
  description?:   string;
  level:          number;
  isActive:       boolean;
}

export interface DesignationRequest {
  title:        string;
  code:         string;
  departmentId: number;
  description?: string;
  level:        number;
  isActive:     boolean;
}

export interface DepartmentState {
  departments:        Department[];
  designations:       Designation[];
  selectedDepartment: Department | null;
  totalElements:      number;
  isLoading:          boolean;
  error:              string | null;
}