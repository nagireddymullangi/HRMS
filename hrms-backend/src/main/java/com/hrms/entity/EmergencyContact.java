// com/hrms/entity/EmergencyContact.java
package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee_emergency_contacts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(length = 100)
    private String name;

    @Column(length = 50)
    private String relationship;

    @Column(length = 15)
    private String phone;

    @Column(length = 100)
    private String email;
}