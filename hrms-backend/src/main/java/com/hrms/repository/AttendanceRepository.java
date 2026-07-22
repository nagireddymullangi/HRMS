
//com/hrms/repository/AttendanceRepository.java
package com.hrms.repository;

import com.hrms.entity.Attendance;
import com.hrms.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository
     extends JpaRepository<Attendance, Long> {

 // ── Find Today Record ──────────────────────────
 Optional<Attendance> findByEmployeeIdAndDate(
         Long employeeId, LocalDate date);

 // ── Exists Check ───────────────────────────────
 boolean existsByEmployeeIdAndDate(
         Long employeeId, LocalDate date);

 // ── By Employee + Date Range ───────────────────
 List<Attendance> findByEmployeeIdAndDateBetween(
         Long employeeId,
         LocalDate startDate,
         LocalDate endDate);

 // ── By Date ────────────────────────────────────
 List<Attendance> findByDate(LocalDate date);

 // ── Count by Status + Date ─────────────────────
 long countByDateAndStatus(
         LocalDate date, AttendanceStatus status);

 // ── Count by Employee + Month + Status ─────────
 @Query("""
     SELECT COUNT(a) FROM Attendance a
     WHERE a.employee.id = :employeeId
     AND   MONTH(a.date) = :month
     AND   YEAR(a.date)  = :year
     AND   a.status      = :status
     """)
 long countByEmployeeMonthStatus(
         @Param("employeeId") Long employeeId,
         @Param("month")      int month,
         @Param("year")       int year,
         @Param("status")     AttendanceStatus status
 );

 // ── Monthly Attendance (paginated, filtered) ───
 @Query("""
     SELECT a FROM Attendance a
     JOIN FETCH a.employee e
     JOIN FETCH e.department d
     WHERE (:employeeId IS NULL OR e.id = :employeeId)
     AND   (:month      IS NULL OR MONTH(a.date) = :month)
     AND   (:year       IS NULL OR YEAR(a.date)  = :year)
     AND   (:status     IS NULL OR a.status = :status)
     AND   (:deptId     IS NULL OR d.id = :deptId)
     AND   (:search     IS NULL OR
            LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR
            LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:search,'%')))
     ORDER BY a.date DESC, e.firstName ASC
     """)
 Page<Attendance> findAttendances(
         @Param("employeeId") Long employeeId,
         @Param("month")      Integer month,
         @Param("year")       Integer year,
         @Param("status")     AttendanceStatus status,
         @Param("deptId")     Long deptId,
         @Param("search")     String search,
         Pageable pageable
 );

 // ── Summary for Employee Month ─────────────────
 @Query("""
     SELECT a FROM Attendance a
     WHERE a.employee.id = :employeeId
     AND   MONTH(a.date) = :month
     AND   YEAR(a.date)  = :year
     """)
 List<Attendance> findMonthlyAttendance(
         @Param("employeeId") Long employeeId,
         @Param("month")      int month,
         @Param("year")       int year
 );

 // ── Today Total by Dept ────────────────────────
 @Query("""
     SELECT COUNT(a) FROM Attendance a
     JOIN a.employee e
     WHERE a.date = :date
     AND   e.department.id = :deptId
     AND   a.status = 'PRESENT'
     """)
 long countPresentByDeptAndDate(
         @Param("deptId") Long deptId,
         @Param("date")   LocalDate date
 );

 // ── Total Work Hours by Month ──────────────────
 @Query("""
     SELECT COALESCE(SUM(a.workHours), 0)
     FROM Attendance a
     WHERE a.employee.id = :employeeId
     AND   MONTH(a.date) = :month
     AND   YEAR(a.date)  = :year
     """)
 Double sumWorkHoursByEmployeeAndMonth(
         @Param("employeeId") Long employeeId,
         @Param("month")      int month,
         @Param("year")       int year
 );

 // ── Total Overtime by Month ────────────────────
 @Query("""
     SELECT COALESCE(SUM(a.overtime), 0)
     FROM Attendance a
     WHERE a.employee.id = :employeeId
     AND   MONTH(a.date) = :month
     AND   YEAR(a.date)  = :year
     """)
 Double sumOvertimeByEmployeeAndMonth(
         @Param("employeeId") Long employeeId,
         @Param("month")      int month,
         @Param("year")       int year
 );

 // ── Late Count ─────────────────────────────────
 @Query("""
     SELECT COUNT(a) FROM Attendance a
     WHERE a.employee.id = :employeeId
     AND   MONTH(a.date) = :month
     AND   YEAR(a.date)  = :year
     AND   a.status IN ('LATE')
     """)
 long countLateByEmployeeAndMonth(
         @Param("employeeId") Long employeeId,
         @Param("month")      int month,
         @Param("year")       int year
 );
}