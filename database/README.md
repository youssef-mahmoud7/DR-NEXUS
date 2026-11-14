# Database

DR. NEXUS is designed for Supabase PostgreSQL, Authentication, and Storage. This folder is the source of truth for versioned SQL migrations.

No domain schema is included yet. When Supabase is configured, initialize the Supabase CLI from this directory and create timestamped migrations in `migrations/`. Use Row Level Security for every table that stores user, crew, or mission data.
