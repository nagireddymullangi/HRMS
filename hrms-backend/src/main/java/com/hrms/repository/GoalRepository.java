
//com/hrms/repository/GoalRepository.java
package com.hrms.repository;

import com.hrms.entity.Goal;
import com.hrms.enums.GoalStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository
     extends JpaRepository<Goal, Long> {

 List<Goal> findByEmployeeId(Long employeeId);
 List<Goal> findByEmployeeIdAndReviewCycleId(
         Long employeeId, Long cycleId);
 long countByEmployeeIdAndReviewCycleId(
         Long employeeId, Long cycleId);
 long countByEmployeeIdAndReviewCycleIdAndStatus(
         Long employeeId, Long cycleId, GoalStatus status);

 @Query("""
     SELECT AVG(g.progress) FROM Goal g
     WHERE g.employee.id = :empId
     AND   g.reviewCycle.id = :cycleId
     """)
 Double averageProgressByEmployeeAndCycle(
         @Param("empId") Long empId,
         @Param("cycleId") Long cycleId);
}