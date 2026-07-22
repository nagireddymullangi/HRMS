// com/hrms/mapper/DesignationMapper.java
package com.hrms.mapper;

import com.hrms.dto.request.DesignationRequest;
import com.hrms.dto.response.DesignationResponse;
import com.hrms.entity.Designation;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DesignationMapper {

    // ── Request → Entity ───────────────────────────
    public Designation toEntity(DesignationRequest request) {
        return Designation.builder()
            .title(request.getTitle())
            .code(request.getCode().toUpperCase())
            .description(request.getDescription())
            .level(request.getLevel())
            .isActive(request.isActive())
            .build();
    }

    // ── Update Entity ──────────────────────────────
    public void updateEntity(Designation desig, DesignationRequest request) {
        desig.setTitle(request.getTitle());
        desig.setCode(request.getCode().toUpperCase());
        desig.setDescription(request.getDescription());
        desig.setLevel(request.getLevel());
        desig.setActive(request.isActive());
    }

    // ── Entity → Response ──────────────────────────
    public DesignationResponse toResponse(Designation desig) {
        return DesignationResponse.builder()
            .id(desig.getId())
            .title(desig.getTitle())
            .code(desig.getCode())
            .departmentId(desig.getDepartment() != null
                    ? desig.getDepartment().getId() : null)
            .departmentName(desig.getDepartment() != null
                    ? desig.getDepartment().getName() : null)
            .description(desig.getDescription())
            .level(desig.getLevel())
            .isActive(desig.isActive())
            .createdAt(desig.getCreatedAt())
            .updatedAt(desig.getUpdatedAt())
            .build();
    }

    // ── List Mapping ───────────────────────────────
    public List<DesignationResponse> toResponses(List<Designation> designations) {
        return designations.stream()
                .map(this::toResponse)
                .toList();
    }
}