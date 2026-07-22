// com/hrms/repository/DesignationRepository.java
package com.hrms.repository;

import com.hrms.entity.Designation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignationRepository
        extends JpaRepository<Designation, Long> {

    // ── Basic ──────────────────────────────────────
    boolean existsByCode(String code);

    List<Designation> findByDepartmentId(Long departmentId);

    Page<Designation> findByDepartmentId(
            Long departmentId, Pageable pageable);

    List<Designation> findByDepartmentIdAndIsActiveTrue(Long departmentId);

    List<Designation> findByIsActiveTrue();

    // ── Search ─────────────────────────────────────
    @Query("""
        SELECT d FROM Designation d
        JOIN FETCH d.department dept
        WHERE (:search IS NULL OR
               LOWER(d.title) LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(d.code)  LIKE LOWER(CONCAT('%',:search,'%')))
        AND (:departmentId IS NULL OR dept.id = :departmentId)
        AND (:isActive IS NULL OR d.isActive = :isActive)
        """)
    Page<Designation> searchDesignations(
            @Param("search")       String search,
            @Param("departmentId") Long departmentId,
            @Param("isActive")     Boolean isActive,
            Pageable pageable
    );

    // ── Count by department ────────────────────────
    long countByDepartmentId(Long departmentId);
}