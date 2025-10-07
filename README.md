# Matcha - Modern Dating Platform 💕

**Matcha** is a comprehensive, full-stack dating web application that combines modern web technologies to create an engaging social platform for discovering and connecting with like-minded people. Built with a focus on real-time interactions, smart matching algorithms, and user experience.

---

## 🚀 What is Matcha?

Matcha is a feature-rich dating platform where users can:

### Core Features
- **🔐 Secure Authentication:** Email registration with confirmation, password recovery, and OAuth integration (Google & 42 Intra)


<p align="center">
  <img width="800" alt="Image 1" src="https://github.com/user-attachments/assets/de18ac62-5311-40c2-8aeb-bfa9fbab62e0" />
  <img width="198" alt="Image 2" src="https://github.com/user-attachments/assets/05dcd5dd-f027-42c2-9c55-dee545de3b9b" />
</p>

- **👤 Complete Profile System:** Customizable profiles with photos, biography, tags, location, and personal preferences

<p align="center">
  <img width="795" alt="Image 1" src="https://github.com/user-attachments/assets/5adc6458-0e42-4538-8590-a935bd1a479b" />
  <img width="200" alt="Image 2" src="https://github.com/user-attachments/assets/30139525-c6a4-41fd-9b9e-3a89dbadf3f2" />
</p>

- **🎯 Smart Matching Algorithm:** Advanced user suggestions based on:
  - Sexual orientation compatibility
  - Geographic proximity (with distance calculation)
  - Shared interests and tags
  - Fame rating and popularity
  - Age preferences
 
<p align="center">
  <img width="800" alt="Image 1" src="https://github.com/user-attachments/assets/f93a08d6-c687-4846-9e0f-315769e6c627" />
  <img width="198" alt="Image 2" src="https://github.com/user-attachments/assets/418eeff9-6523-4f99-93f6-e276eafacceb" />
</p>
    
- **💬 Real-Time Chat System:** Instant messaging with:
  - Text messages with profanity filtering
  - Voice message recording and playback
  - Audio file uploads (MP3, WAV, MP4, AAC, OGG, WebM)
  - Event scheduling within chats
  - Online/offline status indicators
 
<p align="center">
  <img width="650" alt="Image 1" src="https://github.com/user-attachments/assets/30c7d0b3-75fa-418f-9a78-f491e0cdc059" />
  <img width="160" alt="Image 2" src="https://github.com/user-attachments/assets/25773cfd-ed42-44b5-aa0d-5f61039670ed" />
  <img width="160" alt="Image 2" src="https://github.com/user-attachments/assets/d0b2068e-e684-45a6-85d8-2d7d6d08d544" />
</p>
  
- **🔔 Live Notification System:** Real-time notifications for:
  - Profile likes and dislikes
  - Profile views
  - Messages and voice messages
  - Matches and events
 
<p align="center">
  <img width="198" alt="Image 1" src="https://github.com/user-attachments/assets/5c562f5f-fd9a-4d2c-b8ad-fdc4b137c71d" />
  <img width="800" alt="Image 2" src="https://github.com/user-attachments/assets/abdfa5bd-f840-45ba-b588-ed06d0c8fe03" />
</p>
  
- **🗺️ Interactive Geolocation:**
  - Automatic location detection via GPS
  - IP-based fallback location
  - Manual location selection with interactive maps
  - Distance-based filtering and sorting
 
<p align="center">
  <img width="800" alt="Image 1" src="https://github.com/user-attachments/assets/f4bcf7b6-9140-48f6-bb40-05a57c576803" />
  <img width="198" alt="Image 2" src="https://github.com/user-attachments/assets/07b3cf66-69dd-4126-9344-ff50eceb8be0" />
</p>

- **🔍 Advanced Search & Filtering:**
  - Age range filtering
  - Distance-based proximity search
  - Fame rating filters
  - Tag-based search
  - Multiple sorting options
- **🖼️ Media Management:**
  - Profile picture uploads
  - Multiple photo galleries (up to 5 images)
  - Image deletion and management
- **⚡ Real-Time Interactions:**
  - Like/dislike system with instant feedback
  - Match detection and notifications
  - User blocking and reporting
  - Profile view tracking

---

## 🛠️ Technology Stack

### **Backend (Python)**
- **Framework:** Flask 2.3.2
- **Real-Time:** Flask-SocketIO 5.3.6 + Eventlet 0.36.1
- **Database:** PostgreSQL with psycopg2-binary 2.9.6
- **Authentication:** 
  - BCrypt 4.1.2 for password hashing
  - OAuth2 via requests-oauthlib 1.3.1 (Google & 42 Intra)
  - Session-based authentication
- **Email:** SMTP integration for confirmations and password resets
- **Data Generation:** Faker 24.8.0 for development seeding
- **Security:** Environment-based configuration with python-dotenv 1.0.0
- **CORS:** Flask-CORS for cross-origin requests

### **Frontend (TypeScript + React)**
- **Framework:** React 19.1.0 with TypeScript
- **Build Tool:** Vite 6.3.5 for fast development and optimized builds
- **Styling:** TailwindCSS 4.1.8 for modern, responsive design
- **State Management:** 
  - React Context API for profile management
  - Redux Toolkit 2.8.2 for notifications
  - Custom hooks for data fetching
- **Real-Time:** Socket.IO Client 4.8.1 for live messaging and notifications
- **Routing:** React Router DOM 7.6.2 for SPA navigation
- **Maps & Geolocation:** 
  - React-Leaflet 5.0.0 for interactive maps
  - Leaflet 1.9.4 for geolocation features
- **Media & Interactions:**
  - MediaRecorder API for voice recording
  - Framer Motion 12.16.0 for smooth animations
  - Bad-words 4.0.0 for content filtering
- **Security:** zxcvbn 4.4.2 for password strength validation
- **Icons:** React Icons 5.5.0 + Lucide React 0.513.0

### **DevOps & Infrastructure**
- **Containerization:** Docker + Docker Compose for multi-service orchestration
- **Database:** PostgreSQL with automated initialization scripts
- **Development:** Hot-reload for both frontend and backend
- **Build Process:** Automated with Makefile for easy deployment
- **File Storage:** Volume mounting for persistent data and uploads

### **External Services**
- **Geolocation:** ipapi.co for IP-based location detection
- **Maps:** OpenStreetMap with CartoDB tiles for clean visualization
- **Email:** SMTP (Gmail) for transactional emails
- **OAuth Providers:** Google OAuth 2.0 and 42 Intra integration

---

## ✨ Advanced Features

### **🧠 Smart Matching Algorithm**
- **Multi-factor scoring** based on proximity, shared interests, and compatibility
- **Haversine formula** for accurate distance calculations between users
- **Dynamic fame rating** system that updates based on user interactions
- **Advanced SQL queries** with geographic calculations and complex filtering

### **🎙️ Audio Messaging System**
- **Real-time voice recording** with MediaRecorder API
- **Audio format support:** WebM, MP3, WAV, MP4, AAC, OGG (up to 10MB)
- **Professional audio controls:** Record, preview, send, and delete
- **Cross-browser compatibility** with fallback format detection

### **🗺️ Geolocation & Mapping**
- **Multi-layered location detection:**
  1. GPS-based precise location
  2. IP-based approximate location fallback
  3. Manual location selection with interactive maps
- **Interactive Leaflet maps** with custom markers and popups
- **Real-time distance calculation** and display
- **Location-based filtering** with customizable radius

### **🔔 Real-Time Notification Engine**
- **Socket.IO-based** instant notification delivery
- **Multiple notification types:** likes, views, messages, matches, events
- **Persistent notification storage** with read/unread tracking
- **Real-time badge updates** in navigation bar
- **Cross-tab synchronization** for consistent user experience

### **🔒 Security & Privacy**
- **Comprehensive email validation** with regex patterns
- **Strong password requirements** with real-time strength checking
- **Account confirmation** flow with secure token generation
- **OAuth integration** for secure third-party authentication
- **User blocking and reporting** system for safety
- **Session-based authentication** with secure cookie handling

---

## 🏗️ Architecture

### **Database Schema**
```
Users: Core user information, authentication, location, preferences
Messages: Chat messages with support for text and audio types
Chats: Chat rooms and membership management
User_Tags: Many-to-many relationship for user interests
Likes/Dislikes: User interaction tracking
Notifications: Real-time notification storage
User_Blocks: User blocking and reporting system
```

### **API Structure**
```
/auth/* - Authentication endpoints (register, login, reset password)
/oauth/* - OAuth provider callbacks (Google, 42 Intra)
/profile/* - User profile management
/pictures/* - Image upload and management
/users/* - User discovery, likes, views, blocking
/chats/* - Messaging system with audio support
/tags/* - Tag management and suggestions
/reminder/* - Notification system
```

### **Real-Time Events**
```
Chat Socket: join, leave, send_message, receive_message
Notification Socket: register_reminder, send_reminder, receive_reminder
Connection management with automatic reconnection
```

---

## 🧑‍💻 Quick Start

### **Prerequisites**
- Docker and Docker Compose
- Git

### **Installation**

1. **Clone the repository:**
```bash
git clone https://github.com/adiaz-uf/Dating-WebApp.git
cd Dating-WebApp
```

2. **Set up environment variables:**
```bash
cp .env-example .env
# Edit .env with your configuration (database, email, OAuth credentials)
```

3. **Build and run with Docker:**
```bash
make
```

4. **Access the application:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

### **Development Commands**
```bash
make restart    # Restart all services
make stop       # Stop all services
make down       # Stop and remove containers
make fclean     # Complete cleanup (removes data)
make re         # Full rebuild
```

---

## 📁 Project Structure

```
matcha/
├── Backend/                 # Flask API server
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── sockets/        # Real-time event handlers
│   │   └── Utils/          # Helper functions
│   ├── uploads/            # File storage
│   └── run.py             # Application entry point
├── Frontend/               # React application
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature-specific modules
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and helpers
│   │   └── store/         # State management
│   └── public/            # Static assets
├── Docker/                 # Container configurations
├── data/                   # Persistent database storage
└── docker-compose.yml      # Service orchestration
```

---

## 🌟 Highlights

This project demonstrates:

- **Full-stack development** with modern technologies
- **Real-time web application** architecture
- **Complex database relationships** and queries
- **Geospatial data processing** and visualization
- **File upload and media handling**
- **OAuth integration** and security best practices
- **Responsive design** and user experience
- **Docker containerization** and deployment
- **WebRTC-like features** with audio messaging
- **Advanced filtering and search** algorithms

**Matcha** represents a production-ready dating platform with enterprise-level features, demonstrating proficiency in modern web development, database design, real-time communications, and user experience design.
