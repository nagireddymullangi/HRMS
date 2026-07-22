
//com/hrms/dto/response/DesignationResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class DesignationResponse {
 private Long    id;
 private String  title;
 private String  code;
 private Long    departmentId;
 private String  departmentName;
 private String  description;
 private int     level;
 private boolean isActive;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}