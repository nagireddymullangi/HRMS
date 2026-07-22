// com/hrms/controller/DepartmentController.java
package com.hrms.controller;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.*;
import com.hrms.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
@Tag(name = "Department Management",
     description = "Department CRUD APIs")
@SecurityRequirement(name = "bearerAuth")
public class DepartmentController {

    private final DepartmentService departmentService;

    // ── GET ALL (Paginated) ────────────────────────
    @GetMapping
    @Operation(summary = "Get All Departments (Paginated)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<Page<DepartmentListResponse>>>
    getAllDepartments(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir,
            @RequestParam(required = false)      String search,
            @RequestParam(required = false)      Boolean isActive
    ) {
        Page<DepartmentListResponse> departments =
                departmentService.getAllDepartments(
                        page, size, sortBy, sortDir, search, isActive);
        return ResponseEntity.ok(
                ApiResponse.success("Departments fetched", departments));
    }

    // ── GET LIST (for dropdowns) ───────────────────
    @GetMapping("/list")
    @Operation(summary = "Get All Active Departments (Dropdown)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DepartmentListResponse>>>
    getDepartmentList() {
        return ResponseEntity.ok(
                ApiResponse.success("Departments fetched",
                        departmentService.getAllDepartmentList()));
    }

    // ── GET BY ID ──────────────────────────────────
    @GetMapping("/{id}")
    @Operation(summary = "Get Department by ID")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Department fetched",
                        departmentService.getDepartmentById(id)));
    }

    // ── CREATE ─────────────────────────────────────
    @PostMapping
    @Operation(summary = "Create Department")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    create(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created",
                        departmentService.createDepartment(request)));
    }

    // ── UPDATE ─────────────────────────────────────
    @PutMapping("/{id}")
    @Operation(summary = "Update Department")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    update(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Department updated",
                        departmentService.updateDepartment(id, request)));
    }

    // ── DELETE ─────────────────────────────────────
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Department")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>>
    delete(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(
                ApiResponse.success("Department deleted"));
    }

    // ── TOGGLE STATUS ──────────────────────────────
    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle Department Active Status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>>
    toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Status toggled",
                        departmentService.toggleStatus(id)));
    }
}