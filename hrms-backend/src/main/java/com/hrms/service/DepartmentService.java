// com/hrms/service/DepartmentService.java
package com.hrms.service;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.DepartmentListResponse;
import com.hrms.dto.response.DepartmentResponse;
import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.mapper.DepartmentMapper;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository   employeeRepository;
    private final DepartmentMapper     departmentMapper;

    // ═══════════════════════════════════════════════
    // GET ALL (Paginated)
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public Page<DepartmentListResponse> getAllDepartments(
            int page, int size,
            String sortBy, String sortDir,
            String search, Boolean isActive) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Department> deptPage;

        if (search != null && !search.isEmpty()) {
            deptPage = departmentRepository
                    .searchDepartments(search, isActive, pageable);
        } else if (isActive != null) {
            deptPage = departmentRepository
                    .findByIsActive(isActive, pageable);
        } else {
            deptPage = departmentRepository.findAll(pageable);
        }

        return deptPage.map(departmentMapper::toListResponse);
    }

    // ═══════════════════════════════════════════════
    // GET ALL (List - for dropdowns)
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<DepartmentListResponse> getAllDepartmentList() {
        List<Department> departments =
                departmentRepository.findAllActiveDepartmentsWithDetails();
        return departmentMapper.toListResponses(departments);
    }

    // ═══════════════════════════════════════════════
    // GET BY ID
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found: " + id));
        return departmentMapper.toResponse(dept);
    }

    // ═══════════════════════════════════════════════
    // CREATE
    // ═══════════════════════════════════════════════
    public DepartmentResponse createDepartment(DepartmentRequest request) {

        // Validate unique code
        if (departmentRepository.existsByCode(
                request.getCode().toUpperCase())) {
            throw new BadRequestException(
                    "Department code already exists: " + request.getCode());
        }

        // Build entity
        Department dept = departmentMapper.toEntity(request);

        // Set Head
        if (request.getHeadId() != null) {
            Employee head = employeeRepository
                    .findById(request.getHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Employee not found for head: " + request.getHeadId()));
            dept.setHead(head);
        } else {
        	dept.setHead(null);
        }

        // Set Parent Department
        if (request.getParentDepartmentId() != null) {
            Department parent = departmentRepository
                    .findById(request.getParentDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parent department not found: "
                            + request.getParentDepartmentId()));
            dept.setParentDepartment(parent);
        }

        Department saved = departmentRepository.save(dept);
        log.info("Department created: {}", saved.getName());
        return departmentMapper.toResponse(saved);
    }

    // ═══════════════════════════════════════════════
    // UPDATE
    // ═══════════════════════════════════════════════
    public DepartmentResponse updateDepartment(
            Long id, DepartmentRequest request) {

        Department dept = departmentRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found: " + id));

        // Validate code uniqueness (exclude self)
        if (!dept.getCode().equalsIgnoreCase(request.getCode())) {
            if (departmentRepository.existsByCode(
                    request.getCode().toUpperCase())) {
                throw new BadRequestException(
                        "Department code already in use: " + request.getCode());
            }
        }

        // Update basic fields
        departmentMapper.updateEntity(dept, request);

        // Update Head
        if (request.getHeadId() != null) {
            Employee head = employeeRepository
                    .findById(request.getHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Employee not found: " + request.getHeadId()));
            dept.setHead(head);
        } else {
            dept.setHead(null);
        }

        // Update Parent Department
        if (request.getParentDepartmentId() != null) {
            // Prevent circular reference
            if (request.getParentDepartmentId().equals(id)) {
                throw new BadRequestException(
                        "Department cannot be its own parent");
            }
            Department parent = departmentRepository
                    .findById(request.getParentDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parent department not found"));
            dept.setParentDepartment(parent);
        } else {
            dept.setParentDepartment(null);
        }

        Department updated = departmentRepository.save(dept);
        log.info("Department updated: {}", updated.getName());
        return departmentMapper.toResponse(updated);
    }

    // ═══════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found: " + id));

        // Check if employees exist
        long empCount = employeeRepository.countByDepartmentId(id);
        if (empCount > 0) {
            throw new BadRequestException(
                    "Cannot delete department with " + empCount
                    + " active employees. Reassign them first.");
        }

        departmentRepository.delete(dept);
        log.info("Department deleted: {}", dept.getName());
    }

    // ═══════════════════════════════════════════════
    // TOGGLE STATUS
    // ═══════════════════════════════════════════════
    public DepartmentResponse toggleStatus(Long id) {
        Department dept = departmentRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found: " + id));

        dept.setActive(!dept.isActive());
        Department updated = departmentRepository.save(dept);
        log.info("Department {} status toggled to {}",
                updated.getName(), updated.isActive());
        return departmentMapper.toResponse(updated);
    }
}