
//com/hrms/dto/request/InitiateReviewRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class InitiateReviewRequest {

 @NotNull(message = "Review cycle is required")
 private Long reviewCycleId;

 @NotNull(message = "Employee ID is required")
 private Long employeeId;

 @NotNull(message = "Reviewer ID is required")
 private Long reviewerId;

 private List<CompetencyItem> competencies;

 @Data
 public static class CompetencyItem {
     private String competency;
     private String category;
     private int weight;
 }
}