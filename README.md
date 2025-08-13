# Matcha

**Matcha** is a modern, social dating platform inspired by the best apps in the industry, allowing users to discover, connect, and chat in real time with like-minded people. The project is a fullstack web application, using Typescript (React), Python (Flask) and PostgreSQL.

---

## 🚀 What is Matcha?

Matcha is a web dating app where users can:
- Register and create a personalized profile with photos, bio, tags, and preferences.
- Browse and discover suggested profiles based on sexual orientation, geographic proximity, shared interests, and popularity.
- Interact through likes, dislikes, notifications, and reports.
- Chat in real time thanks to socket integration.
- Manage privacy and security with email confirmation, password recovery, and OAuth authentication.

---

## 🛠️ Technologies Used

**Backend:**
- Python 3.12 + Flask
- Flask-SocketIO (real-time chat)
- PostgreSQL (relational database)
- Advanced SQL queries for smart suggestions
- JWT and OAuth (Google) authentication
- Docker for containerization

**Frontend:**
- React + TypeScript
- Vite (fast development environment)
- socket.io-client (instant messaging)
- TailwindCSS (modern, responsive styles)
- Context API and custom hooks for state management

**DevOps:**
- Docker Compose (service orchestration)
- Database initialization and migration scripts

---

## ✨ Key Features

- **Smart Suggestions:** Profiles are filtered by gender, sexual orientation, proximity, shared interests, and fame rating.
- **Real-Time Chat:** Instant messaging between users with online/offline status notifications.
- **Geolocation:** Automatic location detection and search for nearby profiles.
- **Secure Authentication:** Email registration, confirmation, password recovery, and social login with Google.
- **Notification System:** Likes, visits, messages, and reports managed in real time.
- **Advanced User Panel:** Profile editing, image uploads, tag and preference selection.

---

## 🧑‍💻 How to Use


```bash
git clone https://github.com/adiaz-uf/Dating-WebApp.git
cd Dating-WebApp
make
```