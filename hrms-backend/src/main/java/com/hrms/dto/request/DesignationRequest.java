
//com/hrms/dto/request/DesignationRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DesignationRequest {

 @NotBlank(message = "Designation title is required")
 @Size(min = 2, max = 100,
       message = "Title must be between 2 and 100 characters")
 private String title;

 @NotBlank(message = "Designation code is required")
 @Size(min = 2, max = 20,
       message = "Code must be between 2 and 20 characters")
 @Pattern(regexp = "^[A-Z0-9_-]+$",
          message = "Code must contain only uppercase letters, numbers, hyphens or underscores")
 private String code;

 @NotNull(message = "Department is required")
 private Long departmentId;

 @Size(max = 500, message = "Description cannot exceed 500 characters")
 private String description;

 @Min(value = 1, message = "Level must be at least 1")
 @Max(value = 10, message = "Level cannot exceed 10")
 private int level = 1;

 private boolean isActive = true;
}
