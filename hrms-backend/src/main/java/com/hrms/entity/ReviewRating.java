
//com/hrms/entity/ReviewRating.java
package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_ratings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReviewRating {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "review_id", nullable = false)
 private PerformanceReview review;

 @Column(nullable = false, length = 100)
 private String competency;

 @Column(nullable = false, length = 50)
 private String category = "CORE";

 @Column(name = "self_rating", precision = 3, scale = 1)
 private BigDecimal selfRating;

 @Column(name = "manager_rating", precision = 3, scale = 1)
 private BigDecimal managerRating;

 @Column(nullable = false)
 private int weight = 1;

 @Column(columnDefinition = "TEXT")
 private String comments;

 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @PrePersist
 protected void onCreate() {
     createdAt = LocalDateTime.now();
 }
}