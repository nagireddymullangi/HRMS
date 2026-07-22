// com/hrms/dto/request/PayrollProcessRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class PayrollProcessRequest {

    @NotNull(message = "Month is required")
    @Min(value = 1,  message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2020, message = "Year must be between 2020 and 2099")
    @Max(value = 2099, message = "Year must be between 2020 and 2099")
    private Integer year;

    // Optional: specific employees. null/empty = process all active employees
    private List<@NotNull(message = "Employee ID cannot be null")
                 @Positive(message = "Employee ID must be positive") Long> employeeIds;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;
}