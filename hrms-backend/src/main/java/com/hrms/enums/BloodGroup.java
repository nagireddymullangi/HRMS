// com/hrms/enums/BloodGroup.java
package com.hrms.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BloodGroup {
    A_POSITIVE("A+"), A_NEGATIVE("A-"),
    B_POSITIVE("B+"), B_NEGATIVE("B-"),
    AB_POSITIVE("AB+"), AB_NEGATIVE("AB-"),
    O_POSITIVE("O+"), O_NEGATIVE("O-");

    private final String label;
    BloodGroup(String label) { this.label = label; }
    @JsonValue
    public String getLabel() { return label; }
}