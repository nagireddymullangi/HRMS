
//com/hrms/controller/AttendanceController.java
package com.hrms.controller;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.User;
import com.hrms.enums.AttendanceStatus;
import com.hrms.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance Management",
  description = "Attendance tracking APIs")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceController {

 private final AttendanceService attendanceService;

 // ── GET ALL (Paginated + Filtered) ─────────────
 @GetMapping
 @Operation(summary = "Get All Attendance Records")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<Page<AttendanceResponse>>>
 getAll(
         @RequestParam(defaultValue = "0")  int page,
         @RequestParam(defaultValue = "10") int size,
         @RequestParam(required = false)    Long employeeId,
         @RequestParam(required = false)    Integer month,
         @RequestParam(required = false)    Integer year,
         @RequestParam(required = false)    AttendanceStatus status,
         @RequestParam(required = false)    Long departmentId,
         @RequestParam(required = false)    String search
 ) {
     Page<AttendanceResponse> records =
             attendanceService.getAllAttendances(
                     page, size, employeeId, month,
                     year, status, departmentId, search);
     return ResponseEntity.ok(
             ApiResponse.success("Attendance fetched", records));
 }

 // ── GET BY ID ──────────────────────────────────
 @GetMapping("/{id}")
 @Operation(summary = "Get Attendance by ID")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<AttendanceResponse>>
 getById(@PathVariable Long id) {
     return ResponseEntity.ok(
             ApiResponse.success("Attendance fetched",
                     attendanceService.getById(id)));
 }

 // ── GET TODAY STATUS ───────────────────────────
 @GetMapping("/today/{employeeId}")
 @Operation(summary = "Get Today's Attendance Status")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<AttendanceResponse>>
 getTodayStatus(@PathVariable Long employeeId) {
     return ResponseEntity.ok(
             ApiResponse.success("Today status fetched",
                     attendanceService.getTodayStatus(employeeId)));
 }

 // ── CHECK IN ───────────────────────────────────
 @PostMapping("/check-in")
 @Operation(summary = "Employee Check In")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<AttendanceResponse>>
 checkIn(@Valid @RequestBody CheckInRequest request) {
     return ResponseEntity.status(HttpStatus.CREATED)
             .body(ApiResponse.success("Checked in successfully",
                     attendanceService.checkIn(request)));
 }

 // ── CHECK OUT ──────────────────────────────────
 @PostMapping("/check-out")
 @Operation(summary = "Employee Check Out")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<AttendanceResponse>>
 checkOut(@RequestParam Long employeeId) {
     return ResponseEntity.ok(
             ApiResponse.success("Checked out successfully",
                     attendanceService.checkOut(employeeId)));
 }

 // ── MANUAL MARK ────────────────────────────────
 @PostMapping
 @Operation(summary = "Manually Mark Attendance (HR)")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<AttendanceResponse>>
 markAttendance(
         @Valid @RequestBody AttendanceRequest request,
         @AuthenticationPrincipal User currentUser
 ) {
     return ResponseEntity.status(HttpStatus.CREATED)
             .body(ApiResponse.success("Attendance marked",
                     attendanceService.markAttendance(
                             request, currentUser)));
 }

 // ── UPDATE ─────────────────────────────────────
 @PutMapping("/{id}")
 @Operation(summary = "Update Attendance Record")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<AttendanceResponse>>
 update(
         @PathVariable Long id,
         @Valid @RequestBody AttendanceRequest request
 ) {
     return ResponseEntity.ok(
             ApiResponse.success("Attendance updated",
                     attendanceService.updateAttendance(id, request)));
 }

 // ── MONTHLY SUMMARY ────────────────────────────
 @GetMapping("/summary")
 @Operation(summary = "Get Monthly Attendance Summary")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<AttendanceSummaryResponse>>
 getMonthlySummary(
         @RequestParam Long    employeeId,
         @RequestParam int     month,
         @RequestParam int     year
 ) {
     return ResponseEntity.ok(
             ApiResponse.success("Summary fetched",
                     attendanceService.getMonthlySummary(
                             employeeId, month, year)));
 } 
 
//--- GET MY ATTENDANCE (Using Custom User Details) ---
 @GetMapping("/me")
 @Operation(summary = "Get current authenticated user's attendance")
 @PreAuthorize("isAuthenticated()") 
 public ResponseEntity<ApiResponse<AttendanceResponse>> getMyAttendance(Authentication authentication) {
     
     // Assuming you have a custom implementation of UserDetails (e.g., CustomUserDetails)
     // that stores the employeeId when the JWT is parsed.
     User  userDetails = (User) authentication.getPrincipal();
     Long employeeId = userDetails.getId(); 
     
     return ResponseEntity.ok(
             ApiResponse.success("My attendance fetched successfully",
             attendanceService.getTodayStatus(employeeId)) // Or a method that gets all records
     );
 }
 
 // ── TODAY OVERVIEW (Dashboard) ─────────────────
 @GetMapping("/today/overview")
 @Operation(summary = "Get Today's Attendance Overview")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<TodayAttendanceResponse>>
 getTodayOverview() {
     return ResponseEntity.ok(
             ApiResponse.success("Today overview fetched",
                     attendanceService.getTodayOverview()));
 }

 // ── GET HOLIDAYS ───────────────────────────────
 @GetMapping("/holidays")
 @Operation(summary = "Get Holidays by Year")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<List<HolidayResponse>>>
 getHolidays(
         @RequestParam(defaultValue = "2024") int year
 ) {
     return ResponseEntity.ok(
             ApiResponse.success("Holidays fetched",
                     attendanceService.getHolidays(year)));
 }
}