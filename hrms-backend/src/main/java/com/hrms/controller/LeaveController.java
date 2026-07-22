
//com/hrms/controller/LeaveController.java
package com.hrms.controller;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.User;
import com.hrms.enums.LeaveStatus;
import com.hrms.repository.UserRepository;
import com.hrms.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management",
  description = "Leave management APIs")
@SecurityRequirement(name = "bearerAuth")
public class LeaveController {

 private final LeaveService leaveService;
 private final UserRepository userRepository;

 // ── GET ALL (Paginated + Filtered) ─────────────
 @GetMapping
 @Operation(summary = "Get All Leave Requests")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<Page<LeaveResponse>>>
 getAll(
         @RequestParam(defaultValue = "0")  int page,
         @RequestParam(defaultValue = "10") int size,
         @RequestParam(required = false)    Long employeeId,
         @RequestParam(required = false)    LeaveStatus status,
         @RequestParam(required = false)    Long leaveTypeId,
         @RequestParam(required = false)    Long departmentId,
         @RequestParam(required = false)    LocalDate startDate,
         @RequestParam(required = false)    LocalDate endDate,
         @RequestParam(required = false)    String search
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Leaves fetched",
         leaveService.getAllLeaves(
             page, size, employeeId, status,
             leaveTypeId, departmentId,
             startDate, endDate, search)));
 }

 // ── GET BY ID ──────────────────────────────────
 @GetMapping("/{id}")
 @Operation(summary = "Get Leave by ID")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<LeaveResponse>>
 getById(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success(
         "Leave fetched", leaveService.getById(id)));
 }

 // ── APPLY LEAVE ────────────────────────────────
 @PostMapping
 @Operation(summary = "Apply for Leave")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<LeaveResponse>>
 apply(@Valid @RequestBody LeaveRequest request) {
     return ResponseEntity.status(HttpStatus.CREATED)
         .body(ApiResponse.success(
             "Leave applied successfully",
             leaveService.applyLeave(request)));
 }

 // ── APPROVE LEAVE ──────────────────────────────
 @PatchMapping("/{id}/approve")
 @Operation(summary = "Approve Leave Request")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<LeaveResponse>>
 approve(
         @PathVariable Long id,
         @RequestBody LeaveApprovalRequest request,
         @AuthenticationPrincipal User currentUser
 ) {
     // Get employee linked to the current user
     Long approverId = getCurrentEmployeeId(currentUser);
     return ResponseEntity.ok(ApiResponse.success(
         "Leave approved",
         leaveService.approveLeave(id, request, approverId)));
 }

 // ── REJECT LEAVE ───────────────────────────────
 @PatchMapping("/{id}/reject")
 @Operation(summary = "Reject Leave Request")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<LeaveResponse>>
 reject(
         @PathVariable Long id,
         @RequestBody LeaveApprovalRequest request,
         @AuthenticationPrincipal User currentUser
 ) {
     Long approverId = getCurrentEmployeeId(currentUser);
     return ResponseEntity.ok(ApiResponse.success(
         "Leave rejected",
         leaveService.rejectLeave(id, request, approverId)));
 }

 // ── CANCEL LEAVE ───────────────────────────────
 @PatchMapping("/{id}/cancel")
 @Operation(summary = "Cancel Leave Request")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<LeaveResponse>>
 cancel(
         @PathVariable Long id,
         @RequestParam Long employeeId
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Leave cancelled",
         leaveService.cancelLeave(id, employeeId)));
 }

 // ── PENDING APPROVALS ──────────────────────────
 @GetMapping("/pending")
 @Operation(summary = "Get Pending Approvals")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<List<LeaveResponse>>>
 getPending() {
     return ResponseEntity.ok(ApiResponse.success(
         "Pending approvals fetched",
         leaveService.getPendingApprovals()));
 }
 
 
//--- GET MY LEAVE BALANCE ---
 @GetMapping("/me/balance")
 @Operation(summary = "Get current authenticated user's leave balance")
 @PreAuthorize("isAuthenticated()") 
 public ResponseEntity<ApiResponse<LeaveBalanceResponse>> getMyLeaveBalance(Authentication authentication) {
     
     // Cast the principal to your entity class
     //User userDetails = (User) authentication.getPrincipal(); 
     //Long employeeId = userDetails.getId();
	 String username = authentication.getName(); // Get the username of the authenticated user
	 User user = userRepository.findByUsername(username)
			 .orElseThrow(() -> new RuntimeException("User not found"));
     
     int currentYear = java.time.Year.now().getValue(); // Get the current year
     // Call your LeaveService to fetch the balance for this specific employee
     return ResponseEntity.ok(
             ApiResponse.success("Leave balance fetched successfully",
             leaveService.getLeaveBalance(user.getId(), currentYear)) // Ensure this method exists in your LeaveService
     );
 }

 // ── LEAVE BALANCE ──────────────────────────────
 @GetMapping("/balance")
 @Operation(summary = "Get Leave Balance")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<LeaveBalanceResponse>>
 getBalance(
         @RequestParam Long employeeId,
         @RequestParam(defaultValue = "2026") int year
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Balance fetched",
         leaveService.getLeaveBalance(employeeId, year)));
 }

 // ── SUMMARY ────────────────────────────────────
 @GetMapping("/summary")
 @Operation(summary = "Get Leave Summary (Dashboard)")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER','EMPLOYEE')")
 public ResponseEntity<ApiResponse<LeaveSummaryResponse>>
 getSummary() {
     return ResponseEntity.ok(ApiResponse.success(
         "Summary fetched", leaveService.getSummary()));
 }

 // ── INITIALIZE BALANCE ─────────────────────────
 @PostMapping("/balance/initialize")
 @Operation(summary = "Initialize Leave Balances for Employee")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<Void>>
 initializeBalance(
         @RequestParam Long employeeId,
         @RequestParam int  year
 ) {
     leaveService.initializeLeaveBalances(employeeId, year);
     return ResponseEntity.ok(ApiResponse.success(
         "Leave balances initialized"));
 }

 // ── LEAVE TYPES ────────────────────────────────
 @GetMapping("/types")
 @Operation(summary = "Get All Leave Types")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>>
 getLeaveTypes() {
     return ResponseEntity.ok(ApiResponse.success(
         "Leave types fetched",
         leaveService.getAllLeaveTypes()));
 }

 @GetMapping("/types/active")
 @Operation(summary = "Get Active Leave Types")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>>
 getActiveLeaveTypes() {
     return ResponseEntity.ok(ApiResponse.success(
         "Active leave types fetched",
         leaveService.getActiveLeaveTypes()));
 }

 @PostMapping("/types")
 @Operation(summary = "Create Leave Type")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<LeaveTypeResponse>>
 createLeaveType(
         @Valid @RequestBody LeaveTypeRequest request) {
     return ResponseEntity.status(HttpStatus.CREATED)
         .body(ApiResponse.success(
             "Leave type created",
             leaveService.createLeaveType(request)));
 }

 @PutMapping("/types/{id}")
 @Operation(summary = "Update Leave Type")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<LeaveTypeResponse>>
 updateLeaveType(
         @PathVariable Long id,
         @Valid @RequestBody LeaveTypeRequest request
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Leave type updated",
         leaveService.updateLeaveType(id, request)));
 }

 // ── Helper ─────────────────────────────────────
 private Long getCurrentEmployeeId(User user) {
     // For simplicity, use user.getId() as placeholder
     // In real implementation, fetch employee by user.getId()
     return user.getId();
 }
}