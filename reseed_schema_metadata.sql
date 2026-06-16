-- Reseed schema_metadata for all 6 ONGC profiles
-- Format: {"columns": [{"name": "col", "type": "TYPE"}]} to match _build_schema_ddl
-- Safe: DELETE existing rows for these profiles, then re-insert

BEGIN;

-- Clear existing schema_metadata for these profiles
DELETE FROM schema_metadata WHERE profile_id IN (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000006'
);

-- ── Profile 001: Finance ──────────────────────────────────────────────────────
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'budget_allocations',
 '{"columns":[{"name":"budget_id","type":"INT"},{"name":"department","type":"VARCHAR"},{"name":"quarter","type":"VARCHAR"},{"name":"year","type":"INT"},{"name":"allocated_amount","type":"NUMERIC"},{"name":"spent_amount","type":"NUMERIC"},{"name":"balance_amount","type":"NUMERIC"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'procurement_orders',
 '{"columns":[{"name":"order_id","type":"INT"},{"name":"vendor_name","type":"VARCHAR"},{"name":"order_date","type":"DATE"},{"name":"amount","type":"NUMERIC"},{"name":"status","type":"VARCHAR"},{"name":"department","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'purchase_orders',
 '{"columns":[{"name":"po_id","type":"INT"},{"name":"po_number","type":"VARCHAR"},{"name":"vendor_id","type":"INT"},{"name":"order_date","type":"DATE"},{"name":"total_amount","type":"NUMERIC"},{"name":"status","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'gl_entries',
 '{"columns":[{"name":"entry_id","type":"INT"},{"name":"entry_date","type":"DATE"},{"name":"account_code","type":"VARCHAR"},{"name":"description","type":"TEXT"},{"name":"debit_amount","type":"NUMERIC"},{"name":"credit_amount","type":"NUMERIC"},{"name":"department","type":"VARCHAR"}]}'::jsonb);

-- ── Profile 002: HR ───────────────────────────────────────────────────────────
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'departments',
 '{"columns":[{"name":"dept_id","type":"INT"},{"name":"dept_name","type":"VARCHAR"},{"name":"dept_code","type":"VARCHAR"},{"name":"hod","type":"VARCHAR"},{"name":"location","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'employees',
 '{"columns":[{"name":"emp_id","type":"INT"},{"name":"emp_code","type":"VARCHAR"},{"name":"full_name","type":"VARCHAR"},{"name":"email","type":"VARCHAR"},{"name":"dept_id","type":"INT"},{"name":"designation","type":"VARCHAR"},{"name":"grade","type":"VARCHAR"},{"name":"joining_date","type":"DATE"},{"name":"status","type":"VARCHAR"},{"name":"base_salary","type":"NUMERIC"},{"name":"location","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'payroll_records',
 '{"columns":[{"name":"payroll_id","type":"INT"},{"name":"emp_id","type":"INT"},{"name":"pay_month","type":"VARCHAR"},{"name":"basic_pay","type":"NUMERIC"},{"name":"hra","type":"NUMERIC"},{"name":"da","type":"NUMERIC"},{"name":"gross_salary","type":"NUMERIC"},{"name":"deductions","type":"NUMERIC"},{"name":"net_salary","type":"NUMERIC"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'attendance',
 '{"columns":[{"name":"attendance_id","type":"INT"},{"name":"emp_id","type":"INT"},{"name":"attendance_date","type":"DATE"},{"name":"status","type":"VARCHAR"},{"name":"check_in","type":"TIME"},{"name":"check_out","type":"TIME"}]}'::jsonb);

-- ── Profile 003: Assets ───────────────────────────────────────────────────────
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'equipment_assets',
 '{"columns":[{"name":"asset_id","type":"INT"},{"name":"asset_code","type":"VARCHAR"},{"name":"asset_name","type":"VARCHAR"},{"name":"asset_type","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"department","type":"VARCHAR"},{"name":"manufacturer","type":"VARCHAR"},{"name":"installation_date","type":"DATE"},{"name":"is_active","type":"BOOLEAN"},{"name":"asset_value","type":"NUMERIC"},{"name":"condition_status","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'maintenance_schedules',
 '{"columns":[{"name":"schedule_id","type":"INT"},{"name":"asset_id","type":"INT"},{"name":"maintenance_type","type":"VARCHAR"},{"name":"scheduled_date","type":"DATE"},{"name":"completed_date","type":"DATE"},{"name":"status","type":"VARCHAR"},{"name":"technician","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'spare_parts',
 '{"columns":[{"name":"part_id","type":"INT"},{"name":"part_code","type":"VARCHAR"},{"name":"part_name","type":"VARCHAR"},{"name":"category","type":"VARCHAR"},{"name":"quantity_available","type":"INT"},{"name":"unit_price","type":"NUMERIC"},{"name":"location","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'asset_conditions',
 '{"columns":[{"name":"condition_id","type":"INT"},{"name":"asset_id","type":"INT"},{"name":"assessment_date","type":"DATE"},{"name":"condition_rating","type":"VARCHAR"},{"name":"notes","type":"TEXT"}]}'::jsonb);

-- ── Profile 004: Operations ───────────────────────────────────────────────────
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000004', 'wells',
 '{"columns":[{"name":"well_id","type":"INT"},{"name":"well_name","type":"VARCHAR"},{"name":"well_type","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"basin","type":"VARCHAR"},{"name":"spud_date","type":"DATE"},{"name":"completion_date","type":"DATE"},{"name":"depth_meters","type":"INT"},{"name":"is_active","type":"BOOLEAN"},{"name":"operator","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000004', 'production_data',
 '{"columns":[{"name":"prod_id","type":"INT"},{"name":"well_id","type":"INT"},{"name":"prod_date","type":"DATE"},{"name":"oil_bbl","type":"NUMERIC"},{"name":"gas_mmscf","type":"NUMERIC"},{"name":"water_bbl","type":"NUMERIC"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000004', 'drilling_records',
 '{"columns":[{"name":"drill_id","type":"INT"},{"name":"well_id","type":"INT"},{"name":"drill_date","type":"DATE"},{"name":"depth_from","type":"INT"},{"name":"depth_to","type":"INT"},{"name":"formation","type":"VARCHAR"},{"name":"mud_weight","type":"NUMERIC"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000004', 'reservoir_data',
 '{"columns":[{"name":"reservoir_id","type":"INT"},{"name":"well_id","type":"INT"},{"name":"formation","type":"VARCHAR"},{"name":"porosity","type":"NUMERIC"},{"name":"permeability","type":"NUMERIC"},{"name":"pressure_psi","type":"NUMERIC"},{"name":"temperature_c","type":"NUMERIC"}]}'::jsonb);

-- ── Profile 005: Procurement ──────────────────────────────────────────────────
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'vendors',
 '{"columns":[{"name":"vendor_id","type":"INT"},{"name":"vendor_name","type":"VARCHAR"},{"name":"vendor_code","type":"VARCHAR"},{"name":"category","type":"VARCHAR"},{"name":"contact_person","type":"VARCHAR"},{"name":"email","type":"VARCHAR"},{"name":"city","type":"VARCHAR"},{"name":"is_active","type":"BOOLEAN"},{"name":"registered_date","type":"DATE"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'purchase_requests',
 '{"columns":[{"name":"pr_id","type":"INT"},{"name":"pr_number","type":"VARCHAR"},{"name":"requested_by","type":"VARCHAR"},{"name":"department","type":"VARCHAR"},{"name":"item_description","type":"TEXT"},{"name":"quantity","type":"INT"},{"name":"estimated_cost","type":"NUMERIC"},{"name":"status","type":"VARCHAR"},{"name":"created_date","type":"DATE"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'contracts',
 '{"columns":[{"name":"contract_id","type":"INT"},{"name":"contract_number","type":"VARCHAR"},{"name":"vendor_id","type":"INT"},{"name":"contract_value","type":"NUMERIC"},{"name":"start_date","type":"DATE"},{"name":"end_date","type":"DATE"},{"name":"status","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'invoices',
 '{"columns":[{"name":"invoice_id","type":"INT"},{"name":"invoice_number","type":"VARCHAR"},{"name":"vendor_id","type":"INT"},{"name":"amount","type":"NUMERIC"},{"name":"invoice_date","type":"DATE"},{"name":"due_date","type":"DATE"},{"name":"status","type":"VARCHAR"}]}'::jsonb);

-- ── Profile 006: Safety ───────────────────────────────────────────────────────
INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000006', 'incidents',
 '{"columns":[{"name":"incident_id","type":"INT"},{"name":"incident_date","type":"DATE"},{"name":"incident_type","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"severity","type":"VARCHAR"},{"name":"description","type":"TEXT"},{"name":"reported_by","type":"VARCHAR"},{"name":"injured_count","type":"INT"},{"name":"is_resolved","type":"BOOLEAN"},{"name":"resolved_date","type":"DATE"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000006', 'safety_inspections',
 '{"columns":[{"name":"inspection_id","type":"INT"},{"name":"inspection_date","type":"DATE"},{"name":"location","type":"VARCHAR"},{"name":"inspector","type":"VARCHAR"},{"name":"findings","type":"TEXT"},{"name":"risk_level","type":"VARCHAR"},{"name":"status","type":"VARCHAR"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000006', 'risk_assessments',
 '{"columns":[{"name":"assessment_id","type":"INT"},{"name":"assessment_date","type":"DATE"},{"name":"area","type":"VARCHAR"},{"name":"risk_type","type":"VARCHAR"},{"name":"probability","type":"VARCHAR"},{"name":"impact","type":"VARCHAR"},{"name":"mitigation","type":"TEXT"}]}'::jsonb),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000006', 'training_records',
 '{"columns":[{"name":"training_id","type":"INT"},{"name":"emp_id","type":"INT"},{"name":"training_name","type":"VARCHAR"},{"name":"training_date","type":"DATE"},{"name":"validity_date","type":"DATE"},{"name":"status","type":"VARCHAR"},{"name":"score","type":"NUMERIC"}]}'::jsonb);

COMMIT;

-- Verify
SELECT profile_id, table_name FROM schema_metadata ORDER BY profile_id, table_name;
