
//com/hrms/dto/request/LeaveRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequest {

 @NotNull(message = "Employee ID is required")
 private Long employeeId;

 @NotNull(message = "Leave type is required")
 private Long leaveTypeId;

 @NotNull(message = "Start date is required")
 private LocalDate startDate;

 @NotNull(message = "End date is required")
 private LocalDate endDate;

 @NotBlank(message = "Reason is required")
 @Size(min = 10, max = 500,
       message = "Reason must be between 10 and 500 characters")
 private String reason;

 private boolean isHalfDay = false;

 private String halfDayType;

 private String documentPath;
}