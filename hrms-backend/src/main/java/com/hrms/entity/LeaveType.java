
//com/hrms/entity/LeaveType.java
package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_types")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LeaveType {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, unique = true, length = 50)
 private String name;

 @Column(nullable = false, unique = true, length = 20)
 private String code;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "max_days", nullable = false)
 private int maxDays;

 @Column(name = "is_paid", nullable = false)
 private boolean isPaid = true;

 @Column(name = "is_active", nullable = false)
 private boolean isActive = true;

 @Column(name = "requires_doc", nullable = false)
 private boolean requiresDocument = false;

 @Column(length = 10)
 private String color = "#6366f1";

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