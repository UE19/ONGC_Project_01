-- Seed schema_metadata with exact snake_case column names for ONGC Refinery profile
DELETE FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000008';

INSERT INTO schema_metadata (id, profile_id, table_name, column_definitions, created_at, updated_at) VALUES
(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'assets',
 '{"columns": [{"name":"asset_id","type":"INT"},{"name":"asset_name","type":"VARCHAR"},{"name":"location","type":"VARCHAR"},{"name":"region","type":"VARCHAR"},{"name":"is_active","type":"BOOLEAN"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'refineryunits',
 '{"columns": [{"name":"unit_id","type":"INT"},{"name":"asset_id","type":"INT"},{"name":"unit_name","type":"VARCHAR"},{"name":"design_capacity_bpd","type":"INT"},{"name":"primary_product","type":"VARCHAR"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'productionlogs',
 '{"columns": [{"name":"log_id","type":"INT"},{"name":"unit_id","type":"INT"},{"name":"production_date","type":"DATE"},{"name":"product_type","type":"VARCHAR"},{"name":"actual_volume_bpd","type":"DECIMAL"},{"name":"efficiency_percentage","type":"DECIMAL"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'crudeassays',
 '{"columns": [{"name":"assay_id","type":"INT"},{"name":"crude_name","type":"VARCHAR"},{"name":"api_gravity","type":"DECIMAL"},{"name":"sulfur_percentage","type":"DECIMAL"},{"name":"viscosity_cst","type":"DECIMAL"},{"name":"pour_point_c","type":"DECIMAL"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'pipelines',
 '{"columns": [{"name":"pipeline_id","type":"INT"},{"name":"source_asset_id","type":"INT"},{"name":"destination_unit_id","type":"INT"},{"name":"pipeline_name","type":"VARCHAR"},{"name":"length_km","type":"DECIMAL"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'pipelinemetrics',
 '{"columns": [{"name":"metric_id","type":"INT"},{"name":"pipeline_id","type":"INT"},{"name":"metric_timestamp","type":"TIMESTAMP"},{"name":"flow_rate_m3h","type":"DECIMAL"},{"name":"pressure_bar","type":"DECIMAL"},{"name":"temperature_c","type":"DECIMAL"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'weeklyinventoryrecords',
 '{"columns": [{"name":"inventory_id","type":"INT"},{"name":"unit_id","type":"INT"},{"name":"record_date","type":"DATE"},{"name":"product_type","type":"VARCHAR"},{"name":"current_stock_bbls","type":"DECIMAL"},{"name":"max_capacity_bbls","type":"DECIMAL"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'assetintegritylogs',
 '{"columns": [{"name":"log_id","type":"INT"},{"name":"unit_id","type":"INT"},{"name":"inspection_date","type":"DATE"},{"name":"component_name","type":"VARCHAR"},{"name":"corrosion_rate_mmpy","type":"DECIMAL"},{"name":"wall_thickness_mm","type":"DECIMAL"},{"name":"status","type":"VARCHAR"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'refineryutilizationmetrics',
 '{"columns": [{"name":"utilization_id","type":"INT"},{"name":"unit_id","type":"INT"},{"name":"metric_date","type":"DATE"},{"name":"design_capacity_bpd","type":"INT"},{"name":"actual_throughput_bpd","type":"DECIMAL"},{"name":"utilization_percentage","type":"DECIMAL"}]}'::jsonb,
 NOW(), NOW()),

(gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'supplydemanddynamics',
 '{"columns": [{"name":"dynamics_id","type":"INT"},{"name":"product_type","type":"VARCHAR"},{"name":"record_date","type":"DATE"},{"name":"region","type":"VARCHAR"},{"name":"projected_demand_bpd","type":"DECIMAL"},{"name":"actual_supply_bpd","type":"DECIMAL"},{"name":"volumetric_variance_bpd","type":"DECIMAL"}]}'::jsonb,
 NOW(), NOW());

SELECT table_name FROM schema_metadata WHERE profile_id = '10000000-0000-0000-0000-000000000008' ORDER BY table_name;
