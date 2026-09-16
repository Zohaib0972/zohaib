# Therapy Hub - Clinical Management & Attendance Portal

A modern, full-stack clinic management system designed for therapy centers. Features clinical schedule management, patient booking, geolocation-verified staff attendance check-in/out, multi-device real-time sync (Server-Sent Events), customizable themes, and printable clinical rosters.

---

## 🚀 Quick Start (Local Machine)

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **bun** or **yarn**

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Run in Production Mode
```bash
npm run build
npm start
```

---

## 📦 How to Upload this Project to GitHub

Follow these steps to upload this codebase to your own GitHub repository:

### Step 1: Initialize Git (in your project folder)
```bash
git init
```

### Step 2: Add all files & make initial commit
```bash
git add .
git commit -m "Initial commit: Therapy Hub Portal"
```

### Step 3: Create a new repository on GitHub
1. Go to [https://github.com/new](https://github.com/new)
2. Enter repository name (e.g. `therapy-hub-portal`)
3. Choose **Public** or **Private**
4. **Do NOT** check "Add a README file", ".gitignore", or "license" (we already have them)
5. Click **Create repository**

### Step 4: Link your local repository to GitHub & Push
```bash
# Rename branch to main (if not already)
git branch -M main

# Add your GitHub repository URL (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/therapy-hub-portal.git

# Push the code to GitHub
git push -u origin main
```

---

## 🌐 Deploying the Website

### Option 1: Render / Railway / Koyeb (Recommended for Full-Stack Node.js)
Because this app includes both the Vite frontend and an Express server with real-time SSE updates:
1. Connect your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm start`
4. Set **Port**: `3000` (or leave default if the platform auto-detects `process.env.PORT`)

### Option 2: Vercel / Netlify (Client-Only Deployment)
If you want to host only the frontend statically:
1. Connect your GitHub repository to Vercel / Netlify.
2. Build Command: `npm run build:client`
3. Output Directory: `dist`

---

## 🔑 Default Login Accounts

| Role | Username / ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access: edit all therapists, shifts, attendance, users |
| **Therapist** | `t-faiza` | `faiza123` | Individual therapist schedule & check-in/out |
| **Therapist** | `t-ayesha` | `ayesha123` | Individual therapist schedule & check-in/out |

---

## 🛠 Available Scripts

- `npm run dev` - Starts full-stack dev server on port 3000 with live reload.
- `npm run build` - Builds production frontend via Vite and bundles backend via esbuild into `dist/server.cjs`.
- `npm run build:client` - Builds only the static frontend assets into `dist/`.
- `npm start` - Runs the bundled production server (`dist/server.cjs`).
- `npm run lint` - Runs TypeScript type checking across the codebase.

---

## 📁 Project Structure

```
├── data/                  # Server-side persistence storage (clinic_data.json)
├── public/                # Static assets (favicons, images, logos)
├── src/
│   ├── assets/            # Component-level visual assets
│   ├── components/        # React components
│   │   ├── AttendancePortal.tsx   # Geofenced check-in / check-out portal
│   │   ├── ClinicalPrintModal.tsx # PDF & clinical roster print layout
│   │   ├── LoginScreen.tsx        # Secure authentication screen
│   │   ├── ManageUsersModal.tsx   # Staff & admin account management
│   │   ├── PrintAllStaffView.tsx  # Multi-staff master print view
│   │   ├── ScheduleTable.tsx      # Main schedule table & day column boxes
│   │   └── Sidebar.tsx            # Navigation & therapist selector
│   ├── data/
│   │   └── initialData.ts         # Default clinic schedules & staff data
│   ├── types.ts           # TypeScript interfaces & types
│   ├── utils/
│   │   ├── realtimeSync.ts        # SSE & multi-tab synchronization
│   │   └── scheduleUtils.ts       # Timing, slot & CSV export utilities
│   ├── App.tsx            # Main application orchestrator
│   └── main.tsx           # React DOM entry point
├── server.ts              # Express backend with SSE real-time sync & static fallback
├── package.json           # Dependencies & build scripts
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite build configuration
```
