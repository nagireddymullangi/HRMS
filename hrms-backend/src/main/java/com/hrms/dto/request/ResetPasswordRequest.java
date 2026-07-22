
//com/hrms/dto/request/ResetPasswordRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
 @NotBlank
 private String token;

 @NotBlank
 private String newPassword;
}