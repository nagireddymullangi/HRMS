-- src/main/resources/db/migration/V6__create_payroll_tables.sql

-- Salary Structure Table (per employee)
CREATE TABLE IF NOT EXISTS salary_structures (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    employee_id     BIGINT         NOT NULL UNIQUE,
    basic_salary    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    hra_percent     DECIMAL(5,2)   NOT NULL DEFAULT 40.00,
    da_percent      DECIMAL(5,2)   NOT NULL DEFAULT 10.00,
    ta_amount       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    medical_allow   DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    other_allow     DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    pf_percent      DECIMAL(5,2)   NOT NULL DEFAULT 12.00,
    esi_percent     DECIMAL(5,2)   NOT NULL DEFAULT 0.75,
    tds_percent     DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    prof_tax        DECIMAL(10,2)  NOT NULL DEFAULT 200.00,
    effective_from  DATE           NOT NULL,
    effective_to    DATE           NULL,
    is_active       BOOLEAN        NOT NULL DEFAULT TRUE,
    created_by      BIGINT         NULL,
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE SET NULL
);

-- Payroll Table (monthly payroll records)
CREATE TABLE IF NOT EXISTS payrolls (
    id               BIGINT        AUTO_INCREMENT PRIMARY KEY,
    employee_id      BIGINT        NOT NULL,
    month            INT           NOT NULL,
    year             INT           NOT NULL,
    basic_salary     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    hra              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    da               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ta               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    medical_allow    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    other_allow      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    gross_salary     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pf_deduction     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    esi_deduction    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tds_deduction    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    prof_tax         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    net_salary       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    working_days     INT           NOT NULL DEFAULT 0,
    present_days     INT           NOT NULL DEFAULT 0,
    absent_days      INT           NOT NULL DEFAULT 0,
    leave_days       INT           NOT NULL DEFAULT 0,
    overtime_hours   DECIMAL(6,2)  NOT NULL DEFAULT 0.00,
    overtime_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    loss_of_pay      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status           ENUM(
                        'PENDING',
                        'PROCESSED',
                        'PAID',
                        'CANCELLED'
                     )             NOT NULL DEFAULT 'PENDING',
    paid_on          DATE          NULL,
    payment_mode     VARCHAR(50)   NULL DEFAULT 'BANK_TRANSFER',
    remarks          TEXT          NULL,
    processed_by     BIGINT        NULL,
    processed_at     TIMESTAMP     NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emp_month_year (employee_id, month, year),
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by)
        REFERENCES users(id) ON DELETE SET NULL
);

-- Payroll Deductions (custom deductions per payroll)
CREATE TABLE IF NOT EXISTS payroll_deductions (
    id          BIGINT        AUTO_INCREMENT PRIMARY KEY,
    payroll_id  BIGINT        NOT NULL,
    name        VARCHAR(100)  NOT NULL,
    amount      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT          NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_id)
        REFERENCES payrolls(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_payrolls_employee_id ON payrolls(employee_id);
CREATE INDEX idx_payrolls_month_year  ON payrolls(month, year);
CREATE INDEX idx_payrolls_status      ON payrolls(status);
CREATE INDEX idx_salary_employee_id   ON salary_structures(employee_id);