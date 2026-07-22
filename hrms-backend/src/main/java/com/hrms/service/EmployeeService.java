// com/hrms/service/EmployeeService.java
package com.hrms.service;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.enums.EmployeeStatus;
import com.hrms.exception.*;
import com.hrms.mapper.EmployeeMapper;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmployeeService {

    private final EmployeeRepository    employeeRepository;
    private final DepartmentRepository  departmentRepository;
    private final DesignationRepository designationRepository;
    private final EmployeeMapper        employeeMapper;

    // ── Upload Directory ───────────────────────────
    private static final String UPLOAD_DIR = "uploads/profile-photos/";

    // ═══════════════════════════════════════════════
    // GET ALL EMPLOYEES (Paginated + Filtered)
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public Page<EmployeeListResponse> getAllEmployees(
            int page, int size, String sortBy, String sortDir,
            String search, EmployeeStatus status,
            Long departmentId, String employmentType, String gender) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Employee> employeePage = employeeRepository.searchEmployees(
                search, status, departmentId,
                employmentType, gender, pageable);

        return employeePage.map(employeeMapper::toListResponse);
    }

    // ═══════════════════════════════════════════════
    // GET EMPLOYEE BY ID
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with id: " + id));
        return employeeMapper.toResponse(employee);
    }

    // ═══════════════════════════════════════════════
    // CREATE EMPLOYEE
    // ═══════════════════════════════════════════════
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        // Validate unique fields
        if (employeeRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already exists");

        // Fetch related entities
        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Designation desig = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));

        // Build employee
        Employee employee = employeeMapper.toEntity(request);
        employee.setEmployeeId(generateEmployeeId());
        employee.setDepartment(dept);
        employee.setDesignation(desig);
        employee.setStatus(EmployeeStatus.ACTIVE);

        // Set Manager
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository
                    .findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Manager not found"));
            employee.setManager(manager);
        }

        // Save employee first
        Employee saved = employeeRepository.save(employee);

        // Save Address
        if (request.getAddress() != null) {
            Address address = buildAddress(request.getAddress(), saved);
            saved.setAddress(address);
        }

        // Save Emergency Contact
        if (request.getEmergencyContact() != null) {
            EmergencyContact ec = buildEmergencyContact(
                    request.getEmergencyContact(), saved);
            saved.setEmergencyContact(ec);
        }

        Employee finalEmployee = employeeRepository.save(saved);
        log.info("Employee created: {}", finalEmployee.getEmployeeId());
        return employeeMapper.toResponse(finalEmployee);
    }

    // ═══════════════════════════════════════════════
    // UPDATE EMPLOYEE
    // ═══════════════════════════════════════════════
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {

        Employee employee = employeeRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found: " + id));

        // Check email uniqueness (exclude self)
        employeeRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id))
                        throw new BadRequestException("Email already in use");
                });

        // Update basic fields
        employeeMapper.updateEntity(employee, request);

        // Update Department
        if (!employee.getDepartment().getId().equals(request.getDepartmentId())) {
            Department dept = departmentRepository
                    .findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found"));
            employee.setDepartment(dept);
        }

        // Update Designation
        if (!employee.getDesignation().getId().equals(request.getDesignationId())) {
            Designation desig = designationRepository
                    .findById(request.getDesignationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Designation not found"));
            employee.setDesignation(desig);
        }

        // Update Manager
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository
                    .findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Manager not found"));
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }

        // Update Address
        if (request.getAddress() != null) {
            if (employee.getAddress() != null) {
                updateAddress(employee.getAddress(), request.getAddress());
            } else {
                employee.setAddress(buildAddress(request.getAddress(), employee));
            }
        }

        // Update Emergency Contact
        if (request.getEmergencyContact() != null) {
            if (employee.getEmergencyContact() != null) {
                updateEmergencyContact(employee.getEmergencyContact(),
                        request.getEmergencyContact());
            } else {
                employee.setEmergencyContact(
                        buildEmergencyContact(request.getEmergencyContact(), employee));
            }
        }

        Employee updated = employeeRepository.save(employee);
        log.info("Employee updated: {}", updated.getEmployeeId());
        return employeeMapper.toResponse(updated);
    }

    // ═══════════════════════════════════════════════
    // UPDATE STATUS
    // ═══════════════════════════════════════════════
    public EmployeeResponse updateStatus(Long id, UpdateStatusRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found: " + id));
        employee.setStatus(request.getStatus());
        Employee updated = employeeRepository.save(employee);
        log.info("Employee {} status updated to {}", id, request.getStatus());
        return employeeMapper.toResponse(updated);
    }

    // ═══════════════════════════════════════════════
    // DELETE EMPLOYEE
    // ═══════════════════════════════════════════════
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found: " + id));
        employeeRepository.delete(employee);
        log.info("Employee deleted: {}", id);
    }

    // ═══════════════════════════════════════════════
    // GET BY DEPARTMENT
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<EmployeeListResponse> getByDepartment(Long departmentId) {
        return employeeMapper.toListResponses(
                employeeRepository.findByDepartmentId(departmentId));
    }

    // ═══════════════════════════════════════════════
    // SEARCH EMPLOYEES
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<EmployeeListResponse> searchEmployees(String query) {
        Pageable pageable = PageRequest.of(0, 20);
        return employeeRepository
                .searchEmployees(query, null, null, null, null, pageable)
                .map(employeeMapper::toListResponse)
                .toList();
    }

    // ═══════════════════════════════════════════════
    // UPLOAD PROFILE PHOTO
    // ═══════════════════════════════════════════════
    public String uploadProfilePhoto(Long id, MultipartFile file) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found: " + id));

        try {
            // Create directory
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate filename
            String extension = getFileExtension(file.getOriginalFilename());
            String filename = employee.getEmployeeId() + "_" +
                    UUID.randomUUID() + "." + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file
            Files.copy(file.getInputStream(), filePath,
                    StandardCopyOption.REPLACE_EXISTING);

            // Update employee
            String photoUrl = "/uploads/profile-photos/" + filename;
            employee.setProfilePicture(photoUrl);
            employeeRepository.save(employee);

            return photoUrl;
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload photo: " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════
    // DASHBOARD STATS
    // ═══════════════════════════════════════════════
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long total      = employeeRepository.count();
        long active     = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long inactive   = employeeRepository.countByStatus(EmployeeStatus.INACTIVE);
        long onLeave    = employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE);
        long terminated = employeeRepository.countByStatus(EmployeeStatus.TERMINATED);
        long male       = employeeRepository.countByGender(com.hrms.enums.Gender.MALE);
        long female     = employeeRepository.countByGender(com.hrms.enums.Gender.FEMALE);

        LocalDate now = LocalDate.now();
        long newJoinees = employeeRepository.countNewJoinees(
                now.getMonthValue(), now.getYear());

        return DashboardStatsResponse.builder()
            .totalEmployees(total)
            .activeEmployees(active)
            .inactiveEmployees(inactive)
            .onLeaveEmployees(onLeave)
            .terminatedEmployees(terminated)
            .maleEmployees(male)
            .femaleEmployees(female)
            .newJoineesThisMonth(newJoinees)
            .build();
    }

    // ═══════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════
    private String generateEmployeeId() {
        int year  = LocalDate.now().getYear();
        long count = employeeRepository.countByYear(year) + 1;
        return String.format("EMP%d%04d", year, count);
    }

    private Address buildAddress(AddressRequest req, Employee employee) {
        return Address.builder()
            .employee(employee)
            .street(req.getStreet())
            .city(req.getCity())
            .state(req.getState())
            .country(req.getCountry() != null ? req.getCountry() : "India")
            .zipCode(req.getZipCode())
            .build();
    }

    private void updateAddress(Address address, AddressRequest req) {
        address.setStreet(req.getStreet());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setCountry(req.getCountry());
        address.setZipCode(req.getZipCode());
    }

    private EmergencyContact buildEmergencyContact(
            EmergencyContactRequest req, Employee employee) {
        return EmergencyContact.builder()
            .employee(employee)
            .name(req.getName())
            .relationship(req.getRelationship())
            .phone(req.getPhone())
            .email(req.getEmail())
            .build();
    }

    private void updateEmergencyContact(
            EmergencyContact ec, EmergencyContactRequest req) {
        ec.setName(req.getName());
        ec.setRelationship(req.getRelationship());
        ec.setPhone(req.getPhone());
        ec.setEmail(req.getEmail());
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "jpg";
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex > 0 ? filename.substring(dotIndex + 1) : "jpg";
    }
}