
//com/hrms/service/LeaveService.java
package com.hrms.service;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.enums.*;
import com.hrms.exception.*;
import com.hrms.mapper.LeaveMapper;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeaveService {

 private final LeaveRepository        leaveRepository;
 private final LeaveTypeRepository    leaveTypeRepository;
 private final LeaveBalanceRepository leaveBalanceRepository;
 private final EmployeeRepository     employeeRepository;
 private final LeaveMapper            leaveMapper;

 // ═══════════════════════════════════════════════
 // GET ALL LEAVES (Paginated + Filtered)
 // ═══════════════════════════════════════════════
 @Transactional
 public Page<LeaveResponse> getAllLeaves(
         int page, int size,
         Long employeeId, LeaveStatus status,
         Long leaveTypeId, Long departmentId,
         LocalDate startDate, LocalDate endDate,
         String search) {

     Pageable pageable = PageRequest.of(page, size);

     return leaveRepository.findLeaves(
             employeeId, status, leaveTypeId,
             departmentId, startDate, endDate,
             search, pageable)
             .map(leaveMapper::toResponse);
 }

 // ═══════════════════════════════════════════════
 // GET LEAVE BY ID
 // ═══════════════════════════════════════════════
 @Transactional
 public LeaveResponse getById(Long id) {
     Leave leave = leaveRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave not found: " + id));
     return leaveMapper.toResponse(leave);
 }

 // ═══════════════════════════════════════════════
 // APPLY LEAVE
 // ═══════════════════════════════════════════════
 public LeaveResponse applyLeave(LeaveRequest request) {

     // Validate employee
     Employee employee = employeeRepository
             .findById(request.getEmployeeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee not found: " + request.getEmployeeId()));

     // Validate leave type
     LeaveType leaveType = leaveTypeRepository
             .findById(request.getLeaveTypeId())
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave type not found: " + request.getLeaveTypeId()));

     // Validate dates
     if (request.getEndDate().isBefore(request.getStartDate())) {
         throw new BadRequestException(
                 "End date cannot be before start date");
     }

     if (request.getStartDate().isBefore(LocalDate.now())) {
         throw new BadRequestException(
                 "Cannot apply for past dates");
     }

     // Calculate total days
     int totalDays = calculateLeaveDays(
             request.getStartDate(),
             request.getEndDate(),
             request.isHalfDay());

     // Check for overlapping leaves
     long overlap = leaveRepository.countOverlappingLeaves(
             request.getEmployeeId(),
             request.getStartDate(),
             request.getEndDate());
     if (overlap > 0) {
         throw new BadRequestException(
                 "Leave dates overlap with existing request");
     }

     // Check leave balance
     int year = request.getStartDate().getYear();
     LeaveBalance balance = getOrCreateBalance(
             employee, leaveType, year);

     int available = balance.getRemaining();
     if (totalDays > available) {
         throw new BadRequestException(
                 "Insufficient leave balance. Available: "
                 + available + " days, Requested: " + totalDays + " days");
     }

     // Build leave entity
     Leave leave = Leave.builder()
         .employee(employee)
         .leaveType(leaveType)
         .startDate(request.getStartDate())
         .endDate(request.getEndDate())
         .totalDays(totalDays)
         .reason(request.getReason())
         .status(LeaveStatus.PENDING)
         .isHalfDay(request.isHalfDay())
         .halfDayType(request.getHalfDayType() != null
                 ? HalfDayType.valueOf(request.getHalfDayType()) : null)
         .documentPath(request.getDocumentPath())
         .build();

     Leave saved = leaveRepository.save(leave);

     // Update pending balance
     balance.setPending(balance.getPending() + totalDays);
     leaveBalanceRepository.save(balance);

     log.info("Leave applied: {} for employee {}",
             saved.getId(), employee.getFullName());
     return leaveMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // APPROVE LEAVE
 // ═══════════════════════════════════════════════
 public LeaveResponse approveLeave(
         Long id, LeaveApprovalRequest request,
         Long approverId) {

     Leave leave = leaveRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave not found: " + id));

     if (leave.getStatus() != LeaveStatus.PENDING) {
         throw new BadRequestException(
                 "Only pending leaves can be approved. Current status: "
                 + leave.getStatus());
     }

     Employee approver = employeeRepository
             .findById(approverId)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Approver not found"));

     // Update leave
     leave.setStatus(LeaveStatus.APPROVED);
     leave.setApprovedBy(approver);
     leave.setApprovalNote(request.getApprovalNote());
     leave.setApprovedAt(LocalDateTime.now());

     Leave saved = leaveRepository.save(leave);

     // Update balance: pending → used
     int year = leave.getStartDate().getYear();
     LeaveBalance balance = getOrCreateBalance(
             leave.getEmployee(), leave.getLeaveType(), year);
     balance.setPending(Math.max(0,
             balance.getPending() - leave.getTotalDays()));
     balance.setUsed(balance.getUsed() + leave.getTotalDays());
     leaveBalanceRepository.save(balance);

     log.info("Leave {} approved by {}",
             id, approver.getFullName());
     return leaveMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // REJECT LEAVE
 // ═══════════════════════════════════════════════
 public LeaveResponse rejectLeave(
         Long id, LeaveApprovalRequest request,
         Long approverId) {

     Leave leave = leaveRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave not found: " + id));

     if (leave.getStatus() != LeaveStatus.PENDING) {
         throw new BadRequestException(
                 "Only pending leaves can be rejected");
     }

     if (request.getApprovalNote() == null ||
         request.getApprovalNote().isBlank()) {
         throw new BadRequestException(
                 "Rejection reason is required");
     }

     Employee approver = employeeRepository
             .findById(approverId)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Approver not found"));

     leave.setStatus(LeaveStatus.REJECTED);
     leave.setApprovedBy(approver);
     leave.setApprovalNote(request.getApprovalNote());
     leave.setApprovedAt(LocalDateTime.now());

     Leave saved = leaveRepository.save(leave);

     // Release pending balance
     int year = leave.getStartDate().getYear();
     LeaveBalance balance = getOrCreateBalance(
             leave.getEmployee(), leave.getLeaveType(), year);
     balance.setPending(Math.max(0,
             balance.getPending() - leave.getTotalDays()));
     leaveBalanceRepository.save(balance);

     log.info("Leave {} rejected by {}",
             id, approver.getFullName());
     return leaveMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // CANCEL LEAVE
 // ═══════════════════════════════════════════════
 public LeaveResponse cancelLeave(Long id, Long employeeId) {

     Leave leave = leaveRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave not found: " + id));

     // Only employee who applied can cancel
     if (!leave.getEmployee().getId().equals(employeeId)) {
         throw new BadRequestException(
                 "You can only cancel your own leave requests");
     }

     if (leave.getStatus() == LeaveStatus.CANCELLED) {
         throw new BadRequestException("Leave already cancelled");
     }

     if (leave.getStatus() == LeaveStatus.REJECTED) {
         throw new BadRequestException("Cannot cancel a rejected leave");
     }

     // Cannot cancel if leave has already started
     if (leave.getStartDate().isBefore(LocalDate.now())) {
         throw new BadRequestException(
                 "Cannot cancel leave that has already started");
     }

     LeaveStatus oldStatus = leave.getStatus();
     leave.setStatus(LeaveStatus.CANCELLED);
     Leave saved = leaveRepository.save(leave);

     // Release balance
     int year = leave.getStartDate().getYear();
     LeaveBalance balance = getOrCreateBalance(
             leave.getEmployee(), leave.getLeaveType(), year);

     if (oldStatus == LeaveStatus.PENDING) {
         balance.setPending(Math.max(0,
                 balance.getPending() - leave.getTotalDays()));
     } else if (oldStatus == LeaveStatus.APPROVED) {
         balance.setUsed(Math.max(0,
                 balance.getUsed() - leave.getTotalDays()));
     }
     leaveBalanceRepository.save(balance);

     log.info("Leave {} cancelled by employee {}", id, employeeId);
     return leaveMapper.toResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // GET PENDING APPROVALS
 // ═══════════════════════════════════════════════
 @Transactional
 public List<LeaveResponse> getPendingApprovals() {
     return leaveMapper.toResponses(
             leaveRepository.findPendingApprovals());
 }

 // ═══════════════════════════════════════════════
 // GET LEAVE BALANCE
 // ═══════════════════════════════════════════════
 @Transactional
 public LeaveBalanceResponse getLeaveBalance(
         Long employeeId, int year) {

     Employee employee = employeeRepository
             .findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee not found: " + employeeId));

     List<LeaveType> leaveTypes =
             leaveTypeRepository.findByIsActiveTrue();

     List<LeaveBalanceResponse.LeaveBalanceItem> items =
             new ArrayList<>();

     int totalAllocated = 0;
     int totalUsed      = 0;
     int totalPending   = 0;
     int totalRemaining = 0;

     for (LeaveType lt : leaveTypes) {
         LeaveBalance balance = getOrCreateBalance(
                 employee, lt, year);

         // Sync used & pending from actual leave records
         int usedDays    = leaveRepository
                 .sumUsedDays(employeeId, lt.getId(), year);
         int pendingDays = leaveRepository
                 .sumPendingDays(employeeId, lt.getId(), year);

         balance.setUsed(usedDays);
         balance.setPending(pendingDays);
         leaveBalanceRepository.save(balance);

         int remaining = balance.getRemaining();
         double usedPercent = balance.getAllocated() > 0
                 ? Math.round(
                     (double)(usedDays + pendingDays)
                     / (balance.getAllocated() + balance.getCarriedForward())
                     * 100.0 * 10) / 10.0
                 : 0.0;

         items.add(LeaveBalanceResponse.LeaveBalanceItem.builder()
             .leaveTypeId(lt.getId())
             .leaveTypeName(lt.getName())
             .leaveTypeCode(lt.getCode())
             .color(lt.getColor())
             .allocated(balance.getAllocated())
             .used(usedDays)
             .pending(pendingDays)
             .carriedForward(balance.getCarriedForward())
             .remaining(remaining)
             .usedPercent(usedPercent)
             .build());

         totalAllocated += balance.getAllocated();
         totalUsed      += usedDays;
         totalPending   += pendingDays;
         totalRemaining += remaining;
     }

     return LeaveBalanceResponse.builder()
         .employeeId(employeeId)
         .employeeName(employee.getFullName())
         .year(year)
         .balances(items)
         .totalAllocated(totalAllocated)
         .totalUsed(totalUsed)
         .totalPending(totalPending)
         .totalRemaining(totalRemaining)
         .build();
 }

 // ═══════════════════════════════════════════════
 // GET SUMMARY (Dashboard)
 // ═══════════════════════════════════════════════
 @Transactional
 public LeaveSummaryResponse getSummary() {
     long total     = leaveRepository.count();
     long pending   = leaveRepository.countByStatus(LeaveStatus.PENDING);
     long approved  = leaveRepository.countByStatus(LeaveStatus.APPROVED);
     long rejected  = leaveRepository.countByStatus(LeaveStatus.REJECTED);
     long cancelled = leaveRepository.countByStatus(LeaveStatus.CANCELLED);

     return LeaveSummaryResponse.builder()
         .totalRequests(total)
         .pendingRequests(pending)
         .approvedRequests(approved)
         .rejectedRequests(rejected)
         .cancelledRequests(cancelled)
         .pendingToday(pending)
         .build();
 }

 // ═══════════════════════════════════════════════
 // LEAVE TYPES CRUD
 // ═══════════════════════════════════════════════
 @Transactional
 public List<LeaveTypeResponse> getAllLeaveTypes() {
     return leaveMapper.toLeaveTypeResponses(
             leaveTypeRepository.findAll());
 }

 @Transactional
 public List<LeaveTypeResponse> getActiveLeaveTypes() {
     return leaveMapper.toLeaveTypeResponses(
             leaveTypeRepository.findByIsActiveTrue());
 }

 public LeaveTypeResponse createLeaveType(
         LeaveTypeRequest request) {

     if (leaveTypeRepository.existsByCode(
             request.getCode().toUpperCase())) {
         throw new BadRequestException(
                 "Leave type code already exists: " + request.getCode());
     }

     if (leaveTypeRepository.existsByName(request.getName())) {
         throw new BadRequestException(
                 "Leave type name already exists: " + request.getName());
     }

     LeaveType lt = LeaveType.builder()
         .name(request.getName())
         .code(request.getCode().toUpperCase())
         .description(request.getDescription())
         .maxDays(request.getMaxDays())
         .isPaid(request.isPaid())
         .isActive(request.isActive())
         .requiresDocument(request.isRequiresDocument())
         .color(request.getColor())
         .build();

     LeaveType saved = leaveTypeRepository.save(lt);
     log.info("Leave type created: {}", saved.getName());
     return leaveMapper.toLeaveTypeResponse(saved);
 }

 public LeaveTypeResponse updateLeaveType(
         Long id, LeaveTypeRequest request) {

     LeaveType lt = leaveTypeRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Leave type not found: " + id));

     lt.setName(request.getName());
     lt.setCode(request.getCode().toUpperCase());
     lt.setDescription(request.getDescription());
     lt.setMaxDays(request.getMaxDays());
     lt.setPaid(request.isPaid());
     lt.setActive(request.isActive());
     lt.setRequiresDocument(request.isRequiresDocument());
     lt.setColor(request.getColor());

     LeaveType saved = leaveTypeRepository.save(lt);
     log.info("Leave type updated: {}", saved.getName());
     return leaveMapper.toLeaveTypeResponse(saved);
 }

 // ═══════════════════════════════════════════════
 // INITIALIZE LEAVE BALANCES (for new employees)
 // ═══════════════════════════════════════════════
 public void initializeLeaveBalances(
         Long employeeId, int year) {

     Employee employee = employeeRepository
             .findById(employeeId)
             .orElseThrow(() -> new ResourceNotFoundException(
                     "Employee not found"));

     List<LeaveType> leaveTypes =
             leaveTypeRepository.findByIsActiveTrue();

     for (LeaveType lt : leaveTypes) {
         if (!leaveBalanceRepository
                 .existsByEmployeeIdAndLeaveTypeIdAndYear(
                         employeeId, lt.getId(), year)) {
             LeaveBalance balance = LeaveBalance.builder()
                 .employee(employee)
                 .leaveType(lt)
                 .year(year)
                 .allocated(lt.getMaxDays())
                 .used(0)
                 .pending(0)
                 .carriedForward(0)
                 .build();
             leaveBalanceRepository.save(balance);
         }
     }
     log.info("Leave balances initialized for employee {} year {}",
             employeeId, year);
 }

 // ═══════════════════════════════════════════════
 // PRIVATE HELPERS
 // ═══════════════════════════════════════════════
 private int calculateLeaveDays(
         LocalDate start, LocalDate end,
         boolean isHalfDay) {
     if (isHalfDay) return 1;
     long days = end.toEpochDay() - start.toEpochDay() + 1;
     return (int) days;
 }

 private LeaveBalance getOrCreateBalance(
         Employee employee, LeaveType leaveType, int year) {

     return leaveBalanceRepository
         .findByEmployeeIdAndLeaveTypeIdAndYear(
                 employee.getId(), leaveType.getId(), year)
         .orElseGet(() -> {
             LeaveBalance newBalance = LeaveBalance.builder()
                 .employee(employee)
                 .leaveType(leaveType)
                 .year(year)
                 .allocated(leaveType.getMaxDays())
                 .used(0)
                 .pending(0)
                 .carriedForward(0)
                 .build();
             return leaveBalanceRepository.save(newBalance);
         });
 }
}