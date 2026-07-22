
//com/hrms/dto/response/AuthResponse.java
package com.hrms.dto.response;

import com.hrms.enums.Role;
import lombok.*;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
 private String accessToken;
 private String refreshToken;
 private String tokenType = "Bearer";
 private Long expiresIn;
 private UserInfo user;

 @Data @Builder
 @NoArgsConstructor @AllArgsConstructor
 public static class UserInfo {
     private Long id;
     private String username;
     private String email;
     private Role role;
     private boolean isActive;
 }
}