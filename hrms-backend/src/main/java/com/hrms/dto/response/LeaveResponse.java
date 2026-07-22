
//com/hrms/dto/response/LeaveResponse.java
package com.hrms.dto.response;

import com.hrms.enums.LeaveStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class LeaveResponse {
 private Long          id;
 private Long          employeeId;
 private String        employeeName;
 private String        employeeCode;
 private String        departmentName;
 private Long          leaveTypeId;
 private String        leaveTypeName;
 private String        leaveTypeColor;
 private LocalDate     startDate;
 private LocalDate     endDate;
 private int           totalDays;
 private String        reason;
 private LeaveStatus   status;
 private Long          approvedById;
 private String        approvedByName;
 private String        approvalNote;
 private LocalDateTime approvedAt;
 private LocalDateTime appliedOn;
 private boolean       isHalfDay;
 private String        halfDayType;
 private String        documentPath;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}