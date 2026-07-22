// com/hrms/entity/SalaryStructure.java
package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_structures")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id",
                nullable = false, unique = true)
    private Employee employee;

    @Column(name = "basic_salary",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(name = "hra_percent",
            precision = 5, scale = 2)
    private BigDecimal hraPercent = new BigDecimal("40.00");

    @Column(name = "da_percent",
            precision = 5, scale = 2)
    private BigDecimal daPercent = new BigDecimal("10.00");

    @Column(name = "ta_amount",
            precision = 10, scale = 2)
    private BigDecimal taAmount = BigDecimal.ZERO;

    @Column(name = "medical_allow",
            precision = 10, scale = 2)
    private BigDecimal medicalAllow = BigDecimal.ZERO;

    @Column(name = "other_allow",
            precision = 10, scale = 2)
    private BigDecimal otherAllow = BigDecimal.ZERO;

    @Column(name = "pf_percent",
            precision = 5, scale = 2)
    private BigDecimal pfPercent = new BigDecimal("12.00");

    @Column(name = "esi_percent",
            precision = 5, scale = 2)
    private BigDecimal esiPercent = new BigDecimal("0.75");

    @Column(name = "tds_percent",
            precision = 5, scale = 2)
    private BigDecimal tdsPercent = BigDecimal.ZERO;

    @Column(name = "prof_tax",
            precision = 10, scale = 2)
    private BigDecimal profTax = new BigDecimal("200.00");

    @Column(name = "effective_from",
            nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active",
            nullable = false)
    private boolean isActive = true;

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