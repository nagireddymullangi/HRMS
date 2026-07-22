
//com/hrms/scheduler/AttendanceScheduler.java
package com.hrms.scheduler;

import com.hrms.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class AttendanceScheduler {

 private final AttendanceService attendanceService;

 // ── Run at 10:00 PM every working day ─────────
 @Scheduled(cron = "0 0 22 * * MON-FRI")
 public void autoMarkAbsent() {
     log.info("Running scheduled absent marking...");
     attendanceService.markAbsentForToday();
 }
}