# Remote Work Platform - Frontend

A modern, professional remote work platform built with React, Tailwind CSS, and real-time collaboration features.

## Features

- 🔐 **Authentication** - Supabase authentication with sign up/sign in
- 💬 **Real-time Chat** - Instant messaging with Socket.io
- 📹 **Video Conferencing** - WebRTC-based video calls with screen sharing
- 🏢 **Workspaces** - Organize teams into dedicated collaboration spaces
- 🎨 **Modern UI** - Professional design with Tailwind CSS and Framer Motion animations
- ⚡ **Real-time Updates** - Instant synchronization across all users

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Socket.io Client** - Real-time bidirectional communication
- **Supabase** - Backend as a Service (authentication & database)
- **WebRTC** - Peer-to-peer video conferencing
- **Lucide React** - Beautiful icon library

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SERVER_URL=http://localhost:8080
```

### 3. Set Up Supabase

1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Run the following SQL in the Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view workspaces they're members of" ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their workspaces" ON messages
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );
```

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Development

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Authentication UI
│   │   ├── Dashboard.jsx       # Main workspace dashboard
│   │   ├── Chat.jsx            # Real-time chat component
│   │   └── VideoConference.jsx # Video calling component
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── services/
│   │   └── socketService.js    # Socket.io service
│   ├── config/
│   │   └── supabase.js         # Supabase configuration
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Overview

### Authentication
- Sign up with email and password
- Sign in with existing account
- Automatic session management
- User profile creation

### Real-time Chat
- Workspace-level chat rooms
- Real-time message delivery
- User join/leave notifications
- Message history
- Beautiful chat UI with animations

### Video Conferencing
- WebRTC peer-to-peer connections
- Multiple participants support
- Video/audio controls
- Automatic device access
- Grid layout for multiple users
- Connection status indicators

### Workspaces
- Create and manage workspaces
- Join multiple workspaces
- Workspace-specific chat and video
- Member management

## Customization

### Tailwind Configuration

Edit `tailwind.config.js` to customize colors, animations, and themes:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Adding New Features

1. Create component in `src/components/`
2. Add necessary Socket.io events in `src/services/socketService.js`
3. Update backend server to handle new events
4. Add UI to Dashboard

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari (limited WebRTC support)

## Troubleshooting

### Camera/Microphone Access
- Ensure HTTPS or localhost
- Check browser permissions
- Allow camera/microphone access when prompted

### Connection Issues
- Verify backend server is running
- Check VITE_SERVER_URL in .env
- Ensure CORS is configured correctly

### Build Errors
- Delete `node_modules` and run `npm install`
- Clear Vite cache: `rm -rf .vite`
- Ensure all environment variables are set

## License

MIT
