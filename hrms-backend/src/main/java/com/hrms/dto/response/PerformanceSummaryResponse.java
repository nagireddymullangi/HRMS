
//com/hrms/dto/response/PerformanceSummaryResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class PerformanceSummaryResponse {
 private long       totalReviews;
 private long       pendingSelf;
 private long       pendingManager;
 private long       completed;
 private long       cancelled;
 private BigDecimal averageRating;
 private long       promotionRecommendations;
 private long       outstandingCount;
 private long       exceedsCount;
 private long       meetsCount;
 private long       belowCount;
 private long       unsatisfactoryCount;
}