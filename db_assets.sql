-- ONGC Asset Management DB
DROP TABLE IF EXISTS asset_conditions CASCADE;
DROP TABLE IF EXISTS spare_parts CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS equipment_assets CASCADE;

CREATE TABLE equipment_assets (
    asset_id        SERIAL PRIMARY KEY,
    asset_code      VARCHAR(30) UNIQUE NOT NULL,
    asset_name      VARCHAR(200) NOT NULL,
    asset_type      VARCHAR(80),
    location        VARCHAR(150),
    department      VARCHAR(100),
    manufacturer    VARCHAR(100),
    model_number    VARCHAR(100),
    serial_number   VARCHAR(100),
    installation_date DATE,
    last_service_date DATE,
    next_service_date DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    asset_value     DECIMAL(15,2),
    condition_status VARCHAR(30) DEFAULT 'good'
);
CREATE TABLE maintenance_schedules (
    schedule_id     SERIAL PRIMARY KEY,
    asset_id        INT REFERENCES equipment_assets(asset_id),
    maintenance_type VARCHAR(80),
    scheduled_date  DATE,
    completed_date  DATE,
    technician_name VARCHAR(100),
    work_order_no   VARCHAR(30),
    duration_hours  DECIMAL(6,2),
    cost_incurred   DECIMAL(12,2),
    status          VARCHAR(30) DEFAULT 'scheduled',
    remarks         TEXT
);
CREATE TABLE spare_parts (
    part_id         SERIAL PRIMARY KEY,
    part_code       VARCHAR(30) UNIQUE,
    part_name       VARCHAR(200),
    asset_id        INT REFERENCES equipment_assets(asset_id),
    quantity_in_stock INT DEFAULT 0,
    reorder_level   INT DEFAULT 5,
    unit_cost       DECIMAL(12,2),
    last_replenished DATE,
    supplier        VARCHAR(150)
);
CREATE TABLE asset_conditions (
    condition_id    SERIAL PRIMARY KEY,
    asset_id        INT REFERENCES equipment_assets(asset_id),
    assessment_date DATE NOT NULL,
    condition_score INT,
    condition_grade VARCHAR(5),
    assessed_by     VARCHAR(100),
    wear_percent    DECIMAL(5,2),
    next_assessment DATE,
    notes           TEXT
);

INSERT INTO equipment_assets(asset_code,asset_name,asset_type,location,department,manufacturer,model_number,serial_number,installation_date,last_service_date,next_service_date,is_active,asset_value,condition_status) VALUES
('AST-001','Crude Distillation Unit CDU-1','Process Equipment','Karaikal Refinery','Refinery Operations','Technip FMC','CDU-2500','TF-CDU-001',  '2008-03-15','2025-12-10','2026-06-10',TRUE,2500000000,'good'),
('AST-002','Crude Distillation Unit CDU-2','Process Equipment','Karaikal Refinery','Refinery Operations','Technip FMC','CDU-2500','TF-CDU-002','2010-07-20','2025-11-15','2026-05-15',TRUE,2600000000,'good'),
('AST-003','Vacuum Distillation Unit VDU-1','Process Equipment','Karaikal Refinery','Refinery Operations','UOP LLC','VDU-1800','UOP-VDU-001','2009-05-10','2025-10-20','2026-04-20',TRUE,1800000000,'fair'),
('AST-004','SCADA Control System - Offshore','Instrumentation','Mumbai High Platform A','E&P Operations','Honeywell','Experion PKS R500','HON-SCADA-001','2015-06-01','2026-01-15','2026-07-15',TRUE,450000000,'good'),
('AST-005','Gas Turbine Generator GT-1','Rotating Equipment','Mumbai High Platform A','E&P Operations','GE Power','LM2500+','GE-GT-001','2012-09-15','2026-02-20','2026-08-20',TRUE,850000000,'good'),
('AST-006','Gas Turbine Generator GT-2','Rotating Equipment','Mumbai High Platform B','E&P Operations','GE Power','LM2500+','GE-GT-002','2013-04-10','2026-03-10','2026-09-10',TRUE,850000000,'good'),
('AST-007','Subsea Pipeline - MHN to Uran','Pipeline','Western Offshore to Uran','E&P Operations','Saipem','30-inch SSAW','SAI-PL-001','2005-08-20','2025-08-15','2026-08-15',TRUE,5000000000,'good'),
('AST-008','Wellhead Tree - MHN-A-01','Wellhead Equipment','Mumbai High North Platform A','E&P Operations','Cameron/SLB','HC-FS','CAM-WHT-001','2010-09-20','2025-06-10','2026-06-10',TRUE,180000000,'good'),
('AST-009','Crude Storage Tank T-01','Storage','Uran Onshore Processing','E&P Operations','Engineers India Ltd','FRTF-50000','EIL-TK-001','2006-04-15','2025-09-20','2026-09-20',TRUE,320000000,'good'),
('AST-010','Crude Storage Tank T-02','Storage','Uran Onshore Processing','E&P Operations','Engineers India Ltd','FRTF-50000','EIL-TK-002','2006-04-15','2025-09-20','2026-09-20',TRUE,320000000,'good'),
('AST-011','DCS System - Refinery','Instrumentation','Karaikal Refinery','Refinery Operations','Yokogawa','CENTUM VP R6','YKW-DCS-001','2018-02-10','2026-04-05','2026-10-05',TRUE,220000000,'good'),
('AST-012','Hydrocracker Unit HCU-1','Process Equipment','Karaikal Refinery','Refinery Operations','UOP LLC','HCU-1200','UOP-HCU-001','2012-11-20','2025-11-30','2026-05-30',TRUE,3200000000,'good'),
('AST-013','Fire & Gas Detection System','Safety Equipment','Mumbai High Platform A','Safety & Environment','MSA Safety','GALAXY Fixed Gas','MSA-FGD-001','2015-06-01','2026-01-20','2026-07-20',TRUE,85000000,'good'),
('AST-014','Emergency Shutdown System','Safety Equipment','Karaikal Refinery','Safety & Environment','Triconex','TRICON v10','TRX-ESD-001','2016-03-15','2026-02-28','2026-08-28',TRUE,120000000,'good'),
('AST-015','Rig Equipment - Aban Abraham','Drilling Equipment','Ahmedabad Block','E&P Operations','NOV Inc','Rig-5000 HP','NOV-RIG-001','2025-01-10',NULL,'2026-09-01',TRUE,1200000000,'good');

INSERT INTO maintenance_schedules(asset_id,maintenance_type,scheduled_date,completed_date,technician_name,work_order_no,duration_hours,cost_incurred,status,remarks) VALUES
(1,'Turnaround Maintenance','2026-01-15','2026-01-22','Suresh Kumar','WO-2026-001',168,25000000,'completed','Annual turnaround completed successfully'),
(2,'Routine Inspection','2026-02-10','2026-02-10','Priya Nair','WO-2026-002',8,450000,'completed','All checks passed'),
(3,'Pump Overhaul','2026-02-20','2026-02-25','Rajesh Iyer','WO-2026-003',48,3500000,'completed','Impeller replaced'),
(4,'Calibration','2026-03-05','2026-03-05','Karthik S','WO-2026-004',4,80000,'completed','All instruments calibrated'),
(5,'Major Inspection (BORESCOPE)','2026-03-15','2026-03-18','GE Service Team','WO-2026-005',72,8500000,'completed','Turbine blades in good condition'),
(6,'Routine Maintenance','2026-04-01','2026-04-01','Vikram Menon','WO-2026-006',8,350000,'completed','Routine checks done'),
(8,'Wellhead Inspection','2026-04-10','2026-04-10','Cameron Tech','WO-2026-007',12,1200000,'completed','Seals replaced'),
(9,'Internal Inspection','2026-04-15','2026-04-20','Tank Inspection Team','WO-2026-008',120,5500000,'completed','No corrosion found'),
(11,'Software Upgrade','2026-05-01','2026-05-03','Yokogawa Engineers','WO-2026-009',48,2200000,'completed','Upgraded to CENTUM VP R6.06'),
(1,'Pump Seal Replacement','2026-05-15','2026-05-15','Maintenance Team','WO-2026-010',6,280000,'completed','P-101 A/B seal replaced'),
(3,'VDU Overhead Condenser Check','2026-05-28',NULL,'Senior Technician','WO-2026-011',NULL,NULL,'in_progress','Condenser pressure issue under investigation'),
(5,'Fuel Nozzle Replacement','2026-06-10',NULL,'GE Service Team','WO-2026-012',NULL,NULL,'scheduled','Preventive replacement'),
(12,'Catalyst Regeneration','2026-07-01',NULL,'UOP Engineers','WO-2026-013',NULL,NULL,'scheduled','Annual catalyst regeneration planned'),
(13,'System Test','2026-06-20',NULL,'MSA Safety Team','WO-2026-014',NULL,NULL,'scheduled','6-monthly system test'),
(7,'Intelligent Pigging','2026-08-01',NULL,'TDW Offshore','WO-2026-015',NULL,NULL,'scheduled','Biennial pipeline inspection');

INSERT INTO spare_parts(part_code,part_name,asset_id,quantity_in_stock,reorder_level,unit_cost,last_replenished,supplier) VALUES
('SP-001','Pump Mechanical Seal 75mm',1,12,5,45000,'2026-03-15','Flowserve India'),
('SP-002','Pump Impeller CDU Type',1,4,2,185000,'2026-02-20','Flowserve India'),
('SP-003','Heat Exchanger Gasket Set',3,25,10,8500,'2026-04-10','Flexitallic India'),
('SP-004','Control Valve Trim Set',4,8,3,125000,'2026-01-20','Emerson India'),
('SP-005','Gas Turbine Fuel Nozzle',5,6,3,850000,'2026-05-01','GE Aviation'),
('SP-006','Pressure Transmitter Rosemount 3051',4,15,5,28500,'2026-03-25','Emerson India'),
('SP-007','Flow Meter Yokogawa ADMAG',11,8,3,65000,'2026-02-15','Yokogawa India'),
('SP-008','Wellhead Seal Ring Kit',8,20,8,35000,'2026-04-05','Cameron/SLB'),
('SP-009','DCS I/O Card Yokogawa ADV151',11,10,4,185000,'2026-01-10','Yokogawa India'),
('SP-010','Fire Detector Flame Scanner',13,30,10,18500,'2026-05-15','MSA Safety India');

INSERT INTO asset_conditions(asset_id,assessment_date,condition_score,condition_grade,assessed_by,wear_percent,next_assessment,notes) VALUES
(1,'2026-01-22',88,'B','Independent Inspector',18,'2027-01-22','Good condition post-turnaround'),
(2,'2026-02-10',85,'B','Plant Integrity Team',22,'2027-02-10','Minor corrosion in overhead circuit'),
(3,'2026-02-25',78,'C','Plant Integrity Team',32,'2026-08-25','Overhead condenser showing signs of wear'),
(4,'2026-03-05',95,'A','SCADA Specialist',5,'2027-03-05','Excellent condition'),
(5,'2026-03-18',90,'A','GE Field Service',12,'2027-03-18','Good condition, blades within tolerance'),
(6,'2026-04-01',92,'A','Plant Engineer',10,'2027-04-01','Very good condition'),
(7,'2025-08-15',85,'B','Pipecheck Integrity',22,'2026-08-15','Minor wall loss in section B, within limits'),
(8,'2026-04-10',91,'A','Wellhead Inspector',9,'2027-04-10','Good condition post-seal replacement'),
(9,'2026-04-20',88,'B','Tank Inspector',15,'2027-04-20','Good condition, coating intact'),
(11,'2026-05-03',96,'A','Yokogawa Engineers',4,'2027-05-03','Excellent after upgrade');

SELECT 'asset tables loaded' AS status, COUNT(*) AS asset_count FROM equipment_assets;
