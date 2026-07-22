
//com/hrms/dto/request/UpdateStatusRequest.java
package com.hrms.dto.request;

import com.hrms.enums.EmployeeStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
 @NotNull(message = "Status is required")
 private EmployeeStatus status;
 private String reason;
}