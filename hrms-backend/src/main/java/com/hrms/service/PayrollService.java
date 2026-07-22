
//com/hrms/service/PayrollService.java
package com.hrms.service;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.enums.*;
import com.hrms.exception.*;
import com.hrms.mapper.PayrollMapper;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PayrollService {

 private final PayrollRepository          payrollRepository;
 private final SalaryStructureRepository  salaryStructureRepo;
 private final EmployeeRepository         employeeRepository;
 private final AttendanceRepository       attendanceRepository;
 private final PayrollMapper              payrollMapper;

 // ═══════════════════════════════════════════════
 // GET ALL PAYROLLS (Paginated + Filtered)
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public Page<PayrollResponse> getAllPayrolls(
         int page, int size,
         Integer month, Integer year,
         PayrollStatus status, Long departmentId,
         Long employeeId, String search) {

     Pageable pageable = PageRequest.of(page, size);

     return payrollRepository.findPayrolls(
         month, year, status, departmentId,
         employeeId, search, pageable)
         .map(payrollMapper::toResponse);
 }

 // ═══════════════════════════════════════════════
 // GET BY ID
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public PayrollResponse getById(Long id) {
     return payrollMapper.toResponse(
         payrollRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Payroll not found: " + id)));
 }

 // ═══════════════════════════════════════════════
 // GET PAYSLIP
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public PayslipResponse getPayslip(
         Long employeeId, int month, int year) {

     Payroll payroll = payrollRepository
         .findByEmployeeIdAndMonthAndYear(
                 employeeId, month, year)
         .orElseThrow(() -> new ResourceNotFoundException(
                 "Payslip not found for month "
                 + month + "/" + year));

     return payrollMapper.toPayslip(payroll);
 }

 // ═══════════════════════════════════════════════
 // GET PAYROLL HISTORY (for employee)
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public List<PayrollResponse> getPayrollHistory(
         Long employeeId) {
     return payrollMapper.toResponses(
         payrollRepository.findPayrollHistory(employeeId));
 }

 // ═══════════════════════════════════════════════
 // PROCESS PAYROLL (for a month)
 // ═══════════════════════════════════════════════
 public PayrollSummaryResponse processPayroll(
         PayrollProcessRequest request, User processedBy) {

     int month = request.getMonth();
     int year  = request.getYear();

     // Determine employees to process
     List<Employee> employees;
     if (request.getEmployeeIds() != null
             && !request.getEmployeeIds().isEmpty()) {
         employees = employeeRepository
                 .findAllById(request.getEmployeeIds());
     } else {
         employees = employeeRepository
                 .findAllActiveForExport();
     }

     int processed = 0;
     for (Employee employee : employees) {
         // Skip if already processed
         if (payrollRepository.existsByEmployeeIdAndMonthAndYear(
                 employee.getId(), month, year)) {
             log.warn("Payroll already exists for {} {}/{}",
                     employee.getFullName(), month, year);
             continue;
         }

         // Get salary structure
         SalaryStructure structure = salaryStructureRepo
             .findActiveByEmployeeId(employee.getId())
             .orElse(null);

         if (structure == null) {
             log.warn("No salary structure for employee: {}",
                     employee.getFullName());
             continue;
         }

         // Get attendance for the month
         AttendanceStats stats = getAttendanceStats(
                 employee.getId(), month, year);

         // Calculate payroll
         Payroll payroll = calculatePayroll(
                 employee, structure, stats,
                 month, year, processedBy,
                 request.getRemarks());

         payrollRepository.save(payroll);
         processed++;
     }

     log.info("Payroll processed for {}/{}: {} employees",
             month, year, processed);

     return getPayrollSummary(month, year);
 }

 // ═══════════════════════════════════════════════
 // MARK AS PAID
 // ═══════════════════════════════════════════════
 public PayrollResponse markAsPaid(
         Long id, MarkPaidRequest request) {

     Payroll payroll = payrollRepository.findById(id)
         .orElseThrow(() -> new ResourceNotFoundException(
                 "Payroll not found: " + id));

     if (payroll.getStatus() != PayrollStatus.PROCESSED) {
         throw new BadRequestException(
             "Only PROCESSED payrolls can be marked as paid. "
             + "Current: " + payroll.getStatus());
     }

     payroll.setStatus(PayrollStatus.PAID);
     payroll.setPaidOn(request.getPaidOn());
     payroll.setPaymentMode(request.getPaymentMode());
     payroll.setRemarks(request.getRemarks());

     Payroll saved = payrollRepository.save(payroll);
     log.info("Payroll {} marked as PAID", id);
     return payrollMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // BULK MARK PAID (all processed for a month)
 // ═══════════════════════════════════════════════
 public int bulkMarkPaid(
         int month, int year, MarkPaidRequest request) {

     List<Payroll> processed = payrollRepository
         .findByMonthAndYear(month, year)
         .stream()
         .filter(p -> p.getStatus() == PayrollStatus.PROCESSED)
         .toList();

     processed.forEach(p -> {
         p.setStatus(PayrollStatus.PAID);
         p.setPaidOn(request.getPaidOn());
         p.setPaymentMode(request.getPaymentMode());
         p.setRemarks(request.getRemarks());
     });

     payrollRepository.saveAll(processed);
     log.info("Bulk marked {} payrolls as PAID for {}/{}",
             processed.size(), month, year);
     return processed.size();
 }

 // ═══════════════════════════════════════════════
 // CANCEL PAYROLL
 // ═══════════════════════════════════════════════
 public PayrollResponse cancelPayroll(Long id) {
     Payroll payroll = payrollRepository.findById(id)
         .orElseThrow(() -> new ResourceNotFoundException(
                 "Payroll not found: " + id));

     if (payroll.getStatus() == PayrollStatus.PAID) {
         throw new BadRequestException(
                 "Cannot cancel a PAID payroll");
     }

     payroll.setStatus(PayrollStatus.CANCELLED);
     Payroll saved = payrollRepository.save(payroll);
     log.info("Payroll {} cancelled", id);
     return payrollMapper.toResponse(saved);
 }

 public PayrollResponse getLatestPayrollByEmployeeId(Long employeeId) {
	Optional<Payroll> payrollOpt = payrollRepository
		 .findTopByEmployeeIdOrderByIdDesc(employeeId);
	if(payrollOpt.isEmpty()) {
		return PayrollResponse.builder().build();
	}
     Payroll latestPayroll = payrollOpt.get();
	 return PayrollResponse.builder()
			 .id(latestPayroll.getId())
			 .employeeId(latestPayroll.getEmployee().getId())
			 .month(latestPayroll.getMonth())
			 .year(latestPayroll.getYear())
			 .grossSalary(latestPayroll.getGrossSalary())
			 .netSalary(latestPayroll.getNetSalary())
			 .status(latestPayroll.getStatus())
			 .paidOn(latestPayroll.getPaidOn())
			 .paymentMode(latestPayroll.getPaymentMode())
			 .remarks(latestPayroll.getRemarks())
			 .build();
 }
 
 
 // ═══════════════════════════════════════════════
 // GET MONTHLY SUMMARY
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public PayrollSummaryResponse getPayrollSummary(
         int month, int year) {

     long total     = payrollRepository
             .countByMonthAndYear(month, year);
     long pending   = payrollRepository
             .countByMonthAndYearAndStatus(
                     month, year, PayrollStatus.PENDING);
     long processed = payrollRepository
             .countByMonthAndYearAndStatus(
                     month, year, PayrollStatus.PROCESSED);
     long paid      = payrollRepository
             .countByMonthAndYearAndStatus(
                     month, year, PayrollStatus.PAID);

     BigDecimal totalGross  = payrollRepository
             .sumGrossByMonthAndYear(month, year);
     BigDecimal totalNet    = payrollRepository
             .sumNetByMonthAndYear(month, year);
     BigDecimal totalDeduct = payrollRepository
             .sumDeductionsByMonthAndYear(month, year);
     BigDecimal totalPf     = payrollRepository
             .sumPfByMonthAndYear(month, year);
     BigDecimal totalEsi    = payrollRepository
             .sumEsiByMonthAndYear(month, year);
     BigDecimal totalTds    = payrollRepository
             .sumTdsByMonthAndYear(month, year);

     String[] months = {
         "January","February","March","April",
         "May","June","July","August",
         "September","October","November","December"
     };

     return PayrollSummaryResponse.builder()
         .month(month)
         .year(year)
         .monthName(months[month - 1])
         .totalEmployees(total)
         .processedCount(processed)
         .pendingCount(pending)
         .paidCount(paid)
         .totalGrossSalary(
             totalGross  != null ? totalGross  : BigDecimal.ZERO)
         .totalDeductions(
             totalDeduct != null ? totalDeduct : BigDecimal.ZERO)
         .totalNetSalary(
             totalNet    != null ? totalNet    : BigDecimal.ZERO)
         .totalPfDeduction(
             totalPf     != null ? totalPf     : BigDecimal.ZERO)
         .totalEsiDeduction(
             totalEsi    != null ? totalEsi    : BigDecimal.ZERO)
         .totalTdsDeduction(
             totalTds    != null ? totalTds    : BigDecimal.ZERO)
         .totalOvertimeAmount(BigDecimal.ZERO)
         .build();
 }

 // ═══════════════════════════════════════════════
 // SALARY STRUCTURE CRUD
 // ═══════════════════════════════════════════════
 public SalaryStructureResponse createSalaryStructure(
         SalaryStructureRequest request, User createdBy) {

     Employee employee = employeeRepository
         .findById(request.getEmployeeId())
         .orElseThrow(() -> new ResourceNotFoundException(
                 "Employee not found: " + request.getEmployeeId()));

     // Deactivate existing structure
     salaryStructureRepo.findByEmployeeId(employee.getId())
         .ifPresent(s -> {
             s.setActive(false);
             salaryStructureRepo.save(s);
         });

     SalaryStructure structure = SalaryStructure.builder()
         .employee(employee)
         .basicSalary(request.getBasicSalary())
         .hraPercent(request.getHraPercent())
         .daPercent(request.getDaPercent())
         .taAmount(request.getTaAmount())
         .medicalAllow(request.getMedicalAllow())
         .otherAllow(request.getOtherAllow())
         .pfPercent(request.getPfPercent())
         .esiPercent(request.getEsiPercent())
         .tdsPercent(request.getTdsPercent())
         .profTax(request.getProfTax())
         .effectiveFrom(request.getEffectiveFrom())
         .effectiveTo(request.getEffectiveTo())
         .isActive(true)
         .createdBy(createdBy)
         .build();

     SalaryStructure saved = salaryStructureRepo.save(structure);

     // Update employee salary
     employee.setSalary(request.getBasicSalary());
     employeeRepository.save(employee);

     log.info("Salary structure created for {}",
             employee.getFullName());
     return payrollMapper.toSalaryResponse(saved);
 }

 @Transactional(readOnly = true)
 public SalaryStructureResponse getSalaryStructure(
         Long employeeId) {
     SalaryStructure structure = salaryStructureRepo
         .findActiveByEmployeeId(employeeId)
         .orElseThrow(() -> new ResourceNotFoundException(
                 "Salary structure not found for employee: "
                 + employeeId));
     return payrollMapper.toSalaryResponse(structure);
 }

 // ═══════════════════════════════════════════════
 // PRIVATE HELPERS
 // ═══════════════════════════════════════════════

 // ── Attendance Stats for Month ─────────────────
 private AttendanceStats getAttendanceStats(
         Long employeeId, int month, int year) {

     YearMonth ym = YearMonth.of(year, month);
     int totalDays = ym.lengthOfMonth();

     long present = attendanceRepository
         .countByEmployeeMonthStatus(
             employeeId, month, year,
             AttendanceStatus.PRESENT);
     long late = attendanceRepository
         .countByEmployeeMonthStatus(
             employeeId, month, year,
             AttendanceStatus.LATE);
     long halfDay = attendanceRepository
         .countByEmployeeMonthStatus(
             employeeId, month, year,
             AttendanceStatus.HALF_DAY);
     long onLeave = attendanceRepository
         .countByEmployeeMonthStatus(
             employeeId, month, year,
             AttendanceStatus.ON_LEAVE);
     long holiday = attendanceRepository
         .countByEmployeeMonthStatus(
             employeeId, month, year,
             AttendanceStatus.HOLIDAY);

     // Working days = total - weekends - holidays
     long weekends = countWeekends(year, month);
     long workingDays = totalDays - weekends - holiday;

     // Present days = present + late + half
     long presentDays = present + late +
             Math.round(halfDay * 0.5);
     long absentDays = Math.max(0,
             workingDays - presentDays - onLeave);

     // Overtime hours
     Double overtime = attendanceRepository
         .sumOvertimeByEmployeeAndMonth(
                 employeeId, month, year);

     return new AttendanceStats(
         (int) workingDays, (int) presentDays,
         (int) absentDays, (int) onLeave,
         overtime != null ? BigDecimal.valueOf(overtime)
                          : BigDecimal.ZERO
     );
 }

 // ── Calculate Payroll ──────────────────────────
 private Payroll calculatePayroll(
         Employee employee,
         SalaryStructure s,
         AttendanceStats stats,
         int month, int year,
         User processedBy,
         String remarks) {

     BigDecimal basic = s.getBasicSalary();

     // ── Per-day salary ─────────────────────────
     BigDecimal perDaySalary = stats.workingDays > 0
         ? basic.divide(
             BigDecimal.valueOf(stats.workingDays), 2,
             RoundingMode.HALF_UP)
         : BigDecimal.ZERO;

     // ── Loss of Pay (LOP) ──────────────────────
     BigDecimal lop = perDaySalary.multiply(
         BigDecimal.valueOf(stats.absentDays));

     BigDecimal effectiveBasic = basic.subtract(lop);

     // ── Earnings ───────────────────────────────
     BigDecimal hra = percent(effectiveBasic, s.getHraPercent());
     BigDecimal da  = percent(effectiveBasic, s.getDaPercent());
     BigDecimal ta  = s.getTaAmount();
     BigDecimal med = s.getMedicalAllow();
     BigDecimal oth = s.getOtherAllow();

     // ── Overtime Pay ───────────────────────────
     // Overtime rate = 1.5x per hour
     BigDecimal hourlyRate = effectiveBasic.divide(
         BigDecimal.valueOf(26 * 8), 2, RoundingMode.HALF_UP);
     BigDecimal overtimeAmt = stats.overtimeHours
         .multiply(hourlyRate)
         .multiply(new BigDecimal("1.5"));

     // ── Gross Salary ───────────────────────────
     BigDecimal gross = effectiveBasic.add(hra).add(da)
         .add(ta).add(med).add(oth).add(overtimeAmt);

     // ── Deductions ─────────────────────────────
     BigDecimal pf  = percent(effectiveBasic, s.getPfPercent());
     BigDecimal esi = percent(gross, s.getEsiPercent());
     BigDecimal tds = percent(gross, s.getTdsPercent());
     BigDecimal pt  = s.getProfTax();

     BigDecimal totalDeduct = pf.add(esi).add(tds)
         .add(pt).add(lop);

     // ── Net Salary ─────────────────────────────
     BigDecimal net = gross.subtract(pf).subtract(esi)
         .subtract(tds).subtract(pt);

     return Payroll.builder()
         .employee(employee)
         .month(month)
         .year(year)
         .basicSalary(effectiveBasic)
         .hra(hra)
         .da(da)
         .ta(ta)
         .medicalAllow(med)
         .otherAllow(oth)
         .grossSalary(gross)
         .pfDeduction(pf)
         .esiDeduction(esi)
         .tdsDeduction(tds)
         .profTax(pt)
         .lossOfPay(lop)
         .otherDeductions(BigDecimal.ZERO)
         .totalDeductions(totalDeduct)
         .netSalary(net)
         .workingDays(stats.workingDays)
         .presentDays(stats.presentDays)
         .absentDays(stats.absentDays)
         .leaveDays(stats.leaveDays)
         .overtimeHours(stats.overtimeHours)
         .overtimeAmount(overtimeAmt)
         .status(PayrollStatus.PROCESSED)
         .processedBy(processedBy)
         .processedAt(LocalDateTime.now())
         .remarks(remarks)
         .build();
 }

 // ── Percent Calculator ─────────────────────────
 private BigDecimal percent(
         BigDecimal base, BigDecimal pct) {
     if (base == null || pct == null)
         return BigDecimal.ZERO;
     return base.multiply(pct)
                .divide(BigDecimal.valueOf(100), 2,
                        RoundingMode.HALF_UP);
 }

 // ── Count Weekends in Month ────────────────────
 private long countWeekends(int year, int month) {
     YearMonth ym   = YearMonth.of(year, month);
     long count = 0;
     for (int d = 1; d <= ym.lengthOfMonth(); d++) {
         DayOfWeek day = LocalDate.of(year, month, d)
                 .getDayOfWeek();
         if (day == DayOfWeek.SATURDAY ||
             day == DayOfWeek.SUNDAY) count++;
     }
     return count;
 }

 // ── Inner class: Attendance Stats ─────────────
 private record AttendanceStats(
     int workingDays,
     int presentDays,
     int absentDays,
     int leaveDays,
     BigDecimal overtimeHours
 ) {}
}