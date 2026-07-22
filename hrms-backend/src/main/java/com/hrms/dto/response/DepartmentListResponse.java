
//com/hrms/dto/response/DepartmentListResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class DepartmentListResponse {
 private Long    id;
 private String  name;
 private String  code;
 private String  description;
 private Long    headId;
 private String  headName;
 private Long    parentDepartmentId;
 private String  parentDepartmentName;
 private long    employeeCount;
 private boolean isActive;
 private LocalDateTime createdAt;
}