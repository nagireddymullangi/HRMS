
//com/hrms/repository/PerformanceReviewRepository.java
package com.hrms.repository;

import com.hrms.entity.PerformanceReview;
import com.hrms.enums.OverallPerformance;
import com.hrms.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceReviewRepository
     extends JpaRepository<PerformanceReview, Long> {

 Optional<PerformanceReview> findByEmployeeIdAndReviewCycleId(
         Long employeeId, Long cycleId);
 boolean existsByEmployeeIdAndReviewCycleId(
         Long employeeId, Long cycleId);
 List<PerformanceReview> findByReviewCycleId(Long cycleId);
 List<PerformanceReview> findByReviewerId(Long reviewerId);
 List<PerformanceReview> findByStatus(ReviewStatus status);

 @Query("""
     SELECT pr FROM PerformanceReview pr
     JOIN FETCH pr.employee e
     JOIN FETCH pr.reviewer r
     JOIN FETCH pr.reviewCycle rc
     LEFT JOIN FETCH e.department d
     LEFT JOIN FETCH e.designation des
     WHERE (:cycleId IS NULL OR rc.id = :cycleId)
     AND   (:status  IS NULL OR pr.status = :status)
     AND   (:empId   IS NULL OR e.id = :empId)
     AND   (:deptId  IS NULL OR d.id = :deptId)
     AND   (:search  IS NULL OR
            LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR
            LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:search,'%')))
     ORDER BY pr.createdAt DESC
     """)
 Page<PerformanceReview> findReviews(
         @Param("cycleId") Long cycleId,
         @Param("status")  ReviewStatus status,
         @Param("empId")   Long empId,
         @Param("deptId")  Long deptId,
         @Param("search")  String search,
         Pageable pageable);

 @Query("SELECT pr FROM PerformanceReview pr WHERE pr.id = :id")
 Optional<PerformanceReview> findByIdWithDetails(@Param("id") Long id);

 // Counts
 long countByReviewCycleId(Long cycleId);
 long countByReviewCycleIdAndStatus(Long cycleId, ReviewStatus status);
 long countByStatus(ReviewStatus status);
 long countByOverallPerformance(OverallPerformance performance);
 long countByPromotionRecommendedTrue();

 @Query("""
     SELECT COALESCE(AVG(pr.finalRating), 0)
     FROM PerformanceReview pr
     WHERE pr.reviewCycle.id = :cycleId
     AND   pr.status = 'COMPLETED'
     """)
 Double averageRatingByCycle(@Param("cycleId") Long cycleId);
}