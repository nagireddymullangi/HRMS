
//com/hrms/repository/ReviewRatingRepository.java
package com.hrms.repository;

import com.hrms.entity.ReviewRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRatingRepository
     extends JpaRepository<ReviewRating, Long> {
 List<ReviewRating> findByReviewId(Long reviewId);
}