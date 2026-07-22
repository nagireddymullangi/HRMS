
//com/hrms/entity/LeaveBalance.java
package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
 name = "leave_balances",
 uniqueConstraints = @UniqueConstraint(
     name = "uq_emp_type_year",
     columnNames = {"employee_id", "leave_type_id", "year"}
 )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LeaveBalance {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "leave_type_id", nullable = false)
 private LeaveType leaveType;

 @Column(nullable = false)
 private int year;

 @Column(nullable = false)
 private int allocated = 0;

 @Column(nullable = false)
 private int used = 0;

 @Column(nullable = false)
 private int pending = 0;

 @Column(name = "carried_forward", nullable = false)
 private int carriedForward = 0;

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

 // ── Helper: remaining days ─────────────────────
 public int getRemaining() {
     return allocated + carriedForward - used - pending;
 }
}