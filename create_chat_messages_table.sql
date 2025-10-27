-- ============================================================================
-- CREATE CHAT MESSAGES TABLE
-- ============================================================================
-- This SQL script creates the chat_messages table to persist chat history
-- Run this in your Supabase SQL editor

-- Drop table if exists (optional, for fresh setup)
-- DROP TABLE IF EXISTS chat_messages;

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace_id ON chat_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace_created ON chat_messages(workspace_id, created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can read messages from their workspaces
DROP POLICY IF EXISTS "Users can read chat messages from their workspaces" ON chat_messages;
CREATE POLICY "Users can read chat messages from their workspaces"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = chat_messages.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Policy: Users can insert messages only in their workspaces
DROP POLICY IF EXISTS "Users can insert messages in their workspaces" ON chat_messages;
CREATE POLICY "Users can insert messages in their workspaces"
  ON chat_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = chat_messages.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Policy: Users can only update their own messages
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
CREATE POLICY "Users can update their own messages"
  ON chat_messages FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can only delete their own messages
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;
CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This creates a chat_messages table with:
-- - Full message persistence
-- - Automatic timestamps
-- - RLS policies for security
-- - Performance indexes
-- Messages are now saved to the database and will persist across sessions