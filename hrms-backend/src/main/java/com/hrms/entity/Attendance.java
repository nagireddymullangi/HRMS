
//com/hrms/entity/Attendance.java
package com.hrms.entity;

import com.hrms.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
 name = "attendance",
 uniqueConstraints = {
     @UniqueConstraint(
         name = "uq_emp_date",
         columnNames = {"employee_id", "date"}
     )
 }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Attendance {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "employee_id", nullable = false)
 private Employee employee;

 @Column(nullable = false)
 private LocalDate date;

 @Column(name = "check_in")
 private LocalTime checkIn;

 @Column(name = "check_out")
 private LocalTime checkOut;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private AttendanceStatus status = AttendanceStatus.PRESENT;

 @Column(name = "work_hours",
         precision = 4, scale = 2)
 private BigDecimal workHours;

 @Column(precision = 4, scale = 2)
 private BigDecimal overtime = BigDecimal.ZERO;

 @Column(columnDefinition = "TEXT")
 private String notes;

 @Column(name = "is_manual", nullable = false)
 private boolean isManual = false;

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
     calculateWorkHours();
 }

 @PreUpdate
 protected void onUpdate() {
     updatedAt = LocalDateTime.now();
     calculateWorkHours();
 }

 // ── Calculate work hours from check-in/out ─────
 private void calculateWorkHours() {
     if (checkIn != null && checkOut != null) {
         long minutes = java.time.Duration
                 .between(checkIn, checkOut).toMinutes();
         if (minutes > 0) {
             BigDecimal hours = BigDecimal.valueOf(minutes)
                     .divide(BigDecimal.valueOf(60), 2,
                             java.math.RoundingMode.HALF_UP);
             this.workHours = hours;

             // Overtime = hours beyond 9
             BigDecimal standard = BigDecimal.valueOf(9);
             if (hours.compareTo(standard) > 0) {
                 this.overtime = hours.subtract(standard);
             }
         }
     }
 }
}