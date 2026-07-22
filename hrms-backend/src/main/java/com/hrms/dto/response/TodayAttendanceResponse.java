
//com/hrms/dto/response/TodayAttendanceResponse.java
package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDate;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class TodayAttendanceResponse {
 private long      total;
 private long      present;
 private long      absent;
 private long      late;
 private long      halfDay;
 private long      onLeave;
 private long      holiday;
 private LocalDate date;
 private double    attendancePercent;
}