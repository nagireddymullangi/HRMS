-- src/main/resources/db/migration/V4__create_attendance_tables.sql

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id  BIGINT       NOT NULL,
    date         DATE         NOT NULL,
    check_in     TIME         NULL,
    check_out    TIME         NULL,
    status       ENUM(
                    'PRESENT',
                    'ABSENT',
                    'LATE',
                    'HALF_DAY',
                    'ON_LEAVE',
                    'HOLIDAY',
                    'WEEKEND'
                 ) NOT NULL DEFAULT 'PRESENT',
    work_hours   DECIMAL(4,2) NULL,
    overtime     DECIMAL(4,2) NULL DEFAULT 0.00,
    notes        TEXT         NULL,
    is_manual    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by   BIGINT       NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emp_date (employee_id, date),
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE SET NULL
);

-- Holiday Table
CREATE TABLE IF NOT EXISTS holidays (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    date        DATE         NOT NULL UNIQUE,
    description TEXT         NULL,
    is_optional BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_attendance_employee_id
    ON attendance(employee_id);

CREATE INDEX idx_attendance_date
    ON attendance(date);

CREATE INDEX idx_attendance_status
    ON attendance(status);

CREATE INDEX idx_attendance_emp_date
    ON attendance(employee_id, date);

-- Seed Holidays for 2026
INSERT INTO holidays (name, date, description) VALUES
('Republic Day',          '2026-01-26', 'National Holiday'),
('Holi',                  '2026-03-25', 'Festival of Colors'),
('Good Friday',           '2026-03-29', 'Good Friday'),
('Ambedkar Jayanti',      '2026-04-14', 'National Holiday'),
('Ram Navami',            '2026-04-17', 'Hindu Festival'),
('Labour Day',            '2026-05-01', 'International Workers Day'),
('Independence Day',      '2026-08-15', 'National Holiday'),
('Gandhi Jayanti',        '2026-10-02', 'National Holiday'),
('Dussehra',              '2026-10-12', 'Hindu Festival'),
('Diwali',                '2026-11-01', 'Festival of Lights'),
('Christmas',             '2026-12-25', 'Christmas Day');