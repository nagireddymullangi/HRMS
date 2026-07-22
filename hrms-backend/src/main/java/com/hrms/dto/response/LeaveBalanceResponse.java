
//com/hrms/dto/response/LeaveBalanceResponse.java
package com.hrms.dto.response;

import lombok.*;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class LeaveBalanceResponse {
 private Long   employeeId;
 private String employeeName;
 private int    year;
 private java.util.List<LeaveBalanceItem> balances;
 private int    totalAllocated;
 private int    totalUsed;
 private int    totalPending;
 private int    totalRemaining;

 @Data @Builder
 @NoArgsConstructor @AllArgsConstructor
 public static class LeaveBalanceItem {
     private Long   leaveTypeId;
     private String leaveTypeName;
     private String leaveTypeCode;
     private String color;
     private int    allocated;
     private int    used;
     private int    pending;
     private int    carriedForward;
     private int    remaining;
     private double usedPercent;
 }
}