-- ONGC Procurement DB
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS purchase_requests CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

CREATE TABLE vendors (
    vendor_id      SERIAL PRIMARY KEY,
    vendor_name    VARCHAR(150) NOT NULL,
    vendor_code    VARCHAR(30)  UNIQUE,
    category       VARCHAR(80),
    contact_person VARCHAR(100),
    email          VARCHAR(150),
    phone          VARCHAR(20),
    city           VARCHAR(80),
    is_active      BOOLEAN DEFAULT TRUE,
    registered_date DATE
);
CREATE TABLE purchase_requests (
    pr_id         SERIAL PRIMARY KEY,
    pr_number     VARCHAR(30) UNIQUE NOT NULL,
    department    VARCHAR(100),
    item_desc     VARCHAR(250),
    quantity      DECIMAL(10,2),
    unit          VARCHAR(30),
    estimated_cost DECIMAL(15,2),
    requested_by  VARCHAR(100),
    request_date  DATE NOT NULL,
    status        VARCHAR(30) DEFAULT 'pending',
    priority      VARCHAR(20) DEFAULT 'normal'
);
CREATE TABLE contracts (
    contract_id   SERIAL PRIMARY KEY,
    contract_number VARCHAR(30) UNIQUE NOT NULL,
    vendor_id     INT REFERENCES vendors(vendor_id),
    contract_value DECIMAL(15,2),
    start_date    DATE,
    end_date      DATE,
    department    VARCHAR(100),
    contract_type VARCHAR(50),
    status        VARCHAR(30) DEFAULT 'active'
);
CREATE TABLE invoices (
    invoice_id    SERIAL PRIMARY KEY,
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    vendor_id     INT REFERENCES vendors(vendor_id),
    contract_id   INT REFERENCES contracts(contract_id),
    invoice_amount DECIMAL(15,2),
    invoice_date  DATE,
    due_date      DATE,
    paid_date     DATE,
    status        VARCHAR(30) DEFAULT 'pending'
);

INSERT INTO vendors(vendor_name,vendor_code,category,contact_person,email,phone,city,is_active,registered_date) VALUES
('TechCorp India Ltd','VND001','IT Hardware','Anil Kumar','anil@techcorp.in','9876543210','Mumbai',TRUE,'2018-01-15'),
('Siemens India Pvt Ltd','VND002','Industrial Automation','Raj Mehta','raj.mehta@siemens.in','9876543211','Pune',TRUE,'2015-03-20'),
('ABB India Ltd','VND003','Electrical Equipment','Priya Nair','priya@abb.in','9876543212','Bengaluru',TRUE,'2016-05-10'),
('Larsen & Toubro Ltd','VND004','Engineering & Construction','Suresh Rao','suresh.rao@lnt.com','9876543213','Mumbai',TRUE,'2010-08-01'),
('Honeywell Automation India','VND005','Process Automation','Rahul Shah','rahul@honeywell.in','9876543214','Pune',TRUE,'2014-02-28'),
('GE India Ltd','VND006','Energy Equipment','Vivek Sharma','vivek@ge.com','9876543215','Noida',TRUE,'2012-11-15'),
('Schlumberger India','VND007','Oilfield Services','Deepak Pillai','deepak@slb.com','9876543216','Mumbai',TRUE,'2008-06-01'),
('Bharat Petroleum Corp','VND008','Petroleum Products','Meera Iyer','meera@bpcl.in','9876543217','Mumbai',TRUE,'2015-09-20'),
('Microsoft India Pvt Ltd','VND009','Software Licenses','Arun Desai','arun@microsoft.in','9876543218','Hyderabad',TRUE,'2020-01-10'),
('Oracle India Pvt Ltd','VND010','Database Software','Kavitha Nair','kavitha@oracle.in','9876543219','Mumbai',TRUE,'2019-03-05'),
('Cisco Systems India','VND011','Networking Equipment','Rohit Kumar','rohit@cisco.in','9876543220','Bengaluru',TRUE,'2018-07-12'),
('Yokogawa India Pvt Ltd','VND012','Instrumentation','Sanjay Verma','sanjay@yokogawa.in','9876543221','Mumbai',TRUE,'2017-04-18'),
('Emerson India Pvt Ltd','VND013','Flow Control','Anita Sharma','anita@emerson.in','9876543222','Noida',TRUE,'2016-10-25'),
('DNV GL India Pvt Ltd','VND014','Inspection Services','Harish Pillai','harish@dnvgl.in','9876543223','Mumbai',TRUE,'2019-08-30'),
('Wipro Technologies Ltd','VND015','IT Services','Preeti Rao','preeti@wipro.com','9876543224','Bengaluru',TRUE,'2021-02-14');

INSERT INTO purchase_requests(pr_number,department,item_desc,quantity,unit,estimated_cost,requested_by,request_date,status,priority) VALUES
('PR-2026-001','IT Infrastructure','Dell PowerEdge Servers R750',10,'Units',18000000,'GM-IT','2026-01-10','approved','high'),
('PR-2026-002','E&P Operations','Drilling Rig Maintenance Parts',1,'Lot',35000000,'GM-OPS','2026-01-15','approved','critical'),
('PR-2026-003','Refinery','SCADA System Upgrade',1,'System',22000000,'GM-REF','2026-01-20','approved','high'),
('PR-2026-004','Safety & Environment','PPE Kits for Field Workers',500,'Units',2500000,'GM-HSE','2026-02-01','approved','normal'),
('PR-2026-005','HR & Admin','Office Furniture',200,'Units',1200000,'GM-HR','2026-02-05','approved','low'),
('PR-2026-006','E&P Operations','Pipeline Inspection Robot',2,'Units',15000000,'GM-OPS','2026-02-10','approved','high'),
('PR-2026-007','Refinery','Heat Exchanger Bundles',5,'Units',8500000,'GM-REF','2026-02-15','approved','normal'),
('PR-2026-008','IT Infrastructure','Network Switches Cisco Cat9300',50,'Units',6200000,'GM-IT','2026-03-01','approved','normal'),
('PR-2026-009','E&P Operations','Gas Turbine Rotor Blades',1,'Set',28000000,'Director-OPS','2026-03-10','approved','critical'),
('PR-2026-010','Refinery','Yokogawa DCS Controller Upgrade',1,'System',11000000,'GM-REF','2026-03-15','approved','high'),
('PR-2026-011','E&P Operations','Seismic Survey Equipment',1,'Lot',42000000,'Director-OPS','2026-04-01','pending','critical'),
('PR-2026-012','IT Infrastructure','IBM Cloud Migration Services',1,'Project',7500000,'GM-IT','2026-04-05','pending','high'),
('PR-2026-013','Safety & Environment','Fire Suppression System Maintenance',1,'Service',3200000,'GM-HSE','2026-04-08','pending','normal'),
('PR-2026-014','Refinery','Emerson Flow Meters',25,'Units',8900000,'GM-REF','2026-04-12','pending','normal'),
('PR-2026-015','E&P Operations','Subsea Wellhead Equipment',1,'Lot',65000000,'Director-OPS','2026-05-01','pending','critical');

INSERT INTO contracts(contract_number,vendor_id,contract_value,start_date,end_date,department,contract_type,status) VALUES
('CNT-2024-001',4,250000000,'2024-04-01','2027-03-31','E&P Operations','Engineering & Construction','active'),
('CNT-2024-002',7,180000000,'2024-07-01','2026-06-30','E&P Operations','Oilfield Services','active'),
('CNT-2025-001',2,95000000,'2025-01-01','2027-12-31','Refinery','Annual Maintenance','active'),
('CNT-2025-002',15,45000000,'2025-04-01','2026-03-31','IT Infrastructure','IT Services AMC','active'),
('CNT-2025-003',5,75000000,'2025-01-01','2026-12-31','Refinery','Process Automation','active'),
('CNT-2026-001',1,35000000,'2026-01-15','2027-01-14','IT Infrastructure','Hardware Supply','active'),
('CNT-2026-002',6,120000000,'2026-02-01','2028-01-31','E&P Operations','Equipment Supply','active'),
('CNT-2026-003',9,12000000,'2026-04-01','2027-03-31','IT Infrastructure','Software Licenses','active');

INSERT INTO invoices(invoice_number,vendor_id,contract_id,invoice_amount,invoice_date,due_date,paid_date,status) VALUES
('INV-2026-001',4,1,12500000,'2026-04-05','2026-05-05','2026-05-02','paid'),
('INV-2026-002',7,2,15000000,'2026-04-10','2026-05-10','2026-05-08','paid'),
('INV-2026-003',2,3,8000000,'2026-04-15','2026-05-15','2026-05-13','paid'),
('INV-2026-004',15,4,3750000,'2026-04-20','2026-05-20','2026-05-18','paid'),
('INV-2026-005',5,5,6250000,'2026-04-25','2026-05-25','2026-05-22','paid'),
('INV-2026-006',1,6,8750000,'2026-05-01','2026-05-31','2026-05-29','paid'),
('INV-2026-007',4,1,12500000,'2026-05-05','2026-06-05',NULL,'pending'),
('INV-2026-008',7,2,15000000,'2026-05-10','2026-06-10',NULL,'pending'),
('INV-2026-009',2,3,8000000,'2026-05-15','2026-06-15',NULL,'pending'),
('INV-2026-010',6,7,10000000,'2026-05-20','2026-06-20',NULL,'pending'),
('INV-2026-011',9,8,3000000,'2026-06-01','2026-07-01',NULL,'pending'),
('INV-2026-012',4,1,12500000,'2026-06-05','2026-07-05',NULL,'pending');

SELECT 'procurement tables loaded' AS status, COUNT(*) AS vendor_count FROM vendors;
