// com/hrms/dto/response/DepartmentResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class DepartmentResponse {
    private Long   id;
    private String name;
    private String code;
    private String description;

    // Head info
    private Long   headId;
    private String headName;

    // Parent dept info
    private Long   parentDepartmentId;
    private String parentDepartmentName;

    private long    employeeCount;
    private boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}