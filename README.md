# Storyteller - Voice-Only Storytelling App

A voice-first storytelling application that allows users to listen to personalized stories, interact via voice commands, and access a rich library of content. Built with React and Node.js/Express.

## Features

- **Voice-First Interaction**: Control the app entirely by voice — play, pause, skip, search, and browse stories using natural voice commands
- **Story Library**: Browse and filter stories by genre, author, or keyword search
- **Audio Playback**: Read-aloud functionality using Text-to-Speech (Web Speech API)
- **Personalization**: Save favorite genres, preferred narrator voice, and audio speed preferences
- **Recommendations**: Get personalized story recommendations based on your preferences and listening history
- **Listening History**: Track your progress across stories
- **JWT Authentication**: Secure signup/login with token-based authentication
- **Accessible Design**: Minimal, dark-themed UI with large touch targets and ARIA labels

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios, Web Speech API
- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Auth**: JWT (jsonwebtoken), bcryptjs
- **Testing**: Jest, Supertest

## Project Structure

```
storyteller/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server entry point
│   │   ├── config/
│   │   │   ├── auth.js            # JWT configuration
│   │   │   └── database.js        # SQLite setup & schema
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification middleware
│   │   ├── models/
│   │   │   ├── User.js            # User CRUD & password hashing
│   │   │   ├── Story.js           # Story CRUD & filtering
│   │   │   └── Preference.js      # User preferences & history
│   │   ├── routes/
│   │   │   ├── auth.js            # Signup, login, profile
│   │   │   ├── stories.js         # Story management
│   │   │   ├── users.js           # Preferences & recommendations
│   │   │   └── voice.js           # Voice command processing
│   │   └── services/
│   │       ├── recommendation.js  # Story recommendation engine
│   │       └── voiceProcessor.js  # Voice command parser
│   └── tests/
│       ├── auth.test.js
│       ├── stories.test.js
│       └── voice.test.js
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                # Routes & navigation
│   │   ├── App.css                # Dark theme styles
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Library.jsx        # Story browsing & search
│   │   │   ├── Player.jsx         # Playback & voice controls
│   │   │   ├── Settings.jsx       # User preferences
│   │   │   ├── VoiceControl.jsx   # Floating mic button
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   └── services/
│   │       ├── api.js             # API client
│   │       └── voice.js           # Web Speech API wrapper
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Backend Setup

```bash
cd backend
npm install
npm start          # Starts on port 3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Starts on port 5173 (proxies /api to backend)
```

### Run Tests

```bash
cd backend
npm test           # Runs 30 backend tests
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register a new user |
| POST | /api/auth/login | Login with credentials |
| GET | /api/auth/me | Get current user profile |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stories | List stories (filter: genre, author, search) |
| GET | /api/stories/genres | List available genres |
| GET | /api/stories/:id | Get a single story |
| POST | /api/stories | Create a story (auth required) |
| PUT | /api/stories/:id | Update a story (auth required) |
| DELETE | /api/stories/:id | Delete a story (auth required) |

### User Preferences
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/preferences | Get user preferences |
| PUT | /api/users/preferences | Update preferences |
| POST | /api/users/history | Record listening progress |
| GET | /api/users/history | Get listening history |
| GET | /api/users/recommendations | Get personalized recommendations |

### Voice
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/voice/command | Process a voice command |
| POST | /api/voice/tts | Text-to-Speech (placeholder) |
| POST | /api/voice/stt | Speech-to-Text (placeholder) |

## Voice Commands

The app supports the following voice commands:
- **"Play [story name]"** — Start playing a specific story
- **"Play something in [genre]"** — Play a story from a genre
- **"Pause"** / **"Resume"** — Control playback
- **"Skip"** / **"Next"** — Skip to next story
- **"Repeat"** — Replay current story
- **"Stop"** — Stop playback
- **"Search for [query]"** — Search stories
- **"Speed up"** / **"Slow down"** — Adjust playback speed

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| JWT_SECRET | (dev default) | JWT signing secret |
| DB_PATH | data/storyteller.sqlite | SQLite database path |

## License

ISC