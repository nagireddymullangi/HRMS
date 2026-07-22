
//com/hrms/controller/PerformanceController.java
package com.hrms.controller;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.entity.User;
import com.hrms.enums.ReviewStatus;
import com.hrms.service.PerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/performance")
@RequiredArgsConstructor
@Tag(name = "Performance Management",
  description = "Performance review APIs")
@SecurityRequirement(name = "bearerAuth")
public class PerformanceController {

 private final PerformanceService service;

 // ══════════════════════════════════════════════
 // REVIEW CYCLES
 // ══════════════════════════════════════════════
 @GetMapping("/cycles")
 @Operation(summary = "Get All Review Cycles")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<List<ReviewCycleResponse>>>
 getCycles(@RequestParam(required = false) Integer year) {
     return ResponseEntity.ok(ApiResponse.success(
         "Cycles fetched", service.getAllCycles(year)));
 }

 @GetMapping("/cycles/{id}")
 @Operation(summary = "Get Cycle by ID")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<ReviewCycleResponse>>
 getCycle(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success(
         "Cycle fetched", service.getCycleById(id)));
 }

 @PostMapping("/cycles")
 @Operation(summary = "Create Review Cycle")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<ReviewCycleResponse>>
 createCycle(
         @Valid @RequestBody ReviewCycleRequest req,
         @AuthenticationPrincipal User user) {
     return ResponseEntity.status(HttpStatus.CREATED)
         .body(ApiResponse.success("Cycle created",
             service.createCycle(req, user)));
 }

 @PatchMapping("/cycles/{id}/status")
 @Operation(summary = "Update Cycle Status")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
 public ResponseEntity<ApiResponse<ReviewCycleResponse>>
 updateCycleStatus(
         @PathVariable Long id,
         @RequestParam String status) {
     return ResponseEntity.ok(ApiResponse.success(
         "Status updated",
         service.updateCycleStatus(id, status)));
 }

 // ══════════════════════════════════════════════
 // GOALS
 // ══════════════════════════════════════════════
 @GetMapping("/goals")
 @Operation(summary = "Get Employee Goals")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<List<GoalResponse>>>
 getGoals(
         @RequestParam Long employeeId,
         @RequestParam(required = false) Long cycleId) {
     return ResponseEntity.ok(ApiResponse.success(
         "Goals fetched", service.getGoals(employeeId, cycleId)));
 }

 @PostMapping("/goals")
 @Operation(summary = "Create Goal")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<GoalResponse>>
 createGoal(@Valid @RequestBody GoalRequest req) {
     return ResponseEntity.status(HttpStatus.CREATED)
         .body(ApiResponse.success("Goal created",
             service.createGoal(req)));
 }

 @PutMapping("/goals/{id}")
 @Operation(summary = "Update Goal")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<GoalResponse>>
 updateGoal(
         @PathVariable Long id,
         @Valid @RequestBody GoalRequest req) {
     return ResponseEntity.ok(ApiResponse.success(
         "Goal updated", service.updateGoal(id, req)));
 }

 @DeleteMapping("/goals/{id}")
 @Operation(summary = "Delete Goal")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<Void>>
 deleteGoal(@PathVariable Long id) {
     service.deleteGoal(id);
     return ResponseEntity.ok(ApiResponse.success("Goal deleted"));
 }

 // ══════════════════════════════════════════════
 // PERFORMANCE REVIEWS
 // ══════════════════════════════════════════════
 @GetMapping("/reviews")
 @Operation(summary = "Get All Reviews (Paginated)")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<Page<PerformanceReviewResponse>>>
 getReviews(
         @RequestParam(defaultValue = "0")  int page,
         @RequestParam(defaultValue = "10") int size,
         @RequestParam(required = false)    Long cycleId,
         @RequestParam(required = false)    ReviewStatus status,
         @RequestParam(required = false)    Long employeeId,
         @RequestParam(required = false)    Long departmentId,
         @RequestParam(required = false)    String search) {
     return ResponseEntity.ok(ApiResponse.success(
         "Reviews fetched",
         service.getAllReviews(page, size, cycleId,
                 status, employeeId, departmentId, search)));
 }

 @GetMapping("/reviews/{id}")
 @Operation(summary = "Get Review by ID")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<PerformanceReviewResponse>>
 getReview(@PathVariable Long id) {
     return ResponseEntity.ok(ApiResponse.success(
         "Review fetched", service.getReviewById(id)));
 }

 @PostMapping("/reviews/initiate")
 @Operation(summary = "Initiate Performance Review")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<PerformanceReviewResponse>>
 initiateReview(
         @Valid @RequestBody InitiateReviewRequest req) {
     return ResponseEntity.status(HttpStatus.CREATED)
         .body(ApiResponse.success("Review initiated",
             service.initiateReview(req)));
 }

 @PatchMapping("/reviews/{id}/self-assessment")
 @Operation(summary = "Submit Self Assessment")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<ApiResponse<PerformanceReviewResponse>>
 submitSelfAssessment(
         @PathVariable Long id,
         @Valid @RequestBody SelfAssessmentRequest req) {
     return ResponseEntity.ok(ApiResponse.success(
         "Self assessment submitted",
         service.submitSelfAssessment(id, req)));
 }

 @PatchMapping("/reviews/{id}/manager-review")
 @Operation(summary = "Submit Manager Review")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<PerformanceReviewResponse>>
 submitManagerReview(
         @PathVariable Long id,
         @Valid @RequestBody PerformanceReviewRequest req) {
     return ResponseEntity.ok(ApiResponse.success(
         "Manager review submitted",
         service.submitManagerReview(id, req)));
 }

 // ══════════════════════════════════════════════
 // SUMMARY
 // ══════════════════════════════════════════════
 @GetMapping("/summary")
 @Operation(summary = "Get Performance Summary (Dashboard)")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
 public ResponseEntity<ApiResponse<PerformanceSummaryResponse>>
 getSummary() {
     return ResponseEntity.ok(ApiResponse.success(
         "Summary fetched", service.getSummary()));
 }
}