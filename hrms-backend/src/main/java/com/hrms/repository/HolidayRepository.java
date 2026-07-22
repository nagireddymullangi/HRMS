
//com/hrms/repository/HolidayRepository.java
package com.hrms.repository;

import com.hrms.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository
     extends JpaRepository<Holiday, Long> {

 Optional<Holiday> findByDate(LocalDate date);
 boolean existsByDate(LocalDate date);

 @Query("""
     SELECT h FROM Holiday h
     WHERE YEAR(h.date) = :year
     ORDER BY h.date ASC
     """)
 List<Holiday> findByYear(@Param("year") int year);

 @Query("""
     SELECT h FROM Holiday h
     WHERE MONTH(h.date) = :month
     AND   YEAR(h.date)  = :year
     ORDER BY h.date ASC
     """)
 List<Holiday> findByMonthAndYear(
         @Param("month") int month,
         @Param("year")  int year
 );
}