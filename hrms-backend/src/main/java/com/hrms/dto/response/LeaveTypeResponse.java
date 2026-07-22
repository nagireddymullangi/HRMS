
//com/hrms/dto/response/LeaveTypeResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class LeaveTypeResponse {
 private Long          id;
 private String        name;
 private String        code;
 private String        description;
 private int           maxDays;
 private boolean       isPaid;
 private boolean       isActive;
 private boolean       requiresDocument;
 private String        color;
 private LocalDateTime createdAt;
}