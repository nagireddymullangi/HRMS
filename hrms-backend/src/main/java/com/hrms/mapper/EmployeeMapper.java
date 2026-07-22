// com/hrms/mapper/EmployeeMapper.java
package com.hrms.mapper;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.*;
import com.hrms.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmployeeMapper {

    // ── Request → Entity ───────────────────────────
    public Employee toEntity(EmployeeRequest request) {
        return Employee.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .gender(request.getGender())
            .dateOfBirth(request.getDateOfBirth())
            .bloodGroup(request.getBloodGroup())
            .maritalStatus(request.getMaritalStatus())
            .joiningDate(request.getJoiningDate())
            .employmentType(request.getEmploymentType())
            .salary(request.getSalary())
            .build();
    }

    // ── Update Entity from Request ─────────────────
    public void updateEntity(Employee employee, EmployeeRequest request) {
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setGender(request.getGender());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setBloodGroup(request.getBloodGroup());
        employee.setMaritalStatus(request.getMaritalStatus());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setSalary(request.getSalary());
    }

    // ── Entity → Full Response ─────────────────────
    public EmployeeResponse toResponse(Employee emp) {
        return EmployeeResponse.builder()
            .id(emp.getId())
            .employeeId(emp.getEmployeeId())
            .firstName(emp.getFirstName())
            .lastName(emp.getLastName())
            .fullName(emp.getFullName())
            .email(emp.getEmail())
            .phone(emp.getPhone())
            .gender(emp.getGender())
            .dateOfBirth(emp.getDateOfBirth())
            .bloodGroup(emp.getBloodGroup())
            .maritalStatus(emp.getMaritalStatus())
            .joiningDate(emp.getJoiningDate())
            .employmentType(emp.getEmploymentType())
            .status(emp.getStatus())
            .departmentId(emp.getDepartment() != null
                    ? emp.getDepartment().getId() : null)
            .departmentName(emp.getDepartment() != null
                    ? emp.getDepartment().getName() : null)
            .designationId(emp.getDesignation() != null
                    ? emp.getDesignation().getId() : null)
            .designationName(emp.getDesignation() != null
                    ? emp.getDesignation().getTitle() : null)
            .managerId(emp.getManager() != null
                    ? emp.getManager().getId() : null)
            .managerName(emp.getManager() != null
                    ? emp.getManager().getFullName() : null)
            .salary(emp.getSalary())
            .profilePicture(emp.getProfilePicture())
            .address(emp.getAddress() != null
                    ? toAddressResponse(emp.getAddress()) : null)
            .emergencyContact(emp.getEmergencyContact() != null
                    ? toEmergencyResponse(emp.getEmergencyContact()) : null)
            .createdAt(emp.getCreatedAt())
            .updatedAt(emp.getUpdatedAt())
            .build();
    }

    // ── Entity → List Response ─────────────────────
    public EmployeeListResponse toListResponse(Employee emp) {
        return EmployeeListResponse.builder()
            .id(emp.getId())
            .employeeId(emp.getEmployeeId())
            .firstName(emp.getFirstName())
            .lastName(emp.getLastName())
            .fullName(emp.getFullName())
            .email(emp.getEmail())
            .phone(emp.getPhone())
            .gender(emp.getGender())
            .joiningDate(emp.getJoiningDate())
            .employmentType(emp.getEmploymentType())
            .status(emp.getStatus())
            .departmentName(emp.getDepartment() != null
                    ? emp.getDepartment().getName() : null)
            .designationName(emp.getDesignation() != null
                    ? emp.getDesignation().getTitle() : null)
            .managerName(emp.getManager() != null
                    ? emp.getManager().getFullName() : null)
            .salary(emp.getSalary())
            .profilePicture(emp.getProfilePicture())
            .build();
    }

    // ── Helper: Address ────────────────────────────
    private AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
            .street(address.getStreet())
            .city(address.getCity())
            .state(address.getState())
            .country(address.getCountry())
            .zipCode(address.getZipCode())
            .build();
    }

    // ── Helper: Emergency Contact ──────────────────
    private EmergencyContactResponse toEmergencyResponse(EmergencyContact ec) {
        return EmergencyContactResponse.builder()
            .name(ec.getName())
            .relationship(ec.getRelationship())
            .phone(ec.getPhone())
            .email(ec.getEmail())
            .build();
    }

    // ── List Mapping ───────────────────────────────
    public List<EmployeeListResponse> toListResponses(List<Employee> employees) {
        return employees.stream().map(this::toListResponse).toList();
    }
}