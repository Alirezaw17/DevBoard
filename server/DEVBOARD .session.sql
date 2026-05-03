
-- The sql code here is not workable since this sqltools does not read this language here so,
-- I tried to only import the code I wrote to create the db here to check the errs later.ABORT


-- users TABLE: 
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'member',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Since I preferred to assign my fist user as admin when registered, I did not put any user for now here.

-- projects TABLE:
CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- to delete the projects after user deletion
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  color       CHAR(7) DEFAULT '#6366f1', --differentiate the projects
  status      VARCHAR(20) DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- tasks TABLE:
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  priority    VARCHAR(10) DEFAULT 'medium',
  status      VARCHAR(20) DEFAULT 'todo',
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- activity_log TABLE: 
CREATE TABLE activity_log (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action       VARCHAR(100) NOT NULL,
  entity_type  VARCHAR(50),
  entity_name  VARCHAR(255),
  project_name VARCHAR(255),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- The activity_log table does not have a foreign key to projects 
-- instead it stores the project name as plain text directly in the project_name column.
-- WITH Foreign key -> If project is deleted → log entry breaks or gets deleted too
-- When your backend records an activity, it simply copies the project name at that moment
