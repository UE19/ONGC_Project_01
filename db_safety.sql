-- ONGC Safety & Environment DB
DROP TABLE IF EXISTS training_records CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS safety_inspections CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;

CREATE TABLE incidents (
    incident_id      SERIAL PRIMARY KEY,
    incident_date    DATE NOT NULL,
    incident_type    VARCHAR(80)  NOT NULL,
    location         VARCHAR(150),
    severity         VARCHAR(20)  DEFAULT 'low',
    description      TEXT,
    reported_by      VARCHAR(100),
    injured_count    INT DEFAULT 0,
    is_resolved      BOOLEAN DEFAULT FALSE,
    resolved_date    DATE,
    root_cause       VARCHAR(250),
    corrective_action VARCHAR(250)
);
CREATE TABLE safety_inspections (
    inspection_id    SERIAL PRIMARY KEY,
    inspection_date  DATE NOT NULL,
    location         VARCHAR(150),
    inspector_name   VARCHAR(100),
    inspection_type  VARCHAR(80),
    findings         TEXT,
    compliance_score INT,
    status           VARCHAR(30) DEFAULT 'completed',
    next_inspection  DATE
);
CREATE TABLE risk_assessments (
    assessment_id    SERIAL PRIMARY KEY,
    assessment_date  DATE NOT NULL,
    location         VARCHAR(150),
    hazard_type      VARCHAR(100),
    risk_level       VARCHAR(20)  DEFAULT 'medium',
    likelihood       INT,
    consequence      INT,
    risk_score       INT,
    control_measures TEXT,
    responsible_person VARCHAR(100),
    review_date      DATE
);
CREATE TABLE training_records (
    training_id      SERIAL PRIMARY KEY,
    emp_code         VARCHAR(20),
    emp_name         VARCHAR(150),
    training_type    VARCHAR(100),
    training_date    DATE,
    completion_date  DATE,
    score            INT,
    is_certified     BOOLEAN DEFAULT FALSE,
    expiry_date      DATE
);

INSERT INTO incidents(incident_date,incident_type,location,severity,description,reported_by,injured_count,is_resolved,resolved_date,root_cause,corrective_action) VALUES
('2026-01-12','Near Miss','Mumbai High Platform A','low','Worker slipped on wet surface near pump station','Arun Pillai',0,TRUE,'2026-01-15','Wet floor not marked','Anti-slip mats installed, signage added'),
('2026-02-03','Minor Injury','Karaikal Refinery Unit-3','medium','Hand injury during valve maintenance','Safety Officer Karaikal',1,TRUE,'2026-02-10','PPE not worn properly','Mandatory PPE training conducted'),
('2026-02-18','Equipment Damage','Hazira Processing Plant','medium','Pipe flange leak in crude unit','Hazira Safety Team',0,TRUE,'2026-02-25','Gasket failure due to age','All flanges in unit inspected and replaced'),
('2026-03-05','Fire Incident','Uran Fractionation Plant','high','Small fire at fractionation column','Emergency Response Team',0,TRUE,'2026-03-08','Hydrocarbon leak near hot surface','Fire suppression system upgraded'),
('2026-03-22','Near Miss','Mumbai High Platform B','low','Tool dropped from height - no injuries','Safety Inspector',0,TRUE,'2026-03-24','Inadequate tool securing','Tool tethering protocol implemented'),
('2026-04-10','Spill','Rajkot Field Station','medium','Small crude oil spill during transfer','Field Safety Officer',0,TRUE,'2026-04-14','Transfer pump valve failure','Preventive maintenance schedule updated'),
('2026-04-28','Near Miss','Dehradun R&D Lab','low','Chemical exposure - minor','Lab Safety Officer',0,TRUE,'2026-04-30','SOP not followed','SOP training refresher done'),
('2026-05-15','Minor Injury','Ankleshwar Field','medium','Back strain during manual handling','Field Supervisor',1,TRUE,'2026-05-20','Improper lifting technique','Manual handling training conducted'),
('2026-05-28','Equipment Malfunction','Karaikal Refinery Unit-1','high','CDU overhead condenser pressure surge','Senior Safety Officer',0,FALSE,NULL,'Under investigation','Equipment isolated, investigation ongoing'),
('2026-06-02','Near Miss','Mumbai Office Complex','low','Electrical sparks from panel','Maintenance Supervisor',0,TRUE,'2026-06-04','Overloaded circuit','Circuit redesigned and load distributed');

INSERT INTO safety_inspections(inspection_date,location,inspector_name,inspection_type,findings,compliance_score,status,next_inspection) VALUES
('2026-04-01','Mumbai High Platform A','Arun Pillai','Process Safety Inspection','All safety systems functional. 2 minor housekeeping issues noted.',92,'completed','2026-07-01'),
('2026-04-05','Karaikal Refinery Unit-1','HSE Manager Karaikal','Fire & Gas Detection Audit','Fire detection system 100% functional. 1 gas detector needs calibration.',88,'completed','2026-07-05'),
('2026-04-10','Hazira Processing Plant','Regional HSE Manager','Emergency Response Drill','Evacuation completed in 4.2 min (target 5 min). Communication gaps identified.',85,'completed','2026-07-10'),
('2026-04-15','Uran Fractionation Plant','External Auditor - DNV GL','Third-Party Safety Audit','Good overall compliance. 3 observations raised on MOC documentation.',87,'completed','2026-10-15'),
('2026-05-01','Rajkot Field Station','Field Safety Officer','Environmental Inspection','Waste disposal compliance good. Minor soil contamination near pump.',82,'completed','2026-08-01'),
('2026-05-10','Ankleshwar Field','HSE Engineer','Electrical Safety Audit','All earthing systems intact. 2 junction boxes need upgrading.',89,'completed','2026-08-10'),
('2026-05-20','Mumbai High Platform B','Platform Safety Officer','Permit to Work Audit','PTW system 95% compliant. Training for 3 new crew members required.',91,'completed','2026-08-20'),
('2026-06-01','Dehradun R&D Lab','Lab Safety Officer','Chemical Safety Inspection','Storage procedures compliant. Inventory management excellent.',96,'completed','2026-09-01'),
('2026-06-08','Karaikal Refinery Unit-3','HSE Manager Karaikal','Mechanical Integrity Inspection','Pressure vessel inspections current. 1 PSSR pending for CDU-3.',84,'completed','2026-09-08'),
('2026-06-15','New Delhi HQ','Corporate HSE Team','ISO 45001 Readiness Audit','Good progress on ISO 45001 implementation. Gap in incident reporting automation.',88,'completed','2026-09-15');

INSERT INTO risk_assessments(assessment_date,location,hazard_type,risk_level,likelihood,consequence,risk_score,control_measures,responsible_person,review_date) VALUES
('2026-04-01','Mumbai High Platform A','H2S Gas Exposure','high',3,5,15,'Gas detectors, SCBA, buddy system, emergency shutdown',' Arun Pillai','2026-10-01'),
('2026-04-02','Mumbai High Platform A','Working at Height','medium',3,4,12,'Fall arrest systems, PTW, safety nets, competency check','Platform Safety Officer','2026-10-02'),
('2026-04-05','Karaikal Refinery Unit-1','Hydrocarbon Fire/Explosion','high',2,5,10,'Fire suppression, gas detection, PTW, hot work control','HSE Manager Karaikal','2026-10-05'),
('2026-04-08','Hazira Processing Plant','Pressurized Equipment Failure','high',2,5,10,'Regular inspections, PSSR, relief valves, operator training','Plant Safety Manager','2026-10-08'),
('2026-04-12','Ankleshwar Field','Manual Handling Injury','low',4,2,8,'Mechanical aids, training, task rotation','Field Supervisor','2026-10-12'),
('2026-04-15','Rajkot Field Station','Environmental Contamination','medium',2,4,8,'Secondary containment, spill kits, disposal procedures','Environmental Officer','2026-10-15'),
('2026-04-20','Uran Fractionation Plant','Process Upset - Temperature Excursion','high',2,5,10,'DCS interlocks, SOP, alarm management, operator training','Process Safety Engineer','2026-10-20'),
('2026-05-01','All Offshore Platforms','Vessel Collision Risk','medium',2,3,6,'Navigation lights, radio communication, safety zones','Marine Safety Officer','2026-11-01'),
('2026-05-10','All Refineries','Confined Space Entry','medium',3,4,12,'Confined space permit, gas testing, standby person, rescue plan','Refinery HSE Manager','2026-11-10'),
('2026-05-20','Drilling Locations','Blowout Risk','high',1,5,5,'BOP testing, well control training, ERP','Drilling Safety Engineer','2026-11-20');

INSERT INTO training_records(emp_code,emp_name,training_type,training_date,completion_date,score,is_certified,expiry_date) VALUES
('ONGC001','Rajiv Sharma','Process Safety Management',  '2026-01-10','2026-01-12',88,TRUE,'2028-01-12'),
('ONGC002','Suresh Nair','Fire Safety & Emergency Response','2026-01-15','2026-01-16',92,TRUE,'2027-01-16'),
('ONGC003','Meena Gupta','First Aid & Basic Life Support','2026-02-01','2026-02-02',85,TRUE,'2028-02-02'),
('ONGC005','Arun Pillai','NEBOSH International General Certificate','2026-02-10','2026-03-10',79,TRUE,'2029-03-10'),
('ONGC007','Ramesh Kumar','Well Control IWCF Level 3','2026-01-20','2026-01-24',90,TRUE,'2028-01-24'),
('ONGC009','Vikram Singh','H2S Safety & Breathing Apparatus','2026-02-15','2026-02-15',95,TRUE,'2027-02-15'),
('ONGC013','Deepak Nair','Confined Space Entry','2026-03-01','2026-03-01',82,TRUE,'2027-03-01'),
('ONGC015','Harish Iyer','HAZOP Study & Risk Assessment','2026-03-05','2026-03-06',88,TRUE,'2029-03-06'),
('ONGC017','Arjun Menon','Basic Safety Induction','2022-08-15','2022-08-15',90,TRUE,'2024-08-15'),
('ONGC017','Arjun Menon','Basic Safety Induction Renewal','2026-04-01','2026-04-01',93,TRUE,'2028-04-01'),
('ONGC021','Sanjay Tiwari','Process Safety Leadership','2026-01-25','2026-01-26',86,TRUE,'2028-01-26'),
('ONGC025','Manish Joshi','BOSIET Offshore Survival','2026-02-20','2026-02-21',91,TRUE,'2028-02-21'),
('ONGC027','Rakesh Pandey','Pipeline Integrity Management','2026-03-10','2026-03-11',84,TRUE,'2028-03-11'),
('ONGC012','Kavitha Rao','Chemical Safety & COSHH','2026-04-05','2026-04-05',87,TRUE,'2027-04-05'),
('ONGC019','Rohit Dubey','Working at Height','2026-04-10','2026-04-10',89,TRUE,'2027-04-10');

SELECT 'safety tables loaded' AS status, COUNT(*) AS incident_count FROM incidents;
