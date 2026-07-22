
//com/hrms/dto/response/PayrollSummaryResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class PayrollSummaryResponse {
 private int        month;
 private int        year;
 private String     monthName;
 private long       totalEmployees;
 private long       processedCount;
 private long       pendingCount;
 private long       paidCount;
 private BigDecimal totalGrossSalary;
 private BigDecimal totalDeductions;
 private BigDecimal totalNetSalary;
 private BigDecimal totalPfDeduction;
 private BigDecimal totalEsiDeduction;
 private BigDecimal totalTdsDeduction;
 private BigDecimal totalOvertimeAmount;
}