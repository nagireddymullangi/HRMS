
//com/hrms/dto/response/PerformanceReviewResponse.java
package com.hrms.dto.response;

import com.hrms.enums.OverallPerformance;
import com.hrms.enums.ReviewStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class PerformanceReviewResponse {
 private Long                id;

 // Employee
 private Long                employeeId;
 private String              employeeName;
 private String              employeeCode;
 private String              departmentName;
 private String              designationName;

 // Reviewer
 private Long                reviewerId;
 private String              reviewerName;

 // Cycle
 private Long                reviewCycleId;
 private String              reviewCycleTitle;

 private ReviewStatus        status;

 // Self Assessment
 private BigDecimal          selfRating;
 private String              selfComments;
 private String              selfStrengths;
 private String              selfImprovements;
 private LocalDateTime       selfSubmittedAt;

 // Manager Review
 private BigDecimal          managerRating;
 private String              managerComments;
 private String              managerStrengths;
 private String              managerImprovements;
 private LocalDateTime       managerSubmittedAt;

 // Final
 private BigDecimal          finalRating;
 private String              finalComments;
 private OverallPerformance  overallPerformance;
 private boolean             promotionRecommended;
 private BigDecimal          salaryHikePercent;
 private String              trainingNeeded;
 private LocalDateTime       completedAt;

 // Competency Ratings
 private List<RatingItem>    ratings;

 // Goals Summary
 private int                 totalGoals;
 private int                 completedGoals;
 private double              goalCompletionPercent;

 private LocalDateTime       createdAt;
 private LocalDateTime       updatedAt;

 @Data @Builder
 @NoArgsConstructor @AllArgsConstructor
 public static class RatingItem {
     private Long       id;
     private String     competency;
     private String     category;
     private BigDecimal selfRating;
     private BigDecimal managerRating;
     private int        weight;
     private String     comments;
 }
}