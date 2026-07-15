-- Freelance VA applications from the public "Work with VAxAI" page.
-- Studio manages pipeline (Applications + Approved talent pool) via service role / member RLS.

CREATE TABLE IF NOT EXISTS va_applications (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),

  -- Applicant path: experienced freelancers vs early-career / getting started
  applicant_type              text NOT NULL CHECK (applicant_type IN ('experienced', 'early_career')),

  full_name                   text NOT NULL,
  email                       text NOT NULL,
  telephone                   text,
  location                    text,
  uk_based                    boolean NOT NULL DEFAULT true,

  -- Setup readiness (HMRC self-employed; not Companies House)
  self_employed_status        text NOT NULL CHECK (
    self_employed_status IN ('registered_hmrc', 'will_register', 'need_setup_help')
  ),
  has_business_insurance      text NOT NULL DEFAULT 'will_arrange' CHECK (
    has_business_insurance IN ('yes', 'no', 'will_arrange')
  ),
  can_prove_identity          boolean NOT NULL DEFAULT false,

  specialisms                 text[] NOT NULL DEFAULT '{}',
  sectors_interests           text,
  work_specialises_in         text,
  ai_knowledge                text,

  -- Availability (v1; extended over time for matching)
  availability_hours_per_week text,
  availability_notes          text,

  cv_path                     text,
  cv_file_name                text,
  cv_url                      text,
  photo_url                   text,

  cover_note                  text,
  admin_notes                 text,

  status                      text NOT NULL DEFAULT 'new' CHECK (
    status IN (
      'new',
      'contacted',
      'verified',
      'approved',
      'joined',
      'not_suitable'
    )
  ),
  last_action                 text,
  last_action_date            timestamptz,

  -- Extensible matching profile (future: skills scores, tools, preferred work types)
  profile_extras              jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_va_applications_status_created
  ON va_applications (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_va_applications_applicant_type
  ON va_applications (applicant_type);

CREATE INDEX IF NOT EXISTS idx_va_applications_email
  ON va_applications (email);

CREATE INDEX IF NOT EXISTS idx_va_applications_specialisms
  ON va_applications USING gin (specialisms);

ALTER TABLE va_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_va_applications" ON va_applications;
CREATE POLICY "anon_insert_va_applications"
  ON va_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_select_va_applications" ON va_applications;
CREATE POLICY "authenticated_select_va_applications"
  ON va_applications
  FOR SELECT
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS "authenticated_update_va_applications" ON va_applications;
CREATE POLICY "authenticated_update_va_applications"
  ON va_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_studio_member())
  WITH CHECK (public.is_studio_member());

DROP POLICY IF EXISTS "authenticated_delete_va_applications" ON va_applications;
CREATE POLICY "authenticated_delete_va_applications"
  ON va_applications
  FOR DELETE
  TO authenticated
  USING (public.is_studio_member());

DROP POLICY IF EXISTS "service_role_all_va_applications" ON va_applications;
CREATE POLICY "service_role_all_va_applications"
  ON va_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Storage folder for CVs and profile photos lives under the existing vaxai-studio bucket
-- at paths: va-applications/cvs/* and va-applications/photos/*
-- Uploads go through API routes using the service role.
