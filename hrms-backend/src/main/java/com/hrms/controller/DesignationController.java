// com/hrms/controller/DesignationController.java
package com.hrms.controller;

import com.hrms.dto.request.DesignationRequest;
import com.hrms.dto.response.*;
import com.hrms.service.DesignationService;
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
@RequestMapping("/designations")
@RequiredArgsConstructor
@Tag(name = "Designation Management",
     description = "Designation CRUD APIs")
@SecurityRequirement(name = "bearerAuth")
public class DesignationController {

    private final DesignationService designationService;

    // ── GET ALL (Paginated) ────────────────────────
    @GetMapping
    @Operation(summary = "Get All Designations (Paginated)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<Page<DesignationResponse>>>
    getAll(
            @RequestParam(defaultValue = "0")     int page,
            @RequestParam(defaultValue = "10")    int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc")   String sortDir,
            @RequestParam(required = false)       Long departmentId
    ) {
        Page<DesignationResponse> designations =
                designationService.getAllDesignations(
                        page, size, sortBy, sortDir, departmentId);
        return ResponseEntity.ok(
                ApiResponse.success("Designations fetched", designations));
    }

    // ── GET BY DEPARTMENT (for dropdown) ──────────
    @GetMapping("/department/{deptId}")
    @Operation(summary = "Get Designations by Department")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DesignationResponse>>>
    getByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(
                ApiResponse.success("Designations fetched",
                        designationService.getByDepartment(deptId)));
    }

    // ── GET BY ID ──────────────────────────────────
    @GetMapping("/{id}")
    @Operation(summary = "Get Designation by ID")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    public ResponseEntity<ApiResponse<DesignationResponse>>
    getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Designation fetched",
                        designationService.getById(id)));
    }

    // ── CREATE ─────────────────────────────────────
    @PostMapping
    @Operation(summary = "Create Designation")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<DesignationResponse>>
    create(@Valid @RequestBody DesignationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Designation created",
                        designationService.createDesignation(request)));
    }

    // ── UPDATE ─────────────────────────────────────
    @PutMapping("/{id}")
    @Operation(summary = "Update Designation")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<DesignationResponse>>
    update(
            @PathVariable Long id,
            @Valid @RequestBody DesignationRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Designation updated",
                        designationService.updateDesignation(id, request)));
    }

    // ── DELETE ─────────────────────────────────────
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Designation")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<Void>>
    delete(@PathVariable Long id) {
        designationService.deleteDesignation(id);
        return ResponseEntity.ok(
                ApiResponse.success("Designation deleted"));
    }

    // ── TOGGLE STATUS ──────────────────────────────
    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle Designation Status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public ResponseEntity<ApiResponse<DesignationResponse>>
    toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Status toggled",
                        designationService.toggleStatus(id)));
    }
}