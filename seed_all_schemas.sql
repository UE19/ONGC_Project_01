-- Seed schema_metadata for ALL profiles
-- Column: column_definitions (JSONB), id (UUID), profile_id, table_name, created_at, updated_at
-- Run against vanna_platform database

-- ── Finance (profile 001) ──────────────────────────────────────────────────
DELETE FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000001';
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions, created_at, updated_at) VALUES
(gen_random_uuid(),'10000000-0000-0000-0000-000000000001','budget_allocations',
 '{"columns":[{"name":"budget_id","type":"INT"},{"name":"department","type":"VARCHAR"},{"name":"quarter","type":"VARCHAR"},{"name":"year","type":"INT"},{"name":"allocated_amount","type":"DECIMAL"},{"name":"spent_amount","type":"DECIMAL"},{"name":"balance_amount","type":"DECIMAL"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000001','procurement_orders',
 '{"columns":[{"name":"order_id","type":"INT"},{"name":"vendor_name","type":"VARCHAR"},{"name":"item_desc","type":"VARCHAR"},{"name":"po_value","type":"DECIMAL"},{"name":"department","type":"VARCHAR"},{"name":"order_date","type":"DATE"},{"name":"status","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000001','purchase_orders',
 '{"columns":[{"name":"po_id","type":"INT"},{"name":"vendor_name","type":"VARCHAR"},{"name":"po_value","type":"DECIMAL"},{"name":"department","type":"VARCHAR"},{"name":"po_date","type":"DATE"},{"name":"approved_by","type":"VARCHAR"},{"name":"status","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000001','gl_entries',
 '{"columns":[{"name":"entry_id","type":"INT"},{"name":"account_code","type":"VARCHAR"},{"name":"account_name","type":"VARCHAR"},{"name":"debit_amount","type":"DECIMAL"},{"name":"credit_amount","type":"DECIMAL"},{"name":"entry_date","type":"DATE"},{"name":"description","type":"VARCHAR"},{"name":"department","type":"VARCHAR"}]}'::jsonb,NOW(),NOW());

-- ── HR (profile 002) ───────────────────────────────────────────────────────
DELETE FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000002';
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions, created_at, updated_at) VALUES
(gen_random_uuid(),'10000000-0000-0000-0000-000000000002','departments',
 '{"columns":[{"name":"dept_id","type":"INT"},{"name":"dept_name","type":"VARCHAR"},{"name":"dept_head","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"employee_count","type":"INT"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000002','employees',
 '{"columns":[{"name":"emp_id","type":"INT"},{"name":"emp_code","type":"VARCHAR"},{"name":"full_name","type":"VARCHAR"},{"name":"email","type":"VARCHAR"},{"name":"dept_id","type":"INT"},{"name":"designation","type":"VARCHAR"},{"name":"grade","type":"VARCHAR"},{"name":"joining_date","type":"DATE"},{"name":"status","type":"VARCHAR"},{"name":"base_salary","type":"DECIMAL"},{"name":"location","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000002','payroll_records',
 '{"columns":[{"name":"payroll_id","type":"INT"},{"name":"emp_id","type":"INT"},{"name":"pay_month","type":"VARCHAR"},{"name":"pay_year","type":"INT"},{"name":"basic_pay","type":"DECIMAL"},{"name":"hra","type":"DECIMAL"},{"name":"da","type":"DECIMAL"},{"name":"deductions","type":"DECIMAL"},{"name":"net_pay","type":"DECIMAL"},{"name":"paid_date","type":"DATE"},{"name":"status","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000002','attendance',
 '{"columns":[{"name":"attendance_id","type":"INT"},{"name":"emp_id","type":"INT"},{"name":"attendance_date","type":"DATE"},{"name":"check_in","type":"TIME"},{"name":"check_out","type":"TIME"},{"name":"status","type":"VARCHAR"},{"name":"work_hours","type":"DECIMAL"}]}'::jsonb,NOW(),NOW());

-- ── Asset Management (profile 003) ────────────────────────────────────────
DELETE FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000003';
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions, created_at, updated_at) VALUES
(gen_random_uuid(),'10000000-0000-0000-0000-000000000003','equipment_assets',
 '{"columns":[{"name":"asset_id","type":"INT"},{"name":"asset_code","type":"VARCHAR"},{"name":"asset_name","type":"VARCHAR"},{"name":"asset_type","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"department","type":"VARCHAR"},{"name":"manufacturer","type":"VARCHAR"},{"name":"installation_date","type":"DATE"},{"name":"last_service_date","type":"DATE"},{"name":"next_service_date","type":"DATE"},{"name":"is_active","type":"BOOLEAN"},{"name":"asset_value","type":"DECIMAL"},{"name":"condition_status","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000003','maintenance_schedules',
 '{"columns":[{"name":"schedule_id","type":"INT"},{"name":"asset_id","type":"INT"},{"name":"maintenance_type","type":"VARCHAR"},{"name":"scheduled_date","type":"DATE"},{"name":"completed_date","type":"DATE"},{"name":"technician_name","type":"VARCHAR"},{"name":"work_order_no","type":"VARCHAR"},{"name":"duration_hours","type":"DECIMAL"},{"name":"cost_incurred","type":"DECIMAL"},{"name":"status","type":"VARCHAR"},{"name":"remarks","type":"TEXT"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000003','spare_parts',
 '{"columns":[{"name":"part_id","type":"INT"},{"name":"part_code","type":"VARCHAR"},{"name":"part_name","type":"VARCHAR"},{"name":"asset_id","type":"INT"},{"name":"quantity_in_stock","type":"INT"},{"name":"reorder_level","type":"INT"},{"name":"unit_cost","type":"DECIMAL"},{"name":"last_replenished","type":"DATE"},{"name":"supplier","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000003','asset_conditions',
 '{"columns":[{"name":"condition_id","type":"INT"},{"name":"asset_id","type":"INT"},{"name":"assessment_date","type":"DATE"},{"name":"condition_score","type":"INT"},{"name":"condition_grade","type":"VARCHAR"},{"name":"assessed_by","type":"VARCHAR"},{"name":"wear_percent","type":"DECIMAL"},{"name":"next_assessment","type":"DATE"},{"name":"notes","type":"TEXT"}]}'::jsonb,NOW(),NOW());

-- ── Operations (profile 004) ───────────────────────────────────────────────
DELETE FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000004';
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions, created_at, updated_at) VALUES
(gen_random_uuid(),'10000000-0000-0000-0000-000000000004','wells',
 '{"columns":[{"name":"well_id","type":"INT"},{"name":"well_name","type":"VARCHAR"},{"name":"well_type","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"basin","type":"VARCHAR"},{"name":"spud_date","type":"DATE"},{"name":"completion_date","type":"DATE"},{"name":"depth_meters","type":"INT"},{"name":"is_active","type":"BOOLEAN"},{"name":"operator","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000004','production_data',
 '{"columns":[{"name":"prod_id","type":"INT"},{"name":"well_id","type":"INT"},{"name":"production_date","type":"DATE"},{"name":"oil_volume_bbl","type":"DECIMAL"},{"name":"gas_volume_mmscfd","type":"DECIMAL"},{"name":"water_volume_bbl","type":"DECIMAL"},{"name":"gor","type":"DECIMAL"},{"name":"watercut_percent","type":"DECIMAL"},{"name":"downtime_hours","type":"DECIMAL"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000004','drilling_records',
 '{"columns":[{"name":"drill_id","type":"INT"},{"name":"well_id","type":"INT"},{"name":"rig_name","type":"VARCHAR"},{"name":"spud_date","type":"DATE"},{"name":"td_date","type":"DATE"},{"name":"total_depth","type":"INT"},{"name":"formation","type":"VARCHAR"},{"name":"cost_crore","type":"DECIMAL"},{"name":"status","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000004','reservoir_data',
 '{"columns":[{"name":"reservoir_id","type":"INT"},{"name":"reservoir_name","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"discovery_year","type":"INT"},{"name":"oil_reserves_mmt","type":"DECIMAL"},{"name":"gas_reserves_bcm","type":"DECIMAL"},{"name":"recovery_factor","type":"DECIMAL"},{"name":"current_production_mmt","type":"DECIMAL"},{"name":"reservoir_pressure_bar","type":"DECIMAL"},{"name":"is_active","type":"BOOLEAN"}]}'::jsonb,NOW(),NOW());

-- ── Procurement (profile 005) ──────────────────────────────────────────────
DELETE FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000005';
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions, created_at, updated_at) VALUES
(gen_random_uuid(),'10000000-0000-0000-0000-000000000005','vendors',
 '{"columns":[{"name":"vendor_id","type":"INT"},{"name":"vendor_name","type":"VARCHAR"},{"name":"vendor_code","type":"VARCHAR"},{"name":"category","type":"VARCHAR"},{"name":"contact_person","type":"VARCHAR"},{"name":"city","type":"VARCHAR"},{"name":"is_active","type":"BOOLEAN"},{"name":"registered_date","type":"DATE"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000005','purchase_requests',
 '{"columns":[{"name":"pr_id","type":"INT"},{"name":"pr_number","type":"VARCHAR"},{"name":"department","type":"VARCHAR"},{"name":"item_desc","type":"VARCHAR"},{"name":"quantity","type":"DECIMAL"},{"name":"estimated_cost","type":"DECIMAL"},{"name":"requested_by","type":"VARCHAR"},{"name":"request_date","type":"DATE"},{"name":"status","type":"VARCHAR"},{"name":"priority","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000005','contracts',
 '{"columns":[{"name":"contract_id","type":"INT"},{"name":"contract_number","type":"VARCHAR"},{"name":"vendor_id","type":"INT"},{"name":"contract_value","type":"DECIMAL"},{"name":"start_date","type":"DATE"},{"name":"end_date","type":"DATE"},{"name":"department","type":"VARCHAR"},{"name":"contract_type","type":"VARCHAR"},{"name":"status","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000005','invoices',
 '{"columns":[{"name":"invoice_id","type":"INT"},{"name":"invoice_number","type":"VARCHAR"},{"name":"vendor_id","type":"INT"},{"name":"contract_id","type":"INT"},{"name":"invoice_amount","type":"DECIMAL"},{"name":"invoice_date","type":"DATE"},{"name":"due_date","type":"DATE"},{"name":"paid_date","type":"DATE"},{"name":"status","type":"VARCHAR"}]}'::jsonb,NOW(),NOW());

-- ── Safety (profile 006) ───────────────────────────────────────────────────
DELETE FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000006';
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions, created_at, updated_at) VALUES
(gen_random_uuid(),'10000000-0000-0000-0000-000000000006','incidents',
 '{"columns":[{"name":"incident_id","type":"INT"},{"name":"incident_date","type":"DATE"},{"name":"incident_type","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"severity","type":"VARCHAR"},{"name":"description","type":"TEXT"},{"name":"reported_by","type":"VARCHAR"},{"name":"injured_count","type":"INT"},{"name":"is_resolved","type":"BOOLEAN"},{"name":"resolved_date","type":"DATE"},{"name":"root_cause","type":"VARCHAR"},{"name":"corrective_action","type":"VARCHAR"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000006','safety_inspections',
 '{"columns":[{"name":"inspection_id","type":"INT"},{"name":"inspection_date","type":"DATE"},{"name":"location","type":"VARCHAR"},{"name":"inspector_name","type":"VARCHAR"},{"name":"inspection_type","type":"VARCHAR"},{"name":"findings","type":"TEXT"},{"name":"compliance_score","type":"INT"},{"name":"status","type":"VARCHAR"},{"name":"next_inspection","type":"DATE"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000006','risk_assessments',
 '{"columns":[{"name":"assessment_id","type":"INT"},{"name":"assessment_date","type":"DATE"},{"name":"location","type":"VARCHAR"},{"name":"hazard_type","type":"VARCHAR"},{"name":"risk_level","type":"VARCHAR"},{"name":"likelihood","type":"INT"},{"name":"consequence","type":"INT"},{"name":"risk_score","type":"INT"},{"name":"control_measures","type":"TEXT"},{"name":"responsible_person","type":"VARCHAR"},{"name":"review_date","type":"DATE"}]}'::jsonb,NOW(),NOW()),
(gen_random_uuid(),'10000000-0000-0000-0000-000000000006','training_records',
 '{"columns":[{"name":"training_id","type":"INT"},{"name":"emp_code","type":"VARCHAR"},{"name":"emp_name","type":"VARCHAR"},{"name":"training_type","type":"VARCHAR"},{"name":"training_date","type":"DATE"},{"name":"completion_date","type":"DATE"},{"name":"score","type":"INT"},{"name":"is_certified","type":"BOOLEAN"},{"name":"expiry_date","type":"DATE"}]}'::jsonb,NOW(),NOW());

-- Verify all
SELECT profile_id, COUNT(*) AS tables FROM schema_metadata GROUP BY profile_id ORDER BY profile_id;
