# Remote Work Platform

A comprehensive remote work collaboration platform with real-time chat, video conferencing, and workspace management. Built with modern technologies for seamless remote team collaboration.

## 🚀 Features

- **Real-time Chat** - Instant messaging with Socket.io
- **Video Conferencing** - WebRTC-based video calls with multiple participants
- **Authentication** - Secure user authentication with Supabase
- **Workspaces** - Organize teams into dedicated collaboration spaces
- **Modern UI/UX** - Professional design with Tailwind CSS and smooth animations
- **Real-time Updates** - Instant synchronization across all connected users

## 📁 Project Structure

```
project/
├── backend/                 # Node.js + Express + Socket.io server
│   ├── server.js           # Main server file with chat & video logic
│   ├── config/
│   │   └── supabase.js     # Supabase configuration
│   ├── package.json
│   └── README.md
│
└── frontend/               # React + Tailwind CSS application
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   ├── services/       # Socket.io service
    │   └── config/         # Configuration files
    ├── package.json
    └── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **Supabase** - Backend as a Service (database & auth)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication
- **WebRTC** - Video conferencing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

## 🚀 Quick Start

### 1. Clone or Setup Project

Ensure you have the project structure with `backend/` and `frontend/` folders.

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

Start backend:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SERVER_URL=http://localhost:8080
```

Start frontend:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 4. Setup Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to SQL Editor and run the following:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace members table
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Messages table
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

-- Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view workspaces they're members of" ON workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view messages in their workspaces" ON messages
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );
```

## 📖 Usage

### Getting Started

1. **Sign Up**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Select Workspace**: Choose or create a workspace
4. **Start Chatting**: Click on "Real-time Chat" to start messaging
5. **Video Call**: Click on "Video Conference" to start a video call

### Features Guide

#### Real-time Chat
- Join workspace chat rooms
- Send and receive instant messages
- See when users join/leave
- Message timestamps
- Real-time updates

#### Video Conferencing
- Start or join video calls
- Toggle video/audio
- Multiple participants support
- Grid layout for participants
- End call functionality

#### Workspaces
- Create new workspaces
- Join existing workspaces
- Switch between workspaces
- Workspace-specific collaboration

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:
- `PORT` - Server port (default: 8080)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key

### Frontend Configuration

Edit `frontend/.env`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SERVER_URL` - Backend server URL

## 🔒 Security

- All authentication handled by Supabase
- Row Level Security (RLS) enabled on all tables
- Secure WebSocket connections
- Environment variables for sensitive data
- CORS protection

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8080 is available
- Verify environment variables are set
- Run `npm install` to ensure dependencies are installed

### Frontend connection issues
- Ensure backend is running on correct port
- Check `VITE_SERVER_URL` in frontend `.env`
- Verify CORS settings in backend

### Video call not working
- Allow camera/microphone permissions in browser
- Use HTTPS or localhost (required for WebRTC)
- Check browser compatibility (Chrome recommended)

### Database errors
- Verify Supabase credentials
- Check if tables are created
- Ensure RLS policies are set up correctly

## 📝 Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

Frontend:
```bash
cd frontend
npm run dev  # Uses Vite with hot reload
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend (use PM2 or similar):
```bash
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Supabase for backend services
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the README files in backend/ and frontend/
- Ensure all dependencies are properly installed
- Verify environment variables are correctly set

---

**Happy Collaborating! 🚀**
