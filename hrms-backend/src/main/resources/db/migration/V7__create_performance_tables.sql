-- src/main/resources/db/migration/V7__create_performance_tables.sql

-- Review Cycles (Quarterly/Annual review periods)
CREATE TABLE IF NOT EXISTS review_cycles (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT         NULL,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    status      ENUM('DRAFT','ACTIVE','IN_REVIEW','COMPLETED','CANCELLED')
                NOT NULL DEFAULT 'DRAFT',
    year        INT          NOT NULL,
    quarter     INT          NULL,
    created_by  BIGINT       NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE SET NULL
);

-- Goals / KPIs (per employee per cycle)
CREATE TABLE IF NOT EXISTS goals (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    employee_id      BIGINT       NOT NULL,
    review_cycle_id  BIGINT       NOT NULL,
    title            VARCHAR(200) NOT NULL,
    description      TEXT         NULL,
    category         VARCHAR(50)  NULL DEFAULT 'GENERAL',
    weight           INT          NOT NULL DEFAULT 0,
    target_value     VARCHAR(100) NULL,
    achieved_value   VARCHAR(100) NULL,
    status           ENUM('NOT_STARTED','IN_PROGRESS','COMPLETED','EXCEEDED','CANCELLED')
                     NOT NULL DEFAULT 'NOT_STARTED',
    progress         INT          NOT NULL DEFAULT 0,
    due_date         DATE         NULL,
    completed_date   DATE         NULL,
    comments         TEXT         NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (review_cycle_id)
        REFERENCES review_cycles(id) ON DELETE CASCADE
);

-- Performance Reviews (per employee per cycle)
CREATE TABLE IF NOT EXISTS performance_reviews (
    id                    BIGINT       AUTO_INCREMENT PRIMARY KEY,
    employee_id           BIGINT       NOT NULL,
    reviewer_id           BIGINT       NOT NULL,
    review_cycle_id       BIGINT       NOT NULL,
    status                ENUM('PENDING_SELF','PENDING_MANAGER','COMPLETED','CANCELLED')
                          NOT NULL DEFAULT 'PENDING_SELF',
    -- Self Assessment
    self_rating           DECIMAL(3,1) NULL,
    self_comments         TEXT         NULL,
    self_strengths        TEXT         NULL,
    self_improvements     TEXT         NULL,
    self_submitted_at     TIMESTAMP    NULL,
    -- Manager Review
    manager_rating        DECIMAL(3,1) NULL,
    manager_comments      TEXT         NULL,
    manager_strengths     TEXT         NULL,
    manager_improvements  TEXT         NULL,
    manager_submitted_at  TIMESTAMP    NULL,
    -- Final
    final_rating          DECIMAL(3,1) NULL,
    final_comments        TEXT         NULL,
    overall_performance   ENUM('OUTSTANDING','EXCEEDS','MEETS','BELOW','UNSATISFACTORY') NULL,
    promotion_recommended BOOLEAN      NOT NULL DEFAULT FALSE,
    salary_hike_percent   DECIMAL(5,2) NULL,
    training_needed       TEXT         NULL,
    completed_at          TIMESTAMP    NULL,
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emp_cycle (employee_id, review_cycle_id),
    FOREIGN KEY (employee_id)
        REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id)
        REFERENCES employees(id),
    FOREIGN KEY (review_cycle_id)
        REFERENCES review_cycles(id) ON DELETE CASCADE
);

-- Review Ratings (individual competency ratings)
CREATE TABLE IF NOT EXISTS review_ratings (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    review_id     BIGINT       NOT NULL,
    competency    VARCHAR(100) NOT NULL,
    category      VARCHAR(50)  NOT NULL DEFAULT 'CORE',
    self_rating   DECIMAL(3,1) NULL,
    manager_rating DECIMAL(3,1) NULL,
    weight        INT          NOT NULL DEFAULT 1,
    comments      TEXT         NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id)
        REFERENCES performance_reviews(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_goals_employee       ON goals(employee_id);
CREATE INDEX idx_goals_cycle          ON goals(review_cycle_id);
CREATE INDEX idx_reviews_employee     ON performance_reviews(employee_id);
CREATE INDEX idx_reviews_cycle        ON performance_reviews(review_cycle_id);
CREATE INDEX idx_reviews_status       ON performance_reviews(status);
CREATE INDEX idx_ratings_review       ON review_ratings(review_id);

-- Seed Review Cycle
INSERT INTO review_cycles
    (title, description, start_date, end_date, status, year, quarter)
VALUES
('Q1 2026 Review', 'First quarter performance review',
 '2026-01-01', '2026-03-31', 'COMPLETED', 2026, 1),
('Q2 2026 Review', 'Second quarter performance review',
 '2026-04-01', '2026-06-30', 'ACTIVE', 2026, 2),
('Annual Review 2026', 'Annual performance appraisal',
 '2026-01-01', '2026-12-31', 'DRAFT', 2026, NULL);