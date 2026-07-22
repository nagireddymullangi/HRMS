
//com/hrms/mapper/LeaveMapper.java
package com.hrms.mapper;

import com.hrms.dto.response.*;
import com.hrms.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LeaveMapper {

 // ── Leave Entity → Response ────────────────────
 public LeaveResponse toResponse(Leave leave) {
     return LeaveResponse.builder()
         .id(leave.getId())
         .employeeId(leave.getEmployee() != null
                 ? leave.getEmployee().getId() : null)
         .employeeName(leave.getEmployee() != null
                 ? leave.getEmployee().getFullName() : null)
         .employeeCode(leave.getEmployee() != null
                 ? leave.getEmployee().getEmployeeId() : null)
         .departmentName(
             leave.getEmployee() != null &&
             leave.getEmployee().getDepartment() != null
                 ? leave.getEmployee().getDepartment().getName() : null)
         .leaveTypeId(leave.getLeaveType() != null
                 ? leave.getLeaveType().getId() : null)
         .leaveTypeName(leave.getLeaveType() != null
                 ? leave.getLeaveType().getName() : null)
         .leaveTypeColor(leave.getLeaveType() != null
                 ? leave.getLeaveType().getColor() : null)
         .startDate(leave.getStartDate())
         .endDate(leave.getEndDate())
         .totalDays(leave.getTotalDays())
         .reason(leave.getReason())
         .status(leave.getStatus())
         .approvedById(leave.getApprovedBy() != null
                 ? leave.getApprovedBy().getId() : null)
         .approvedByName(leave.getApprovedBy() != null
                 ? leave.getApprovedBy().getFullName() : null)
         .approvalNote(leave.getApprovalNote())
         .approvedAt(leave.getApprovedAt())
         .appliedOn(leave.getAppliedOn())
         .isHalfDay(leave.isHalfDay())
         .halfDayType(leave.getHalfDayType() != null
                 ? leave.getHalfDayType().name() : null)
         .documentPath(leave.getDocumentPath())
         .createdAt(leave.getCreatedAt())
         .updatedAt(leave.getUpdatedAt())
         .build();
 }

 // ── Leave Type Entity → Response ───────────────
 public LeaveTypeResponse toLeaveTypeResponse(LeaveType lt) {
     return LeaveTypeResponse.builder()
         .id(lt.getId())
         .name(lt.getName())
         .code(lt.getCode())
         .description(lt.getDescription())
         .maxDays(lt.getMaxDays())
         .isPaid(lt.isPaid())
         .isActive(lt.isActive())
         .requiresDocument(lt.isRequiresDocument())
         .color(lt.getColor())
         .createdAt(lt.getCreatedAt())
         .build();
 }

 // ── List Mappings ──────────────────────────────
 public List<LeaveResponse> toResponses(List<Leave> leaves) {
     return leaves.stream().map(this::toResponse).toList();
 }

 public List<LeaveTypeResponse> toLeaveTypeResponses(
         List<LeaveType> leaveTypes) {
     return leaveTypes.stream()
             .map(this::toLeaveTypeResponse)
             .toList();
 }
}