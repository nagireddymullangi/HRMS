// com/hrms/entity/Payroll.java
package com.hrms.entity;

import com.hrms.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "payrolls",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_emp_month_year",
        columnNames = {"employee_id", "month", "year"}
    )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    // ── Earnings ──────────────────────────────────
    @Column(name = "basic_salary",
            precision = 12, scale = 2)
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal hra = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal da = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal ta = BigDecimal.ZERO;

    @Column(name = "medical_allow",
            precision = 10, scale = 2)
    private BigDecimal medicalAllow = BigDecimal.ZERO;

    @Column(name = "other_allow",
            precision = 10, scale = 2)
    private BigDecimal otherAllow = BigDecimal.ZERO;

    @Column(name = "gross_salary",
            precision = 12, scale = 2)
    private BigDecimal grossSalary = BigDecimal.ZERO;

    // ── Deductions ────────────────────────────────
    @Column(name = "pf_deduction",
            precision = 10, scale = 2)
    private BigDecimal pfDeduction = BigDecimal.ZERO;

    @Column(name = "esi_deduction",
            precision = 10, scale = 2)
    private BigDecimal esiDeduction = BigDecimal.ZERO;

    @Column(name = "tds_deduction",
            precision = 10, scale = 2)
    private BigDecimal tdsDeduction = BigDecimal.ZERO;

    @Column(name = "prof_tax",
            precision = 10, scale = 2)
    private BigDecimal profTax = BigDecimal.ZERO;

    @Column(name = "other_deductions",
            precision = 10, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "total_deductions",
            precision = 12, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    // ── Net Salary ────────────────────────────────
    @Column(name = "net_salary",
            precision = 12, scale = 2)
    private BigDecimal netSalary = BigDecimal.ZERO;

    // ── Attendance Info ───────────────────────────
    @Column(name = "working_days")
    private int workingDays = 0;

    @Column(name = "present_days")
    private int presentDays = 0;

    @Column(name = "absent_days")
    private int absentDays = 0;

    @Column(name = "leave_days")
    private int leaveDays = 0;

    @Column(name = "overtime_hours",
            precision = 6, scale = 2)
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "overtime_amount",
            precision = 10, scale = 2)
    private BigDecimal overtimeAmount = BigDecimal.ZERO;

    @Column(name = "loss_of_pay",
            precision = 10, scale = 2)
    private BigDecimal lossOfPay = BigDecimal.ZERO;

    // ── Status ────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayrollStatus status = PayrollStatus.PENDING;

    @Column(name = "paid_on")
    private LocalDate paidOn;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode = "BANK_TRANSFER";

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @OneToMany(mappedBy = "payroll",
               cascade = CascadeType.ALL,
               orphanRemoval = true,
               fetch = FetchType.LAZY)
    @Builder.Default
    private List<PayrollDeduction> customDeductions = new ArrayList<>();

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
