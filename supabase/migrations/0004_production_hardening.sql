-- 0004_production_hardening.sql
-- Production persistence schema for audit events, authorization logs,
-- defense scans, discernment reports, and runtime test runs.

-- ─── 1. Audit Events Table ──────────────────────────────────────────────────
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  user_identifier text not null default 'anonymous',
  session_id text,
  action text not null,
  route text not null,
  target_resource text,
  outcome text not null check (outcome in ('SUCCESS', 'FAILURE', 'BLOCKED', 'ERROR')),
  status_code integer not null,
  ip_address_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_created_idx
  on public.audit_events (created_at desc);

create index if not exists audit_events_action_idx
  on public.audit_events (action, outcome);

create index if not exists audit_events_request_idx
  on public.audit_events (request_id);

alter table public.audit_events enable row level security;

-- ─── 2. Authorization Events Table ──────────────────────────────────────────
create table if not exists public.authorization_events (
  id uuid primary key default gen_random_uuid(),
  clearance_id text not null,
  event_type text not null check (event_type in ('ATTEMPT', 'GRANTED', 'REVOKED', 'EXPIRED', 'FAILED')),
  project_name text,
  scope text,
  success boolean not null default false,
  reason text,
  session_id text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists authorization_events_created_idx
  on public.authorization_events (created_at desc);

create index if not exists authorization_events_clearance_idx
  on public.authorization_events (clearance_id);

alter table public.authorization_events enable row level security;

-- ─── 3. Defense-of-Break Scans Table ────────────────────────────────────────
create table if not exists public.defense_scans (
  id uuid primary key default gen_random_uuid(),
  decision text not null check (decision in ('ALLOWED', 'BLOCKED', 'REQUIRES_AUTHORIZATION', 'ERROR')),
  category text not null,
  rule_triggered text not null,
  sanitized_reason text not null,
  authorization_status text not null default 'UNAUTHORIZED',
  content_fingerprint text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists defense_scans_created_idx
  on public.defense_scans (created_at desc);

create index if not exists defense_scans_decision_idx
  on public.defense_scans (decision, category);

alter table public.defense_scans enable row level security;

-- ─── 4. Discernment Records Table ───────────────────────────────────────────
create table if not exists public.discernment_records (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null default 'text',
  source_url text,
  evidence_index text not null,
  overall_score smallint check (overall_score is null or overall_score between 0 and 100),
  summary text not null,
  claims_count smallint not null default 0,
  claims_data jsonb not null default '[]'::jsonb,
  sandbox_plan jsonb not null default '{}'::jsonb,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists discernment_records_created_idx
  on public.discernment_records (created_at desc);

alter table public.discernment_records enable row level security;

-- ─── 5. Test Runs & Runtime Verification Table ──────────────────────────────
create table if not exists public.test_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null check (run_type in ('DEPLOYMENT_READINESS', 'SYNTHETIC_PERSONA', 'SECURITY_INTEGRITY')),
  suite_name text not null,
  status text not null check (status in ('NOT_RUN', 'PASSED', 'FAILED', 'SKIPPED')),
  total_tests integer not null default 0,
  passed_tests integer not null default 0,
  failed_tests integer not null default 0,
  skipped_tests integer not null default 0,
  duration_ms integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists test_runs_created_idx
  on public.test_runs (created_at desc);

alter table public.test_runs enable row level security;

-- ─── 6. Access policies for service role & internal operations ─────────────
-- Read access for authenticated users; service role handles background operations
grant select on public.audit_events to authenticated;
grant select on public.authorization_events to authenticated;
grant select on public.defense_scans to authenticated;
grant select on public.discernment_records to authenticated;
grant select on public.test_runs to authenticated;
