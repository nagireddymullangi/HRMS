

//com/hrms/dto/request/SelfAssessmentRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SelfAssessmentRequest {

 @NotNull @DecimalMin("0.0") @DecimalMax("5.0")
 private BigDecimal selfRating;

 @NotBlank(message = "Self comments required")
 @Size(min = 20, max = 2000)
 private String selfComments;

 private String selfStrengths;
 private String selfImprovements;

 private List<CompetencyRating> competencyRatings;

 @Data
 public static class CompetencyRating {
     private Long ratingId;
     private String competency;
     private BigDecimal selfRating;
     private String comments;
 }
}