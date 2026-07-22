// com/hrms/dto/response/EmployeeResponse.java
package com.hrms.dto.response;

import com.hrms.enums.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate dateOfBirth;
    private BloodGroup bloodGroup;
    private MaritalStatus maritalStatus;
    private LocalDate joiningDate;
    private EmploymentType employmentType;
    private EmployeeStatus status;
    private Long departmentId;
    private String departmentName;
    private Long designationId;
    private String designationName;
    private Long managerId;
    private String managerName;
    private BigDecimal salary;
    private String profilePicture;
    private AddressResponse address;
    private EmergencyContactResponse emergencyContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}