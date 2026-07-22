// com/hrms/service/DesignationService.java
package com.hrms.service;

import com.hrms.dto.request.DesignationRequest;
import com.hrms.dto.response.DesignationResponse;
import com.hrms.entity.Department;
import com.hrms.entity.Designation;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.mapper.DesignationMapper;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.DesignationRepository;
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
public class DesignationService {

    private final DesignationRepository designationRepository;
    private final DepartmentRepository  departmentRepository;
    private final DesignationMapper     designationMapper;

    // ═══════════════════════════════════════════════
    // GET ALL (Paginated)
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public Page<DesignationResponse> getAllDesignations(
            int page, int size,
            String sortBy, String sortDir,
            Long departmentId) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Designation> designPage;

        if (departmentId != null) {
            designPage = designationRepository
                    .findByDepartmentId(departmentId, pageable);
        } else {
            designPage = designationRepository.findAll(pageable);
        }

        return designPage.map(designationMapper::toResponse);
    }

    // ═══════════════════════════════════════════════
    // GET BY DEPARTMENT (for dropdown)
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<DesignationResponse> getByDepartment(Long departmentId) {
        List<Designation> list = designationRepository
                .findByDepartmentIdAndIsActiveTrue(departmentId);
        return designationMapper.toResponses(list);
    }

    // ═══════════════════════════════════════════════
    // GET BY ID
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public DesignationResponse getById(Long id) {
        return designationMapper.toResponse(
                designationRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Designation not found: " + id)));
    }

    // ═══════════════════════════════════════════════
    // CREATE
    // ═══════════════════════════════════════════════
    public DesignationResponse createDesignation(DesignationRequest request) {

        // Validate unique code
        if (designationRepository.existsByCode(
                request.getCode().toUpperCase())) {
            throw new BadRequestException(
                    "Designation code already exists: " + request.getCode());
        }

        // Fetch Department
        Department dept = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found: " + request.getDepartmentId()));

        Designation desig = designationMapper.toEntity(request);
        desig.setDepartment(dept);

        Designation saved = designationRepository.save(desig);
        log.info("Designation created: {}", saved.getTitle());
        return designationMapper.toResponse(saved);
    }

    // ═══════════════════════════════════════════════
    // UPDATE
    // ═══════════════════════════════════════════════
    public DesignationResponse updateDesignation(
            Long id, DesignationRequest request) {

        Designation desig = designationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Designation not found: " + id));

        // Validate code uniqueness (exclude self)
        if (!desig.getCode().equalsIgnoreCase(request.getCode())) {
            if (designationRepository.existsByCode(
                    request.getCode().toUpperCase())) {
                throw new BadRequestException(
                        "Designation code already in use: " + request.getCode());
            }
        }

        // Update basic fields
        designationMapper.updateEntity(desig, request);

        // Update Department if changed
        if (!desig.getDepartment().getId().equals(request.getDepartmentId())) {
            Department dept = departmentRepository
                    .findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found: " + request.getDepartmentId()));
            desig.setDepartment(dept);
        }

        Designation updated = designationRepository.save(desig);
        log.info("Designation updated: {}", updated.getTitle());
        return designationMapper.toResponse(updated);
    }

    // ═══════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════
    public void deleteDesignation(Long id) {
        Designation desig = designationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Designation not found: " + id));

        designationRepository.delete(desig);
        log.info("Designation deleted: {}", desig.getTitle());
    }

    // ═══════════════════════════════════════════════
    // TOGGLE STATUS
    // ═══════════════════════════════════════════════
    public DesignationResponse toggleStatus(Long id) {
        Designation desig = designationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Designation not found: " + id));

        desig.setActive(!desig.isActive());
        Designation updated = designationRepository.save(desig);
        log.info("Designation {} status toggled to {}",
                updated.getTitle(), updated.isActive());
        return designationMapper.toResponse(updated);
    }
}