
//com/hrms/dto/response/AttendanceSummaryResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class AttendanceSummaryResponse {
 private Long       employeeId;
 private String     employeeName;
 private String     employeeCode;
 private int        month;
 private int        year;
 private int        totalDays;
 private int        presentDays;
 private int        absentDays;
 private int        lateDays;
 private int        halfDays;
 private int        leaveDays;
 private int        holidays;
 private int        weekends;
 private BigDecimal totalWorkHours;
 private BigDecimal totalOvertime;
 private double     attendancePercent;
}