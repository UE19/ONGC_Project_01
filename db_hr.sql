-- ONGC HR DB — run connected to ongc_hr
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE departments (
    dept_id        SERIAL PRIMARY KEY,
    dept_name      VARCHAR(100) NOT NULL,
    dept_head      VARCHAR(100),
    location       VARCHAR(100),
    employee_count INT DEFAULT 0
);
CREATE TABLE employees (
    emp_id       SERIAL PRIMARY KEY,
    emp_code     VARCHAR(20)  UNIQUE NOT NULL,
    full_name    VARCHAR(150) NOT NULL,
    email        VARCHAR(150),
    dept_id      INT REFERENCES departments(dept_id),
    designation  VARCHAR(100),
    grade        VARCHAR(10),
    joining_date DATE NOT NULL,
    status       VARCHAR(20) DEFAULT 'active',
    base_salary  DECIMAL(12,2),
    location     VARCHAR(100)
);
CREATE TABLE payroll_records (
    payroll_id SERIAL PRIMARY KEY,
    emp_id     INT REFERENCES employees(emp_id),
    pay_month  VARCHAR(10) NOT NULL,
    pay_year   INT NOT NULL,
    basic_pay  DECIMAL(12,2),
    hra        DECIMAL(10,2),
    da         DECIMAL(10,2),
    deductions DECIMAL(10,2),
    net_pay    DECIMAL(12,2),
    paid_date  DATE,
    status     VARCHAR(20) DEFAULT 'paid'
);
CREATE TABLE attendance (
    attendance_id   SERIAL PRIMARY KEY,
    emp_id          INT REFERENCES employees(emp_id),
    attendance_date DATE NOT NULL,
    check_in        TIME,
    check_out       TIME,
    status          VARCHAR(20) DEFAULT 'present',
    work_hours      DECIMAL(4,2)
);

INSERT INTO departments(dept_name,dept_head,location,employee_count) VALUES
('E&P Operations','Rajiv Sharma','Mumbai',450),
('Refinery Operations','Suresh Nair','Karaikal',320),
('HR & Administration','Meena Gupta','New Delhi',85),
('IT Infrastructure','Karthik Rajan','Mumbai',120),
('Safety & Environment','Arun Pillai','Mumbai',65),
('Finance & Accounts','Pradeep Verma','New Delhi',95),
('Legal & Compliance','Sunita Mehta','New Delhi',45),
('Research & Development','Dr. Venkat','Dehradun',75);

INSERT INTO employees(emp_code,full_name,email,dept_id,designation,grade,joining_date,status,base_salary,location) VALUES
('ONGC001','Rajiv Sharma','rajiv.sharma@ongc.co.in',1,'General Manager - E&P','E8','2005-03-15','active',285000,'Mumbai'),
('ONGC002','Suresh Nair','suresh.nair@ongc.co.in',2,'General Manager - Refinery','E8','2004-07-01','active',288000,'Karaikal'),
('ONGC003','Meena Gupta','meena.gupta@ongc.co.in',3,'General Manager - HR','E8','2006-01-10','active',275000,'New Delhi'),
('ONGC004','Karthik Rajan','karthik.rajan@ongc.co.in',4,'General Manager - IT','E8','2007-05-20','active',278000,'Mumbai'),
('ONGC005','Arun Pillai','arun.pillai@ongc.co.in',5,'General Manager - Safety','E8','2003-11-12','active',282000,'Mumbai'),
('ONGC006','Pradeep Verma','pradeep.verma@ongc.co.in',6,'General Manager - Finance','E8','2002-09-01','active',292000,'New Delhi'),
('ONGC007','Ramesh Kumar','ramesh.kumar@ongc.co.in',1,'Deputy GM - Drilling','E7','2009-06-15','active',225000,'Mumbai'),
('ONGC008','Priya Sharma','priya.sharma@ongc.co.in',2,'Senior Manager - Process','E6','2012-03-10','active',185000,'Karaikal'),
('ONGC009','Vikram Singh','vikram.singh@ongc.co.in',1,'Manager - Reservoir','E5','2015-08-22','active',145000,'Mumbai'),
('ONGC010','Anita Desai','anita.desai@ongc.co.in',3,'Manager - HR','E5','2014-02-14','active',138000,'New Delhi'),
('ONGC011','Mohammed Ismail','m.ismail@ongc.co.in',4,'Senior Engineer - IT','E4','2017-07-01','active',112000,'Mumbai'),
('ONGC012','Kavitha Rao','kavitha.rao@ongc.co.in',2,'Engineer - Refinery','E3','2019-01-15','active',88000,'Karaikal'),
('ONGC013','Deepak Nair','deepak.nair@ongc.co.in',1,'Engineer - Drilling','E3','2018-09-01','active',90000,'Mumbai'),
('ONGC014','Shalini Patel','shalini.patel@ongc.co.in',6,'Senior Accountant','E4','2016-04-20','active',105000,'New Delhi'),
('ONGC015','Harish Iyer','harish.iyer@ongc.co.in',5,'Safety Officer','E4','2015-11-08','active',108000,'Mumbai'),
('ONGC016','Riya Agarwal','riya.agarwal@ongc.co.in',3,'HR Executive','E2','2021-06-01','active',62000,'New Delhi'),
('ONGC017','Arjun Menon','arjun.menon@ongc.co.in',1,'Junior Engineer','E1','2022-08-15','active',52000,'Mumbai'),
('ONGC018','Pooja Mishra','pooja.mishra@ongc.co.in',4,'IT Analyst','E2','2022-01-10','active',65000,'Mumbai'),
('ONGC019','Rohit Dubey','rohit.dubey@ongc.co.in',2,'Process Technician','E2','2023-03-20','active',58000,'Karaikal'),
('ONGC020','Nandini Krishnan','nandini.k@ongc.co.in',6,'Accounts Executive','E2','2023-01-05','active',60000,'New Delhi'),
('ONGC021','Sanjay Tiwari','sanjay.tiwari@ongc.co.in',1,'Senior Manager - Production','E6','2011-07-12','active',182000,'Mumbai'),
('ONGC022','Uma Shankar','uma.shankar@ongc.co.in',7,'Legal Manager','E5','2013-09-01','active',148000,'New Delhi'),
('ONGC023','Girish Patil','girish.patil@ongc.co.in',8,'Research Scientist','E5','2014-04-18','active',155000,'Dehradun'),
('ONGC024','Lalitha Subramaniam','lalitha.s@ongc.co.in',2,'Quality Manager','E5','2013-11-20','active',142000,'Karaikal'),
('ONGC025','Manish Joshi','manish.joshi@ongc.co.in',1,'Geologist','E4','2016-06-01','active',118000,'Mumbai'),
('ONGC026','Divya Menon','divya.menon@ongc.co.in',3,'HR Business Partner','E5','2012-02-28','active',142000,'Mumbai'),
('ONGC027','Rakesh Pandey','rakesh.pandey@ongc.co.in',1,'Pipeline Engineer','E4','2017-03-15','active',115000,'Mumbai'),
('ONGC028','Sunitha Rao','sunitha.rao@ongc.co.in',6,'Tax Manager','E5','2011-10-01','active',152000,'New Delhi'),
('ONGC029','Ajay Kapoor','ajay.kapoor@ongc.co.in',4,'Network Engineer','E3','2020-07-20','active',82000,'Mumbai'),
('ONGC030','Preeti Sharma','preeti.sharma@ongc.co.in',2,'Lab Analyst','E3','2021-02-10','active',78000,'Karaikal');

INSERT INTO payroll_records(emp_id,pay_month,pay_year,basic_pay,hra,da,deductions,net_pay,paid_date,status) VALUES
(1,'June',2026,285000,85500,28500,45000,354000,'2026-06-01','paid'),
(2,'June',2026,288000,86400,28800,45500,357700,'2026-06-01','paid'),
(3,'June',2026,275000,82500,27500,43000,342000,'2026-06-01','paid'),
(4,'June',2026,278000,83400,27800,43500,345700,'2026-06-01','paid'),
(5,'June',2026,282000,84600,28200,44200,350600,'2026-06-01','paid'),
(6,'June',2026,292000,87600,29200,46000,362800,'2026-06-01','paid'),
(7,'June',2026,225000,67500,22500,35000,280000,'2026-06-01','paid'),
(8,'June',2026,185000,55500,18500,28000,231000,'2026-06-01','paid'),
(9,'June',2026,145000,43500,14500,22000,181000,'2026-06-01','paid'),
(10,'June',2026,138000,41400,13800,21000,172200,'2026-06-01','paid'),
(11,'June',2026,112000,33600,11200,17000,139800,'2026-06-01','paid'),
(12,'June',2026,88000,26400,8800,13500,109700,'2026-06-01','paid'),
(13,'June',2026,90000,27000,9000,14000,112000,'2026-06-01','paid'),
(14,'June',2026,105000,31500,10500,16000,131000,'2026-06-01','paid'),
(15,'June',2026,108000,32400,10800,16500,134700,'2026-06-01','paid'),
(16,'June',2026,62000,18600,6200,9500,77300,'2026-06-01','paid'),
(17,'June',2026,52000,15600,5200,8000,64800,'2026-06-01','paid'),
(18,'June',2026,65000,19500,6500,10000,81000,'2026-06-01','paid'),
(19,'June',2026,58000,17400,5800,9000,72200,'2026-06-01','paid'),
(20,'June',2026,60000,18000,6000,9200,74800,'2026-06-01','paid');

INSERT INTO attendance(emp_id,attendance_date,check_in,check_out,status,work_hours) VALUES
(1,'2026-06-09','08:55','18:10','present',9.25),(2,'2026-06-09','09:00','18:00','present',9.0),
(3,'2026-06-09','09:05','17:55','present',8.83),(4,'2026-06-09','08:50','18:20','present',9.5),
(5,'2026-06-09','09:15','18:05','present',8.83),(6,'2026-06-09','09:00','18:00','present',9.0),
(7,'2026-06-09','09:20','17:45','present',8.42),(8,'2026-06-09','08:45','17:50','present',9.08),
(9,'2026-06-09','09:10','18:05','present',8.92),(10,'2026-06-09',NULL,NULL,'absent',0),
(1,'2026-06-10','08:58','18:12','present',9.23),(2,'2026-06-10','09:02','18:05','present',9.05),
(3,'2026-06-10','09:08','17:58','present',8.83),(4,'2026-06-10','08:52','18:25','present',9.55),
(5,'2026-06-10','09:12','18:08','present',8.93),(6,'2026-06-10','09:03','18:00','present',8.95),
(11,'2026-06-10','09:00','18:00','present',9.0),(12,'2026-06-10',NULL,NULL,'leave',0),
(13,'2026-06-11','09:05','17:55','present',8.83),(14,'2026-06-11','09:00','18:00','present',9.0),
(15,'2026-06-11','08:55','18:05','present',9.17),(16,'2026-06-11','09:10','17:50','present',8.67),
(1,'2026-06-12','08:50','18:00','present',9.17),(2,'2026-06-12','09:00','17:58','present',8.97),
(17,'2026-06-12','09:05','17:55','present',8.83),(18,'2026-06-12','09:00','18:02','present',9.03),
(19,'2026-06-13',NULL,NULL,'leave',0),(20,'2026-06-13','09:08','18:00','present',8.87);

SELECT 'hr tables loaded' AS status, COUNT(*) AS emp_count FROM employees;
