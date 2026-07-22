
//com/hrms/dto/response/PayslipResponse.java
package com.hrms.dto.response;

import com.hrms.enums.PayrollStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class PayslipResponse {
 // Company Info
 private String     companyName;
 private String     companyAddress;
 private String     companyEmail;
 private String     companyPhone;

 // Employee Info
 private Long       employeeId;
 private String     employeeCode;
 private String     employeeName;
 private String     designation;
 private String     department;
 private String     panNumber;
 private String     bankAccount;
 private String     pfNumber;
 private String     esiNumber;

 // Pay Period
 private int        month;
 private int        year;
 private String     monthName;
 private LocalDate  paidOn;
 private String     paymentMode;

 // Attendance Summary
 private int        workingDays;
 private int        presentDays;
 private int        absentDays;
 private int        leaveDays;

 // Earnings
 private BigDecimal basicSalary;
 private BigDecimal hra;
 private BigDecimal da;
 private BigDecimal ta;
 private BigDecimal medicalAllow;
 private BigDecimal otherAllow;
 private BigDecimal overtimeAmount;
 private BigDecimal grossEarnings;

 // Deductions
 private BigDecimal pfDeduction;
 private BigDecimal esiDeduction;
 private BigDecimal tdsDeduction;
 private BigDecimal profTax;
 private BigDecimal lossOfPay;
 private BigDecimal otherDeductions;
 private BigDecimal totalDeductions;

 // Net
 private BigDecimal netSalary;
 private String     netSalaryInWords;

 // Status
 private PayrollStatus status;
}