# 🎬 MovieRater

MovieRater is a full-stack web application that lets users browse the latest movies, leave 1–10 star ratings (with or without comments), and read reviews from other users. Built to sharpen my skills in **React**, **Flask**, and **MongoDB**, it’s designed to be clean, scalable, and eventually deployable for real-world use.

---

## ⚙️ Tech Stack

### 🖥 Frontend

- **React** (Vite)
- **React Router**
- **Axios**
- **Tailwind CSS** (or Bootstrap)

### 🧠 Backend

- **Flask** + **Flask-CORS**
- **JWT Authentication** (`flask-jwt-extended`)
- **MongoDB** (hosted via Atlas)
- **Password Hashing** (`flask-bcrypt`)
- **RESTful API**

### ☁️ Deployment (Coming Soon)

- **Frontend**: Vercel or Netlify
- **Backend**: Render
- **Database**: MongoDB Atlas (Free Tier)

---

## 🔐 Core Features

- 🧾 **User Authentication** — Signup, login, and JWT-based route protection
- 🎥 **Browse Movies** — Scroll through a catalog of the latest films (fetched via TMDB or mock data)
- ⭐ **Rate Movies** — Submit a score from 1 to 10 with an optional comment
- 💬 **See Reviews** — View public feedback from other users
- 🔒 **Secure** — Passwords are hashed and protected with JWT auth
