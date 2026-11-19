begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'incidents', 'incidents table exists');
select has_table('public', 'verification_decisions', 'verification decisions table exists');
select has_table('public', 'safai_coin_transactions', 'coin ledger table exists');
select has_index('public', 'driver_assignments', 'driver_assignments_one_active_incident_idx', 'active assignment index exists');
select has_index('public', 'safai_coin_transactions', 'safai_coin_transactions_one_reward_per_incident_idx', 'reward idempotency index exists');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'citizen-a@safaios.test'),
  ('00000000-0000-0000-0000-000000000002', 'citizen-b@safaios.test'),
  ('00000000-0000-0000-0000-000000000003', 'driver-a@safaios.test'),
  ('00000000-0000-0000-0000-000000000004', 'driver-b@safaios.test'),
  ('00000000-0000-0000-0000-000000000005', 'admin@safaios.test'),
  ('00000000-0000-0000-0000-000000000006', 'viewer@safaios.test'),
  ('00000000-0000-0000-0000-000000000007', 'superadmin@safaios.test'),
  ('00000000-0000-0000-0000-000000000008', 'reporter-driver@safaios.test');

insert into public.user_roles (user_id, role) values
  ('00000000-0000-0000-0000-000000000003', 'DRIVER'),
  ('00000000-0000-0000-0000-000000000004', 'DRIVER'),
  ('00000000-0000-0000-0000-000000000005', 'ADMIN'),
  ('00000000-0000-0000-0000-000000000006', 'VIEWER'),
  ('00000000-0000-0000-0000-000000000007', 'SUPERADMIN'),
  ('00000000-0000-0000-0000-000000000008', 'DRIVER');

insert into public.incidents (id, reporter_id, title, description, lifecycle_status) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Citizen A report', 'A report', 'DRAFT'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Citizen B report', 'B report', 'DRAFT'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'Reporter driver report', 'Role conflict report', 'DRAFT');

insert into public.driver_assignments (id, incident_id, driver_id, status) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'ASSIGNED'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'ASSIGNED'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'ASSIGNED');

insert into storage.objects (bucket_id, name, owner_id) values
  ('incident-media', '00000000-0000-0000-0000-000000000001/report.jpg', '00000000-0000-0000-0000-000000000001');

select throws_ok(
  $$insert into public.driver_assignments (incident_id, driver_id, status) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'ASSIGNED')$$,
  '23505', NULL, 'one active assignment per incident is enforced'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select results_eq('select count(*) from public.incidents', array[1::bigint], 'Citizen A can only read their own incident');
select throws_ok($$update public.incidents set lifecycle_status = 'CLOSED' where id = '10000000-0000-0000-0000-000000000001'$$, '42501', NULL, 'Citizen cannot directly close an incident');
select throws_ok($$insert into public.ai_analysis_results (incident_id, checkpoint_sha256) values ('10000000-0000-0000-0000-000000000001', repeat('a', 64))$$, '42501', NULL, 'Citizen cannot fabricate trusted AI analysis');
select throws_ok($$insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-000000000001', 'ADMIN')$$, '42501', NULL, 'Citizen cannot grant a role');
select results_eq($$select count(*) from storage.objects where bucket_id = 'incident-media'$$, array[1::bigint], 'Citizen can read their own private upload');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select results_eq($$select count(*) from storage.objects where bucket_id = 'incident-media'$$, array[0::bigint], 'Citizen cannot read another citizen private upload');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
select results_eq('select count(*) from public.driver_assignments', array[1::bigint], 'Driver A can only read their own assignment');
select lives_ok($$insert into public.cleanup_evidence (id, incident_id, assignment_id, submitted_by, statement) values ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Cleaned')$$, 'Assigned Driver A can submit evidence for their assignment');
select throws_ok($$insert into public.cleanup_evidence (incident_id, assignment_id, submitted_by) values ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003')$$, 'P0001', NULL, 'Driver A cannot submit evidence for Driver B assignment');
select throws_ok($$insert into public.verification_decisions (incident_id, cleanup_evidence_id, status, actor_kind, decided_by, decided_at) values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'APPROVED', 'CITIZEN', '00000000-0000-0000-0000-000000000003', now())$$, 'P0001', NULL, 'Driver cannot verify their own cleanup');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select lives_ok($$insert into public.verification_decisions (incident_id, cleanup_evidence_id, status, actor_kind, decided_by, decided_at) values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'APPROVED', 'CITIZEN', '00000000-0000-0000-0000-000000000001', now())$$, 'Reporter can verify assigned-driver cleanup');

reset role;
insert into public.cleanup_evidence (id, incident_id, assignment_id, submitted_by, statement) values
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'Conflict cleanup');
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000008';
select throws_ok($$insert into public.verification_decisions (incident_id, cleanup_evidence_id, status, actor_kind, decided_by, decided_at) values ('10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'APPROVED', 'CITIZEN', '00000000-0000-0000-0000-000000000008', now())$$, 'P0001', NULL, 'Reporter who performed cleanup cannot self-verify');
select throws_ok($$insert into public.safai_coin_accounts (owner_id) values ('00000000-0000-0000-0000-000000000001')$$, '42501', NULL, 'Citizen cannot create a coin account directly');
select throws_ok($$insert into public.audit_logs (action, entity_type) values ('tamper', 'incident')$$, '42501', NULL, 'Citizen cannot create an audit log directly');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000006';
select throws_ok($$update public.incidents set lifecycle_status = 'CLOSED' where id = '10000000-0000-0000-0000-000000000001'$$, '42501', NULL, 'Viewer cannot perform operational updates');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
select throws_ok($$insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-000000000005', 'SUPERADMIN')$$, '42501', NULL, 'Admin cannot grant SUPERADMIN directly');

reset role;
insert into public.safai_coin_accounts (id, owner_id) values ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');
insert into public.safai_coin_transactions (account_id, incident_id, transaction_type, amount, idempotency_key) values ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'REWARD_CREDIT', 1, 'reward-10000000-0000-0000-0000-000000000001');
select throws_ok($$insert into public.safai_coin_transactions (account_id, incident_id, transaction_type, amount, idempotency_key) values ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'REWARD_CREDIT', 1, 'reward-duplicate-10000000-0000-0000-0000-000000000001')$$, '23505', NULL, 'duplicate reward for an incident is prevented');

select * from finish();
rollback;
