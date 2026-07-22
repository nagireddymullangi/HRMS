-- src/main/resources/db/migration/V3__alter_department_tables.sql

-- Add employee_count view for departments
CREATE OR REPLACE VIEW department_employee_counts AS
SELECT
    d.id          AS department_id,
    d.name        AS department_name,
    COUNT(e.id)   AS employee_count
FROM departments d
LEFT JOIN employees e
    ON e.department_id = d.id
    AND e.status NOT IN ('TERMINATED','INACTIVE')
GROUP BY d.id, d.name;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_dept_id
    ON employees(department_id);

CREATE INDEX IF NOT EXISTS idx_employees_desig_id
    ON employees(designation_id);

CREATE INDEX IF NOT EXISTS idx_employees_status
    ON employees(status);

CREATE INDEX IF NOT EXISTS idx_employees_joining_date
    ON employees(joining_date);

CREATE INDEX IF NOT EXISTS idx_designations_dept_id
    ON designations(department_id);