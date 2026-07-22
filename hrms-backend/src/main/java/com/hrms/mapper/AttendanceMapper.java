
//com/hrms/mapper/AttendanceMapper.java
package com.hrms.mapper;

import com.hrms.dto.request.AttendanceRequest;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.dto.response.HolidayResponse;
import com.hrms.entity.Attendance;
import com.hrms.entity.Holiday;
import org.springframework.stereotype.Component;

import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Component
public class AttendanceMapper {

 // ── Entity → Response ──────────────────────────
 public AttendanceResponse toResponse(Attendance a) {
     return AttendanceResponse.builder()
         .id(a.getId())
         .employeeId(a.getEmployee() != null
                 ? a.getEmployee().getId() : null)
         .employeeName(a.getEmployee() != null
                 ? a.getEmployee().getFullName() : null)
         .employeeCode(a.getEmployee() != null
                 ? a.getEmployee().getEmployeeId() : null)
         .departmentName(
             a.getEmployee() != null &&
             a.getEmployee().getDepartment() != null
                 ? a.getEmployee().getDepartment().getName() : null)
         .date(a.getDate())
         .dayOfWeek(a.getDate() != null
                 ? a.getDate().getDayOfWeek()
                     .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                 : null)
         .checkIn(a.getCheckIn())
         .checkOut(a.getCheckOut())
         .status(a.getStatus())
         .workHours(a.getWorkHours())
         .overtime(a.getOvertime())
         .notes(a.getNotes())
         .isManual(a.isManual())
         .createdAt(a.getCreatedAt())
         .updatedAt(a.getUpdatedAt())
         .build();
 }

 // ── List Mapping ───────────────────────────────
 public List<AttendanceResponse> toResponses(
         List<Attendance> attendances) {
     return attendances.stream()
             .map(this::toResponse)
             .toList();
 }

 // ── Holiday Entity → Response ──────────────────
 public HolidayResponse toHolidayResponse(Holiday h) {
     return HolidayResponse.builder()
         .id(h.getId())
         .name(h.getName())
         .date(h.getDate())
         .description(h.getDescription())
         .isOptional(h.isOptional())
         .dayOfWeek(h.getDate() != null
                 ? h.getDate().getDayOfWeek()
                     .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                 : null)
         .build();
 }
}