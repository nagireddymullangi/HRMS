
//com/hrms/repository/LeaveRepository.java
package com.hrms.repository;

import com.hrms.entity.Leave;
import com.hrms.enums.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository
     extends JpaRepository<Leave, Long> {

 // ── Basic ──────────────────────────────────────
 List<Leave> findByEmployeeId(Long employeeId);
 List<Leave> findByStatus(LeaveStatus status);

 // ── Paginated + Filtered ───────────────────────
 @Query("""
     SELECT l FROM Leave l
     JOIN FETCH l.employee e
     JOIN FETCH l.leaveType lt
     LEFT JOIN FETCH e.department d
     LEFT JOIN FETCH l.approvedBy ab
     WHERE (:employeeId IS NULL OR e.id     = :employeeId)
     AND   (:status     IS NULL OR l.status = :status)
     AND   (:leaveTypeId IS NULL OR lt.id   = :leaveTypeId)
     AND   (:deptId     IS NULL OR d.id     = :deptId)
     AND   (:startDate  IS NULL OR l.startDate >= :startDate)
     AND   (:endDate    IS NULL OR l.endDate   <= :endDate)
     AND   (:search     IS NULL OR
            LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR
            LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:search,'%')))
     ORDER BY l.appliedOn DESC
     """)
 Page<Leave> findLeaves(
         @Param("employeeId")  Long employeeId,
         @Param("status")      LeaveStatus status,
         @Param("leaveTypeId") Long leaveTypeId,
         @Param("deptId")      Long deptId,
         @Param("startDate")   LocalDate startDate,
         @Param("endDate")     LocalDate endDate,
         @Param("search")      String search,
         Pageable pageable
 );

 // ── Pending Approvals ──────────────────────────
 @Query("""
     SELECT l FROM Leave l
     JOIN FETCH l.employee e
     JOIN FETCH l.leaveType lt
     WHERE l.status = 'PENDING'
     ORDER BY l.appliedOn ASC
     """)
 List<Leave> findPendingApprovals();

 // ── Conflict Check ─────────────────────────────
 @Query("""
     SELECT COUNT(l) FROM Leave l
     WHERE l.employee.id = :employeeId
     AND   l.status IN ('PENDING', 'APPROVED')
     AND   l.startDate <= :endDate
     AND   l.endDate   >= :startDate
     """)
 long countOverlappingLeaves(
         @Param("employeeId") Long employeeId,
         @Param("startDate")  LocalDate startDate,
         @Param("endDate")    LocalDate endDate
 );

 // ── Count by Status ────────────────────────────
 long countByStatus(LeaveStatus status);

 long countByEmployeeIdAndStatus(
         Long employeeId, LeaveStatus status);

 // ── Count used days by type & employee & year ──
 @Query("""
     SELECT COALESCE(SUM(l.totalDays), 0)
     FROM Leave l
     WHERE l.employee.id   = :employeeId
     AND   l.leaveType.id  = :leaveTypeId
     AND   l.status        = 'APPROVED'
     AND   YEAR(l.startDate) = :year
     """)
 int sumUsedDays(
         @Param("employeeId")  Long employeeId,
         @Param("leaveTypeId") Long leaveTypeId,
         @Param("year")        int year
 );

 // ── Pending days ───────────────────────────────
 @Query("""
     SELECT COALESCE(SUM(l.totalDays), 0)
     FROM Leave l
     WHERE l.employee.id   = :employeeId
     AND   l.leaveType.id  = :leaveTypeId
     AND   l.status        = 'PENDING'
     AND   YEAR(l.startDate) = :year
     """)
 int sumPendingDays(
         @Param("employeeId")  Long employeeId,
         @Param("leaveTypeId") Long leaveTypeId,
         @Param("year")        int year
 );

 // ── Employee leave on a specific date ──────────
 @Query("""
     SELECT l FROM Leave l
     WHERE l.employee.id = :employeeId
     AND   l.status      = 'APPROVED'
     AND   :date BETWEEN l.startDate AND l.endDate
     """)
 List<Leave> findApprovedLeaveOnDate(
         @Param("employeeId") Long employeeId,
         @Param("date")       LocalDate date
 );

 // ── Upcoming leaves (next 7 days) ─────────────
 @Query("""
     SELECT l FROM Leave l
     JOIN FETCH l.employee e
     WHERE l.status     = 'APPROVED'
     AND   l.startDate >= :today
     AND   l.startDate <= :nextWeek
     ORDER BY l.startDate ASC
     """)
 List<Leave> findUpcomingLeaves(
         @Param("today")    LocalDate today,
         @Param("nextWeek") LocalDate nextWeek
 );
}