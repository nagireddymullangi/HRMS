-- src/main/resources/db/migration/V2__create_employee_tables.sql

-- Departments Table (needed before employees)
CREATE TABLE IF NOT EXISTS departments (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                  VARCHAR(100) NOT NULL,
    code                  VARCHAR(20)  NOT NULL UNIQUE,
    description           TEXT         NULL,
    head_id               BIGINT       NULL,
    parent_department_id  BIGINT       NULL,
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_department_id)
        REFERENCES departments(id) ON DELETE SET NULL
);

-- Designations Table
CREATE TABLE IF NOT EXISTS designations (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(100) NOT NULL,
    code          VARCHAR(20)  NOT NULL UNIQUE,
    department_id BIGINT       NOT NULL,
    description   TEXT         NULL,
    level         INT          NOT NULL DEFAULT 1,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id)
        REFERENCES departments(id) ON DELETE CASCADE
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    employee_id      VARCHAR(20)  NOT NULL UNIQUE,
    user_id          BIGINT       NULL UNIQUE,
    first_name       VARCHAR(50)  NOT NULL,
    last_name        VARCHAR(50)  NOT NULL,
    email            VARCHAR(100) NOT NULL UNIQUE,
    phone            VARCHAR(15)  NOT NULL,
    gender           ENUM('MALE','FEMALE','OTHER') NOT NULL,
    date_of_birth    DATE         NULL,
    blood_group      ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NULL,
    marital_status   ENUM('SINGLE','MARRIED','DIVORCED','WIDOWED')   NULL,
    joining_date     DATE         NOT NULL,
    employment_type  ENUM('FULL_TIME','PART_TIME','CONTRACT','INTERN')
                     NOT NULL DEFAULT 'FULL_TIME',
    status           ENUM('ACTIVE','INACTIVE','TERMINATED','ON_LEAVE')
                     NOT NULL DEFAULT 'ACTIVE',
    department_id    BIGINT       NOT NULL,
    designation_id   BIGINT       NOT NULL,
    manager_id       BIGINT       NULL,
    salary           DECIMAL(12,2) NULL,
    profile_picture  VARCHAR(500)  NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id)
        REFERENCES departments(id),
    FOREIGN KEY (designation_id)
        REFERENCES designations(id),
    FOREIGN KEY (manager_id)
        REFERENCES employees(id) ON DELETE SET NULL
);

-- Employee Address Table
CREATE TABLE IF NOT EXISTS employee_addresses (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT       NOT NULL UNIQUE,
    street      VARCHAR(255) NULL,
    city        VARCHAR(100) NULL,
    state       VARCHAR(100) NULL,
    country     VARCHAR(100) NULL DEFAULT 'India',
    zip_code    VARCHAR(10)  NULL,
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Emergency Contact Table
CREATE TABLE IF NOT EXISTS employee_emergency_contacts (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id  BIGINT      NOT NULL UNIQUE,
    name         VARCHAR(100) NULL,
    relationship VARCHAR(50)  NULL,
    phone        VARCHAR(15)  NULL,
    email        VARCHAR(100) NULL,
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE
);

-- Update departments to add foreign key for head
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_id)
    REFERENCES employees(id) ON DELETE SET NULL;

-- Seed default departments
INSERT INTO departments (name, code, description, is_active) VALUES
('Engineering',   'ENG',  'Software Engineering Department',  TRUE),
('Marketing',     'MKT',  'Marketing Department',             TRUE),
('Human Resources','HR',  'HR Department',                    TRUE),
('Finance',       'FIN',  'Finance Department',               TRUE),
('Operations',    'OPS',  'Operations Department',            TRUE);

-- Seed default designations
INSERT INTO designations (title, code, department_id, level, is_active) VALUES
('Senior Developer',   'ENG-SD',  1, 3, TRUE),
('Junior Developer',   'ENG-JD',  1, 1, TRUE),
('DevOps Engineer',    'ENG-DO',  1, 2, TRUE),
('Marketing Lead',     'MKT-ML',  2, 3, TRUE),
('Content Writer',     'MKT-CW',  2, 1, TRUE),
('HR Manager',         'HR-MGR',  3, 4, TRUE),
('HR Executive',       'HR-EXE',  3, 2, TRUE),
('Finance Manager',    'FIN-MGR', 4, 4, TRUE),
('Accountant',         'FIN-ACC', 4, 2, TRUE),
('Operations Manager', 'OPS-MGR', 5, 4, TRUE);