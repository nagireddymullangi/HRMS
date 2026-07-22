// com/hrms/dto/request/SalaryStructureRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SalaryStructureRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.0",
                message = "Basic salary must be positive")
    private BigDecimal basicSalary;

    @DecimalMin("0") @DecimalMax("100")
    private BigDecimal hraPercent = new BigDecimal("40.00");

    @DecimalMin("0") @DecimalMax("100")
    private BigDecimal daPercent = new BigDecimal("10.00");

    @DecimalMin("0")
    private BigDecimal taAmount = BigDecimal.ZERO;

    @DecimalMin("0")
    private BigDecimal medicalAllow = BigDecimal.ZERO;

    @DecimalMin("0")
    private BigDecimal otherAllow = BigDecimal.ZERO;

    @DecimalMin("0") @DecimalMax("100")
    private BigDecimal pfPercent = new BigDecimal("12.00");

    @DecimalMin("0") @DecimalMax("100")
    private BigDecimal esiPercent = new BigDecimal("0.75");

    @DecimalMin("0") @DecimalMax("100")
    private BigDecimal tdsPercent = BigDecimal.ZERO;

    @DecimalMin("0")
    private BigDecimal profTax = new BigDecimal("200.00");

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;
}