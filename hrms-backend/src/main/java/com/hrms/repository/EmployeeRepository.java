// com/hrms/repository/EmployeeRepository.java
package com.hrms.repository;

import com.hrms.entity.Employee;
import com.hrms.enums.EmployeeStatus;
import com.hrms.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // ── Basic Finders ──────────────────────────────
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeId(String employeeId);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    // ── By Department ──────────────────────────────
    List<Employee> findByDepartmentId(Long departmentId);
    List<Employee> findByDepartmentIdAndStatus(
            Long departmentId, EmployeeStatus status);

    // ── By Manager ────────────────────────────────
    List<Employee> findByManagerId(Long managerId);

    // ── Count ─────────────────────────────────────
    long countByStatus(EmployeeStatus status);
    long countByDepartmentId(Long departmentId);
    long countByGender(Gender gender);

    // ── Search with Filters (Pageable) ────────────
    @Query("""
        SELECT e FROM Employee e
        JOIN FETCH e.department d
        JOIN FETCH e.designation des
        LEFT JOIN FETCH e.manager m
        WHERE (:search IS NULL OR
               LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(e.email)     LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(e.employeeId) LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(d.name)      LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(des.title)   LIKE LOWER(CONCAT('%',:search,'%')))
        AND (:status IS NULL OR e.status = :status)
        AND (:departmentId IS NULL OR d.id = :departmentId)
        AND (:employmentType IS NULL OR
             CAST(e.employmentType AS string) = :employmentType)
        AND (:gender IS NULL OR CAST(e.gender AS string) = :gender)
        """)
    Page<Employee> searchEmployees(
            @Param("search")         String search,
            @Param("status")         EmployeeStatus status,
            @Param("departmentId")   Long departmentId,
            @Param("employmentType") String employmentType,
            @Param("gender")         String gender,
            Pageable pageable
    );

    // ── Dashboard Stats ────────────────────────────
    @Query("""
        SELECT COUNT(e) FROM Employee e
        WHERE MONTH(e.joiningDate) = :month
        AND YEAR(e.joiningDate) = :year
        """)
    long countNewJoinees(
            @Param("month") int month,
            @Param("year")  int year
    );

    @Query("""
        SELECT e FROM Employee e
        WHERE MONTH(e.dateOfBirth) = :month
        ORDER BY DAY(e.dateOfBirth)
        """)
    List<Employee> findUpcomingBirthdays(@Param("month") int month);

    // ── Employee ID Generator ──────────────────────
    @Query("SELECT COUNT(e) FROM Employee e WHERE YEAR(e.createdAt) = :year")
    long countByYear(@Param("year") int year);

    // ── With Full Details ──────────────────────────
    @Query("""
        SELECT e FROM Employee e
        JOIN FETCH e.department
        JOIN FETCH e.designation
        LEFT JOIN FETCH e.manager
        LEFT JOIN FETCH e.address
        LEFT JOIN FETCH e.emergencyContact
        WHERE e.id = :id
        """)
    Optional<Employee> findByIdWithDetails(@Param("id") Long id);

    // ── Export (all without pagination) ────────────
    @Query("""
        SELECT e FROM Employee e
        JOIN FETCH e.department
        JOIN FETCH e.designation
        WHERE e.status = 'ACTIVE'
        ORDER BY e.firstName
        """)
    List<Employee> findAllActiveForExport();
}