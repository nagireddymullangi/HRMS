
//com/hrms/dto/request/LeaveApprovalRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeaveApprovalRequest {

 @NotNull(message = "Leave ID is required")
 private Long leaveId;

 private String approvalNote;
}