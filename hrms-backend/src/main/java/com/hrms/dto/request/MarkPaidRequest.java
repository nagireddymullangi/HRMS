
//com/hrms/dto/request/MarkPaidRequest.java
package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MarkPaidRequest {

 @NotNull
 private LocalDate paidOn;

 private String paymentMode = "BANK_TRANSFER";
 private String remarks;
}