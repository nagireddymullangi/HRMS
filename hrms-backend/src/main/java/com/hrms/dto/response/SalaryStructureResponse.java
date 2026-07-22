
//com/hrms/dto/response/SalaryStructureResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class SalaryStructureResponse {
 private Long       id;
 private Long       employeeId;
 private String     employeeName;
 private String     employeeCode;
 private String     departmentName;
 private String     designationName;

 // Earnings
 private BigDecimal basicSalary;
 private BigDecimal hraPercent;
 private BigDecimal hraAmount;
 private BigDecimal daPercent;
 private BigDecimal daAmount;
 private BigDecimal taAmount;
 private BigDecimal medicalAllow;
 private BigDecimal otherAllow;
 private BigDecimal grossSalary;

 // Deductions
 private BigDecimal pfPercent;
 private BigDecimal pfAmount;
 private BigDecimal esiPercent;
 private BigDecimal esiAmount;
 private BigDecimal tdsPercent;
 private BigDecimal tdsAmount;
 private BigDecimal profTax;
 private BigDecimal totalDeductions;

 // Net
 private BigDecimal netSalary;

 private LocalDate  effectiveFrom;
 private LocalDate  effectiveTo;
 private boolean    isActive;
 private LocalDateTime createdAt;
}