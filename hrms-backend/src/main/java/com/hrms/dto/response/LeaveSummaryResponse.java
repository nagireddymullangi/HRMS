
//com/hrms/dto/response/LeaveSummaryResponse.java
package com.hrms.dto.response;

import lombok.*;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class LeaveSummaryResponse {
 private long totalRequests;
 private long pendingRequests;
 private long approvedRequests;
 private long rejectedRequests;
 private long cancelledRequests;
 private long pendingToday;
}