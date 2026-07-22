// com/hrms/repository/DepartmentRepository.java
package com.hrms.repository;

import com.hrms.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    // ── Basic ──────────────────────────────────────
    boolean existsByCode(String code);
    Optional<Department> findByCode(String code);
    List<Department> findByIsActiveTrue();

    // ── Pageable with filter ───────────────────────
    Page<Department> findByIsActive(boolean isActive, Pageable pageable);

    // ── Search ─────────────────────────────────────
    @Query("""
        SELECT d FROM Department d
        LEFT JOIN FETCH d.head h
        LEFT JOIN FETCH d.parentDepartment p
        WHERE (:search IS NULL OR
               LOWER(d.name) LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(d.code) LIKE LOWER(CONCAT('%',:search,'%')))
        AND   (:isActive IS NULL OR d.isActive = :isActive)
        """)
    Page<Department> searchDepartments(
            @Param("search")   String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    // ── With Details (for single fetch) ───────────
    @Query("""
        SELECT d FROM Department d
        LEFT JOIN FETCH d.head h
        LEFT JOIN FETCH d.parentDepartment p
        WHERE d.id = :id
        """)
    Optional<Department> findByIdWithDetails(@Param("id") Long id);

    // ── Active with Details (for dropdown) ────────
    @Query("""
        SELECT d FROM Department d
        LEFT JOIN FETCH d.head h
        LEFT JOIN FETCH d.parentDepartment p
        WHERE d.isActive = true
        ORDER BY d.name
        """)
    List<Department> findAllActiveDepartmentsWithDetails();

    // ── Count active by parent ─────────────────────
    long countByParentDepartmentId(Long parentDeptId);
}