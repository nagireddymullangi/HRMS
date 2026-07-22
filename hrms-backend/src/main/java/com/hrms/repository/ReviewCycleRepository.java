
//com/hrms/repository/ReviewCycleRepository.java
package com.hrms.repository;

import com.hrms.entity.ReviewCycle;
import com.hrms.enums.ReviewCycleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewCycleRepository
     extends JpaRepository<ReviewCycle, Long> {

 List<ReviewCycle> findByYear(int year);
 List<ReviewCycle> findByStatus(ReviewCycleStatus status);
 Page<ReviewCycle> findByYearAndStatus(
         int year, ReviewCycleStatus status, Pageable pageable);

 @Query("SELECT rc FROM ReviewCycle rc WHERE rc.status = 'ACTIVE'")
 List<ReviewCycle> findActiveCycles();
}