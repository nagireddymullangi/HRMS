
//com/hrms/entity/Holiday.java
package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "holidays")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Holiday {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 100)
 private String name;

 @Column(nullable = false, unique = true)
 private LocalDate date;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "is_optional", nullable = false)
 private boolean isOptional = false;

 @Column(name = "created_at", updatable = false)
 private LocalDateTime createdAt;

 @PrePersist
 protected void onCreate() {
     createdAt = LocalDateTime.now();
 }
}