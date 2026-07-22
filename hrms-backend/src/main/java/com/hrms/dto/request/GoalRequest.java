
//com/hrms/dto/request/GoalRequest.java
package com.hrms.dto.request;

import com.hrms.enums.GoalStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class GoalRequest {

 @NotNull(message = "Employee ID is required")
 private Long employeeId;

 @NotNull(message = "Review cycle is required")
 private Long reviewCycleId;

 @NotBlank(message = "Title is required")
 @Size(min = 3, max = 200)
 private String title;

 private String description;
 private String category;

 @Min(0) @Max(100)
 private int weight = 0;

 private String targetValue;
 private String achievedValue;
 private GoalStatus status;

 @Min(0) @Max(100)
 private int progress = 0;

 private LocalDate dueDate;
 private String comments;
}