
//com/hrms/dto/response/EmployeeListResponse.java
package com.hrms.dto.response;

import com.hrms.enums.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class EmployeeListResponse {
 private Long id;
 private String employeeId;
 private String fullName;
 private String firstName;
 private String lastName;
 private String email;
 private String phone;
 private Gender gender;
 private LocalDate joiningDate;
 private EmploymentType employmentType;
 private EmployeeStatus status;
 private String departmentName;
 private String designationName;
 private String managerName;
 private BigDecimal salary;
 private String profilePicture;
}