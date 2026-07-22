
//com/hrms/dto/request/AttendanceFilterRequest.java
package com.hrms.dto.request;

import com.hrms.enums.AttendanceStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceFilterRequest {
 private Long           employeeId;
 private AttendanceStatus status;
 private LocalDate      startDate;
 private LocalDate      endDate;
 private Integer        month;
 private Integer        year;
 private Long           departmentId;
 private String         search;
}