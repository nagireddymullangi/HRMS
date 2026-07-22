
//com/hrms/dto/request/CheckInRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckInRequest {

 @NotNull(message = "Employee ID is required")
 private Long employeeId;

 private String notes;
}