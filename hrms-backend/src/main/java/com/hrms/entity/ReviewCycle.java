
//com/hrms/entity/ReviewCycle.java
package com.hrms.entity;

import com.hrms.enums.ReviewCycleStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_cycles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReviewCycle {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 100)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "start_date", nullable = false)
 private LocalDate startDate;

 @Column(name = "end_date", nullable = false)
 private LocalDate endDate;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private ReviewCycleStatus status = ReviewCycleStatus.DRAFT;

 @Column(nullable = false)
 private int year;

 private Integer quarter;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "created_by")
 private User createdBy;

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