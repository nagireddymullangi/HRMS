-- src/main/resources/db/migration/V5__create_leave_tables.sql

-- Leave Types Configuration Table
CREATE TABLE IF NOT EXISTS leave_types (
    id           BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(50)  NOT NULL UNIQUE,
    code         VARCHAR(20)  NOT NULL UNIQUE,
    description  TEXT         NULL,
    max_days     INT          NOT NULL DEFAULT 0,
    is_paid      BOOLEAN      NOT NULL DEFAULT TRUE,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    requires_doc BOOLEAN      NOT NULL DEFAULT FALSE,
    color        VARCHAR(10)  NULL DEFAULT '#6366f1',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leaves (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    employee_id      BIGINT       NOT NULL,
    leave_type_id    BIGINT       NOT NULL,
    start_date       DATE         NOT NULL,
    end_date         DATE         NOT NULL,
    total_days       INT          NOT NULL DEFAULT 1,
    reason           TEXT         NOT NULL,
    status           ENUM(
                        'PENDING',
                        'APPROVED',
                        'REJECTED',
                        'CANCELLED'
                     ) NOT NULL DEFAULT 'PENDING',
    approved_by      BIGINT       NULL,
    approval_note    TEXT         NULL,
    approved_at      TIMESTAMP    NULL,
    applied_on       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_path    VARCHAR(500) NULL,
    is_half_day      BOOLEAN      NOT NULL DEFAULT FALSE,
    half_day_type    ENUM('FIRST_HALF','SECOND_HALF') NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id)
        REFERENCES leave_types(id),
    FOREIGN KEY (approved_by)
        REFERENCES employees(id) ON DELETE SET NULL
);

-- Leave Balance Table (per employee per year)
CREATE TABLE IF NOT EXISTS leave_balances (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id   BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    year          INT    NOT NULL,
    allocated     INT    NOT NULL DEFAULT 0,
    used          INT    NOT NULL DEFAULT 0,
    pending       INT    NOT NULL DEFAULT 0,
    carried_forward INT  NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emp_type_year (employee_id, leave_type_id, year),
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id)
        REFERENCES leave_types(id)
);

-- Indexes
CREATE INDEX idx_leaves_employee_id  ON leaves(employee_id);
CREATE INDEX idx_leaves_status       ON leaves(status);
CREATE INDEX idx_leaves_start_date   ON leaves(start_date);
CREATE INDEX idx_leaves_end_date     ON leaves(end_date);
CREATE INDEX idx_lb_employee_year    ON leave_balances(employee_id, year);

-- Seed Leave Types
INSERT INTO leave_types
    (name, code, description, max_days, is_paid, is_active, color,requires_doc)
VALUES
('Annual Leave',       'ANNUAL',       'Paid annual vacation leave',              18, TRUE,  TRUE, '#6366f1',FALSE),
('Sick Leave',         'SICK',         'Medical/health related leave',            12, TRUE,  TRUE, '#ef4444',TRUE),
('Casual Leave',       'CASUAL',       'Short personal leave',                     6, TRUE,  TRUE, '#22c55e',FALSE),
('Maternity Leave',    'MATERNITY',    'Maternity leave for new mothers',          90, TRUE,  TRUE, '#ec4899',TRUE),
('Paternity Leave',    'PATERNITY',    'Paternity leave for new fathers',          15, TRUE,  TRUE, '#0ea5e9',TRUE),
('Unpaid Leave',       'UNPAID',       'Leave without pay',                        30, FALSE, TRUE, '#6b7280',FALSE),
('Compensatory Leave', 'COMPENSATORY', 'Compensation for extra working days',       5, TRUE,  TRUE, '#f59e0b',FALSE);