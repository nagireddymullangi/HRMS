
//com/hrms/mapper/PayrollMapper.java
package com.hrms.mapper;

import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.enums.PayrollStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Month;
import java.util.List;

@Component
public class PayrollMapper {

 private static final String[] MONTHS = {
     "January","February","March","April",
     "May","June","July","August",
     "September","October","November","December"
 };

 // ── Payroll → Response ─────────────────────────
 public PayrollResponse toResponse(Payroll p) {
     return PayrollResponse.builder()
         .id(p.getId())
         .employeeId(p.getEmployee() != null
                 ? p.getEmployee().getId() : null)
         .employeeName(p.getEmployee() != null
                 ? p.getEmployee().getFullName() : null)
         .employeeCode(p.getEmployee() != null
                 ? p.getEmployee().getEmployeeId() : null)
         .departmentName(
             p.getEmployee() != null &&
             p.getEmployee().getDepartment() != null
                 ? p.getEmployee().getDepartment().getName() : null)
         .designationName(
             p.getEmployee() != null &&
             p.getEmployee().getDesignation() != null
                 ? p.getEmployee().getDesignation().getTitle() : null)
         .month(p.getMonth())
         .year(p.getYear())
         .monthName(getMonthName(p.getMonth()))
         .basicSalary(p.getBasicSalary())
         .hra(p.getHra())
         .da(p.getDa())
         .ta(p.getTa())
         .medicalAllow(p.getMedicalAllow())
         .otherAllow(p.getOtherAllow())
         .overtimeAmount(p.getOvertimeAmount())
         .grossSalary(p.getGrossSalary())
         .pfDeduction(p.getPfDeduction())
         .esiDeduction(p.getEsiDeduction())
         .tdsDeduction(p.getTdsDeduction())
         .profTax(p.getProfTax())
         .lossOfPay(p.getLossOfPay())
         .otherDeductions(p.getOtherDeductions())
         .totalDeductions(p.getTotalDeductions())
         .netSalary(p.getNetSalary())
         .workingDays(p.getWorkingDays())
         .presentDays(p.getPresentDays())
         .absentDays(p.getAbsentDays())
         .leaveDays(p.getLeaveDays())
         .overtimeHours(p.getOvertimeHours())
         .status(p.getStatus())
         .paidOn(p.getPaidOn())
         .paymentMode(p.getPaymentMode())
         .remarks(p.getRemarks())
         .customDeductions(
             p.getCustomDeductions() != null
                 ? p.getCustomDeductions().stream()
                     .map(d -> PayrollResponse.DeductionItem.builder()
                         .id(d.getId())
                         .name(d.getName())
                         .amount(d.getAmount())
                         .description(d.getDescription())
                         .build())
                     .toList()
                 : List.of())
         .processedByName(p.getProcessedBy() != null
                 ? p.getProcessedBy().getUsername() : null)
         .processedAt(p.getProcessedAt())
         .createdAt(p.getCreatedAt())
         .updatedAt(p.getUpdatedAt())
         .build();
 }

 // ── SalaryStructure → Response ─────────────────
 public SalaryStructureResponse toSalaryResponse(
         SalaryStructure s) {

     BigDecimal basic = s.getBasicSalary();

     BigDecimal hraAmount = percent(basic, s.getHraPercent());
     BigDecimal daAmount  = percent(basic, s.getDaPercent());
     BigDecimal pfAmount  = percent(basic, s.getPfPercent());
     BigDecimal esiAmount = percent(basic, s.getEsiPercent());
     BigDecimal tdsAmount = percent(basic, s.getTdsPercent());

     BigDecimal gross = basic.add(hraAmount).add(daAmount)
         .add(s.getTaAmount()).add(s.getMedicalAllow())
         .add(s.getOtherAllow());

     BigDecimal totalDeduct = pfAmount.add(esiAmount)
         .add(tdsAmount).add(s.getProfTax());

     BigDecimal net = gross.subtract(totalDeduct);

     return SalaryStructureResponse.builder()
         .id(s.getId())
         .employeeId(s.getEmployee() != null
                 ? s.getEmployee().getId() : null)
         .employeeName(s.getEmployee() != null
                 ? s.getEmployee().getFullName() : null)
         .employeeCode(s.getEmployee() != null
                 ? s.getEmployee().getEmployeeId() : null)
         .departmentName(
             s.getEmployee() != null &&
             s.getEmployee().getDepartment() != null
                 ? s.getEmployee().getDepartment().getName() : null)
         .designationName(
             s.getEmployee() != null &&
             s.getEmployee().getDesignation() != null
                 ? s.getEmployee().getDesignation().getTitle() : null)
         .basicSalary(basic)
         .hraPercent(s.getHraPercent())
         .hraAmount(hraAmount)
         .daPercent(s.getDaPercent())
         .daAmount(daAmount)
         .taAmount(s.getTaAmount())
         .medicalAllow(s.getMedicalAllow())
         .otherAllow(s.getOtherAllow())
         .grossSalary(gross)
         .pfPercent(s.getPfPercent())
         .pfAmount(pfAmount)
         .esiPercent(s.getEsiPercent())
         .esiAmount(esiAmount)
         .tdsPercent(s.getTdsPercent())
         .tdsAmount(tdsAmount)
         .profTax(s.getProfTax())
         .totalDeductions(totalDeduct)
         .netSalary(net)
         .effectiveFrom(s.getEffectiveFrom())
         .effectiveTo(s.getEffectiveTo())
         .isActive(s.isActive())
         .createdAt(s.getCreatedAt())
         .build();
 }

 // ── Payroll → Payslip ──────────────────────────
 public PayslipResponse toPayslip(Payroll p) {
     return PayslipResponse.builder()
         .companyName("TechCorp Solutions Pvt. Ltd.")
         .companyAddress("123 Business Park, Mumbai - 400069")
         .companyEmail("hr@techcorp.com")
         .companyPhone("+91 22 1234 5678")
         .employeeId(p.getEmployee() != null
                 ? p.getEmployee().getId() : null)
         .employeeCode(p.getEmployee() != null
                 ? p.getEmployee().getEmployeeId() : null)
         .employeeName(p.getEmployee() != null
                 ? p.getEmployee().getFullName() : null)
         .designation(
             p.getEmployee() != null &&
             p.getEmployee().getDesignation() != null
                 ? p.getEmployee().getDesignation().getTitle() : null)
         .department(
             p.getEmployee() != null &&
             p.getEmployee().getDepartment() != null
                 ? p.getEmployee().getDepartment().getName() : null)
         .month(p.getMonth())
         .year(p.getYear())
         .monthName(getMonthName(p.getMonth()))
         .paidOn(p.getPaidOn())
         .paymentMode(p.getPaymentMode())
         .workingDays(p.getWorkingDays())
         .presentDays(p.getPresentDays())
         .absentDays(p.getAbsentDays())
         .leaveDays(p.getLeaveDays())
         .basicSalary(p.getBasicSalary())
         .hra(p.getHra())
         .da(p.getDa())
         .ta(p.getTa())
         .medicalAllow(p.getMedicalAllow())
         .otherAllow(p.getOtherAllow())
         .overtimeAmount(p.getOvertimeAmount())
         .grossEarnings(p.getGrossSalary())
         .pfDeduction(p.getPfDeduction())
         .esiDeduction(p.getEsiDeduction())
         .tdsDeduction(p.getTdsDeduction())
         .profTax(p.getProfTax())
         .lossOfPay(p.getLossOfPay())
         .otherDeductions(p.getOtherDeductions())
         .totalDeductions(p.getTotalDeductions())
         .netSalary(p.getNetSalary())
         .netSalaryInWords(numberToWords(p.getNetSalary()))
         .status(p.getStatus())
         .build();
 }

 // ── List Mapping ───────────────────────────────
 public List<PayrollResponse> toResponses(
         List<Payroll> payrolls) {
     return payrolls.stream()
             .map(this::toResponse).toList();
 }

 // ── Helpers ────────────────────────────────────
 private BigDecimal percent(
         BigDecimal base, BigDecimal pct) {
     if (base == null || pct == null)
         return BigDecimal.ZERO;
     return base.multiply(pct)
                .divide(BigDecimal.valueOf(100), 2,
                        RoundingMode.HALF_UP);
 }

 private String getMonthName(int month) {
     if (month < 1 || month > 12) return "";
     return MONTHS[month - 1];
 }

 private String numberToWords(BigDecimal number) {
     if (number == null) return "Zero";
     long amount = number.longValue();
     return convertToWords(amount) + " Rupees Only";
 }

 private String convertToWords(long n) {
     if (n == 0) return "Zero";
     String[] ones = {"","One","Two","Three","Four",
         "Five","Six","Seven","Eight","Nine","Ten",
         "Eleven","Twelve","Thirteen","Fourteen","Fifteen",
         "Sixteen","Seventeen","Eighteen","Nineteen"};
     String[] tens = {"","","Twenty","Thirty","Forty",
         "Fifty","Sixty","Seventy","Eighty","Ninety"};

     if (n < 20) return ones[(int) n];
     if (n < 100) return tens[(int)(n/10)]
         + (n%10 != 0 ? " " + ones[(int)(n%10)] : "");
     if (n < 1000) return ones[(int)(n/100)] + " Hundred"
         + (n%100 != 0 ? " " + convertToWords(n%100) : "");
     if (n < 100000) return convertToWords(n/1000) + " Thousand"
         + (n%1000 != 0 ? " " + convertToWords(n%1000) : "");
     if (n < 10000000) return convertToWords(n/100000) + " Lakh"
         + (n%100000 != 0 ? " " + convertToWords(n%100000) : "");
     return convertToWords(n/10000000) + " Crore"
         + (n%10000000 != 0 ? " " + convertToWords(n%10000000) : "");
 }
}