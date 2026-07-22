
//com/hrms/dto/response/GoalResponse.java
package com.hrms.dto.response;

import com.hrms.enums.GoalStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class GoalResponse {
 private Long       id;
 private Long       employeeId;
 private String     employeeName;
 private Long       reviewCycleId;
 private String     reviewCycleTitle;
 private String     title;
 private String     description;
 private String     category;
 private int        weight;
 private String     targetValue;
 private String     achievedValue;
 private GoalStatus status;
 private int        progress;
 private LocalDate  dueDate;
 private LocalDate  completedDate;
 private String     comments;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}