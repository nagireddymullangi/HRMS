
//com/hrms/dto/request/PerformanceReviewRequest.java
package com.hrms.dto.request;

import com.hrms.enums.OverallPerformance;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PerformanceReviewRequest {

 @NotNull @DecimalMin("0.0") @DecimalMax("5.0")
 private BigDecimal managerRating;

 @NotBlank @Size(min = 20, max = 2000)
 private String managerComments;

 private String managerStrengths;
 private String managerImprovements;

 @NotNull
 private OverallPerformance overallPerformance;

 private boolean promotionRecommended;

 @DecimalMin("0.0") @DecimalMax("100.0")
 private BigDecimal salaryHikePercent;

 private String trainingNeeded;
 private String finalComments;

 private List<CompetencyRating> competencyRatings;

 @Data
 public static class CompetencyRating {
     private Long ratingId;
     private String competency;
     private BigDecimal managerRating;
     private String comments;
 }
}