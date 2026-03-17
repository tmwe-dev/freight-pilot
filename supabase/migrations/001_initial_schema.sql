-- Freight Pilot CRM - Initial Schema Migration
-- Complete database schema for Supabase
-- Created: 2026-03-16
-- Generated from types.ts

-- ============================================================================
-- ENUM TYPES - Create all enums first
-- ============================================================================

CREATE TYPE activity_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

CREATE TYPE activity_type AS ENUM (
  'send_email',
  'phone_call',
  'add_to_campaign',
  'meeting',
  'follow_up',
  'other'
);

CREATE TYPE campaign_job_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

CREATE TYPE campaign_job_type AS ENUM ('email', 'call');

CREATE TYPE certification_type AS ENUM ('IATA', 'BASC', 'ISO', 'C-TPAT', 'AEO');

CREATE TYPE download_queue_status AS ENUM ('pending', 'in_progress', 'completed', 'paused');

CREATE TYPE interaction_type AS ENUM ('call', 'email', 'meeting', 'note');

CREATE TYPE office_type AS ENUM ('head_office', 'branch');

CREATE TYPE partner_type AS ENUM (
  'freight_forwarder',
  'customs_broker',
  'carrier',
  'nvocc',
  '3pl',
  'courier'
);

CREATE TYPE reminder_priority AS ENUM ('low', 'medium', 'high');

CREATE TYPE reminder_status AS ENUM ('pending', 'completed');

CREATE TYPE service_category AS ENUM (
  'air_freight',
  'ocean_fcl',
  'ocean_lcl',
  'road_freight',
  'rail_freight',
  'project_cargo',
  'dangerous_goods',
  'perishables',
  'pharma',
  'ecommerce',
  'relocations',
  'customs_broker',
  'warehousing',
  'nvocc'
);

CREATE TYPE social_platform AS ENUM (
  'linkedin',
  'facebook',
  'instagram',
  'twitter',
  'whatsapp'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type activity_type NOT NULL,
  assigned_to UUID,
  campaign_batch_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  due_date TIMESTAMPTZ,
  email_body TEXT,
  email_subject TEXT,
  partner_id UUID,
  priority TEXT NOT NULL,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  selected_contact_id UUID,
  sent_at TIMESTAMPTZ,
  source_id TEXT NOT NULL,
  source_meta JSONB,
  source_type TEXT,
  status activity_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL
);

-- App settings table
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blacklist entries table
CREATE TABLE blacklist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blacklist_no INTEGER,
  city TEXT,
  claims TEXT,
  company_name TEXT NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ,
  matched_partner_id UUID,
  source TEXT,
  status TEXT,
  total_owed_amount NUMERIC,
  updated_at TIMESTAMPTZ
);

-- Blacklist sync log table
CREATE TABLE blacklist_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ,
  entries_count INTEGER,
  matched_count INTEGER,
  sync_type TEXT NOT NULL
);

-- Campaign jobs table
CREATE TABLE campaign_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to UUID,
  batch_id UUID NOT NULL,
  city TEXT,
  company_name TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT,
  job_type campaign_job_type NOT NULL,
  notes TEXT,
  partner_id UUID NOT NULL,
  phone TEXT,
  status campaign_job_status NOT NULL DEFAULT 'pending'
);

-- Contact interactions table
CREATE TABLE contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  description TEXT,
  interaction_type TEXT NOT NULL,
  outcome TEXT,
  title TEXT NOT NULL
);

-- Credit transactions table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  operation TEXT NOT NULL,
  user_id UUID NOT NULL
);

-- Directory cache table
CREATE TABLE directory_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  download_verified BOOLEAN NOT NULL DEFAULT false,
  members JSONB,
  network_name TEXT,
  scanned_at TIMESTAMPTZ,
  total_pages INTEGER,
  total_results INTEGER,
  updated_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ
);

-- Download jobs table
CREATE TABLE download_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  completed_at TIMESTAMPTZ,
  contacts_found_count INTEGER NOT NULL DEFAULT 0,
  contacts_missing_count INTEGER NOT NULL DEFAULT 0,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_index INTEGER NOT NULL DEFAULT 0,
  delay_seconds INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  failed_ids JSONB,
  job_type TEXT,
  last_contact_result TEXT,
  last_processed_company TEXT,
  last_processed_wca_id INTEGER,
  network_name TEXT NOT NULL,
  processed_ids JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  terminal_log JSONB,
  total_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  wca_ids JSONB
);

-- Download queue table
CREATE TABLE download_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  id_range_end INTEGER,
  id_range_start INTEGER,
  last_processed_id INTEGER,
  network_name TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  status download_queue_status NOT NULL DEFAULT 'pending',
  total_found INTEGER NOT NULL DEFAULT 0,
  total_processed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email campaign queue table
CREATE TABLE email_campaign_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  draft_id UUID,
  error_message TEXT,
  html_body TEXT NOT NULL,
  partner_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  subject TEXT NOT NULL
);

-- Email drafts table
CREATE TABLE email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_ids JSONB,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  html_body TEXT,
  link_urls JSONB,
  queue_completed_at TIMESTAMPTZ,
  queue_delay_seconds INTEGER NOT NULL DEFAULT 0,
  queue_started_at TIMESTAMPTZ,
  queue_status TEXT NOT NULL DEFAULT 'pending',
  recipient_filter JSONB,
  recipient_type TEXT,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  subject TEXT,
  total_count INTEGER NOT NULL DEFAULT 0
);

-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  file_url TEXT NOT NULL,
  name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Import errors table
CREATE TABLE import_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_suggestions JSONB,
  attempted_corrections INTEGER NOT NULL DEFAULT 0,
  corrected_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_message TEXT,
  error_type TEXT NOT NULL,
  import_log_id UUID NOT NULL,
  raw_data JSONB,
  row_number INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Import logs table
CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_rows INTEGER NOT NULL DEFAULT 0,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  file_url TEXT,
  group_name TEXT,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  normalization_method TEXT,
  processing_batch INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  total_batches INTEGER NOT NULL DEFAULT 1,
  total_rows INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL
);

-- Imported contacts table
CREATE TABLE imported_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  city TEXT,
  company_alias TEXT,
  company_name TEXT,
  contact_alias TEXT,
  converted_at TIMESTAMPTZ,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deep_search_at TIMESTAMPTZ,
  email TEXT,
  enrichment_data JSONB,
  external_id TEXT,
  import_log_id UUID NOT NULL,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  is_transferred BOOLEAN NOT NULL DEFAULT false,
  last_interaction_at TIMESTAMPTZ,
  lead_status TEXT NOT NULL DEFAULT 'new',
  mobile TEXT,
  name TEXT,
  note TEXT,
  origin TEXT,
  phone TEXT,
  position TEXT,
  priority_score INTEGER NOT NULL DEFAULT 0,
  raw_data JSONB,
  row_number INTEGER NOT NULL DEFAULT 0,
  zip_code TEXT
);

-- Interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ,
  created_by UUID,
  interaction_date TIMESTAMPTZ,
  interaction_type interaction_type NOT NULL,
  notes TEXT,
  partner_id UUID NOT NULL,
  subject TEXT NOT NULL
);

-- Network configs table
CREATE TABLE network_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  has_contact_emails BOOLEAN NOT NULL DEFAULT false,
  has_contact_names BOOLEAN NOT NULL DEFAULT false,
  has_contact_phones BOOLEAN NOT NULL DEFAULT false,
  is_member BOOLEAN NOT NULL DEFAULT false,
  network_name TEXT NOT NULL,
  notes TEXT,
  sample_tested_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partner certifications table
CREATE TABLE partner_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification certification_type NOT NULL,
  created_at TIMESTAMPTZ,
  partner_id UUID NOT NULL
);

-- Partner contacts table
CREATE TABLE partner_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_alias TEXT,
  created_at TIMESTAMPTZ,
  direct_phone TEXT,
  email TEXT,
  is_primary BOOLEAN,
  mobile TEXT,
  name TEXT NOT NULL,
  partner_id UUID NOT NULL,
  title TEXT
);

-- Partner networks table
CREATE TABLE partner_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ,
  expires TIMESTAMPTZ,
  network_id UUID,
  network_name TEXT NOT NULL,
  partner_id UUID NOT NULL
);

-- Partner services table
CREATE TABLE partner_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ,
  partner_id UUID NOT NULL,
  service_category service_category NOT NULL
);

-- Partner social links table
CREATE TABLE partner_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  partner_id UUID NOT NULL,
  platform social_platform NOT NULL,
  url TEXT NOT NULL
);

-- Partners table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  ai_parsed_at TIMESTAMPTZ,
  branch_cities JSONB,
  city TEXT NOT NULL,
  company_alias TEXT,
  company_name TEXT NOT NULL,
  converted_at TIMESTAMPTZ,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  email TEXT,
  emergency_phone TEXT,
  enriched_at TIMESTAMPTZ,
  enrichment_data JSONB,
  fax TEXT,
  has_branches BOOLEAN,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN,
  is_favorite BOOLEAN,
  last_interaction_at TIMESTAMPTZ,
  lead_status TEXT NOT NULL DEFAULT 'new',
  logo_url TEXT,
  member_since TIMESTAMPTZ,
  membership_expires TIMESTAMPTZ,
  mobile TEXT,
  office_type office_type,
  partner_type partner_type,
  phone TEXT,
  priority_score INTEGER NOT NULL DEFAULT 0,
  profile_description TEXT,
  rating NUMERIC(3,1),
  rating_details JSONB,
  raw_profile_html TEXT,
  raw_profile_markdown TEXT,
  updated_at TIMESTAMPTZ,
  wca_id INTEGER,
  website TEXT
);

-- Partners no contacts table
CREATE TABLE partners_no_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT,
  company_name TEXT NOT NULL,
  country_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_retry_at TIMESTAMPTZ,
  networks JSONB,
  partner_id UUID,
  resolved BOOLEAN NOT NULL DEFAULT false,
  retry_count INTEGER NOT NULL DEFAULT 0,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  wca_id INTEGER NOT NULL
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  display_name TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Prospect contacts table
CREATE TABLE prospect_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codice_fiscale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT,
  linkedin_url TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  prospect_id UUID NOT NULL,
  role TEXT
);

-- Prospect interactions table
CREATE TABLE prospect_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  description TEXT,
  interaction_type TEXT NOT NULL,
  outcome TEXT,
  prospect_id UUID NOT NULL,
  title TEXT NOT NULL
);

-- Prospect social links table
CREATE TABLE prospect_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  platform TEXT NOT NULL,
  prospect_id UUID NOT NULL,
  url TEXT NOT NULL
);

-- Prospects table
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  anno_bilancio INTEGER,
  cap TEXT,
  city TEXT,
  codice_ateco TEXT,
  codice_fiscale TEXT,
  company_name TEXT NOT NULL,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  credit_score INTEGER,
  data_costituzione TIMESTAMPTZ,
  descrizione_ateco TEXT,
  dipendenti INTEGER,
  email TEXT,
  enrichment_data JSONB,
  fatturato NUMERIC,
  forma_giuridica TEXT,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  lead_status TEXT NOT NULL DEFAULT 'new',
  partita_iva TEXT,
  pec TEXT,
  phone TEXT,
  priority_score INTEGER NOT NULL DEFAULT 0,
  province TEXT,
  rating_affidabilita TEXT,
  raw_profile_html TEXT,
  region TEXT,
  source TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  utile NUMERIC,
  website TEXT
);

-- Reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  partner_id UUID NOT NULL,
  priority reminder_priority,
  status reminder_status,
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  name TEXT NOT NULL,
  role TEXT
);

-- User API keys table
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  provider TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- User credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC NOT NULL DEFAULT 0,
  total_consumed NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- User WCA credentials table
CREATE TABLE user_wca_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  wca_password TEXT NOT NULL,
  wca_username TEXT NOT NULL
);

-- Workspace documents table
CREATE TABLE workspace_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extracted_text TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL
);

-- Workspace presets table
CREATE TABLE workspace_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_proposal TEXT,
  created_at TIMESTAMPTZ,
  document_ids JSONB,
  goal TEXT,
  name TEXT NOT NULL,
  reference_links JSONB,
  updated_at TIMESTAMPTZ,
  user_id UUID NOT NULL
);

-- ============================================================================
-- NEW TABLES - Added for deduplication and workflow features
-- ============================================================================

-- Dedup clusters table
CREATE TABLE dedup_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_contact_id UUID NOT NULL,
  master_source_type TEXT,
  match_confidence NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- Dedup cluster members table
CREATE TABLE dedup_cluster_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL,
  contact_id UUID,
  source_type TEXT,
  field_conflicts JSONB,
  is_master BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow rules table
CREATE TABLE workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT false,
  conditions JSONB,
  time_conditions JSONB,
  action_type TEXT NOT NULL,
  action_params JSONB,
  cooldown_hours INTEGER NOT NULL DEFAULT 48,
  frequency_hours INTEGER NOT NULL DEFAULT 6,
  last_executed_at TIMESTAMPTZ,
  total_executions INTEGER NOT NULL DEFAULT 0,
  total_contacts_processed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow execution log table
CREATE TABLE workflow_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL,
  contacts_matched INTEGER,
  actions_created INTEGER,
  errors JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow cooldowns table
CREATE TABLE workflow_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scoring config table
CREATE TABLE scoring_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dimension_weights JSONB NOT NULL DEFAULT '{"data_quality":0.20,"commercial_potential":0.30,"strategic_relevance":0.25,"circuit_status":0.15,"risk":0.10}',
  strategic_countries JSONB NOT NULL DEFAULT '[]',
  strategic_services JSONB NOT NULL DEFAULT '[]',
  strategic_networks JSONB NOT NULL DEFAULT '[]',
  strategic_partner_types JSONB NOT NULL DEFAULT '[]',
  origin_ranks JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE activities
  ADD CONSTRAINT activities_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES team_members(id),
  ADD CONSTRAINT activities_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id),
  ADD CONSTRAINT activities_selected_contact_id_fkey FOREIGN KEY (selected_contact_id) REFERENCES partner_contacts(id);

ALTER TABLE blacklist_entries
  ADD CONSTRAINT blacklist_entries_matched_partner_id_fkey FOREIGN KEY (matched_partner_id) REFERENCES partners(id);

ALTER TABLE campaign_jobs
  ADD CONSTRAINT campaign_jobs_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES team_members(id);

ALTER TABLE contact_interactions
  ADD CONSTRAINT contact_interactions_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES imported_contacts(id);

ALTER TABLE email_campaign_queue
  ADD CONSTRAINT email_campaign_queue_draft_id_fkey FOREIGN KEY (draft_id) REFERENCES email_drafts(id);

ALTER TABLE import_errors
  ADD CONSTRAINT import_errors_import_log_id_fkey FOREIGN KEY (import_log_id) REFERENCES import_logs(id);

ALTER TABLE imported_contacts
  ADD CONSTRAINT imported_contacts_import_log_id_fkey FOREIGN KEY (import_log_id) REFERENCES import_logs(id);

ALTER TABLE interactions
  ADD CONSTRAINT interactions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id);

ALTER TABLE partner_certifications
  ADD CONSTRAINT partner_certifications_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id);

ALTER TABLE partner_contacts
  ADD CONSTRAINT partner_contacts_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id);

ALTER TABLE partner_networks
  ADD CONSTRAINT partner_networks_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id);

ALTER TABLE partner_services
  ADD CONSTRAINT partner_services_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id);

ALTER TABLE partner_social_links
  ADD CONSTRAINT partner_social_links_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES partner_contacts(id),
  ADD CONSTRAINT partner_social_links_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id);

ALTER TABLE prospect_contacts
  ADD CONSTRAINT prospect_contacts_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES prospects(id);

ALTER TABLE prospect_interactions
  ADD CONSTRAINT prospect_interactions_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES prospects(id);

ALTER TABLE prospect_social_links
  ADD CONSTRAINT prospect_social_links_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES prospect_contacts(id),
  ADD CONSTRAINT prospect_social_links_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES prospects(id);

ALTER TABLE reminders
  ADD CONSTRAINT reminders_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES partners(id);

ALTER TABLE dedup_cluster_members
  ADD CONSTRAINT dedup_cluster_members_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES dedup_clusters(id);

ALTER TABLE workflow_execution_log
  ADD CONSTRAINT workflow_execution_log_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES workflow_rules(id);

ALTER TABLE workflow_cooldowns
  ADD CONSTRAINT workflow_cooldowns_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES workflow_rules(id);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Foreign key indexes
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_activities_partner_id ON activities(partner_id);
CREATE INDEX idx_activities_selected_contact_id ON activities(selected_contact_id);
CREATE INDEX idx_campaign_jobs_assigned_to ON campaign_jobs(assigned_to);
CREATE INDEX idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX idx_email_campaign_queue_draft_id ON email_campaign_queue(draft_id);
CREATE INDEX idx_import_errors_import_log_id ON import_errors(import_log_id);
CREATE INDEX idx_imported_contacts_import_log_id ON imported_contacts(import_log_id);
CREATE INDEX idx_interactions_partner_id ON interactions(partner_id);
CREATE INDEX idx_partner_certifications_partner_id ON partner_certifications(partner_id);
CREATE INDEX idx_partner_contacts_partner_id ON partner_contacts(partner_id);
CREATE INDEX idx_partner_networks_partner_id ON partner_networks(partner_id);
CREATE INDEX idx_partner_services_partner_id ON partner_services(partner_id);
CREATE INDEX idx_partner_social_links_contact_id ON partner_social_links(contact_id);
CREATE INDEX idx_partner_social_links_partner_id ON partner_social_links(partner_id);
CREATE INDEX idx_prospect_contacts_prospect_id ON prospect_contacts(prospect_id);
CREATE INDEX idx_prospect_interactions_prospect_id ON prospect_interactions(prospect_id);
CREATE INDEX idx_prospect_social_links_contact_id ON prospect_social_links(contact_id);
CREATE INDEX idx_prospect_social_links_prospect_id ON prospect_social_links(prospect_id);
CREATE INDEX idx_reminders_partner_id ON reminders(partner_id);
CREATE INDEX idx_dedup_cluster_members_cluster_id ON dedup_cluster_members(cluster_id);
CREATE INDEX idx_workflow_execution_log_rule_id ON workflow_execution_log(rule_id);
CREATE INDEX idx_workflow_cooldowns_rule_id ON workflow_cooldowns(rule_id);

-- Table-specific indexes
CREATE INDEX idx_partners_country_code ON partners(country_code);
CREATE INDEX idx_partners_lead_status ON partners(lead_status);
CREATE INDEX idx_partners_wca_id ON partners(wca_id);
CREATE INDEX idx_partners_priority_score ON partners(priority_score DESC);

CREATE INDEX idx_imported_contacts_email ON imported_contacts(email);
CREATE INDEX idx_imported_contacts_lead_status ON imported_contacts(lead_status);

CREATE INDEX idx_prospects_codice_ateco ON prospects(codice_ateco);
CREATE INDEX idx_prospects_lead_status ON prospects(lead_status);
CREATE INDEX idx_prospects_priority_score ON prospects(priority_score DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners_no_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wca_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedup_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedup_cluster_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_config ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "authenticated_select" ON activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON activities FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON app_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON app_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON app_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON app_settings FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON blacklist_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON blacklist_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON blacklist_entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON blacklist_entries FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON blacklist_sync_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON blacklist_sync_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON blacklist_sync_log FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON blacklist_sync_log FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON campaign_jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON campaign_jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON campaign_jobs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON campaign_jobs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON contact_interactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON contact_interactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON contact_interactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON contact_interactions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON credit_transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON credit_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON credit_transactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON credit_transactions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON directory_cache FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON directory_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON directory_cache FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON directory_cache FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON download_jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON download_jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON download_jobs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON download_jobs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON download_queue FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON download_queue FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON download_queue FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON download_queue FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON email_campaign_queue FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON email_campaign_queue FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON email_campaign_queue FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON email_campaign_queue FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON email_drafts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON email_drafts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON email_drafts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON email_drafts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON email_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON email_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON email_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON email_templates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON import_errors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON import_errors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON import_errors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON import_errors FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON import_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON import_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON import_logs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON import_logs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON imported_contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON imported_contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON imported_contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON imported_contacts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON interactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON interactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON interactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON interactions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON network_configs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON network_configs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON network_configs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON network_configs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON partner_certifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON partner_certifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON partner_certifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON partner_certifications FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON partner_contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON partner_contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON partner_contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON partner_contacts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON partner_networks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON partner_networks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON partner_networks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON partner_networks FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON partner_services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON partner_services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON partner_services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON partner_services FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON partner_social_links FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON partner_social_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON partner_social_links FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON partner_social_links FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON partners FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON partners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON partners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON partners FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON partners_no_contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON partners_no_contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON partners_no_contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON partners_no_contacts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON profiles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON profiles FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON prospect_contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON prospect_contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON prospect_contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON prospect_contacts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON prospect_interactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON prospect_interactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON prospect_interactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON prospect_interactions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON prospect_social_links FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON prospect_social_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON prospect_social_links FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON prospect_social_links FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON prospects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON prospects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON prospects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON prospects FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON reminders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON reminders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON reminders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON reminders FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON team_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON team_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON team_members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON user_api_keys FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON user_api_keys FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON user_api_keys FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON user_api_keys FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON user_credits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON user_credits FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON user_credits FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON user_credits FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON user_wca_credentials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON user_wca_credentials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON user_wca_credentials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON user_wca_credentials FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON workspace_documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON workspace_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON workspace_documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON workspace_documents FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON workspace_presets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON workspace_presets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON workspace_presets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON workspace_presets FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON dedup_clusters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON dedup_clusters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON dedup_clusters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON dedup_clusters FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON dedup_cluster_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON dedup_cluster_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON dedup_cluster_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON dedup_cluster_members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON workflow_rules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON workflow_rules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON workflow_rules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON workflow_rules FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON workflow_execution_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON workflow_execution_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON workflow_execution_log FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON workflow_execution_log FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON workflow_cooldowns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON workflow_cooldowns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON workflow_cooldowns FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON workflow_cooldowns FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select" ON scoring_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert" ON scoring_config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update" ON scoring_config FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_delete" ON scoring_config FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- deduct_credits: Deduct credits from user balance
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount NUMERIC,
  p_operation TEXT DEFAULT 'unknown',
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance NUMERIC
) AS $$
BEGIN
  UPDATE user_credits
  SET balance = balance - p_amount,
      total_consumed = total_consumed + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, operation, description, created_at)
  VALUES (p_user_id, p_amount, p_operation, p_description, now());

  RETURN QUERY
  SELECT true::BOOLEAN, balance FROM user_credits WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_contact_filter_options: Get available filter options for contacts
CREATE OR REPLACE FUNCTION get_contact_filter_options()
RETURNS TABLE (
  filter_type TEXT,
  filter_value TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    'lead_status'::TEXT as filter_type,
    lead_status as filter_value
  FROM imported_contacts
  WHERE lead_status IS NOT NULL
  ORDER BY lead_status;

  RETURN QUERY
  SELECT DISTINCT
    'origin'::TEXT as filter_type,
    origin as filter_value
  FROM imported_contacts
  WHERE origin IS NOT NULL
  ORDER BY origin;

  RETURN QUERY
  SELECT DISTINCT
    'country'::TEXT as filter_type,
    country as filter_value
  FROM imported_contacts
  WHERE country IS NOT NULL
  ORDER BY country;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_contact_group_counts: Get group counts for imported contacts
CREATE OR REPLACE FUNCTION get_contact_group_counts()
RETURNS TABLE (
  group_type TEXT,
  group_key TEXT,
  group_label TEXT,
  contact_count INTEGER,
  with_email INTEGER,
  with_phone INTEGER,
  with_alias INTEGER,
  with_deep_search INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'lead_status'::TEXT,
    lead_status,
    lead_status,
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN phone IS NOT NULL OR mobile IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN contact_alias IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN deep_search_at IS NOT NULL THEN 1 END)::INTEGER
  FROM imported_contacts
  GROUP BY lead_status;

  RETURN QUERY
  SELECT
    'origin'::TEXT,
    origin,
    COALESCE(origin, 'Unknown'),
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN phone IS NOT NULL OR mobile IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN contact_alias IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN deep_search_at IS NOT NULL THEN 1 END)::INTEGER
  FROM imported_contacts
  GROUP BY origin;

  RETURN QUERY
  SELECT
    'country'::TEXT,
    country,
    COALESCE(country, 'Unknown'),
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN phone IS NOT NULL OR mobile IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN contact_alias IS NOT NULL THEN 1 END)::INTEGER,
    COUNT(CASE WHEN deep_search_at IS NOT NULL THEN 1 END)::INTEGER
  FROM imported_contacts
  GROUP BY country;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_country_stats: Get statistics by country
CREATE OR REPLACE FUNCTION get_country_stats()
RETURNS TABLE (
  country_code TEXT,
  total_partners INTEGER,
  hq_count INTEGER,
  branch_count INTEGER,
  with_profile INTEGER,
  without_profile INTEGER,
  with_email INTEGER,
  with_phone INTEGER,
  with_company_alias INTEGER,
  with_contact_alias INTEGER,
  with_deep_search INTEGER,
  with_both INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.country_code,
    COUNT(DISTINCT p.id)::INTEGER as total_partners,
    COUNT(DISTINCT CASE WHEN p.office_type = 'head_office' THEN p.id END)::INTEGER as hq_count,
    COUNT(DISTINCT CASE WHEN p.office_type = 'branch' THEN p.id END)::INTEGER as branch_count,
    COUNT(DISTINCT CASE WHEN p.raw_profile_html IS NOT NULL THEN p.id END)::INTEGER as with_profile,
    COUNT(DISTINCT CASE WHEN p.raw_profile_html IS NULL THEN p.id END)::INTEGER as without_profile,
    COUNT(DISTINCT CASE WHEN p.email IS NOT NULL THEN p.id END)::INTEGER as with_email,
    COUNT(DISTINCT CASE WHEN p.phone IS NOT NULL THEN p.id END)::INTEGER as with_phone,
    COUNT(DISTINCT CASE WHEN p.company_alias IS NOT NULL THEN p.id END)::INTEGER as with_company_alias,
    COUNT(DISTINCT pc.id)::INTEGER as with_contact_alias,
    COUNT(DISTINCT CASE WHEN p.enriched_at IS NOT NULL THEN p.id END)::INTEGER as with_deep_search,
    COUNT(DISTINCT CASE WHEN p.email IS NOT NULL AND p.phone IS NOT NULL THEN p.id END)::INTEGER as with_both
  FROM partners p
  LEFT JOIN partner_contacts pc ON p.id = pc.partner_id
  GROUP BY p.country_code
  ORDER BY p.country_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_directory_counts: Get directory member counts
CREATE OR REPLACE FUNCTION get_directory_counts()
RETURNS TABLE (
  country_code TEXT,
  is_verified BOOLEAN,
  member_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.country_code,
    (dc.verified_at IS NOT NULL) as is_verified,
    dc.total_results::INTEGER as member_count
  FROM directory_cache dc
  ORDER BY dc.country_code, is_verified DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- increment_contact_interaction: Increment interaction count for a contact
CREATE OR REPLACE FUNCTION increment_contact_interaction(p_contact_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE imported_contacts
  SET interaction_count = interaction_count + 1,
      last_interaction_at = now()
  WHERE id = p_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
