
//com/hrms/dto/request/RegisterRequest.java
package com.hrms.dto.request;

import com.hrms.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
 @NotBlank @Size(min = 3, max = 50)
 private String username;

 @NotBlank @Email
 private String email;

 @NotBlank @Size(min = 8)
 private String password;

 private Role role;
}