export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND';

export interface Attendance {
  id:           number;
  employeeId:   number;
  employeeName: string;
  date:         string;
  checkIn?:     string;
  checkOut?:    string;
  status:       AttendanceStatus;
  workHours?:   number;
  overtime?:    number;
  notes?:       string;
  createdAt:    string;
}

export interface AttendanceRequest {
  employeeId: number;
  date:       string;
  checkIn?:   string;
  checkOut?:  string;
  status:     AttendanceStatus;
  notes?:     string;
}

export interface AttendanceSummary {
  employeeId:    number;
  employeeName:  string;
  month:         number;
  year:          number;
  totalDays:     number;
  presentDays:   number;
  absentDays:    number;
  halfDays:      number;
  lateDays:      number;
  leaveDays:     number;
  holidays:      number;
  totalWorkHours: number;
  overtimeHours: number;
}

export interface AttendanceState {
  attendances:   Attendance[];
  summary:       AttendanceSummary | null;
  totalElements: number;
  isLoading:     boolean;
  error:         string | null;
}