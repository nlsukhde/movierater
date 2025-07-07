# RateMyReel

A modern full-stack movie rating application where users can browse movies, submit ratings and reviews, and view community feedback—all with minimal setup.

**Live Demo:** [https://ratemyreel.vercel.app/](https://ratemyreel.vercel.app/)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Getting Started](#getting-started)

   - [Prerequisites](#prerequisites)
   - [Clone Repository](#clone-repository)
   - [Environment Variables](#environment-variables)
   - [Install Dependencies](#install-dependencies)
   - [Database & Auth Setup (Supabase)](#database--auth-setup-supabase)
   - [Running Locally](#running-locally)

5. [Deployment](#deployment)

   - [Frontend (Vercel)](#frontend-vercel)
   - [Backend (Render)](#backend-render)

6. [Contributing](#contributing)
7. [License](#license)

---

## Features

- **User Authentication**: Sign up, log in, and manage sessions via Supabase Auth
- **Movie Browsing**: Search and browse movie details powered by the TMDB API
- **Ratings & Reviews**: Submit and edit your own ratings (1–10 stars) and written reviews
- **Average Scores**: Community-average ratings displayed in real time
- **Responsive UI**: Built with React + Vite + TypeScript for snappy, mobile-friendly interactions
- **Secure Backend**: Python Flask API handles TMDB requests and enforces access with Supabase

---

## Tech Stack

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Frontend        | React, Vite, TypeScript         |
| Styling         | Tailwind CSS, Shadcn/UI         |
| Backend API     | Python, Flask, Requests         |
| Database & Auth | Supabase (PostgreSQL + Auth)    |
| External APIs   | TMDB (The Movie Database)       |
| Deployment      | Vercel (frontend), Render (API) |

---

## Architecture Overview

```text
┌──────────────┐      HTTPS      ┌───────────────┐      SQL      ┌──────────────┐
│   Frontend   │ <------------> │ Flask API     │ <----------> │ Supabase DB │
│ (React / TS) │                │ (Render)      │             │ + Auth       │
└──────────────┘                └───────────────┘                └──────────────┘
       │                                    │
       │ TMDB API                           │
       └────────────> Requests to TMDB <────┘
```

1. **Frontend** makes requests to the Flask API (hosted on Render), which in turn fetches data from TMDB.
2. **Authentication** flows directly between the frontend and Supabase—no custom token handling required.
3. **User data** (profiles, reviews, ratings) lives in Supabase PostgreSQL tables.

---

## Getting Started

### Prerequisites

- Node.js v18+ & npm
- Python 3.9+
- Supabase account & project
- TMDB API key
- Render account (for backend)
- Vercel account (for frontend)

### Clone Repository

```bash
git clone https://github.com/yourusername/ratemyreel.git
cd ratemyreel
```

### Environment Variables

1. **Frontend**: create a `.env.local` in the `client/` folder:

   ```ini
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   VITE_API_URL=https://<your-render-service>.onrender.com/api
   ```

2. **Backend**: create a `.env` in the `server/` folder:

   ```ini
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
   TMDB_API_KEY=<your-tmdb-api-key>
   ```

### Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
pip install -r requirements.txt
```

### Database & Auth Setup (Supabase)

1. **Initialize your database**: run any migrations or use the Supabase dashboard to create tables:

   ```sql
   -- users (managed by Supabase Auth)
   -- reviews table example:
   create table reviews (
     id uuid primary key default uuid_generate_v4(),
     user_id uuid references auth.users(id),
     movie_id int not null,
     rating int check (rating between 1 and 10),
     comment text,
     created_at timestamp with time zone default now(),
     unique (user_id, movie_id)
   );
   ```

2. **Enable Auth providers**: email/password is enabled out of the box.

### Running Locally

1. **Start Supabase** (optional local dev):

   ```bash
   supabase start
   ```

2. **Run Flask API**:

   ```bash
   cd server
   flask run --port 8000
   ```

3. **Run React App**:

   ```bash
   cd client
   npm run dev
   ```

Navigate to [http://localhost:5173](http://localhost:5173) to see your app in action.

---

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo in Vercel.
2. Set the same environment variables in Vercel’s dashboard.
3. Build command: `npm run build`, Output directory: `dist `.

### Backend (Render)

1. Create a new Web Service in Render.
2. Link your `server/` directory repo.
3. Set environment variables in the Render dashboard.
4. Start command: `flask run --host 0.0.0.0 --port $PORT`.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
