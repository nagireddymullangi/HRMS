
//com/hrms/repository/LeaveTypeRepository.java
package com.hrms.repository;

import com.hrms.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository
     extends JpaRepository<LeaveType, Long> {

 boolean existsByCode(String code);
 boolean existsByName(String name);
 Optional<LeaveType> findByCode(String code);
 List<LeaveType> findByIsActiveTrue();
}