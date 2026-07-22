
//com/hrms/entity/Leave.java
package com.hrms.entity;

import com.hrms.enums.HalfDayType;
import com.hrms.enums.LeaveStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaves")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Leave {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "leave_type_id", nullable = false)
 private LeaveType leaveType;

 @Column(name = "start_date", nullable = false)
 private LocalDate startDate;

 @Column(name = "end_date", nullable = false)
 private LocalDate endDate;

 @Column(name = "total_days", nullable = false)
 private int totalDays;

 @Column(nullable = false, columnDefinition = "TEXT")
 private String reason;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private LeaveStatus status = LeaveStatus.PENDING;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "approved_by")
 private Employee approvedBy;

 @Column(name = "approval_note", columnDefinition = "TEXT")
 private String approvalNote;

 @Column(name = "approved_at")
 private LocalDateTime approvedAt;

 @Column(name = "applied_on")
 private LocalDateTime appliedOn;

 @Column(name = "document_path", length = 500)
 private String documentPath;

 @Column(name = "is_half_day", nullable = false)
 private boolean isHalfDay = false;

 @Enumerated(EnumType.STRING)
 @Column(name = "half_day_type")
 private HalfDayType halfDayType;

 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 @PrePersist
 protected void onCreate() {
     createdAt = LocalDateTime.now();
     updatedAt = LocalDateTime.now();
     appliedOn = LocalDateTime.now();
 }

 @PreUpdate
 protected void onUpdate() {
     updatedAt = LocalDateTime.now();
 }
}