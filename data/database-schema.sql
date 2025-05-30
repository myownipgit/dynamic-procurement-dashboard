-- Dynamic Procurement Dashboard v6 - Database Schema
-- Created: May 30, 2025
-- Description: Complete database setup for dynamic chart configuration system

-- ============================================
-- DYNAMIC CHART CONFIGURATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS dynamic_chart_configs (
  config_id INTEGER PRIMARY KEY AUTOINCREMENT,
  chart_id TEXT UNIQUE NOT NULL,
  chart_name TEXT NOT NULL,
  chart_type TEXT NOT NULL,
  base_table TEXT NOT NULL,
  join_tables TEXT, -- JSON array of tables to join
  group_by_field TEXT NOT NULL,
  value_field TEXT NOT NULL,
  label_field TEXT,
  filters TEXT, -- JSON object for default filters
  chart_options TEXT NOT NULL, -- JSON for styling/display options
  parameters TEXT, -- JSON for dynamic parameters
  created_date TEXT DEFAULT (datetime('now')),
  updated_date TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- SAMPLE CHART CONFIGURATIONS
-- ============================================

INSERT INTO dynamic_chart_configs (
  chart_id, 
  chart_name, 
  chart_type, 
  base_table, 
  join_tables,
  group_by_field, 
  value_field,
  label_field,
  filters,
  chart_options,
  parameters
) VALUES 

-- Top Commodities Horizontal Bar Chart
(
  'top_commodities_bar',
  'Top Commodities',
  'horizontal_bar',
  'spend_transactions',
  '["commodities ON spend_transactions.commodity_id = commodities.commodity_id"]',
  'commodities.commodity_description',
  'SUM(spend_transactions.total_amount)',
  'commodities.commodity_description',
  '{"active": true}',
  '{"colors": ["#3498DB", "#E74C3C", "#2ECC71", "#F39C12", "#9B59B6"], "showValues": true, "responsive": true}',
  '{"limit": {"type": "number", "default": 10, "max": 50}, "date_range": {"type": "date_range", "default": null}, "min_amount": {"type": "number", "default": null}}'
),

-- Vendor Spend Analysis Pie Chart  
(
  'vendor_spend_analysis',
  'Vendor Spend Analysis', 
  'pie',
  'spend_transactions',
  '["vendors ON spend_transactions.vendor_id = vendors.vendor_id"]',
  'vendors.vendor_name',
  'SUM(spend_transactions.total_amount)',
  'vendors.vendor_name',
  '{}',
  '{"colors": ["#D2524F", "#5B9BD5", "#70AD47", "#E59C39", "#9B59B6"], "innerRadius": 0, "showPercentages": true}',
  '{"limit": {"type": "number", "default": 5}, "state_filter": {"type": "string", "default": null}}'
),

-- Geographic Distribution Donut Chart
(
  'geographic_distribution',
  'Geographic Distribution',
  'donut', 
  'spend_transactions',
  '["vendors ON spend_transactions.vendor_id = vendors.vendor_id"]',
  'vendors.state',
  'SUM(spend_transactions.total_amount)',
  'vendors.state',
  '{"exclude_null": true}',
  '{"colors": ["#70AD47", "#5B9BD5", "#E59C39", "#9B59B6", "#D2524F"], "innerRadius": 60, "outerRadius": 120}',
  '{"limit": {"type": "number", "default": 5}, "exclude_states": {"type": "array", "default": []}}'
);

-- ============================================
-- SUPPORTING DATA TABLES 
-- ============================================

-- Vendors table for geographic and vendor analysis
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  payment_terms TEXT,
  created_date TEXT DEFAULT (datetime('now'))
);

-- Commodities table for category analysis
CREATE TABLE IF NOT EXISTS commodities (
  commodity_id TEXT PRIMARY KEY,
  commodity_description TEXT NOT NULL,
  commodity_code TEXT,
  category TEXT,
  subcategory TEXT,
  unit_of_measure TEXT,
  created_date TEXT DEFAULT (datetime('now'))
);

-- Purchase orders table for contract tracking
CREATE TABLE IF NOT EXISTS purchase_orders (
  po_id TEXT PRIMARY KEY,
  vendor_id TEXT,
  po_number TEXT NOT NULL,
  po_date TEXT,
  total_amount REAL,
  status TEXT,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

-- Main spend transactions table - the heart of the analytics
CREATE TABLE IF NOT EXISTS spend_transactions (
  transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  po_id TEXT,
  vendor_id TEXT,
  commodity_id TEXT,
  transaction_date TEXT,
  line_item_description TEXT,
  quantity REAL,
  unit_price REAL,
  total_amount REAL,
  fiscal_year INTEGER,
  department TEXT,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
  FOREIGN KEY (commodity_id) REFERENCES commodities(commodity_id)
);

-- ============================================
-- LEGACY STATIC CHART CONFIGURATIONS (for backward compatibility)
-- ============================================

CREATE TABLE IF NOT EXISTS chart_configs (
  config_id INTEGER PRIMARY KEY AUTOINCREMENT,
  chart_name TEXT NOT NULL,
  chart_type TEXT NOT NULL,
  data_query TEXT NOT NULL,
  config_json TEXT NOT NULL,
  created_date TEXT DEFAULT (datetime('now')),
  updated_date TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_spend_transactions_vendor_id ON spend_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_spend_transactions_commodity_id ON spend_transactions(commodity_id);
CREATE INDEX IF NOT EXISTS idx_spend_transactions_po_id ON spend_transactions(po_id);
CREATE INDEX IF NOT EXISTS idx_spend_transactions_date ON spend_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_spend_transactions_fiscal_year ON spend_transactions(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_spend_transactions_amount ON spend_transactions(total_amount);

CREATE INDEX IF NOT EXISTS idx_vendors_state ON vendors(state);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(vendor_name);

CREATE INDEX IF NOT EXISTS idx_commodities_description ON commodities(commodity_description);
CREATE INDEX IF NOT EXISTS idx_commodities_category ON commodities(category);

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Sample vendors (Top 5 from analysis)
INSERT OR IGNORE INTO vendors (vendor_id, vendor_name, city, state, zip) VALUES
('VENDOR_001', 'TECHLINE INC', 'Houston', 'TX', '77001'),
('VENDOR_002', 'SUN COAST RESOURCES INC', 'Tampa', 'FL', '33601'),
('VENDOR_003', 'TEXAS ELECTRIC COOPERATIVES', 'Austin', 'TX', '73301'),
('VENDOR_004', 'OLDCASTLE MATERIALS TEXAS INC', 'Dallas', 'TX', '75201'),
('VENDOR_005', 'PRIESTER-MELL & NICHOLSON INC.', 'Atlanta', 'GA', '30301');

-- Sample commodities (Top 5 categories)
INSERT OR IGNORE INTO commodities (commodity_id, commodity_description, category) VALUES
('COMM_001', 'Transformers, Power Distribution (Incl. Fluid Fill)', 'Electrical Equipment'),
('COMM_002', 'METERS, WATT-HOUR', 'Measurement Equipment'),
('COMM_003', 'Impact Tools, Air Powered (Not Road Building)', 'Tools & Equipment'),
('COMM_004', 'SWITCHGEARS AND PARTS, METAL CLAD', 'Electrical Equipment'),
('COMM_005', 'ASPHALTIC CONCRETE, HOT MIX', 'Construction Materials');

-- Sample purchase orders
INSERT OR IGNORE INTO purchase_orders (po_id, vendor_id, po_number, po_date, total_amount, status) VALUES
('PO_001', 'VENDOR_001', 'PO2024-001', '2024-01-15', 2500000.00, 'Completed'),
('PO_002', 'VENDOR_002', 'PO2024-002', '2024-02-20', 1800000.00, 'Completed'),
('PO_003', 'VENDOR_003', 'PO2024-003', '2024-03-10', 3200000.00, 'Completed'),
('PO_004', 'VENDOR_004', 'PO2024-004', '2024-04-05', 950000.00, 'Completed'),
('PO_005', 'VENDOR_005', 'PO2024-005', '2024-05-12', 1200000.00, 'In Progress');

-- Sample spend transactions (subset of larger dataset)
INSERT OR IGNORE INTO spend_transactions (po_id, vendor_id, commodity_id, transaction_date, line_item_description, quantity, unit_price, total_amount, fiscal_year, department) VALUES
('PO_001', 'VENDOR_001', 'COMM_001', '2024-01-15', 'Power Distribution Transformer 500kVA', 5, 500000.00, 2500000.00, 2024, 'Infrastructure'),
('PO_002', 'VENDOR_002', 'COMM_002', '2024-02-20', 'Digital Watt-Hour Meters Class 0.2', 1000, 1800.00, 1800000.00, 2024, 'Utilities'),
('PO_003', 'VENDOR_003', 'COMM_003', '2024-03-10', 'Air Impact Tools Heavy Duty', 200, 16000.00, 3200000.00, 2024, 'Maintenance'),
('PO_004', 'VENDOR_004', 'COMM_005', '2024-04-05', 'Hot Mix Asphalt Concrete Grade A', 500, 1900.00, 950000.00, 2024, 'Roads'),
('PO_005', 'VENDOR_005', 'COMM_004', '2024-05-12', 'Metal Clad Switchgear 15kV', 8, 150000.00, 1200000.00, 2024, 'Electrical');

-- ============================================
-- VIEWS FOR COMMON ANALYTICS
-- ============================================

-- Spend by vendor summary
CREATE VIEW IF NOT EXISTS v_vendor_spend_summary AS
SELECT 
  v.vendor_name,
  v.state,
  COUNT(DISTINCT st.po_id) as total_orders,
  SUM(st.total_amount) as total_spend,
  AVG(st.total_amount) as avg_transaction_amount,
  MIN(st.transaction_date) as first_transaction,
  MAX(st.transaction_date) as last_transaction
FROM vendors v
JOIN spend_transactions st ON v.vendor_id = st.vendor_id
GROUP BY v.vendor_id, v.vendor_name, v.state;

-- Spend by commodity summary  
CREATE VIEW IF NOT EXISTS v_commodity_spend_summary AS
SELECT 
  c.commodity_description,
  c.category,
  COUNT(DISTINCT st.vendor_id) as vendor_count,
  SUM(st.total_amount) as total_spend,
  SUM(st.quantity) as total_quantity,
  AVG(st.unit_price) as avg_unit_price
FROM commodities c
JOIN spend_transactions st ON c.commodity_id = st.commodity_id
GROUP BY c.commodity_id, c.commodity_description, c.category;

-- Monthly spend trends
CREATE VIEW IF NOT EXISTS v_monthly_spend_trends AS
SELECT 
  strftime('%Y-%m', st.transaction_date) as month_year,
  COUNT(*) as transaction_count,
  SUM(st.total_amount) as total_spend,
  AVG(st.total_amount) as avg_transaction_amount,
  COUNT(DISTINCT st.vendor_id) as unique_vendors,
  COUNT(DISTINCT st.commodity_id) as unique_commodities
FROM spend_transactions st
GROUP BY strftime('%Y-%m', st.transaction_date)
ORDER BY month_year;

-- ============================================
-- TRIGGERS FOR DATA INTEGRITY
-- ============================================

-- Update timestamps on chart config changes
CREATE TRIGGER IF NOT EXISTS update_chart_config_timestamp
AFTER UPDATE ON dynamic_chart_configs
BEGIN
  UPDATE dynamic_chart_configs 
  SET updated_date = datetime('now') 
  WHERE config_id = NEW.config_id;
END;

-- Validate spend transaction amounts
CREATE TRIGGER IF NOT EXISTS validate_spend_amount
BEFORE INSERT ON spend_transactions
WHEN NEW.total_amount != (NEW.quantity * NEW.unit_price)
BEGIN
  SELECT RAISE(ABORT, 'Total amount must equal quantity * unit_price');
END;

-- ============================================
-- UTILITY FUNCTIONS (SQLite)
-- ============================================

-- Example queries for testing the dynamic chart system:

/*
-- Test commodity spend query (matches top_commodities_bar config)
SELECT 
  commodities.commodity_description as label, 
  SUM(spend_transactions.total_amount) as value,
  ROUND(SUM(spend_transactions.total_amount) * 100.0 / 
    (SELECT SUM(total_amount) FROM spend_transactions), 1) as percentage
FROM spend_transactions 
JOIN commodities ON spend_transactions.commodity_id = commodities.commodity_id
GROUP BY commodities.commodity_description 
ORDER BY value DESC 
LIMIT 10;

-- Test vendor spend query (matches vendor_spend_analysis config)  
SELECT 
  vendors.vendor_name as label,
  SUM(spend_transactions.total_amount) as value,
  ROUND(SUM(spend_transactions.total_amount) * 100.0 / 
    (SELECT SUM(total_amount) FROM spend_transactions), 1) as percentage
FROM spend_transactions 
JOIN vendors ON spend_transactions.vendor_id = vendors.vendor_id
GROUP BY vendors.vendor_name
ORDER BY value DESC 
LIMIT 5;

-- Test geographic spend query (matches geographic_distribution config)
SELECT 
  vendors.state as label,
  SUM(spend_transactions.total_amount) as value,
  ROUND(SUM(spend_transactions.total_amount) * 100.0 / 
    (SELECT SUM(total_amount) FROM spend_transactions), 1) as percentage,
  COUNT(DISTINCT vendors.vendor_id) as vendor_count
FROM spend_transactions 
JOIN vendors ON spend_transactions.vendor_id = vendors.vendor_id
WHERE vendors.state IS NOT NULL AND vendors.state != ''
GROUP BY vendors.state
ORDER BY value DESC 
LIMIT 5;
*/

-- ============================================
-- PRODUCTION DEPLOYMENT NOTES
-- ============================================

/*
For production deployment:

1. SECURITY:
   - Implement proper user authentication and authorization
   - Use parameterized queries to prevent SQL injection
   - Add rate limiting on API endpoints
   - Encrypt sensitive configuration data

2. PERFORMANCE:
   - Consider PostgreSQL or MySQL for larger datasets
   - Implement query result caching (Redis)
   - Add database connection pooling
   - Monitor query execution times

3. SCALABILITY:
   - Implement horizontal scaling for API layer
   - Use read replicas for reporting queries
   - Consider partitioning large transaction tables
   - Add database backup and recovery procedures

4. MONITORING:
   - Add logging for all chart access and parameter usage
   - Implement performance metrics and alerting
   - Track user adoption of different chart types
   - Monitor database query performance

5. MAINTENANCE:
   - Regular database optimization and statistics updates
   - Automated testing of chart configuration changes
   - Version control for chart configurations
   - Documentation of custom chart creation process
*/