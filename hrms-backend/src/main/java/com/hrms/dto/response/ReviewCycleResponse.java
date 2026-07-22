
//com/hrms/dto/response/ReviewCycleResponse.java
package com.hrms.dto.response;

import com.hrms.enums.ReviewCycleStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class ReviewCycleResponse {
 private Long              id;
 private String            title;
 private String            description;
 private LocalDate         startDate;
 private LocalDate         endDate;
 private ReviewCycleStatus status;
 private int               year;
 private Integer           quarter;
 private long              totalReviews;
 private long              completedReviews;
 private long              pendingReviews;
 private double            completionPercent;
 private String            createdByName;
 private LocalDateTime     createdAt;
}