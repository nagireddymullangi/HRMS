
//com/hrms/repository/PayrollDeductionRepository.java
package com.hrms.repository;

import com.hrms.entity.PayrollDeduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollDeductionRepository
     extends JpaRepository<PayrollDeduction, Long> {
 List<PayrollDeduction> findByPayrollId(Long payrollId);
}