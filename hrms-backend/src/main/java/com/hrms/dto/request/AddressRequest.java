// com/hrms/dto/request/AddressRequest.java
package com.hrms.dto.request;

import lombok.Data;

@Data
public class AddressRequest {
    private String street;
    private String city;
    private String state;
    private String country;
    private String zipCode;
}