
//com/hrms/dto/response/PayrollResponse.java
package com.hrms.dto.response;

import com.hrms.enums.PayrollStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class PayrollResponse {
 private Long          id;
 private Long          employeeId;
 private String        employeeName;
 private String        employeeCode;
 private String        departmentName;
 private String        designationName;
 private int           month;
 private int           year;
 private String        monthName;

 // Earnings
 private BigDecimal    basicSalary;
 private BigDecimal    hra;
 private BigDecimal    da;
 private BigDecimal    ta;
 private BigDecimal    medicalAllow;
 private BigDecimal    otherAllow;
 private BigDecimal    overtimeAmount;
 private BigDecimal    grossSalary;

 // Deductions
 private BigDecimal    pfDeduction;
 private BigDecimal    esiDeduction;
 private BigDecimal    tdsDeduction;
 private BigDecimal    profTax;
 private BigDecimal    lossOfPay;
 private BigDecimal    otherDeductions;
 private BigDecimal    totalDeductions;

 // Net
 private BigDecimal    netSalary;

 // Attendance
 private int           workingDays;
 private int           presentDays;
 private int           absentDays;
 private int           leaveDays;
 private BigDecimal    overtimeHours;

 // Status
 private PayrollStatus status;
 private LocalDate     paidOn;
 private String        paymentMode;
 private String        remarks;

 // Custom deductions
 private List<DeductionItem> customDeductions;

 private String        processedByName;
 private LocalDateTime processedAt;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;

 @Data @Builder
 @NoArgsConstructor @AllArgsConstructor
 public static class DeductionItem {
     private Long       id;
     private String     name;
     private BigDecimal amount;
     private String     description;
 }
}