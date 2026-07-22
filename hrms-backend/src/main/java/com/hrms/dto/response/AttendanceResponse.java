
//com/hrms/dto/response/AttendanceResponse.java
package com.hrms.dto.response;

import com.hrms.enums.AttendanceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class AttendanceResponse {
 private Long             id;
 private Long             employeeId;
 private String           employeeName;
 private String           employeeCode;
 private String           departmentName;
 private LocalDate        date;
 private String           dayOfWeek;
 private LocalTime        checkIn;
 private LocalTime        checkOut;
 private AttendanceStatus status;
 private BigDecimal       workHours;
 private BigDecimal       overtime;
 private String           notes;
 private boolean          isManual;
 private LocalDateTime    createdAt;
 private LocalDateTime    updatedAt;
}