-- ==========================================
-- DATABASE
-- ==========================================
CREATE DATABASE IF NOT EXISTS kingstar_wms;
USE kingstar_wms;

-- ==========================================
-- USERS
-- ==========================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role ENUM('PURCHASING', 'RECEIVING', 'PCL', 'STOCK') NOT NULL
);

-- ==========================================
-- PURCHASE ORDERS (AGORA COM CANCELLED)
-- ==========================================
CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    supplier VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,

    -- 🔥 ADICIONADO CANCELLED
    status ENUM(
        'PENDING',
        'RECEIVING',
        'CONFERENCE',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING'
);

-- ==========================================
-- PO ITEMS
-- ==========================================
CREATE TABLE po_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id VARCHAR(50) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    expected_quantity INT NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- ==========================================
-- RECEIVINGS
-- ==========================================
CREATE TABLE receivings (
    id VARCHAR(36) PRIMARY KEY,
    purchase_order_id VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- ==========================================
-- CONFERENCES
-- ==========================================
CREATE TABLE conferences (
    id VARCHAR(36) PRIMARY KEY,
    receiving_id VARCHAR(36) NOT NULL,
    purchase_order_id VARCHAR(50) NOT NULL,

    racks_count INT DEFAULT 0,
    leftovers_count INT DEFAULT 0,
    total_pieces INT NOT NULL,
    checked_pieces INT DEFAULT 0,
    damages INT DEFAULT 0,
    attempts INT DEFAULT 0,

    status ENUM(
        'PENDING',
        'IN_PROGRESS',
        'PCL_ANALYSIS',
        'APPROVED',
        'REJECTED'
    ) NOT NULL DEFAULT 'PENDING',

    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,

    FOREIGN KEY (receiving_id) REFERENCES receivings(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- ==========================================
-- DIVERGENCES
-- ==========================================
CREATE TABLE divergences (
    id VARCHAR(36) PRIMARY KEY,
    conference_id VARCHAR(36) NOT NULL,
    purchase_order_id VARCHAR(50) NOT NULL,
    error_type ENUM('MISSING_ITEMS', 'EXTRA_ITEMS', 'DAMAGED', 'OTHER') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('IN_ANALYSIS', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'IN_ANALYSIS',

    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- ==========================================
-- DAILY METRICS (AGORA COMPLETO)
-- ==========================================
CREATE TABLE daily_metrics (
    date DATE PRIMARY KEY,

    total_vehicles INT DEFAULT 0,
    total_nfs_completed INT DEFAULT 0,

    -- 🔥 NOVOS CAMPOS
    total_cancelled_nfs INT DEFAULT 0,
    total_rejected_loads INT DEFAULT 0,

    total_pieces_checked INT DEFAULT 0,
    total_divergences INT DEFAULT 0,

    avg_receiving_time_min DECIMAL(10,2) DEFAULT 0,
    avg_conference_time_min DECIMAL(10,2) DEFAULT 0,
    error_rate_percentage DECIMAL(5,2) DEFAULT 0
);

-- ==========================================
-- OPERATIONAL SCORE
-- ==========================================
CREATE TABLE operational_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,

    time_score DECIMAL(5,2) NOT NULL,
    error_score DECIMAL(5,2) NOT NULL,
    attempts_score DECIMAL(5,2) NOT NULL,
    volume_score DECIMAL(5,2) NOT NULL,

    total_score DECIMAL(5,2) NOT NULL,

    classification ENUM('Excelente', 'Boa', 'Regular', 'Crítica') NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

-- ==========================================
-- OPERATIONAL LOGS
-- ==========================================
CREATE TABLE operational_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50),
    details JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- BOT INTERACTIONS
-- ==========================================
CREATE TABLE bot_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);