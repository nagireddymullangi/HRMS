// com/hrms/dto/response/EmergencyContactResponse.java
package com.hrms.dto.response;

import lombok.*;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class EmergencyContactResponse {
    private String name;
    private String relationship;
    private String phone;
    private String email;
}