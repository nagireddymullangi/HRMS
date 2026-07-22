
//com/hrms/repository/SalaryStructureRepository.java
package com.hrms.repository;

import com.hrms.entity.SalaryStructure;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalaryStructureRepository
     extends JpaRepository<SalaryStructure, Long> {

 Optional<SalaryStructure> findByEmployeeId(Long employeeId);

 boolean existsByEmployeeId(Long employeeId);

 @Query("""
     SELECT s FROM SalaryStructure s
     JOIN FETCH s.employee e
     JOIN FETCH e.department
     JOIN FETCH e.designation
     WHERE e.id = :employeeId
     AND   s.isActive = true
     """)
 Optional<SalaryStructure> findActiveByEmployeeId(
         @Param("employeeId") Long employeeId);
}