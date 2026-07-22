// com/hrms/mapper/DepartmentMapper.java
package com.hrms.mapper;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.DepartmentListResponse;
import com.hrms.dto.response.DepartmentResponse;
import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import com.hrms.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DepartmentMapper {

    private final EmployeeRepository employeeRepository;

    // ── Request → Entity ───────────────────────────
    public Department toEntity(DepartmentRequest request) {
        return Department.builder()
            .name(request.getName())
            .code(request.getCode().toUpperCase())
            .description(request.getDescription())
            .isActive(request.isActive())
            .build();
    }

    // ── Update Entity ──────────────────────────────
    public void updateEntity(Department dept, DepartmentRequest request) {
        dept.setName(request.getName());
        dept.setCode(request.getCode().toUpperCase());
        dept.setDescription(request.getDescription());
        dept.setActive(request.isActive());
    }

    // ── Entity → Full Response ─────────────────────
    public DepartmentResponse toResponse(Department dept) {
        long empCount = employeeRepository.countByDepartmentId(dept.getId());

        return DepartmentResponse.builder()
            .id(dept.getId())
            .name(dept.getName())
            .code(dept.getCode())
            .description(dept.getDescription())
            .isActive(dept.isActive())
            .headId(dept.getHead() != null
                    ? dept.getHead().getId() : null)
            .headName(dept.getHead() != null
                    ? dept.getHead().getFullName() : null)
            .parentDepartmentId(dept.getParentDepartment() != null
                    ? dept.getParentDepartment().getId() : null)
            .parentDepartmentName(dept.getParentDepartment() != null
                    ? dept.getParentDepartment().getName() : null)
            .employeeCount(empCount)
            .isActive(dept.isActive())
            .createdAt(dept.getCreatedAt())
            .updatedAt(dept.getUpdatedAt())
            .build();
    }

    // ── Entity → List Response ─────────────────────
    public DepartmentListResponse toListResponse(Department dept) {
        long empCount = employeeRepository.countByDepartmentId(dept.getId());

        return DepartmentListResponse.builder()
            .id(dept.getId())
            .name(dept.getName())
            .code(dept.getCode())
            .description(dept.getDescription())
            .headId(dept.getHead() != null
                    ? dept.getHead().getId() : null)
            .headName(dept.getHead() != null
                    ? dept.getHead().getFullName() : null)
            .parentDepartmentId(dept.getParentDepartment() != null
                    ? dept.getParentDepartment().getId() : null)
            .parentDepartmentName(dept.getParentDepartment() != null
                    ? dept.getParentDepartment().getName() : null)
            .employeeCount(empCount)
            .isActive(dept.isActive())
            .createdAt(dept.getCreatedAt())
            .build();
    }

    // ── List Mapping ───────────────────────────────
    public List<DepartmentListResponse> toListResponses(
            List<Department> departments) {
        return departments.stream()
                .map(this::toListResponse)
                .toList();
    }
}