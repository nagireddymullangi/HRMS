
//com/hrms/dto/response/HolidayResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDate;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class HolidayResponse {
 private Long      id;
 private String    name;
 private LocalDate date;
 private String    description;
 private boolean   isOptional;
 private String    dayOfWeek;
}