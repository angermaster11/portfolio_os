<div align="center">

# 🖥️ Portfolio OS

**A simulated Operating System-style portfolio — built with React + Node.js**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

> An interactive, OS-themed developer portfolio with a live desktop, draggable windows, file manager, music player, AI chat, and a full admin panel to manage all content dynamically.

</div>

---

## ✨ Features

### 🖥️ Guest (Public) Experience
| Feature | Description |
|---|---|
| **Desktop OS UI** | Fully interactive simulated desktop with taskbar, start menu, and draggable windows |
| **Portfolio Showcase** | Slide-deck presentation of bio, skills, experience, and projects |
| **Project Manager** | Browse all projects with README rendering, GitHub & live deployment links |
| **File Manager** | OS-style file tree for exploring project repos cloned via GitHub |
| **Profile Viewer** | Detailed profile with social links, resume download, and contact info |
| **Music Player** | Admin-managed music tracks with playback controls |
| **AskGPT** | AI-powered chat assistant for answering portfolio questions |
| **Widget Sidebar** | Clock, calendar, and quick-access utilities |
| **Context Menu** | Right-click desktop menu with desktop customization options |

### 🔐 Admin Panel
| Feature | Description |
|---|---|
| **Profile Manager** | Edit name, bio, photo, skills, education, experience, and social links |
| **Project Manager** | Add/edit/delete showcase projects with deployment & GitHub links |
| **Project Tree** | Clone GitHub repos and browse them like a filesystem |
| **Music Admin** | Upload and manage background music tracks |
| **Presentation Admin** | Control the portfolio slideshow presentation |
| **Auth** | JWT-based secure login for admin access |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI framework
- **Vite 8** — Lightning-fast build tool
- **Vanilla CSS** — Custom OS-style design system (no CSS framework)
- **React Markdown** — README rendering inside the app

### Backend
- **Node.js + Express 5** — REST API server
- **MongoDB + Mongoose** — Database & ODM
- **JWT + bcrypt** — Authentication & password hashing
- **Multer** — File/image uploads
- **dotenv** — Environment variable management

---

## 📁 Project Structure

```
portfolio/
├── frontend/                  # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── guest/         # Public OS apps (Desktop, FileManager, etc.)
│   │   │   ├── admin/         # Admin panel components
│   │   │   ├── common/        # Shared components
│   │   │   ├── boot/          # Boot screen
│   │   │   └── mode/          # Guest/Admin mode switch
│   │   ├── hooks/             # Custom hooks (useApi, etc.)
│   │   └── screens/           # Top-level screen components
│   └── package.json
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/            # DB connection
│   │   ├── models/            # Mongoose models
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Login / JWT
│   │   │   ├── profile/       # Profile CRUD
│   │   │   ├── projects/      # Projects CRUD + GitHub tree
│   │   │   ├── music/         # Music management
│   │   │   ├── askgpt/        # AI chat
│   │   │   ├── presentation/  # Slideshow
│   │   │   ├── manage/        # Admin utilities
│   │   │   └── widgets/       # Widget data
│   │   ├── services/          # AI service (Gemini/OpenAI)
│   │   └── index.js           # Server entry point
│   ├── uploads/               # Uploaded files (gitignored)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18`
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- npm

---

### 1. Clone the repo

```bash
git clone https://github.com/angermaster11/portfolio.git
cd portfolio
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_super_secret_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourpassword
GEMINI_API_KEY=your_gemini_api_key   # For AskGPT feature
```

Start the backend dev server:

```bash
npm run dev
```

> Backend runs at `http://localhost:3000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs at `http://localhost:5174`

---

### 4. Seed Admin User (First Time Only)

```bash
cd backend
node src/seed.js
```

This creates the admin account using credentials from your `.env`.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Backend server port (default: 3000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AskGPT |

---

## 🌐 Deployment

### Frontend — Vercel / Netlify
```bash
cd frontend
npm run build
# Upload the dist/ folder
```

### Backend — Railway / Render
- Set all environment variables in the platform's dashboard
- Entry command: `npm start`

---

## 👤 Author

**Arju Srivastava**
- GitHub: [@angermaster11](https://github.com/angermaster11)

---

## 📄 License

This project is for personal portfolio use. Feel free to use it as inspiration.