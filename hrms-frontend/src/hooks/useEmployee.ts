import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch }   from '../store/store';
import {
  fetchEmployees, fetchEmployeeById,
  createEmployee, updateEmployee, deleteEmployee,
  clearSelectedEmployee,
} from '../store/slices/employeeSlice';
import { EmployeeRequest } from '../types/employee.types';
import { PaginationParams } from '../types/common.types';

export const useEmployee = () => {
  const dispatch      = useDispatch<AppDispatch>();
  const employeeState = useSelector((s: RootState) => s.employee);

  return {
    ...employeeState,
    fetchAll:    (p?: PaginationParams & { status?: string; departmentId?: number }) =>
                    dispatch(fetchEmployees(p || {})),
    fetchById:   (id: number)                    => dispatch(fetchEmployeeById(id)),
    create:      (data: EmployeeRequest)          => dispatch(createEmployee(data)),
    update:      (id: number, data: Partial<EmployeeRequest>) =>
                    dispatch(updateEmployee({ id, data })),
    remove:      (id: number)                    => dispatch(deleteEmployee(id)),
    clearSelected: ()                            => dispatch(clearSelectedEmployee()),
  };
};