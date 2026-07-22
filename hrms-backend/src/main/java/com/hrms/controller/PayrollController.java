
//com/hrms/controller/PayrollController.java
package com.hrms.controller;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.User;
import com.hrms.enums.PayrollStatus;
import com.hrms.repository.UserRepository;
import com.hrms.service.PayrollService;
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

import java.util.List;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll Management",
  description = "Payroll processing APIs")
@SecurityRequirement(name = "bearerAuth")
public class PayrollController {

 private final PayrollService payrollService;
 private final UserRepository userRepository;

 // ── GET ALL (Paginated + Filtered) ─────────────
 @GetMapping
 @Operation(summary = "Get All Payroll Records")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<Page<PayrollResponse>>>
 getAll(
         @RequestParam(defaultValue = "0")  int page,
         @RequestParam(defaultValue = "10") int size,
         @RequestParam(required = false)    Integer month,
         @RequestParam(required = false)    Integer year,
         @RequestParam(required = false)    PayrollStatus status,
         @RequestParam(required = false)    Long departmentId,
         @RequestParam(required = false)    Long employeeId,
         @RequestParam(required = false)    String search
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Payrolls fetched",
         payrollService.getAllPayrolls(
             page, size, month, year, status,
             departmentId, employeeId, search)));
 }

 // ── GET BY ID ──────────────────────────────────
 @GetMapping("/{id}")
 @Operation(summary = "Get Payroll by ID")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<PayrollResponse>>
 getById(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success(
         "Payroll fetched", payrollService.getById(id)));
 }

 // ── GET PAYSLIP ────────────────────────────────
 @GetMapping("/payslip")
 @Operation(summary = "Get Employee Payslip")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<PayslipResponse>>
 getPayslip(
         @RequestParam Long employeeId,
         @RequestParam int  month,
         @RequestParam int  year
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Payslip fetched",
         payrollService.getPayslip(employeeId, month, year)));
 }

 // ── GET HISTORY ────────────────────────────────
 @GetMapping("/history/{employeeId}")
 @Operation(summary = "Get Payroll History for Employee")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<List<PayrollResponse>>>
 getHistory(@PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success(
         "Payroll history fetched",
         payrollService.getPayrollHistory(employeeId)));
 }

 // ── PROCESS PAYROLL ────────────────────────────
 @PostMapping("/process")
 @Operation(summary = "Process Payroll for a Month")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<PayrollSummaryResponse>>
 process(
         @Valid @RequestBody PayrollProcessRequest request,
         @AuthenticationPrincipal User currentUser
 ) {
     return ResponseEntity.status(HttpStatus.CREATED)
         .body(ApiResponse.success(
             "Payroll processed successfully",
             payrollService.processPayroll(request, currentUser)));
 }

 // ── MARK PAID (single) ─────────────────────────
 @PatchMapping("/{id}/mark-paid")
 @Operation(summary = "Mark Payroll as Paid")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<PayrollResponse>>
 markPaid(
         @PathVariable Long id,
         @Valid @RequestBody MarkPaidRequest request
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Payroll marked as paid",
         payrollService.markAsPaid(id, request)));
 }
 
//--- GET MY LATEST PAYROLL ---
 @GetMapping("/me/latest")
 @Operation(summary = "Get current authenticated user's latest payslip")
 @PreAuthorize("isAuthenticated()") 
 public ResponseEntity<ApiResponse<PayrollResponse>> getMyLatestPayroll(Authentication authentication) {
     
     // 1. Get the logged-in user's ID
     //User userDetails = (User) authentication.getPrincipal(); 
     //Long employeeId = userDetails.getId();
	 String username = authentication.getName();
	 User user = userRepository.findByUsername(username)
			 .orElseThrow(() -> new RuntimeException("User not found"));
     
     // 2. Fetch and return
     return ResponseEntity.ok(
             ApiResponse.success("Latest payroll fetched successfully",
             payrollService.getLatestPayrollByEmployeeId(user.getId())) 
     );
 }

 // ── BULK MARK PAID ─────────────────────────────
 @PatchMapping("/bulk-mark-paid")
 @Operation(summary = "Bulk Mark Payrolls as Paid")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<String>>
 bulkMarkPaid(
         @RequestParam int month,
         @RequestParam int year,
         @Valid @RequestBody MarkPaidRequest request
 ) {
     int count = payrollService.bulkMarkPaid(
             month, year, request);
     return ResponseEntity.ok(ApiResponse.success(
         count + " payrolls marked as paid"));
 }

 // ── CANCEL ─────────────────────────────────────
 @PatchMapping("/{id}/cancel")
 @Operation(summary = "Cancel Payroll")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<PayrollResponse>>
 cancel(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success(
         "Payroll cancelled",
         payrollService.cancelPayroll(id)));
 }

 // ── MONTHLY SUMMARY ────────────────────────────
 @GetMapping("/summary")
 @Operation(summary = "Get Monthly Payroll Summary")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER','EMPLOYEE')")
 public ResponseEntity<ApiResponse<PayrollSummaryResponse>>
 getSummary(
         @RequestParam int month,
         @RequestParam int year
 ) {
     return ResponseEntity.ok(ApiResponse.success(
         "Summary fetched",
         payrollService.getPayrollSummary(month, year)));
 }

 // ── SALARY STRUCTURE ───────────────────────────
 @PostMapping("/salary-structure")
 @Operation(summary = "Create Salary Structure")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<SalaryStructureResponse>>
 createSalaryStructure(
         @Valid @RequestBody SalaryStructureRequest request,
         @AuthenticationPrincipal User currentUser
 ) {
     return ResponseEntity.status(HttpStatus.CREATED)
         .body(ApiResponse.success(
             "Salary structure created",
             payrollService.createSalaryStructure(
                     request, currentUser)));
 }

 @GetMapping("/salary-structure/{employeeId}")
 @Operation(summary = "Get Salary Structure for Employee")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<SalaryStructureResponse>>
 getSalaryStructure(@PathVariable Long employeeId) {
     return ResponseEntity.ok(ApiResponse.success(
         "Salary structure fetched",
         payrollService.getSalaryStructure(employeeId)));
 }
}