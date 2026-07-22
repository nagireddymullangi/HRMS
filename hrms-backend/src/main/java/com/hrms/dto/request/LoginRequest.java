
//com/hrms/dto/request/LoginRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
 @NotBlank(message = "Username or email is required")
 private String usernameOrEmail;

 @NotBlank(message = "Password is required")
 private String password;
}