// com/hrms/dto/request/EmergencyContactRequest.java
package com.hrms.dto.request;

import lombok.Data;

@Data
public class EmergencyContactRequest {
    private String name;
    private String relationship;
    private String phone;
    private String email;
}