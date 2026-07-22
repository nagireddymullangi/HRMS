//com/hrms/dto/response/ApiResponse.java
package com.hrms.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
 private boolean success;
 private String message;
 private T data;
 private Object errors;

 @Builder.Default
 private LocalDateTime timestamp = LocalDateTime.now();

 public static <T> ApiResponse<T> success(String message, T data) {
     return ApiResponse.<T>builder()
             .success(true).message(message).data(data).build();
 }

 public static <T> ApiResponse<T> success(String message) {
     return ApiResponse.<T>builder()
             .success(true).message(message).build();
 }

 public static <T> ApiResponse<T> error(String message, Object errors) {
     return ApiResponse.<T>builder()
             .success(false).message(message).errors(errors).build();
 }
}