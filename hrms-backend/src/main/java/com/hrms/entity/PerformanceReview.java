
//com/hrms/entity/PerformanceReview.java
package com.hrms.entity;

import com.hrms.enums.OverallPerformance;
import com.hrms.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
 name = "performance_reviews",
 uniqueConstraints = @UniqueConstraint(
     name = "uq_emp_cycle",
     columnNames = {"employee_id", "review_cycle_id"}
 )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PerformanceReview {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "reviewer_id", nullable = false)
 private Employee reviewer;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "review_cycle_id", nullable = false)
 private ReviewCycle reviewCycle;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private ReviewStatus status = ReviewStatus.PENDING_SELF;

 // ── Self Assessment ───────────────────────────
 @Column(name = "self_rating", precision = 3, scale = 1)
 private BigDecimal selfRating;

 @Column(name = "self_comments", columnDefinition = "TEXT")
 private String selfComments;

 @Column(name = "self_strengths", columnDefinition = "TEXT")
 private String selfStrengths;

 @Column(name = "self_improvements", columnDefinition = "TEXT")
 private String selfImprovements;

 @Column(name = "self_submitted_at")
 private LocalDateTime selfSubmittedAt;

 // ── Manager Review ────────────────────────────
 @Column(name = "manager_rating", precision = 3, scale = 1)
 private BigDecimal managerRating;

 @Column(name = "manager_comments", columnDefinition = "TEXT")
 private String managerComments;

 @Column(name = "manager_strengths", columnDefinition = "TEXT")
 private String managerStrengths;

 @Column(name = "manager_improvements", columnDefinition = "TEXT")
 private String managerImprovements;

 @Column(name = "manager_submitted_at")
 private LocalDateTime managerSubmittedAt;

 // ── Final ─────────────────────────────────────
 @Column(name = "final_rating", precision = 3, scale = 1)
 private BigDecimal finalRating;

 @Column(name = "final_comments", columnDefinition = "TEXT")
 private String finalComments;

 @Enumerated(EnumType.STRING)
 @Column(name = "overall_performance")
 private OverallPerformance overallPerformance;

 @Column(name = "promotion_recommended", nullable = false)
 private boolean promotionRecommended = false;

 @Column(name = "salary_hike_percent",
         precision = 5, scale = 2)
 private BigDecimal salaryHikePercent;

 @Column(name = "training_needed", columnDefinition = "TEXT")
 private String trainingNeeded;

 @Column(name = "completed_at")
 private LocalDateTime completedAt;

 @OneToMany(mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
 @Builder.Default
 private List<ReviewRating> ratings = new ArrayList<>();

 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 @PrePersist
 protected void onCreate() {
     createdAt = LocalDateTime.now();
     updatedAt = LocalDateTime.now();
 }

 @PreUpdate
 protected void onUpdate() {
     updatedAt = LocalDateTime.now();
 }
}