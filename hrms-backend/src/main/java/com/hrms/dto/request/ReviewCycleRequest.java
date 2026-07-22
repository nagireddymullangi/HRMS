
//com/hrms/dto/request/ReviewCycleRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ReviewCycleRequest {

 @NotBlank(message = "Title is required")
 @Size(min = 3, max = 100)
 private String title;

 private String description;

 @NotNull(message = "Start date is required")
 private LocalDate startDate;

 @NotNull(message = "End date is required")
 private LocalDate endDate;

 @NotNull(message = "Year is required")
 private int year;

 private Integer quarter;
}