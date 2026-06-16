// ============================================================
// ONGC MongoDB Sample Data — Field Operations Database
// Collections: sensor_readings, field_reports, maintenance_logs
// ============================================================

db = db.getSiblingDB('ongc_fieldops');

// Create user
db.createUser({
  user: 'ongc_mongo',
  pwd: 'mongoadmin123',
  roles: [{ role: 'read', db: 'ongc_fieldops' }]
});

// ── sensor_readings ───────────────────────────────────────
db.createCollection('sensor_readings');
db.sensor_readings.insertMany([
  { sensor_id: 'SEN-001', well_id: 'W-101', sensor_type: 'Pressure', value: 312.5, unit: 'PSI', recorded_at: new Date('2026-06-01T06:00:00Z'), location: 'Bombay High', status: 'normal' },
  { sensor_id: 'SEN-002', well_id: 'W-101', sensor_type: 'Temperature', value: 78.2, unit: 'Celsius', recorded_at: new Date('2026-06-01T06:00:00Z'), location: 'Bombay High', status: 'normal' },
  { sensor_id: 'SEN-003', well_id: 'W-102', sensor_type: 'Flow Rate', value: 450.0, unit: 'BPD', recorded_at: new Date('2026-06-01T06:00:00Z'), location: 'Cambay Basin', status: 'normal' },
  { sensor_id: 'SEN-004', well_id: 'W-103', sensor_type: 'Pressure', value: 289.1, unit: 'PSI', recorded_at: new Date('2026-06-01T06:00:00Z'), location: 'Krishna Godavari', status: 'warning' },
  { sensor_id: 'SEN-005', well_id: 'W-104', sensor_type: 'Gas Detector', value: 0.02, unit: 'LEL%', recorded_at: new Date('2026-06-01T07:00:00Z'), location: 'Assam Basin', status: 'normal' },
  { sensor_id: 'SEN-006', well_id: 'W-102', sensor_type: 'Pressure', value: 305.8, unit: 'PSI', recorded_at: new Date('2026-06-01T07:00:00Z'), location: 'Cambay Basin', status: 'normal' },
  { sensor_id: 'SEN-007', well_id: 'W-105', sensor_type: 'Temperature', value: 95.4, unit: 'Celsius', recorded_at: new Date('2026-06-01T07:00:00Z'), location: 'Rajasthan Block', status: 'critical' },
  { sensor_id: 'SEN-008', well_id: 'W-101', sensor_type: 'Flow Rate', value: 520.3, unit: 'BPD', recorded_at: new Date('2026-06-01T08:00:00Z'), location: 'Bombay High', status: 'normal' },
  { sensor_id: 'SEN-009', well_id: 'W-103', sensor_type: 'Temperature', value: 81.7, unit: 'Celsius', recorded_at: new Date('2026-06-01T08:00:00Z'), location: 'Krishna Godavari', status: 'normal' },
  { sensor_id: 'SEN-010', well_id: 'W-106', sensor_type: 'Pressure', value: 198.3, unit: 'PSI', recorded_at: new Date('2026-06-01T08:00:00Z'), location: 'Bombay High', status: 'warning' },
  { sensor_id: 'SEN-011', well_id: 'W-104', sensor_type: 'Flow Rate', value: 310.0, unit: 'BPD', recorded_at: new Date('2026-06-01T09:00:00Z'), location: 'Assam Basin', status: 'normal' },
  { sensor_id: 'SEN-012', well_id: 'W-105', sensor_type: 'Pressure', value: 275.0, unit: 'PSI', recorded_at: new Date('2026-06-01T09:00:00Z'), location: 'Rajasthan Block', status: 'normal' },
  { sensor_id: 'SEN-013', well_id: 'W-107', sensor_type: 'Gas Detector', value: 0.08, unit: 'LEL%', recorded_at: new Date('2026-06-01T09:00:00Z'), location: 'Cambay Basin', status: 'warning' },
  { sensor_id: 'SEN-014', well_id: 'W-106', sensor_type: 'Temperature', value: 72.1, unit: 'Celsius', recorded_at: new Date('2026-06-01T10:00:00Z'), location: 'Bombay High', status: 'normal' },
  { sensor_id: 'SEN-015', well_id: 'W-107', sensor_type: 'Flow Rate', value: 390.5, unit: 'BPD', recorded_at: new Date('2026-06-01T10:00:00Z'), location: 'Cambay Basin', status: 'normal' },
]);

// ── field_reports ─────────────────────────────────────────
db.createCollection('field_reports');
db.field_reports.insertMany([
  { report_id: 'FR-2026-001', well_id: 'W-101', inspector: 'Rajesh Nair', inspection_date: new Date('2026-05-15'), location: 'Bombay High', type: 'Routine Inspection', findings: 'All systems operational. Minor corrosion on valve casing.', action_required: true, priority: 'low', status: 'open' },
  { report_id: 'FR-2026-002', well_id: 'W-102', inspector: 'Sunita Patel', inspection_date: new Date('2026-05-16'), location: 'Cambay Basin', type: 'Safety Audit', findings: 'Emergency shutdown system tested and functional. Fire suppression system checked.', action_required: false, priority: 'none', status: 'closed' },
  { report_id: 'FR-2026-003', well_id: 'W-103', inspector: 'Arvind Kumar', inspection_date: new Date('2026-05-18'), location: 'Krishna Godavari', type: 'Pressure Test', findings: 'Pressure drop detected at wellhead. Seal replacement recommended.', action_required: true, priority: 'high', status: 'open' },
  { report_id: 'FR-2026-004', well_id: 'W-104', inspector: 'Priya Sharma', inspection_date: new Date('2026-05-20'), location: 'Assam Basin', type: 'Equipment Check', findings: 'Pump performance within acceptable range. Lubrication done.', action_required: false, priority: 'none', status: 'closed' },
  { report_id: 'FR-2026-005', well_id: 'W-105', inspector: 'Ramesh Verma', inspection_date: new Date('2026-05-22'), location: 'Rajasthan Block', type: 'Temperature Anomaly', findings: 'Temperature sensors showing elevated readings. Possible heat exchanger issue.', action_required: true, priority: 'critical', status: 'open' },
  { report_id: 'FR-2026-006', well_id: 'W-106', inspector: 'Kavita Singh', inspection_date: new Date('2026-05-25'), location: 'Bombay High', type: 'Routine Inspection', findings: 'Christmas tree valves operating normally. BOP tested satisfactorily.', action_required: false, priority: 'none', status: 'closed' },
  { report_id: 'FR-2026-007', well_id: 'W-107', inspector: 'Deepak Rao', inspection_date: new Date('2026-05-28'), location: 'Cambay Basin', type: 'Gas Leak Check', findings: 'Minor gas seepage detected near pipeline joint. Clamp installed temporarily.', action_required: true, priority: 'high', status: 'in_progress' },
  { report_id: 'FR-2026-008', well_id: 'W-101', inspector: 'Anita Mehta', inspection_date: new Date('2026-06-01'), location: 'Bombay High', type: 'Monthly Review', findings: 'Production targets met. Equipment in good condition.', action_required: false, priority: 'none', status: 'closed' },
  { report_id: 'FR-2026-009', well_id: 'W-103', inspector: 'Vijay Malhotra', inspection_date: new Date('2026-06-05'), location: 'Krishna Godavari', type: 'Follow-up', findings: 'Seal replacement completed. Pressure stabilized.', action_required: false, priority: 'none', status: 'closed' },
  { report_id: 'FR-2026-010', well_id: 'W-105', inspector: 'Ramesh Verma', inspection_date: new Date('2026-06-08'), location: 'Rajasthan Block', type: 'Critical Follow-up', findings: 'Heat exchanger replacement in progress. Temporary cooling system installed.', action_required: true, priority: 'high', status: 'in_progress' },
]);

// ── maintenance_logs ──────────────────────────────────────
db.createCollection('maintenance_logs');
db.maintenance_logs.insertMany([
  { log_id: 'ML-2026-001', asset_id: 'PMP-101', asset_name: 'Submersible Pump', well_id: 'W-101', technician: 'Suresh Babu', maintenance_type: 'Preventive', start_date: new Date('2026-05-10'), end_date: new Date('2026-05-10'), duration_hours: 4, cost_inr: 25000, parts_replaced: ['impeller seal', 'motor bearing'], status: 'completed', location: 'Bombay High' },
  { log_id: 'ML-2026-002', asset_id: 'CMP-201', asset_name: 'Gas Compressor', well_id: 'W-102', technician: 'Mohan Das', maintenance_type: 'Corrective', start_date: new Date('2026-05-12'), end_date: new Date('2026-05-13'), duration_hours: 18, cost_inr: 185000, parts_replaced: ['piston rings', 'valve plate', 'cylinder liner'], status: 'completed', location: 'Cambay Basin' },
  { log_id: 'ML-2026-003', asset_id: 'VLV-301', asset_name: 'Safety Relief Valve', well_id: 'W-103', technician: 'Arun Gupta', maintenance_type: 'Calibration', start_date: new Date('2026-05-15'), end_date: new Date('2026-05-15'), duration_hours: 2, cost_inr: 8000, parts_replaced: [], status: 'completed', location: 'Krishna Godavari' },
  { log_id: 'ML-2026-004', asset_id: 'GEN-401', asset_name: 'Diesel Generator', well_id: 'W-104', technician: 'Ravi Kumar', maintenance_type: 'Preventive', start_date: new Date('2026-05-18'), end_date: new Date('2026-05-18'), duration_hours: 6, cost_inr: 42000, parts_replaced: ['air filter', 'oil filter', 'fuel injector'], status: 'completed', location: 'Assam Basin' },
  { log_id: 'ML-2026-005', asset_id: 'HEX-501', asset_name: 'Heat Exchanger', well_id: 'W-105', technician: 'Prakash Iyer', maintenance_type: 'Corrective', start_date: new Date('2026-05-22'), end_date: new Date('2026-06-10'), duration_hours: 96, cost_inr: 520000, parts_replaced: ['tube bundle', 'shell gaskets', 'baffle plates'], status: 'in_progress', location: 'Rajasthan Block' },
  { log_id: 'ML-2026-006', asset_id: 'PMP-102', asset_name: 'Water Injection Pump', well_id: 'W-106', technician: 'Suresh Babu', maintenance_type: 'Preventive', start_date: new Date('2026-05-25'), end_date: new Date('2026-05-25'), duration_hours: 5, cost_inr: 31000, parts_replaced: ['mechanical seal', 'coupling'], status: 'completed', location: 'Bombay High' },
  { log_id: 'ML-2026-007', asset_id: 'PIP-601', asset_name: 'Pipeline Joint Clamp', well_id: 'W-107', technician: 'Dinesh Tiwari', maintenance_type: 'Emergency', start_date: new Date('2026-05-28'), end_date: new Date('2026-05-28'), duration_hours: 3, cost_inr: 15000, parts_replaced: ['flange gasket', 'bolts'], status: 'completed', location: 'Cambay Basin' },
  { log_id: 'ML-2026-008', asset_id: 'CMP-202', asset_name: 'Air Compressor', well_id: 'W-101', technician: 'Mohan Das', maintenance_type: 'Preventive', start_date: new Date('2026-06-01'), end_date: new Date('2026-06-01'), duration_hours: 3, cost_inr: 18000, parts_replaced: ['air filter', 'belt'], status: 'completed', location: 'Bombay High' },
  { log_id: 'ML-2026-009', asset_id: 'VLV-302', asset_name: 'Ball Valve Assembly', well_id: 'W-102', technician: 'Arun Gupta', maintenance_type: 'Inspection', start_date: new Date('2026-06-05'), end_date: new Date('2026-06-05'), duration_hours: 2, cost_inr: 5000, parts_replaced: [], status: 'completed', location: 'Cambay Basin' },
  { log_id: 'ML-2026-010', asset_id: 'GEN-402', asset_name: 'Turbine Generator', well_id: 'W-104', technician: 'Ravi Kumar', maintenance_type: 'Scheduled', start_date: new Date('2026-06-10'), end_date: new Date('2026-06-11'), duration_hours: 14, cost_inr: 95000, parts_replaced: ['turbine blades', 'bearings'], status: 'scheduled', location: 'Assam Basin' },
]);

print('MongoDB ONGC Field Operations data loaded successfully.');
print('Collections: sensor_readings(15), field_reports(10), maintenance_logs(10)');
