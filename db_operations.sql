-- ONGC Operations (E&P) DB
DROP TABLE IF EXISTS reservoir_data CASCADE;
DROP TABLE IF EXISTS drilling_records CASCADE;
DROP TABLE IF EXISTS production_data CASCADE;
DROP TABLE IF EXISTS wells CASCADE;

CREATE TABLE wells (
    well_id          SERIAL PRIMARY KEY,
    well_name        VARCHAR(100) NOT NULL,
    well_type        VARCHAR(50),
    location         VARCHAR(150),
    basin            VARCHAR(100),
    spud_date        DATE,
    completion_date  DATE,
    depth_meters     INT,
    is_active        BOOLEAN DEFAULT TRUE,
    operator         VARCHAR(100)
);
CREATE TABLE production_data (
    prod_id          SERIAL PRIMARY KEY,
    well_id          INT REFERENCES wells(well_id),
    production_date  DATE NOT NULL,
    oil_volume_bbl   DECIMAL(12,2),
    gas_volume_mmscfd DECIMAL(10,4),
    water_volume_bbl DECIMAL(12,2),
    gor              DECIMAL(10,2),
    watercut_percent DECIMAL(5,2),
    downtime_hours   DECIMAL(6,2) DEFAULT 0
);
CREATE TABLE drilling_records (
    drill_id         SERIAL PRIMARY KEY,
    well_id          INT REFERENCES wells(well_id),
    rig_name         VARCHAR(100),
    spud_date        DATE,
    td_date          DATE,
    total_depth      INT,
    formation        VARCHAR(100),
    cost_crore       DECIMAL(12,2),
    status           VARCHAR(30) DEFAULT 'completed'
);
CREATE TABLE reservoir_data (
    reservoir_id     SERIAL PRIMARY KEY,
    reservoir_name   VARCHAR(100),
    location         VARCHAR(150),
    discovery_year   INT,
    oil_reserves_mmt DECIMAL(10,3),
    gas_reserves_bcm DECIMAL(10,3),
    recovery_factor  DECIMAL(5,2),
    current_production_mmt DECIMAL(10,3),
    reservoir_pressure_bar DECIMAL(8,2),
    is_active        BOOLEAN DEFAULT TRUE
);

INSERT INTO wells(well_name,well_type,location,basin,spud_date,completion_date,depth_meters,is_active,operator) VALUES
('MHN-A-01','Producer','Mumbai High North Platform A','Western Offshore','2010-03-15','2010-09-20',3200,TRUE,'ONGC'),
('MHN-A-02','Producer','Mumbai High North Platform A','Western Offshore','2011-06-01','2011-12-10',3350,TRUE,'ONGC'),
('MHS-B-01','Producer','Mumbai High South Platform B','Western Offshore','2012-02-20','2012-08-15',3100,TRUE,'ONGC'),
('MHS-B-02','Injector','Mumbai High South Platform B','Western Offshore','2013-01-10','2013-07-05',3050,TRUE,'ONGC'),
('BHS-01','Producer','Bassein Field','Western Offshore','2015-04-18','2015-10-22',2800,TRUE,'ONGC'),
('HZR-01','Producer','Hazira Gas Field','Western Offshore','2014-08-05','2015-02-10',2650,TRUE,'ONGC'),
('ANK-01','Producer','Ankleshwar Field','Cambay Basin','2008-05-12','2008-11-20',2400,TRUE,'ONGC'),
('ANK-02','Producer','Ankleshwar Field','Cambay Basin','2009-09-25','2010-03-30',2500,TRUE,'ONGC'),
('RJK-01','Producer','Rajkot Field','Cambay Basin','2016-07-01','2016-12-15',2200,TRUE,'ONGC'),
('GNR-01','Producer','Gandhar Field','Cambay Basin','2005-03-20','2005-09-10',2900,TRUE,'ONGC'),
('KGD6-A01','Producer','KG-DWN-98/3 Deep Water','Krishna-Godavari','2018-11-01','2020-03-15',5800,TRUE,'ONGC'),
('KGD6-A02','Producer','KG-DWN-98/3 Deep Water','Krishna-Godavari','2019-05-20','2020-09-30',5950,TRUE,'ONGC'),
('AHM-01','Exploration','Ahmedabad Block','Cambay Basin','2025-01-10',NULL,NULL,FALSE,'ONGC'),
('MHN-A-03','Producer','Mumbai High North Platform A','Western Offshore','2022-08-10','2023-02-20',3400,TRUE,'ONGC'),
('UHR-01','Producer','Uran Field','Western Offshore','2013-06-15','2013-12-10',2700,TRUE,'ONGC');

INSERT INTO production_data(well_id,production_date,oil_volume_bbl,gas_volume_mmscfd,water_volume_bbl,gor,watercut_percent,downtime_hours) VALUES
(1,'2026-05-01',1850.5,0.45,320.2,240,14.8,0),(1,'2026-05-02',1820.3,0.44,315.5,242,14.7,0),
(1,'2026-05-03',1840.8,0.45,318.2,244,14.7,2.5),(2,'2026-05-01',2100.2,0.52,185.8,248,8.1,0),
(2,'2026-05-02',2080.5,0.51,182.4,245,8.1,0),(2,'2026-05-03',2090.8,0.52,184.1,248,8.0,0),
(3,'2026-05-01',1650.4,0.38,420.6,230,20.3,0),(3,'2026-05-02',1620.8,0.37,415.2,228,20.4,4.0),
(3,'2026-05-03',1640.2,0.38,418.5,232,20.3,0),(5,'2026-05-01',980.5,0.25,152.4,255,13.5,0),
(5,'2026-05-02',975.2,0.24,150.8,246,13.4,0),(6,'2026-05-01',0,1.85,0,0,0,0),
(6,'2026-05-02',0,1.87,0,0,0,0),(7,'2026-05-01',420.3,0.08,85.6,190,17.0,0),
(7,'2026-05-02',415.8,0.08,84.2,192,16.8,0),(8,'2026-05-01',380.5,0.07,78.2,184,17.1,0),
(9,'2026-05-01',285.4,0.05,52.8,175,15.6,0),(10,'2026-05-01',520.8,0.12,96.4,230,15.6,0),
(11,'2026-05-01',3200.5,0.82,125.4,256,3.8,0),(11,'2026-05-02',3180.8,0.81,124.8,255,3.8,0),
(12,'2026-05-01',2950.4,0.75,115.2,254,3.6,0),(14,'2026-05-01',1580.2,0.40,145.8,253,8.4,0),
(15,'2026-05-01',780.5,0.19,98.4,244,11.2,0),(1,'2026-06-01',1830.4,0.44,322.5,241,15.0,0),
(2,'2026-06-01',2075.8,0.51,186.2,246,8.2,0),(3,'2026-06-01',1635.5,0.38,422.8,232,20.5,0),
(11,'2026-06-01',3190.2,0.82,127.8,257,3.8,0),(12,'2026-06-01',2940.8,0.75,116.4,255,3.7,0);

INSERT INTO drilling_records(well_id,rig_name,spud_date,td_date,total_depth,formation,cost_crore,status) VALUES
(1,'Sagar Vijay','2010-03-15','2010-09-20',3200,'L-III Formation',185.50,'completed'),
(2,'Sagar Samrat','2011-06-01','2011-12-10',3350,'L-III Formation',192.80,'completed'),
(3,'Sagar Bhushan','2012-02-20','2012-08-15',3100,'D-Formation',178.20,'completed'),
(4,'Sagar Bhushan','2013-01-10','2013-07-05',3050,'D-Formation',175.50,'completed'),
(5,'Sagar Pragati','2015-04-18','2015-10-22',2800,'Mukta Formation',165.40,'completed'),
(11,'ONGC Videsh Driller-1','2018-11-01','2020-03-15',5800,'Aptian Sands',985.60,'completed'),
(12,'ONGC Videsh Driller-1','2019-05-20','2020-09-30',5950,'Aptian Sands',1025.80,'completed'),
(13,'Aban Abraham','2025-01-10',NULL,1200,'Olpad Formation',NULL,'in_progress'),
(14,'Sagar Vijay','2022-08-10','2023-02-20',3400,'L-III Formation',198.50,'completed');

INSERT INTO reservoir_data(reservoir_name,location,discovery_year,oil_reserves_mmt,gas_reserves_bcm,recovery_factor,current_production_mmt,reservoir_pressure_bar,is_active) VALUES
('Mumbai High North','Western Offshore, Arabian Sea',1974,145.2,28.5,0.35,8.25,182.5,TRUE),
('Mumbai High South','Western Offshore, Arabian Sea',1974,128.8,22.4,0.32,6.85,178.2,TRUE),
('Bassein Field','Western Offshore, Arabian Sea',1976,45.6,82.4,0.42,2.15,195.8,TRUE),
('Hazira Gas Field','Western Offshore',1979,2.5,48.2,0.55,0,168.4,TRUE),
('Ankleshwar','Cambay Basin, Gujarat',1961,42.8,8.5,0.38,1.85,145.2,TRUE),
('Gandhar','Cambay Basin, Gujarat',1983,38.5,6.2,0.35,1.25,152.8,TRUE),
('Rajkot','Cambay Basin, Gujarat',2014,12.5,2.8,0.28,0.65,142.5,TRUE),
('KG-DWN-98/3','Krishna-Godavari Deepwater',2010,85.4,148.5,0.45,5.85,285.4,TRUE),
('Uran Field','Western Offshore',1972,18.5,15.8,0.40,0.85,165.2,TRUE),
('Ahmedabad Block','Cambay Basin, Gujarat',2024,8.5,1.2,0.25,0,128.5,FALSE);

SELECT 'operations tables loaded' AS status, COUNT(*) AS well_count FROM wells;
