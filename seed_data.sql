-- =====================================================
-- VANNA AI PLATFORM — SEED DATA v2
-- Uses ON CONFLICT DO NOTHING on all tables
-- Uses subqueries for owner_id (safe with existing users)
-- =====================================================

-- DEMO PASSWORDS:
-- admin@ongc.com        → Admin@2026
-- analyst1@ongc.com     → Analyst@2026
-- analyst2@ongc.com     → Analyst@2026
-- apiconsumer1@ongc.com → ApiUser@2026
-- apiconsumer2@ongc.com → ApiUser@2026

-- API TOKENS:
-- Analyst1 PG    : vanna_analyst1_pg_token_ongc2026_abc123
-- Admin Full     : vanna_admin_full_token_ongc2026_def456
-- HR MySQL       : vanna_api_hr_mysql_token_ongc2026_ghi789
-- Finance PG     : vanna_api_finance_pg_token_ongc2026_jkl012

-- ── 1. USERS (ON CONFLICT DO NOTHING) ─────────────────
INSERT INTO users (id,email,username,full_name,hashed_password,role,is_active,is_verified,created_at,updated_at)
VALUES (gen_random_uuid(),'admin@ongc.com','ongc_admin','ONGC Platform Admin','$2b$12$WD3V48ENm4KQnut2Ya1Jpu0D/o1atkilWQCpgpjs3J7I7rQ1g19fW','admin',true,true,NOW(),NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id,email,username,full_name,hashed_password,role,is_active,is_verified,created_at,updated_at)
VALUES (gen_random_uuid(),'analyst1@ongc.com','analyst1','Ramesh Kumar (E&P)','$2b$12$1NM46X9oEp/NgM0hd3ZmW.GSgSDKSl28id16ySDJHGadvOCaUW7ny','user',true,true,NOW(),NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id,email,username,full_name,hashed_password,role,is_active,is_verified,created_at,updated_at)
VALUES (gen_random_uuid(),'analyst2@ongc.com','analyst2','Priya Sharma (Refinery)','$2b$12$sqmZmV7Q2cy6qDq0f0nOsOK5gFbiZqO1mwxYocI1CN75bW4elbsYm','user',true,true,NOW(),NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id,email,username,full_name,hashed_password,role,is_active,is_verified,created_at,updated_at)
VALUES (gen_random_uuid(),'apiconsumer1@ongc.com','apiconsumer1','HR Digital Assistant','$2b$12$eMownbsBKxW1B2AUZFA8GuLc.9gjH79g9Lhs5MVkPUHZTmEpacbx6','api_consumer',true,true,NOW(),NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id,email,username,full_name,hashed_password,role,is_active,is_verified,created_at,updated_at)
VALUES (gen_random_uuid(),'apiconsumer2@ongc.com','apiconsumer2','Finance Digital Assistant','$2b$12$SfTbS03yvsXcc.3OwP2Zu.V75OIrYSVHIO8R.cEA1JDKbqESXtOWu','api_consumer',true,true,NOW(),NOW())
ON CONFLICT (email) DO NOTHING;

-- ── 2. CONNECTION PROFILES ─────────────────────────────
INSERT INTO connection_profiles (id,owner_id,profile_name,description,db_type,host,port,database_name,username,encrypted_password,ssl_mode,allowed_schemas,allowed_tables,read_only,is_active,last_tested_at,last_test_success,created_at,updated_at)
VALUES ('10000000-0000-0000-0000-000000000001',(SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),'ONGC Finance DB (PostgreSQL)','Finance dept PostgreSQL — procurement, budgets, GL','postgresql','demo-pg-server.ongc.local',5432,'ongc_finance','pg_readonly','gAAAAABqL8XrTPjSosZZVGYbXYsB6QKC8h1UtOYiALmZX4JNlv3s9qiO3jvN0v8gqg2ygnTL_kdwI9WpRG3EO6iyCsD_8nVnJv5yccl_A-ume_7wUNwY6IQ=','disable','[]','[]',true,true,NOW(),true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO connection_profiles (id,owner_id,profile_name,description,db_type,host,port,database_name,username,encrypted_password,ssl_mode,allowed_schemas,allowed_tables,read_only,is_active,last_tested_at,last_test_success,created_at,updated_at)
VALUES ('10000000-0000-0000-0000-000000000002',(SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),'ONGC HR DB (MySQL)','Human Resources MySQL — employees, payroll, attendance','mysql','demo-mysql-server.ongc.local',3306,'ongc_hr','mysql_readonly','gAAAAABqL8Xr1o6bClHc7g-EdjrtInha6GinwAxNLEq3Pi_Aw3RUB9-RVik6WBWExiaoQfhpfylvJTgZ8G1DGY-Fw0JjrOTmHg==','disable','["hr","payroll"]','[]',true,true,NOW(),true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO connection_profiles (id,owner_id,profile_name,description,db_type,host,port,database_name,username,encrypted_password,ssl_mode,allowed_schemas,allowed_tables,read_only,is_active,last_tested_at,last_test_success,created_at,updated_at)
VALUES ('10000000-0000-0000-0000-000000000003',(SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),'ONGC Asset Management (MSSQL)','Asset tracking MSSQL — equipment, maintenance','mssql','demo-mssql-server.ongc.local',1433,'ongc_assets','sa_readonly','gAAAAABqL8Xrxn6OHZDzydTSb0IGhf14a2cwHiHYEqSyVnkbtoothRAcUw7HdvXv2axCEdoTLN6EUu-IzNux5POgyph2yq27dA==','disable','[]','[]',true,true,NOW(),true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO connection_profiles (id,owner_id,profile_name,description,db_type,host,port,database_name,username,encrypted_password,ssl_mode,allowed_schemas,allowed_tables,read_only,is_active,last_tested_at,last_test_success,created_at,updated_at)
VALUES ('10000000-0000-0000-0000-000000000004',(SELECT id FROM users WHERE email='analyst1@ongc.com' LIMIT 1),'ONGC Operations Oracle','E&P Oracle DB — wells, production, drilling','oracle','demo-oracle-server.ongc.local',1521,'ORCL','ops_readonly','gAAAAABqL8XrOJwLmLaHRd0LJXGZ124sdZK8zJI2GtwTUnqeGdS8RXAeLdBqE4cqLPg5g39twSc5wGt_F82l-brHc74bBO2WlA==','disable','["ONGC_OPS"]','[]',true,true,NOW(),true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 3. API TOKENS ──────────────────────────────────────
INSERT INTO api_tokens (id,owner_id,profile_id,name,description,token_hash,permissions,allowed_schemas,allowed_tables,status,rate_limit_per_minute,total_requests,created_at,updated_at)
VALUES ('20000000-0000-0000-0000-000000000001',(SELECT id FROM users WHERE email='analyst1@ongc.com' LIMIT 1),'10000000-0000-0000-0000-000000000001','Analyst1 Finance Token','Analyst1 → Finance PG DB','c6328185317b4037b9040f4b1d57ab8d19bfc3d1b82cbdeb88e5bae85aa3ae44','["query"]','[]','[]','active',60,0,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO api_tokens (id,owner_id,profile_id,name,description,token_hash,permissions,allowed_schemas,allowed_tables,status,rate_limit_per_minute,total_requests,created_at,updated_at)
VALUES ('20000000-0000-0000-0000-000000000002',(SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),'10000000-0000-0000-0000-000000000001','Admin Finance Full Token','Admin full access → Finance PG DB','d69a42ff3fd15b6150fdf962548bcb4a63bfee387908b2ec8ac5b893895f8bc6','["query"]','[]','[]','active',120,0,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO api_tokens (id,owner_id,profile_id,name,description,token_hash,permissions,allowed_schemas,allowed_tables,status,rate_limit_per_minute,total_requests,created_at,updated_at)
VALUES ('20000000-0000-0000-0000-000000000003',(SELECT id FROM users WHERE email='apiconsumer1@ongc.com' LIMIT 1),'10000000-0000-0000-0000-000000000002','HR Assistant MySQL Token','HR Digital Assistant → MySQL (scope §4.4)','17acb0c36d787cd57cb9c4add3c49be0ae88f019d3e91b27eb1c03d24a430ff8','["query"]','["hr","payroll"]','[]','active',100,0,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO api_tokens (id,owner_id,profile_id,name,description,token_hash,permissions,allowed_schemas,allowed_tables,status,rate_limit_per_minute,total_requests,created_at,updated_at)
VALUES ('20000000-0000-0000-0000-000000000004',(SELECT id FROM users WHERE email='apiconsumer2@ongc.com' LIMIT 1),'10000000-0000-0000-0000-000000000001','Finance Assistant PG Token','Finance Asst → PG DB (scope §4.4)','84b6b2be91baeefb901601ea80743ca6fad43863660b22b71c4fe482a5e45eb2','["query"]','[]','[]','active',60,0,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 4. QUERY HISTORY ───────────────────────────────────
INSERT INTO query_history (id,token_id,profile_id,user_id,natural_language_query,generated_sql,sql_explanation,response_summary,status,row_count,execution_time_ms,ip_address,db_type,page,page_size,created_at)
VALUES ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',(SELECT id FROM users WHERE email='analyst1@ongc.com' LIMIT 1),'Show total procurement orders this month','SELECT COUNT(*) AS total FROM procurement_orders WHERE DATE_TRUNC(''month'',created_at)=DATE_TRUNC(''month'',NOW());','Counts procurement orders in current month','Total procurement orders this month: 248','success',1,189.7,'10.10.1.5','postgresql',1,100,NOW()-INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;
INSERT INTO query_history (id,token_id,profile_id,user_id,natural_language_query,generated_sql,sql_explanation,response_summary,status,row_count,execution_time_ms,ip_address,db_type,page,page_size,created_at)
VALUES ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',(SELECT id FROM users WHERE email='analyst1@ongc.com' LIMIT 1),'What is the total budget allocated for Q2 2026?','SELECT SUM(allocated_amount) FROM budget_allocations WHERE quarter=''Q2'' AND year=2026;','Sums Q2 2026 budget','Total Q2 2026 budget: Rs 4.32 Crore','success',1,212.3,'10.10.1.5','postgresql',1,100,NOW()-INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;
INSERT INTO query_history (id,token_id,profile_id,user_id,natural_language_query,generated_sql,sql_explanation,response_summary,status,row_count,execution_time_ms,ip_address,db_type,page,page_size,created_at)
VALUES ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',(SELECT id FROM users WHERE email='admin@ongc.com' LIMIT 1),'List top 5 vendors by purchase order value','SELECT vendor_name,SUM(po_value) FROM purchase_orders GROUP BY vendor_name ORDER BY 2 DESC LIMIT 5;','Ranks vendors by PO value','Top vendor: TechCorp India Rs 1.8Cr','success',5,321.5,'10.10.1.1','postgresql',1,100,NOW()-INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
INSERT INTO query_history (id,token_id,profile_id,user_id,natural_language_query,generated_sql,sql_explanation,response_summary,status,row_count,execution_time_ms,ip_address,db_type,page,page_size,created_at)
VALUES ('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',(SELECT id FROM users WHERE email='apiconsumer1@ongc.com' LIMIT 1),'How many employees joined this year?','SELECT COUNT(*) FROM employees WHERE YEAR(joining_date)=YEAR(CURDATE());','Counts new joins in current year','87 employees joined this year','success',1,145.2,'10.10.2.10','mysql',1,100,NOW()-INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;
INSERT INTO query_history (id,token_id,profile_id,user_id,natural_language_query,generated_sql,sql_explanation,response_summary,status,row_count,execution_time_ms,ip_address,db_type,page,page_size,created_at)
VALUES ('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',(SELECT id FROM users WHERE email='apiconsumer1@ongc.com' LIMIT 1),'Delete all resigned employees','DELETE FROM employees WHERE status=''resigned''','Blocked: DELETE not permitted','Query blocked — DELETE not allowed in read-only mode','blocked',0,12.1,'10.10.2.10','mysql',1,100,NOW()-INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
INSERT INTO query_history (id,token_id,profile_id,user_id,natural_language_query,generated_sql,sql_explanation,response_summary,status,row_count,execution_time_ms,ip_address,db_type,page,page_size,created_at)
VALUES ('30000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001',(SELECT id FROM users WHERE email='apiconsumer2@ongc.com' LIMIT 1),'Show monthly expense summary for April 2026','SELECT category,SUM(amount) FROM expenses WHERE EXTRACT(MONTH FROM exp_date)=4 AND EXTRACT(YEAR FROM exp_date)=2026 GROUP BY category;','April 2026 expenses by category','6 categories — Travel highest Rs 12.4L','success',6,388.5,'10.10.1.20','postgresql',1,100,NOW()-INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- ── 5. SCHEMA METADATA ─────────────────────────────────
INSERT INTO schema_metadata (id,profile_id,schema_name,table_name,column_definitions,relationships,sample_values,description,is_manually_corrected,created_at,updated_at)
VALUES ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','public','procurement_orders',
'{"order_id":{"type":"integer","pk":true},"vendor_id":{"type":"integer","fk":"vendors.id"},"order_date":{"type":"date"},"po_value":{"type":"decimal"},"status":{"type":"varchar"}}',
'{"vendor_id":"vendors.id"}','{"status":["pending","approved","closed"],"po_value":[50000,120000,800000]}',
'Procurement purchase orders — Finance DB',true,NOW(),NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO schema_metadata (id,profile_id,schema_name,table_name,column_definitions,relationships,sample_values,description,is_manually_corrected,created_at,updated_at)
VALUES ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','hr','employees',
'{"emp_id":{"type":"int","pk":true},"emp_name":{"type":"varchar"},"department":{"type":"varchar"},"joining_date":{"type":"date"},"salary":{"type":"decimal"},"status":{"type":"varchar"}}',
'{}','{"department":["Engineering","HR","Finance","Operations"],"status":["active","resigned","on_leave"]}',
'Employee master — HR DB',false,NOW(),NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO schema_metadata (id,profile_id,schema_name,table_name,column_definitions,relationships,sample_values,description,is_manually_corrected,created_at,updated_at)
VALUES ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','ONGC_OPS','wells',
'{"well_id":{"type":"number","pk":true},"well_name":{"type":"varchar2"},"field_name":{"type":"varchar2"},"status":{"type":"varchar2"},"spud_date":{"type":"date"},"depth_m":{"type":"float"}}',
'{}','{"status":["active","suspended","P&A"],"field_name":["Bombay High","KG-D6","Heera","Bassein"]}',
'Well master registry — E&P Operations Oracle DB',true,NOW(),NOW()) ON CONFLICT (id) DO NOTHING;

-- ── 6. BUSINESS GLOSSARY ───────────────────────────────
INSERT INTO business_glossary (id,profile_id,term,definition,maps_to_table,maps_to_column,synonyms,created_at)
VALUES ('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','PO','Purchase Order — formal procurement document','procurement_orders','order_id','["purchase order","procurement order","PO number"]',NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO business_glossary (id,profile_id,term,definition,maps_to_table,maps_to_column,synonyms,created_at)
VALUES ('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','CTC','Cost to Company — total annual employee compensation','employees','salary','["salary","package","annual pay","compensation"]',NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO business_glossary (id,profile_id,term,definition,maps_to_table,maps_to_column,synonyms,created_at)
VALUES ('50000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','Spud Date','Date drilling of a well officially begins','wells','spud_date','["drill start","drilling date","commenced","spud"]',NOW())
ON CONFLICT (id) DO NOTHING;

-- ── 7. VERIFY ───────────────────────────────────────────
SELECT 'users' AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'connection_profiles', COUNT(*) FROM connection_profiles
UNION ALL SELECT 'api_tokens', COUNT(*) FROM api_tokens
UNION ALL SELECT 'query_history', COUNT(*) FROM query_history
UNION ALL SELECT 'schema_metadata', COUNT(*) FROM schema_metadata
UNION ALL SELECT 'business_glossary', COUNT(*) FROM business_glossary;

-- ── END ─────────────────────────────────────────────────
