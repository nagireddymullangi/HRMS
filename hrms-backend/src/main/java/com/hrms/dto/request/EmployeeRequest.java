// com/hrms/dto/request/EmployeeRequest.java
package com.hrms.dto.request;

import com.hrms.enums.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be 2-50 chars")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be 2-50 chars")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$",
             message = "Enter valid 10-digit mobile number")
    private String phone;

    @NotNull(message = "Gender is required")
    private Gender gender;

    private LocalDate dateOfBirth;
    private BloodGroup bloodGroup;
    private MaritalStatus maritalStatus;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Designation is required")
    private Long designationId;

    private Long managerId;

    @DecimalMin(value = "0.0", message = "Salary must be positive")
    private BigDecimal salary;

    private AddressRequest address;
    private EmergencyContactRequest emergencyContact;
}