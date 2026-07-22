// com/hrms/dto/response/AddressResponse.java
package com.hrms.dto.response;

import lombok.*;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class AddressResponse {
    private String street;
    private String city;
    private String state;
    private String country;
    private String zipCode;
}