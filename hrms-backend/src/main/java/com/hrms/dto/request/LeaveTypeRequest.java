
//com/hrms/dto/request/LeaveTypeRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LeaveTypeRequest {

 @NotBlank(message = "Name is required")
 @Size(min = 2, max = 50)
 private String name;

 @NotBlank(message = "Code is required")
 @Size(min = 2, max = 20)
 private String code;

 private String description;

 @Min(value = 0, message = "Max days must be >= 0")
 @Max(value = 365, message = "Max days must be <= 365")
 private int maxDays;

 private boolean isPaid       = true;
 private boolean isActive     = true;
 private boolean requiresDocument = false;
 private String  color        = "#6366f1";
}