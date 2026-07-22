
//com/hrms/dto/response/DashboardStatsResponse.java
package com.hrms.dto.response;

import lombok.*;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class DashboardStatsResponse {
 private long totalEmployees;
 private long activeEmployees;
 private long inactiveEmployees;
 private long onLeaveEmployees;
 private long terminatedEmployees;
 private long maleEmployees;
 private long femaleEmployees;
 private long newJoineesThisMonth;
 private long totalDepartments;
 private long pendingLeaves;
 private long presentToday;
}