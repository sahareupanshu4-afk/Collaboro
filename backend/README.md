# Remote Work Platform - Backend

Backend server for the remote work platform with real-time chat and video conferencing capabilities.

## Features

- Real-time chat with Socket.io
- Video conferencing with WebRTC
- Supabase integration for database and authentication
- Express.js API server

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
- `PORT`: Server port (default: 8080)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Your Supabase service key

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

- `GET /` - API information and status
- `GET /api/health` - Health check

## Socket.io Events

### Chat Events
- `chat:join-room` - Join a chat room
- `chat:send-message` - Send a message
- `chat:leave-room` - Leave a chat room
- `chat:receive-message` - Receive messages
- `chat:user-joined` - User joined notification
- `chat:user-left` - User left notification

### Video Events
- `video:join-room` - Join video call
- `video:send-offer` - Send WebRTC offer
- `video:send-answer` - Send WebRTC answer
- `video:ice-candidate` - Exchange ICE candidates
- `video:leave-room` - Leave video call
- `video:user-joined` - User joined video call
- `video:user-left` - User left video call

## Supabase Database Schema

### Tables to create in Supabase:

#### workspaces
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### workspace_members
```sql
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);
```

#### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
