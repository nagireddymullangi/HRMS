// com/hrms/controller/EmployeeController.java
package com.hrms.controller;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.enums.EmployeeStatus;
import com.hrms.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "Employee CRUD APIs")
@SecurityRequirement(name = "bearerAuth")
public class EmployeeController {

    private final EmployeeService employeeService;

    // ── GET ALL ────────────────────────────────────
    @GetMapping
    @Operation(summary = "Get All Employees (Paginated + Filtered)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<Page<EmployeeListResponse>>> getAllEmployees(
            @RequestParam(defaultValue = "0")          int page,
            @RequestParam(defaultValue = "10")         int size,
            @RequestParam(defaultValue = "firstName")  String sortBy,
            @RequestParam(defaultValue = "asc")        String sortDir,
            @RequestParam(required = false)            String search,
            @RequestParam(required = false)            EmployeeStatus status,
            @RequestParam(required = false)            Long departmentId,
            @RequestParam(required = false)            String employmentType,
            @RequestParam(required = false)            String gender
    ) {
        Page<EmployeeListResponse> employees = employeeService.getAllEmployees(
                page, size, sortBy, sortDir, search,
                status, departmentId, employmentType, gender);
        return ResponseEntity.ok(
            ApiResponse.success("Employees fetched", employees));
    }

    // ── GET BY ID ──────────────────────────────────
    @GetMapping("/{id}")
    @Operation(summary = "Get Employee by ID")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER','EMPLOYEE')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("Employee fetched",
                    employeeService.getEmployeeById(id)));
    }

    // ── CREATE ─────────────────────────────────────
    @PostMapping
    @Operation(summary = "Create New Employee")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Employee created",
                    employeeService.createEmployee(request)));
    }

    // ── UPDATE ─────────────────────────────────────
    @PutMapping("/{id}")
    @Operation(summary = "Update Employee")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER','EMPLOYEE')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Employee updated",
                    employeeService.updateEmployee(id, request)));
    }

    // ── UPDATE STATUS ──────────────────────────────
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Employee Status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Status updated",
                    employeeService.updateStatus(id, request)));
    }

    // ── DELETE ─────────────────────────────────────
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Employee")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(
            ApiResponse.success("Employee deleted"));
    }

    // ── GET BY DEPARTMENT ──────────────────────────
    @GetMapping("/department/{deptId}")
    @Operation(summary = "Get Employees by Department")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<List<EmployeeListResponse>>> getByDept(
            @PathVariable Long deptId) {
        return ResponseEntity.ok(
            ApiResponse.success("Employees fetched",
                    employeeService.getByDepartment(deptId)));
    }

    // ── SEARCH ─────────────────────────────────────
    @GetMapping("/search")
    @Operation(summary = "Search Employees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<List<EmployeeListResponse>>> search(
            @RequestParam String q) {
        return ResponseEntity.ok(
            ApiResponse.success("Search results",
                    employeeService.searchEmployees(q)));
    }

    // ── UPLOAD PHOTO ───────────────────────────────
    @PostMapping(value = "/{id}/photo",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Profile Photo")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String url = employeeService.uploadProfilePhoto(id, file);
        return ResponseEntity.ok(
            ApiResponse.success("Photo uploaded", url));
    }

    // ── DASHBOARD STATS ────────────────────────────
    @GetMapping("/stats/dashboard")
    @Operation(summary = "Get Dashboard Stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER','EMPLOYEE')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(
            ApiResponse.success("Stats fetched",
                    employeeService.getDashboardStats()));
    }
}