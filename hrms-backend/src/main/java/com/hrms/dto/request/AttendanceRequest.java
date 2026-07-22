
//com/hrms/dto/request/AttendanceRequest.java
package com.hrms.dto.request;

import com.hrms.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceRequest {

 @NotNull(message = "Employee ID is required")
 private Long employeeId;

 @NotNull(message = "Date is required")
 private LocalDate date;

 private LocalTime checkIn;
 private LocalTime checkOut;

 @NotNull(message = "Status is required")
 private AttendanceStatus status;

 private String notes;
}