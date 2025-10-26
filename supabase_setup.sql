-- =========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Remote Work Platform
-- =========================================

-- Enable UUID extension for automatic ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- TABLE CREATION
-- =========================================

-- User Profiles Table
-- Stores additional user information beyond Supabase auth
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces Table
-- Stores workspace/team information
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace Members Table
-- Links users to workspaces with roles
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Messages Table
-- Stores chat message history (optional)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Whiteboards Table
-- Stores collaborative whiteboards
CREATE TABLE IF NOT EXISTS whiteboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  canvas_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
-- Stores collaborative documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content JSONB DEFAULT '{"type":"doc","content":[]}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences Table
-- Stores user customization preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notification_enabled BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  custom_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uploaded Files Table
-- Stores uploaded documents and files
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  file_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS on all tables for security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- =========================================
-- SECURITY POLICIES
-- =========================================

-- User Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
  ON user_profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Workspaces Policies
-- Users can view workspaces they're members of
CREATE POLICY "Users can view workspaces they're members of" 
  ON workspaces
  FOR SELECT 
  USING (
    id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create workspaces
CREATE POLICY "Users can create workspaces" 
  ON workspaces
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Workspace Members Policies
-- Users can view members of their workspaces
CREATE POLICY "Users can view workspace members" 
  ON workspace_members
  FOR SELECT 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can join workspaces (insert themselves)
CREATE POLICY "Users can join workspaces" 
  ON workspace_members
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Workspace admins can add members
CREATE POLICY "Admins can add members" 
  ON workspace_members
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM workspace_members 
      WHERE workspace_id = workspace_members.workspace_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  );

-- Messages Policies
-- Users can view messages in their workspaces
CREATE POLICY "Users can view messages in their workspaces" 
  ON messages
  FOR SELECT 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can send messages to their workspaces
CREATE POLICY "Users can send messages to their workspaces" 
  ON messages
  FOR INSERT 
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Whiteboards Policies
-- Users can view whiteboards in their workspaces
CREATE POLICY "Users can view whiteboards in their workspaces" 
  ON whiteboards
  FOR SELECT 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create whiteboards in their workspaces
CREATE POLICY "Users can create whiteboards in their workspaces" 
  ON whiteboards
  FOR INSERT 
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update whiteboards in their workspaces
CREATE POLICY "Users can update whiteboards in their workspaces" 
  ON whiteboards
  FOR UPDATE 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Documents Policies
-- Users can view documents in their workspaces
CREATE POLICY "Users can view documents in their workspaces" 
  ON documents
  FOR SELECT 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create documents in their workspaces
CREATE POLICY "Users can create documents in their workspaces" 
  ON documents
  FOR INSERT 
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update documents in their workspaces
CREATE POLICY "Users can update documents in their workspaces" 
  ON documents
  FOR UPDATE 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- User Preferences Policies
-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences" 
  ON user_preferences
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" 
  ON user_preferences
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" 
  ON user_preferences
  FOR UPDATE 
  USING (auth.uid() = id);

-- Uploaded Files Policies
-- Users can view files in their workspaces
CREATE POLICY "Users can view files in their workspaces" 
  ON uploaded_files
  FOR SELECT 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can upload files to their workspaces
CREATE POLICY "Users can upload files to their workspaces" 
  ON uploaded_files
  FOR INSERT 
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete files they uploaded
CREATE POLICY "Users can delete their own files" 
  ON uploaded_files
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Index for faster workspace member lookups
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id 
  ON workspace_members(user_id);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id 
  ON workspace_members(workspace_id);

-- Index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_workspace_id 
  ON messages(workspace_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON messages(created_at DESC);

-- Index for faster whiteboard queries
CREATE INDEX IF NOT EXISTS idx_whiteboards_workspace_id 
  ON whiteboards(workspace_id);

-- Index for faster document queries
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id 
  ON documents(workspace_id);

-- Index for faster uploaded files queries
CREATE INDEX IF NOT EXISTS idx_uploaded_files_workspace_id 
  ON uploaded_files(workspace_id);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id 
  ON uploaded_files(user_id);

-- =========================================
-- TRIGGERS FOR AUTO-UPDATE
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for workspaces
CREATE TRIGGER update_workspaces_updated_at 
  BEFORE UPDATE ON workspaces
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for whiteboards
CREATE TRIGGER update_whiteboards_updated_at 
  BEFORE UPDATE ON whiteboards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for documents
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for uploaded_files
CREATE TRIGGER update_uploaded_files_updated_at 
  BEFORE UPDATE ON uploaded_files
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- SETUP COMPLETE
-- =========================================

-- Verify tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('user_profiles', 'workspaces', 'workspace_members', 'messages', 'whiteboards', 'documents', 'user_preferences', 'uploaded_files')
ORDER BY table_name;
