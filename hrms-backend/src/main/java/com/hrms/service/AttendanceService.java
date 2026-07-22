
//com/hrms/service/AttendanceService.java
package com.hrms.service;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.enums.AttendanceStatus;
import com.hrms.exception.*;
import com.hrms.mapper.AttendanceMapper;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AttendanceService {

 private final AttendanceRepository  attendanceRepository;
 private final EmployeeRepository    employeeRepository;
 private final HolidayRepository     holidayRepository;
 private final AttendanceMapper      attendanceMapper;

 // ── Standard work start time (9:00 AM) ────────
 private static final LocalTime STANDARD_START = LocalTime.of(9, 0);
 private static final LocalTime LATE_THRESHOLD  = LocalTime.of(9, 15);

 // ═══════════════════════════════════════════════
 // GET ALL (Paginated + Filtered)
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public Page<AttendanceResponse> getAllAttendances(
         int page, int size,
         Long employeeId, Integer month,
         Integer year, AttendanceStatus status,
         Long departmentId, String search) {

     Pageable pageable = PageRequest.of(page, size);

     Page<Attendance> attendancePage =
             attendanceRepository.findAttendances(
                     employeeId, month, year,
                     status, departmentId, search, pageable);

     return attendancePage.map(attendanceMapper::toResponse);
 }

 // ═══════════════════════════════════════════════
 // GET BY ID
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public AttendanceResponse getById(Long id) {
     Attendance attendance = attendanceRepository
             .findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Attendance not found: " + id));
     return attendanceMapper.toResponse(attendance);
 }

 // ═══════════════════════════════════════════════
 // GET TODAY STATUS (for employee)
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public AttendanceResponse getTodayStatus(Long employeeId) {
     LocalDate today = LocalDate.now();
     return attendanceRepository
             .findByEmployeeIdAndDate(employeeId, today)
             .map(attendanceMapper::toResponse)
             .orElse(null);
 }

 // ═══════════════════════════════════════════════
 // CHECK IN
 // ═══════════════════════════════════════════════
 public AttendanceResponse checkIn(CheckInRequest request) {
     LocalDate today = LocalDate.now();
     LocalTime now   = LocalTime.now();

     // Validate employee exists
     Employee employee = employeeRepository
             .findById(request.getEmployeeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee not found: " + request.getEmployeeId()));

     // Check if already checked in
     if (attendanceRepository.existsByEmployeeIdAndDate(
             request.getEmployeeId(), today)) {
         throw new BadRequestException(
                 "Already checked in today");
     }

     // Check if holiday
     if (holidayRepository.existsByDate(today)) {
         throw new BadRequestException(
                 "Today is a public holiday");
     }

     // Check if weekend
     DayOfWeek day = today.getDayOfWeek();
     if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
         throw new BadRequestException(
                 "Today is a weekend");
     }

     // Determine status (PRESENT or LATE)
     AttendanceStatus status = now.isAfter(LATE_THRESHOLD)
             ? AttendanceStatus.LATE
             : AttendanceStatus.PRESENT;

     Attendance attendance = Attendance.builder()
         .employee(employee)
         .date(today)
         .checkIn(now)
         .status(status)
         .notes(request.getNotes())
         .isManual(false)
         .build();

     Attendance saved = attendanceRepository.save(attendance);
     log.info("Employee {} checked in at {}", employee.getFullName(), now);
     return attendanceMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // CHECK OUT
 // ═══════════════════════════════════════════════
 public AttendanceResponse checkOut(Long employeeId) {
     LocalDate today = LocalDate.now();
     LocalTime now   = LocalTime.now();

     Attendance attendance = attendanceRepository
             .findByEmployeeIdAndDate(employeeId, today)
             .orElseThrow(() -> new BadRequestException(
                     "No check-in found for today"));

     if (attendance.getCheckOut() != null) {
         throw new BadRequestException(
                 "Already checked out today");
     }

     attendance.setCheckOut(now);

     // Update status to HALF_DAY if less than 4.5 hours
     if (attendance.getWorkHours() != null) {
         BigDecimal halfDayThreshold = BigDecimal.valueOf(4.5);
         if (attendance.getWorkHours()
                 .compareTo(halfDayThreshold) < 0) {
             attendance.setStatus(AttendanceStatus.HALF_DAY);
         }
     }

     Attendance saved = attendanceRepository.save(attendance);
     log.info("Employee {} checked out at {}",
             attendance.getEmployee().getFullName(), now);
     return attendanceMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // MANUAL MARK ATTENDANCE (HR)
 // ═══════════════════════════════════════════════
 public AttendanceResponse markAttendance(
         AttendanceRequest request, User createdBy) {

     Employee employee = employeeRepository
             .findById(request.getEmployeeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee not found: " + request.getEmployeeId()));

     // Check if record already exists
     if (attendanceRepository.existsByEmployeeIdAndDate(
             request.getEmployeeId(), request.getDate())) {
         throw new BadRequestException(
                 "Attendance already marked for this date. Use update.");
     }

     Attendance attendance = Attendance.builder()
         .employee(employee)
         .date(request.getDate())
         .checkIn(request.getCheckIn())
         .checkOut(request.getCheckOut())
         .status(request.getStatus())
         .notes(request.getNotes())
         .isManual(true)
         .createdBy(createdBy)
         .build();

     Attendance saved = attendanceRepository.save(attendance);
     log.info("Manual attendance marked for {} on {}",
             employee.getFullName(), request.getDate());
     return attendanceMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // UPDATE ATTENDANCE
 // ═══════════════════════════════════════════════
 public AttendanceResponse updateAttendance(
         Long id, AttendanceRequest request) {

     Attendance attendance = attendanceRepository
             .findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Attendance not found: " + id));

     attendance.setCheckIn(request.getCheckIn());
     attendance.setCheckOut(request.getCheckOut());
     attendance.setStatus(request.getStatus());
     attendance.setNotes(request.getNotes());
     attendance.setManual(true);

     Attendance saved = attendanceRepository.save(attendance);
     log.info("Attendance updated: {}", id);
     return attendanceMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // GET MONTHLY SUMMARY
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public AttendanceSummaryResponse getMonthlySummary(
         Long employeeId, int month, int year) {

     Employee employee = employeeRepository
             .findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee not found: " + employeeId));

     List<Attendance> records = attendanceRepository
             .findMonthlyAttendance(employeeId, month, year);

     // Count stats
     int presentDays = (int) records.stream()
             .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
             .count();
     int lateDays = (int) records.stream()
             .filter(a -> a.getStatus() == AttendanceStatus.LATE)
             .count();
     int absentDays = (int) records.stream()
             .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
             .count();
     int halfDays = (int) records.stream()
             .filter(a -> a.getStatus() == AttendanceStatus.HALF_DAY)
             .count();
     int leaveDays = (int) records.stream()
             .filter(a -> a.getStatus() == AttendanceStatus.ON_LEAVE)
             .count();
     int holidays = (int) records.stream()
             .filter(a -> a.getStatus() == AttendanceStatus.HOLIDAY)
             .count();
     int weekends = (int) records.stream()
             .filter(a -> a.getStatus() == AttendanceStatus.WEEKEND)
             .count();

     // Total work hours & overtime
     Double totalWorkHoursRaw = attendanceRepository
             .sumWorkHoursByEmployeeAndMonth(employeeId, month, year);
     Double totalOvertimeRaw  = attendanceRepository
             .sumOvertimeByEmployeeAndMonth(employeeId, month, year);

     BigDecimal totalWorkHours = totalWorkHoursRaw != null
             ? BigDecimal.valueOf(totalWorkHoursRaw) : BigDecimal.ZERO;
     BigDecimal totalOvertime  = totalOvertimeRaw != null
             ? BigDecimal.valueOf(totalOvertimeRaw) : BigDecimal.ZERO;

     // Working days in month (total days - weekends - holidays)
     int totalDays = YearMonth.of(year, month).lengthOfMonth();
     int workingDays = totalDays - weekends - holidays;

     // Attendance percentage
     double attendancePercent = workingDays > 0
             ? Math.round(((presentDays + lateDays + halfDays * 0.5)
                           / workingDays) * 100.0 * 10) / 10.0
             : 0.0;

     return AttendanceSummaryResponse.builder()
         .employeeId(employeeId)
         .employeeName(employee.getFullName())
         .employeeCode(employee.getEmployeeId())
         .month(month)
         .year(year)
         .totalDays(totalDays)
         .presentDays(presentDays)
         .absentDays(absentDays)
         .lateDays(lateDays)
         .halfDays(halfDays)
         .leaveDays(leaveDays)
         .holidays(holidays)
         .weekends(weekends)
         .totalWorkHours(totalWorkHours)
         .totalOvertime(totalOvertime)
         .attendancePercent(attendancePercent)
         .build();
 }

 // ═══════════════════════════════════════════════
 // GET TODAY OVERVIEW (Dashboard)
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public TodayAttendanceResponse getTodayOverview() {
     LocalDate today = LocalDate.now();

     long total    = employeeRepository
             .countByStatus(com.hrms.enums.EmployeeStatus.ACTIVE);
     long present  = attendanceRepository
             .countByDateAndStatus(today, AttendanceStatus.PRESENT);
     long late     = attendanceRepository
             .countByDateAndStatus(today, AttendanceStatus.LATE);
     long absent   = attendanceRepository
             .countByDateAndStatus(today, AttendanceStatus.ABSENT);
     long halfDay  = attendanceRepository
             .countByDateAndStatus(today, AttendanceStatus.HALF_DAY);
     long onLeave  = attendanceRepository
             .countByDateAndStatus(today, AttendanceStatus.ON_LEAVE);
     long holiday  = attendanceRepository
             .countByDateAndStatus(today, AttendanceStatus.HOLIDAY);

     double percent = total > 0
             ? Math.round(((double)(present + late) / total) * 100.0 * 10)
               / 10.0
             : 0.0;

     return TodayAttendanceResponse.builder()
         .total(total)
         .present(present)
         .late(late)
         .absent(absent)
         .halfDay(halfDay)
         .onLeave(onLeave)
         .holiday(holiday)
         .date(today)
         .attendancePercent(percent)
         .build();
 }

 // ═══════════════════════════════════════════════
 // GET HOLIDAYS
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public List<HolidayResponse> getHolidays(int year) {
     return holidayRepository.findByYear(year)
             .stream()
             .map(attendanceMapper::toHolidayResponse)
             .toList();
 }

 // ═══════════════════════════════════════════════
 // BULK MARK ABSENT (Scheduled Job)
 // ═══════════════════════════════════════════════
 public void markAbsentForToday() {
     LocalDate today = LocalDate.now();

     // Skip weekends
     DayOfWeek day = today.getDayOfWeek();
     if (day == DayOfWeek.SATURDAY ||
         day == DayOfWeek.SUNDAY)  return;

     // Skip holidays
     if (holidayRepository.existsByDate(today)) return;

     // Get all active employees
     List<Employee> allEmployees = employeeRepository
             .findAllActiveForExport();

     // Get employees who checked in today
     List<Long> checkedInIds = attendanceRepository
             .findByDate(today)
             .stream()
             .map(a -> a.getEmployee().getId())
             .toList();

     // Mark absent for those who haven't checked in
     allEmployees.stream()
         .filter(e -> !checkedInIds.contains(e.getId()))
         .forEach(e -> {
             Attendance absent = Attendance.builder()
                 .employee(e)
                 .date(today)
                 .status(AttendanceStatus.ABSENT)
                 .isManual(false)
                 .build();
             attendanceRepository.save(absent);
         });

     log.info("Bulk absent marked for {} employees on {}",
             allEmployees.size() - checkedInIds.size(), today);
 }
}