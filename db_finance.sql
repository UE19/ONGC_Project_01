-- ONGC Finance DB (PostgreSQL)
DROP TABLE IF EXISTS gl_entries CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS procurement_orders CASCADE;
DROP TABLE IF EXISTS budget_allocations CASCADE;

CREATE TABLE budget_allocations (
    budget_id        SERIAL PRIMARY KEY,
    department       VARCHAR(100) NOT NULL,
    quarter          VARCHAR(10)  NOT NULL,
    year             INT          NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    spent_amount     DECIMAL(15,2) DEFAULT 0,
    balance_amount   DECIMAL(15,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED
);
CREATE TABLE procurement_orders (
    order_id    SERIAL PRIMARY KEY,
    vendor_name VARCHAR(150) NOT NULL,
    item_desc   VARCHAR(250),
    po_value    DECIMAL(15,2) NOT NULL,
    department  VARCHAR(100),
    order_date  DATE NOT NULL,
    status      VARCHAR(30) DEFAULT 'pending'
);
CREATE TABLE purchase_orders (
    po_id       SERIAL PRIMARY KEY,
    vendor_name VARCHAR(150) NOT NULL,
    po_value    DECIMAL(15,2) NOT NULL,
    department  VARCHAR(100),
    po_date     DATE NOT NULL,
    approved_by VARCHAR(100),
    status      VARCHAR(30) DEFAULT 'approved'
);
CREATE TABLE gl_entries (
    entry_id      SERIAL PRIMARY KEY,
    account_code  VARCHAR(20)  NOT NULL,
    account_name  VARCHAR(150) NOT NULL,
    debit_amount  DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    entry_date    DATE NOT NULL,
    description   VARCHAR(250),
    department    VARCHAR(100)
);

INSERT INTO budget_allocations(department,quarter,year,allocated_amount,spent_amount) VALUES
('E&P Operations','Q1',2026,45000000,38200000),('Refinery','Q1',2026,32000000,29800000),
('HR & Admin','Q1',2026,8500000,7200000),('IT Infrastructure','Q1',2026,12000000,9800000),
('Safety & Environment','Q1',2026,6000000,5100000),('E&P Operations','Q2',2026,43200000,21500000),
('Refinery','Q2',2026,35000000,18200000),('HR & Admin','Q2',2026,9000000,4100000),
('IT Infrastructure','Q2',2026,11000000,5600000),('Safety & Environment','Q2',2026,6500000,3200000),
('E&P Operations','Q3',2026,47000000,0),('Refinery','Q3',2026,36000000,0),
('HR & Admin','Q3',2026,9500000,0),('IT Infrastructure','Q3',2026,13000000,0),
('Safety & Environment','Q3',2026,7000000,0),('E&P Operations','Q4',2026,48000000,0),
('Refinery','Q4',2026,37000000,0),('Finance & Accounts','Q1',2026,5000000,4200000),
('Finance & Accounts','Q2',2026,5500000,2800000);

INSERT INTO procurement_orders(vendor_name,item_desc,po_value,department,order_date,status) VALUES
('TechCorp India Ltd','Server Hardware & Storage',18500000,'IT Infrastructure','2026-04-02','delivered'),
('Bharat Petroleum','Crude Processing Chemicals',9200000,'Refinery','2026-04-05','delivered'),
('Siemens India','SCADA Control Systems',22000000,'E&P Operations','2026-04-08','in_transit'),
('ABB India','Electrical Switchgear',7800000,'Refinery','2026-04-12','delivered'),
('Larsen & Toubro','Pipeline Inspection Equipment',15600000,'E&P Operations','2026-04-15','delivered'),
('Microsoft India','Enterprise Software Licenses',4200000,'IT Infrastructure','2026-04-18','delivered'),
('ONGC Safety Solutions','PPE & Safety Equipment',2100000,'Safety & Environment','2026-04-20','delivered'),
('Oracle India','Database Licenses',3800000,'IT Infrastructure','2026-05-01','delivered'),
('Honeywell India','Process Automation Systems',28000000,'Refinery','2026-05-05','pending'),
('GE India','Gas Turbine Components',35000000,'E&P Operations','2026-05-10','in_transit'),
('Schlumberger India','Drilling Equipment',42000000,'E&P Operations','2026-05-15','pending'),
('Cisco Systems India','Network Infrastructure',6500000,'IT Infrastructure','2026-05-18','delivered'),
('HPCL','Lubricants & Additives',1800000,'Refinery','2026-05-20','delivered'),
('Wipro Technologies','IT Services & Support',5200000,'IT Infrastructure','2026-05-25','active'),
('Yokogawa India','Instrumentation Systems',11000000,'Refinery','2026-06-01','in_transit'),
('Emerson India','Flow Meters & Sensors',8900000,'E&P Operations','2026-06-05','pending'),
('DNV GL India','Inspection & Certification',3200000,'Safety & Environment','2026-06-08','pending'),
('IBM India','Cloud Infrastructure',7500000,'IT Infrastructure','2026-06-10','pending');

INSERT INTO purchase_orders(vendor_name,po_value,department,po_date,approved_by,status) VALUES
('TechCorp India Ltd',18000000,'IT Infrastructure','2026-01-15','GM-IT','approved'),
('Siemens India',21500000,'E&P Operations','2026-01-20','GM-OPS','approved'),
('Bharat Petroleum',9000000,'Refinery','2026-02-01','GM-REF','approved'),
('ABB India',7500000,'Refinery','2026-02-08','GM-REF','approved'),
('Larsen & Toubro',15000000,'E&P Operations','2026-02-15','GM-OPS','approved'),
('GE India',34000000,'E&P Operations','2026-03-01','Director-OPS','approved'),
('Schlumberger India',40000000,'E&P Operations','2026-03-10','Director-OPS','approved'),
('Honeywell India',27500000,'Refinery','2026-03-15','GM-REF','approved'),
('Oracle India',3600000,'IT Infrastructure','2026-03-20','GM-IT','approved'),
('Microsoft India',4000000,'IT Infrastructure','2026-04-01','GM-IT','approved');

INSERT INTO gl_entries(account_code,account_name,debit_amount,credit_amount,entry_date,description,department) VALUES
('4001','Revenue from Crude Sales',0,280000000,'2026-04-30','April 2026 Crude Revenue','Finance'),
('4001','Revenue from Crude Sales',0,295000000,'2026-05-31','May 2026 Crude Revenue','Finance'),
('4002','Revenue from Petroleum Products',0,185000000,'2026-04-30','April Products Revenue','Finance'),
('4002','Revenue from Petroleum Products',0,192000000,'2026-05-31','May Products Revenue','Finance'),
('5001','E&P Operating Expenses',38200000,0,'2026-04-30','Q1 E&P Expenses','E&P Operations'),
('5002','Refinery Operating Expenses',29800000,0,'2026-04-30','Q1 Refinery Expenses','Refinery'),
('5003','HR & Admin Expenses',7200000,0,'2026-04-30','Q1 HR Expenses','HR & Admin'),
('5004','IT Infrastructure Expenses',9800000,0,'2026-04-30','Q1 IT Expenses','IT Infrastructure'),
('5005','Safety Expenses',5100000,0,'2026-04-30','Q1 Safety Expenses','Safety & Environment');

SELECT 'finance tables loaded' AS status, COUNT(*) AS budget_rows FROM budget_allocations;
