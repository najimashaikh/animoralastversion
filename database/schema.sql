CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  document_type VARCHAR(50) NOT NULL DEFAULT 'note',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(30) NOT NULL,
  resource_type VARCHAR(50) NOT NULL DEFAULT 'reference',
  resource_url TEXT NOT NULL DEFAULT '',
  thumbnail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS objects (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  object_type VARCHAR(80) NOT NULL DEFAULT 'asset',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(20) NOT NULL CHECK (category IN ('2D', '3D', 'VFX')),
  level VARCHAR(40) NOT NULL DEFAULT 'FOUNDATION',
  duration VARCHAR(40) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tutorials (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(20) NOT NULL CHECK (category IN ('2D', '3D', 'VFX')),
  duration VARCHAR(40) NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  thumbnail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('2D', '3D', 'VFX')),
  difficulty VARCHAR(30) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  problem TEXT NOT NULL,
  task TEXT NOT NULL,
  hint TEXT NOT NULL,
  solution TEXT NOT NULL,
  related_course VARCHAR(180) NOT NULL DEFAULT '',
  related_tutorial VARCHAR(180) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);
CREATE INDEX IF NOT EXISTS documents_project_id_idx ON documents (project_id);
CREATE INDEX IF NOT EXISTS queries_user_id_idx ON queries (user_id);
CREATE INDEX IF NOT EXISTS objects_user_id_idx ON objects (user_id);
CREATE INDEX IF NOT EXISTS objects_project_id_idx ON objects (project_id);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses (category);
CREATE INDEX IF NOT EXISTS tutorials_category_idx ON tutorials (category);
CREATE INDEX IF NOT EXISTS problems_category_difficulty_idx ON problems (category, difficulty);