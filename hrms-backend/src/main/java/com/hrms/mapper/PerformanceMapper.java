
//com/hrms/mapper/PerformanceMapper.java
package com.hrms.mapper;

import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.repository.GoalRepository;
import com.hrms.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.hrms.enums.*;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PerformanceMapper {

 private final PerformanceReviewRepository reviewRepository;
 private final GoalRepository goalRepository;

 public ReviewCycleResponse toCycleResponse(ReviewCycle rc) {
     long total     = reviewRepository.countByReviewCycleId(rc.getId());
     long completed = reviewRepository.countByReviewCycleIdAndStatus(
             rc.getId(), ReviewStatus.COMPLETED);
     long pending   = total - completed;
     double pct     = total > 0
             ? Math.round((double) completed / total * 100.0 * 10) / 10.0
             : 0.0;

     return ReviewCycleResponse.builder()
         .id(rc.getId())
         .title(rc.getTitle())
         .description(rc.getDescription())
         .startDate(rc.getStartDate())
         .endDate(rc.getEndDate())
         .status(rc.getStatus())
         .year(rc.getYear())
         .quarter(rc.getQuarter())
         .totalReviews(total)
         .completedReviews(completed)
         .pendingReviews(pending)
         .completionPercent(pct)
         .createdByName(rc.getCreatedBy() != null
                 ? rc.getCreatedBy().getUsername() : null)
         .createdAt(rc.getCreatedAt())
         .build();
 }

 public GoalResponse toGoalResponse(Goal g) {
     return GoalResponse.builder()
         .id(g.getId())
         .employeeId(g.getEmployee() != null ? g.getEmployee().getId() : null)
         .employeeName(g.getEmployee() != null ? g.getEmployee().getFullName() : null)
         .reviewCycleId(g.getReviewCycle() != null ? g.getReviewCycle().getId() : null)
         .reviewCycleTitle(g.getReviewCycle() != null ? g.getReviewCycle().getTitle() : null)
         .title(g.getTitle())
         .description(g.getDescription())
         .category(g.getCategory())
         .weight(g.getWeight())
         .targetValue(g.getTargetValue())
         .achievedValue(g.getAchievedValue())
         .status(g.getStatus())
         .progress(g.getProgress())
         .dueDate(g.getDueDate())
         .completedDate(g.getCompletedDate())
         .comments(g.getComments())
         .createdAt(g.getCreatedAt())
         .updatedAt(g.getUpdatedAt())
         .build();
 }

 public PerformanceReviewResponse toReviewResponse(PerformanceReview pr) {
     // Count goals
     long totalGoals = goalRepository
         .countByEmployeeIdAndReviewCycleId(
             pr.getEmployee().getId(), pr.getReviewCycle().getId());
     long completedGoals = goalRepository
         .countByEmployeeIdAndReviewCycleIdAndStatus(
             pr.getEmployee().getId(), pr.getReviewCycle().getId(),
             GoalStatus.COMPLETED);
     double goalPct = totalGoals > 0
         ? Math.round((double) completedGoals / totalGoals * 100.0) : 0.0;

     return PerformanceReviewResponse.builder()
         .id(pr.getId())
         .employeeId(pr.getEmployee().getId())
         .employeeName(pr.getEmployee().getFullName())
         .employeeCode(pr.getEmployee().getEmployeeId())
         .departmentName(pr.getEmployee().getDepartment() != null
                 ? pr.getEmployee().getDepartment().getName() : null)
         .designationName(pr.getEmployee().getDesignation() != null
                 ? pr.getEmployee().getDesignation().getTitle() : null)
         .reviewerId(pr.getReviewer().getId())
         .reviewerName(pr.getReviewer().getFullName())
         .reviewCycleId(pr.getReviewCycle().getId())
         .reviewCycleTitle(pr.getReviewCycle().getTitle())
         .status(pr.getStatus())
         .selfRating(pr.getSelfRating())
         .selfComments(pr.getSelfComments())
         .selfStrengths(pr.getSelfStrengths())
         .selfImprovements(pr.getSelfImprovements())
         .selfSubmittedAt(pr.getSelfSubmittedAt())
         .managerRating(pr.getManagerRating())
         .managerComments(pr.getManagerComments())
         .managerStrengths(pr.getManagerStrengths())
         .managerImprovements(pr.getManagerImprovements())
         .managerSubmittedAt(pr.getManagerSubmittedAt())
         .finalRating(pr.getFinalRating())
         .finalComments(pr.getFinalComments())
         .overallPerformance(pr.getOverallPerformance())
         .promotionRecommended(pr.isPromotionRecommended())
         .salaryHikePercent(pr.getSalaryHikePercent())
         .trainingNeeded(pr.getTrainingNeeded())
         .completedAt(pr.getCompletedAt())
         .ratings(pr.getRatings() != null
             ? pr.getRatings().stream().map(r ->
                 PerformanceReviewResponse.RatingItem.builder()
                     .id(r.getId())
                     .competency(r.getCompetency())
                     .category(r.getCategory())
                     .selfRating(r.getSelfRating())
                     .managerRating(r.getManagerRating())
                     .weight(r.getWeight())
                     .comments(r.getComments())
                     .build()
             ).toList()
             : List.of())
         .totalGoals((int) totalGoals)
         .completedGoals((int) completedGoals)
         .goalCompletionPercent(goalPct)
         .createdAt(pr.getCreatedAt())
         .updatedAt(pr.getUpdatedAt())
         .build();
 }
}