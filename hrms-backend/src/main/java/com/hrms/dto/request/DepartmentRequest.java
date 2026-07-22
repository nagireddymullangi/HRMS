// com/hrms/dto/request/DepartmentRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 100,
          message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(min = 2, max = 20,
          message = "Code must be between 2 and 20 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$",
             message = "Code must contain only uppercase letters, numbers, hyphens or underscores")
    private String code;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private Long headId;

    private Long parentDepartmentId;

    private boolean isActive = true;
}