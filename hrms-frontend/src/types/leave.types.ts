export type LeaveType   = 'ANNUAL' | 'SICK' | 'CASUAL' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'COMPENSATORY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
  id:             number;
  employeeId:     number;
  employeeName:   string;
  leaveType:      LeaveType;
  startDate:      string;
  endDate:        string;
  totalDays:      number;
  reason:         string;
  status:         LeaveStatus;
  approvedById?:  number;
  approvedByName?: string;
  approvalNote?:  string;
  appliedOn:      string;
  updatedAt:      string;
}

export interface LeaveRequest {
  employeeId: number;
  leaveType:  LeaveType;
  startDate:  string;
  endDate:    string;
  reason:     string;
}

export interface LeaveBalance {
  employeeId:  number;
  annual:      number;
  sick:        number;
  casual:      number;
  compensatory: number;
  used:        number;
  remaining:   number;
  
}

export interface LeaveState {
  leaves:        Leave[];
  leaveBalance:  LeaveBalance | null;
  totalElements: number;
  isLoading:     boolean;
  error:         string | null;
}
export interface LeaveBalanceCardProps {
  type:  LeaveType;
  total: number;
  used:  number;
}