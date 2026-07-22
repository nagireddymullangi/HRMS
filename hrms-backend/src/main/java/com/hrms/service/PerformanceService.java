
//com/hrms/service/PerformanceService.java
package com.hrms.service;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.enums.*;
import com.hrms.exception.*;
import com.hrms.mapper.PerformanceMapper;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PerformanceService {

 private final ReviewCycleRepository       cycleRepo;
 private final GoalRepository              goalRepo;
 private final PerformanceReviewRepository  reviewRepo;
 private final ReviewRatingRepository       ratingRepo;
 private final EmployeeRepository           employeeRepo;
 private final PerformanceMapper            mapper;

 // ═══════════════════════════════════════════════
 // REVIEW CYCLES
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public List<ReviewCycleResponse> getAllCycles(Integer year) {
     List<ReviewCycle> cycles = year != null
             ? cycleRepo.findByYear(year)
             : cycleRepo.findAll();
     return cycles.stream().map(mapper::toCycleResponse).toList();
 }

 @Transactional(readOnly = true)
 public ReviewCycleResponse getCycleById(Long id) {
     return mapper.toCycleResponse(cycleRepo.findById(id)
         .orElseThrow(() -> new ResourceNotFoundException("Cycle not found: " + id)));
 }

 public ReviewCycleResponse createCycle(ReviewCycleRequest req, User createdBy) {
     if (req.getEndDate().isBefore(req.getStartDate()))
         throw new BadRequestException("End date before start date");

     ReviewCycle cycle = ReviewCycle.builder()
         .title(req.getTitle())
         .description(req.getDescription())
         .startDate(req.getStartDate())
         .endDate(req.getEndDate())
         .year(req.getYear())
         .quarter(req.getQuarter())
         .status(ReviewCycleStatus.DRAFT)
         .createdBy(createdBy)
         .build();

     return mapper.toCycleResponse(cycleRepo.save(cycle));
 }

 public ReviewCycleResponse updateCycleStatus(Long id, String status) {
     ReviewCycle cycle = cycleRepo.findById(id)
         .orElseThrow(() -> new ResourceNotFoundException("Cycle not found"));
     cycle.setStatus(ReviewCycleStatus.valueOf(status.toUpperCase()));
     return mapper.toCycleResponse(cycleRepo.save(cycle));
 }

 // ═══════════════════════════════════════════════
 // GOALS
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public List<GoalResponse> getGoals(Long employeeId, Long cycleId) {
     List<Goal> goals = (cycleId != null)
         ? goalRepo.findByEmployeeIdAndReviewCycleId(employeeId, cycleId)
         : goalRepo.findByEmployeeId(employeeId);
     return goals.stream().map(mapper::toGoalResponse).toList();
 }

 public GoalResponse createGoal(GoalRequest req) {
     Employee emp = employeeRepo.findById(req.getEmployeeId())
         .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
     ReviewCycle cycle = cycleRepo.findById(req.getReviewCycleId())
         .orElseThrow(() -> new ResourceNotFoundException("Cycle not found"));

     Goal goal = Goal.builder()
         .employee(emp)
         .reviewCycle(cycle)
         .title(req.getTitle())
         .description(req.getDescription())
         .category(req.getCategory() != null ? req.getCategory() : "GENERAL")
         .weight(req.getWeight())
         .targetValue(req.getTargetValue())
         .status(GoalStatus.NOT_STARTED)
         .progress(0)
         .dueDate(req.getDueDate())
         .build();

     return mapper.toGoalResponse(goalRepo.save(goal));
 }

 public GoalResponse updateGoal(Long id, GoalRequest req) {
     Goal goal = goalRepo.findById(id)
         .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
     goal.setTitle(req.getTitle());
     goal.setDescription(req.getDescription());
     goal.setCategory(req.getCategory());
     goal.setWeight(req.getWeight());
     goal.setTargetValue(req.getTargetValue());
     goal.setAchievedValue(req.getAchievedValue());
     goal.setProgress(req.getProgress());
     goal.setDueDate(req.getDueDate());
     goal.setComments(req.getComments());
     if (req.getStatus() != null) goal.setStatus(req.getStatus());
     if (req.getProgress() >= 100) {
         goal.setStatus(GoalStatus.COMPLETED);
         goal.setCompletedDate(java.time.LocalDate.now());
     }
     return mapper.toGoalResponse(goalRepo.save(goal));
 }

 public void deleteGoal(Long id) {
     goalRepo.deleteById(id);
 }

 // ═══════════════════════════════════════════════
 // PERFORMANCE REVIEWS
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public Page<PerformanceReviewResponse> getAllReviews(
         int page, int size, Long cycleId,
         ReviewStatus status, Long empId,
         Long deptId, String search) {
     Pageable pageable = PageRequest.of(page, size);
     return reviewRepo.findReviews(cycleId, status, empId, deptId, search, pageable)
             .map(mapper::toReviewResponse);
 }

 @Transactional(readOnly = true)
 public PerformanceReviewResponse getReviewById(Long id) {
     PerformanceReview review = reviewRepo.findById(id)
         .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
     return mapper.toReviewResponse(review);
 }

 // ── Initiate Review ────────────────────────────
 public PerformanceReviewResponse initiateReview(InitiateReviewRequest req) {
     Employee emp = employeeRepo.findById(req.getEmployeeId())
         .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
     Employee reviewer = employeeRepo.findById(req.getReviewerId())
         .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
     ReviewCycle cycle = cycleRepo.findById(req.getReviewCycleId())
         .orElseThrow(() -> new ResourceNotFoundException("Cycle not found"));

     if (reviewRepo.existsByEmployeeIdAndReviewCycleId(emp.getId(), cycle.getId()))
         throw new BadRequestException("Review already exists for this employee & cycle");

     PerformanceReview review = PerformanceReview.builder()
         .employee(emp)
         .reviewer(reviewer)
         .reviewCycle(cycle)
         .status(ReviewStatus.PENDING_SELF)
         .build();

     PerformanceReview saved = reviewRepo.save(review);

     // Create default competency ratings
     if (req.getCompetencies() != null) {
         req.getCompetencies().forEach(c -> {
             ReviewRating rating = ReviewRating.builder()
                 .review(saved)
                 .competency(c.getCompetency())
                 .category(c.getCategory() != null ? c.getCategory() : "CORE")
                 .weight(c.getWeight())
                 .build();
             ratingRepo.save(rating);
         });
     } else {
         createDefaultCompetencies(saved);
     }

     return mapper.toReviewResponse(saved);
 }

 // ── Self Assessment ────────────────────────────
 public PerformanceReviewResponse submitSelfAssessment(
         Long reviewId, SelfAssessmentRequest req) {

     PerformanceReview review = reviewRepo.findById(reviewId)
         .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

     if (review.getStatus() != ReviewStatus.PENDING_SELF)
         throw new BadRequestException("Self assessment already submitted");

     review.setSelfRating(req.getSelfRating());
     review.setSelfComments(req.getSelfComments());
     review.setSelfStrengths(req.getSelfStrengths());
     review.setSelfImprovements(req.getSelfImprovements());
     review.setSelfSubmittedAt(LocalDateTime.now());
     review.setStatus(ReviewStatus.PENDING_MANAGER);

     // Update competency self ratings
     if (req.getCompetencyRatings() != null) {
         req.getCompetencyRatings().forEach(cr -> {
             if (cr.getRatingId() != null) {
                 ratingRepo.findById(cr.getRatingId()).ifPresent(r -> {
                     r.setSelfRating(cr.getSelfRating());
                     r.setComments(cr.getComments());
                     ratingRepo.save(r);
                 });
             }
         });
     }

     return mapper.toReviewResponse(reviewRepo.save(review));
 }

 // ── Manager Review ─────────────────────────────
 public PerformanceReviewResponse submitManagerReview(
         Long reviewId, PerformanceReviewRequest req) {

     PerformanceReview review = reviewRepo.findById(reviewId)
         .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

     if (review.getStatus() != ReviewStatus.PENDING_MANAGER)
         throw new BadRequestException("Not ready for manager review");

     review.setManagerRating(req.getManagerRating());
     review.setManagerComments(req.getManagerComments());
     review.setManagerStrengths(req.getManagerStrengths());
     review.setManagerImprovements(req.getManagerImprovements());
     review.setManagerSubmittedAt(LocalDateTime.now());
     review.setOverallPerformance(req.getOverallPerformance());
     review.setPromotionRecommended(req.isPromotionRecommended());
     review.setSalaryHikePercent(req.getSalaryHikePercent());
     review.setTrainingNeeded(req.getTrainingNeeded());
     review.setFinalComments(req.getFinalComments());

     // Final rating = avg of self + manager
     BigDecimal finalRating = review.getSelfRating()
         .add(req.getManagerRating())
         .divide(BigDecimal.valueOf(2), 1, RoundingMode.HALF_UP);
     review.setFinalRating(finalRating);

     review.setStatus(ReviewStatus.COMPLETED);
     review.setCompletedAt(LocalDateTime.now());

     // Update competency manager ratings
     if (req.getCompetencyRatings() != null) {
         req.getCompetencyRatings().forEach(cr -> {
             if (cr.getRatingId() != null) {
                 ratingRepo.findById(cr.getRatingId()).ifPresent(r -> {
                     r.setManagerRating(cr.getManagerRating());
                     if (cr.getComments() != null) r.setComments(cr.getComments());
                     ratingRepo.save(r);
                 });
             }
         });
     }

     return mapper.toReviewResponse(reviewRepo.save(review));
 }

 // ═══════════════════════════════════════════════
 // SUMMARY (Dashboard)
 // ═══════════════════════════════════════════════
 @Transactional(readOnly = true)
 public PerformanceSummaryResponse getSummary() {
     return PerformanceSummaryResponse.builder()
         .totalReviews(reviewRepo.count())
         .pendingSelf(reviewRepo.countByStatus(ReviewStatus.PENDING_SELF))
         .pendingManager(reviewRepo.countByStatus(ReviewStatus.PENDING_MANAGER))
         .completed(reviewRepo.countByStatus(ReviewStatus.COMPLETED))
         .cancelled(reviewRepo.countByStatus(ReviewStatus.CANCELLED))
         .promotionRecommendations(reviewRepo.countByPromotionRecommendedTrue())
         .outstandingCount(reviewRepo.countByOverallPerformance(OverallPerformance.OUTSTANDING))
         .exceedsCount(reviewRepo.countByOverallPerformance(OverallPerformance.EXCEEDS))
         .meetsCount(reviewRepo.countByOverallPerformance(OverallPerformance.MEETS))
         .belowCount(reviewRepo.countByOverallPerformance(OverallPerformance.BELOW))
         .unsatisfactoryCount(reviewRepo.countByOverallPerformance(OverallPerformance.UNSATISFACTORY))
         .build();
 }

 // ── Helper: Default Competencies ───────────────
 private void createDefaultCompetencies(PerformanceReview review) {
     String[][] defaults = {
         {"Communication Skills",    "CORE",       "2"},
         {"Technical Knowledge",     "TECHNICAL",  "3"},
         {"Problem Solving",         "CORE",       "2"},
         {"Teamwork & Collaboration","BEHAVIORAL", "2"},
         {"Leadership",             "BEHAVIORAL", "1"},
         {"Time Management",         "CORE",       "1"},
         {"Innovation & Creativity", "TECHNICAL",  "1"},
         {"Work Quality",            "CORE",       "3"},
     };
     for (String[] d : defaults) {
         ratingRepo.save(ReviewRating.builder()
             .review(review)
             .competency(d[0])
             .category(d[1])
             .weight(Integer.parseInt(d[2]))
             .build());
     }
 }
}