
//com/hrms/repository/PayrollRepository.java
package com.hrms.repository;

import com.hrms.entity.Payroll;
import com.hrms.enums.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository
     extends JpaRepository<Payroll, Long> {

 // ── Basic ──────────────────────────────────────
 Optional<Payroll> findByEmployeeIdAndMonthAndYear(
         Long employeeId, int month, int year);
 Optional<Payroll> findTopByEmployeeIdOrderByIdDesc(Long employeeId);

 boolean existsByEmployeeIdAndMonthAndYear(
         Long employeeId, int month, int year);

 List<Payroll> findByMonthAndYear(int month, int year);

 List<Payroll> findByEmployeeId(Long employeeId);

 // ── Paginated + Filtered ───────────────────────
 @Query("""
     SELECT p FROM Payroll p
     JOIN FETCH p.employee e
     JOIN FETCH e.department d
     JOIN FETCH e.designation des
     LEFT JOIN FETCH p.processedBy pb
     WHERE (:month      IS NULL OR p.month  = :month)
     AND   (:year       IS NULL OR p.year   = :year)
     AND   (:status     IS NULL OR p.status = :status)
     AND   (:deptId     IS NULL OR d.id     = :deptId)
     AND   (:employeeId IS NULL OR e.id     = :employeeId)
     AND   (:search     IS NULL OR
            LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR
            LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:search,'%')) OR
            LOWER(e.employeeId) LIKE LOWER(CONCAT('%',:search,'%')))
     ORDER BY p.year DESC, p.month DESC, e.firstName ASC
     """)
 Page<Payroll> findPayrolls(
         @Param("month")      Integer month,
         @Param("year")       Integer year,
         @Param("status")     PayrollStatus status,
         @Param("deptId")     Long deptId,
         @Param("employeeId") Long employeeId,
         @Param("search")     String search,
         Pageable pageable
 );

 // ── Count by Status ────────────────────────────
 long countByMonthAndYearAndStatus(
         int month, int year, PayrollStatus status);

 long countByMonthAndYear(int month, int year);

 // ── Aggregates ─────────────────────────────────
 @Query("""
     SELECT COALESCE(SUM(p.grossSalary), 0)
     FROM Payroll p
     WHERE p.month = :month AND p.year = :year
     """)
 BigDecimal sumGrossByMonthAndYear(
         @Param("month") int month,
         @Param("year")  int year
 );

 @Query("""
     SELECT COALESCE(SUM(p.netSalary), 0)
     FROM Payroll p
     WHERE p.month = :month AND p.year = :year
     """)
 BigDecimal sumNetByMonthAndYear(
         @Param("month") int month,
         @Param("year")  int year
 );

 @Query("""
     SELECT COALESCE(SUM(p.totalDeductions), 0)
     FROM Payroll p
     WHERE p.month = :month AND p.year = :year
     """)
 BigDecimal sumDeductionsByMonthAndYear(
         @Param("month") int month,
         @Param("year")  int year
 );

 @Query("""
     SELECT COALESCE(SUM(p.pfDeduction), 0)
     FROM Payroll p
     WHERE p.month = :month AND p.year = :year
     """)
 BigDecimal sumPfByMonthAndYear(
         @Param("month") int month,
         @Param("year")  int year
 );

 @Query("""
     SELECT COALESCE(SUM(p.esiDeduction), 0)
     FROM Payroll p
     WHERE p.month = :month AND p.year = :year
     """)
 BigDecimal sumEsiByMonthAndYear(
         @Param("month") int month,
         @Param("year")  int year
 );

 @Query("""
     SELECT COALESCE(SUM(p.tdsDeduction), 0)
     FROM Payroll p
     WHERE p.month = :month AND p.year = :year
     """)
 BigDecimal sumTdsByMonthAndYear(
         @Param("month") int month,
         @Param("year")  int year
 );

 // ── Employee Payslip History ───────────────────
 @Query("""
     SELECT p FROM Payroll p
     WHERE p.employee.id = :employeeId
     ORDER BY p.year DESC, p.month DESC
     """)
 List<Payroll> findPayrollHistory(
         @Param("employeeId") Long employeeId
 );


}