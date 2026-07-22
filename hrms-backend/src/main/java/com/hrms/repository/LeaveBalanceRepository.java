
//com/hrms/repository/LeaveBalanceRepository.java
package com.hrms.repository;

import com.hrms.entity.LeaveBalance;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository
     extends JpaRepository<LeaveBalance, Long> {

 // ── Find by employee + type + year ────────────
 Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(
         Long employeeId, Long leaveTypeId, int year);

 // ── All balances for employee & year ──────────
 @Query("""
     SELECT lb FROM LeaveBalance lb
     JOIN FETCH lb.leaveType lt
     WHERE lb.employee.id = :employeeId
     AND   lb.year        = :year
     ORDER BY lt.name
     """)
 List<LeaveBalance> findByEmployeeAndYear(
         @Param("employeeId") Long employeeId,
         @Param("year")       int year
 );

 // ── Exists check ──────────────────────────────
 boolean existsByEmployeeIdAndLeaveTypeIdAndYear(
         Long employeeId, Long leaveTypeId, int year);
}