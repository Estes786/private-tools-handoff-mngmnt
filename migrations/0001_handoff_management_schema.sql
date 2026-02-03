-- 🎯 HANDOFF MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Infinity Growth Loop per Project
-- Zero Context Loss Guaranteed

-- =====================================================
-- PROJECTS TABLE
-- Stores project information & growth metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  status TEXT DEFAULT 'active',
  
  -- Growth Metrics
  total_sessions INTEGER DEFAULT 0,
  efficiency_score REAL DEFAULT 0.70,
  knowledge_score REAL DEFAULT 1.00,
  context_preservation REAL DEFAULT 0.98,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SESSIONS TABLE
-- Individual work sessions for each project
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  
  -- Session Info
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  
  -- Session Metrics
  credit_budget INTEGER DEFAULT 100,
  credit_used INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  efficiency REAL,
  
  -- Requirements & Deliverables
  requirements TEXT,
  accomplishments TEXT,
  blockers TEXT,
  troubleshooting TEXT,
  
  -- Timestamps
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- =====================================================
-- HANDOFFS TABLE
-- Master handoff documents for each session
-- =====================================================
CREATE TABLE IF NOT EXISTS handoffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  
  -- Handoff Content
  current_state TEXT NOT NULL,
  actual_state TEXT NOT NULL,
  requirements_checklist TEXT NOT NULL,
  troubleshooting_results TEXT,
  next_steps TEXT NOT NULL,
  future_recommendations TEXT,
  
  -- Handoff Metadata
  version TEXT NOT NULL,
  context_quality REAL DEFAULT 0.98,
  requirements_completion_rate REAL DEFAULT 1.00,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- =====================================================
-- CHECKPOINTS TABLE
-- Checkpoint validation results
-- =====================================================
CREATE TABLE IF NOT EXISTS checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  checkpoint_type TEXT NOT NULL,
  
  -- Checkpoint Data
  requirement_item TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- =====================================================
-- ERRORS TABLE
-- Error tracking and resolution
-- =====================================================
CREATE TABLE IF NOT EXISTS errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  
  -- Error Details
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_context TEXT,
  resolution TEXT,
  status TEXT DEFAULT 'open',
  
  -- Timestamps
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- =====================================================
-- GROWTH_METRICS TABLE
-- Historical growth tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS growth_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  
  -- Metrics
  efficiency REAL NOT NULL,
  knowledge REAL NOT NULL,
  effective_output REAL NOT NULL,
  improvement_percentage REAL,
  
  -- Timestamp
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_number ON sessions(project_id, session_number);
CREATE INDEX IF NOT EXISTS idx_handoffs_session ON handoffs(session_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_project ON handoffs(project_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON checkpoints(session_id);
CREATE INDEX IF NOT EXISTS idx_errors_session ON errors(session_id);
CREATE INDEX IF NOT EXISTS idx_errors_status ON errors(status);
CREATE INDEX IF NOT EXISTS idx_growth_project ON growth_metrics(project_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================
CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
AFTER UPDATE ON projects
BEGIN
  UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp 
AFTER UPDATE ON sessions
BEGIN
  UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- INITIAL DATA FOR DEMO
-- =====================================================
INSERT OR IGNORE INTO projects (id, name, description, repository_url) VALUES 
(1, 'Multi-Session Orchestration Management', 'Revolutionary session-centric orchestration with AI-powered handoff', 'https://github.com/Estes786/private-tools-mukti-session-orchestration-mngmnt');
