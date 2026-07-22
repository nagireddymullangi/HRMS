
//com/hrms/entity/Goal.java
package com.hrms.entity;

import com.hrms.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Goal {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "review_cycle_id", nullable = false)
 private ReviewCycle reviewCycle;

 @Column(nullable = false, length = 200)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(length = 50)
 private String category = "GENERAL";

 @Column(nullable = false)
 private int weight = 0;

 @Column(name = "target_value", length = 100)
 private String targetValue;

 @Column(name = "achieved_value", length = 100)
 private String achievedValue;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private GoalStatus status = GoalStatus.NOT_STARTED;

 @Column(nullable = false)
 private int progress = 0;

 @Column(name = "due_date")
 private LocalDate dueDate;

 @Column(name = "completed_date")
 private LocalDate completedDate;

 @Column(columnDefinition = "TEXT")
 private String comments;

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