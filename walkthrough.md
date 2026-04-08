# ChatApp — Full-Stack Real-Time Chat Application

## Summary

Built a complete real-time one-to-one chat application with a **Spring Boot 3.4.4 backend** (MySQL + JPA) and a **React 18 + Vite frontend** (Tailwind CSS). Includes JWT authentication, WebSocket messaging via STOMP/SockJS, and online user tracking.

---

## Project Structure

```
CHATTING APP/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/chatapp/
│       │   ├── ChatAppApplication.java
│       │   ├── config/       → SecurityConfig, WebSocketConfig
│       │   ├── controller/   → AuthController, UserController, MessageController
│       │   ├── service/      → AuthService, UserService, MessageService
│       │   ├── repository/   → UserRepository, MessageRepository
│       │   ├── model/        → User, Message (JPA entities)
│       │   ├── security/     → JwtUtil, JwtFilter
│       │   └── websocket/    → WebSocketController, WebSocketEventListener
│       └── resources/application.properties
│
└── frontend/
    ├── package.json, vite.config.js, index.html
    ├── tailwind.config.js, postcss.config.js
    └── src/
        ├── main.jsx, App.jsx
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── pages/        → Login, Register, Chat
        ├── components/   → UserList, ChatBox, MessageInput
        ├── websocket/socket.js
        └── styles/index.css
```

---

## API Endpoints

| Method | Endpoint             | Auth     | Description                        |
|--------|----------------------|----------|------------------------------------|
| POST   | `/auth/register`     | Public   | Register new user                  |
| POST   | `/auth/login`        | Public   | Login, returns JWT                 |
| GET    | `/users`             | JWT      | List all users except current      |
| POST   | `/messages/send`     | JWT      | Send message + WebSocket broadcast |
| GET    | `/messages/{user}`   | JWT      | Chat history (20 messages, desc)   |
| WS     | `/ws`                | JWT/STOMP| WebSocket endpoint (SockJS)        |

---

## MongoDB → MySQL Migration

All 7 files were updated to replace MongoDB with MySQL + Spring Data JPA:

| File | Change |
|------|--------|
| `pom.xml` | `spring-boot-starter-data-mongodb` → `spring-boot-starter-data-jpa` + `mysql-connector-j` |
| `application.properties` | MongoDB URI → MySQL datasource + JPA/Hibernate config |
| `User.java` | `@Document` → `@Entity @Table(name="users")`, `String id` → `Long id` with `@GeneratedValue(IDENTITY)` |
| `Message.java` | `@Document` → `@Entity @Table(name="messages")`, `String id` → `Long id`, added `columnDefinition="TEXT"` |
| `UserRepository.java` | `MongoRepository<User, String>` → `JpaRepository<User, Long>` |
| `MessageRepository.java` | `MongoRepository` + `@Query` → `JpaRepository` + derived query method |
| `MessageService.java` | Removed `Pageable` import, calls new JPA query method |

> [!IMPORTANT]
> No changes were made to controllers, JWT logic, SecurityConfig, WebSocketConfig, or frontend code.

---

## MySQL Schema (Auto-created by Hibernate)

**users table:**
| Column   | Type         | Constraints            |
|----------|-------------|------------------------|
| id       | BIGINT      | PK, AUTO_INCREMENT     |
| username | VARCHAR(255)| UNIQUE, NOT NULL       |
| password | VARCHAR(255)| NOT NULL               |

**messages table:**
| Column    | Type         | Constraints        |
|-----------|-------------|---------------------|
| id        | BIGINT      | PK, AUTO_INCREMENT  |
| sender    | VARCHAR(255)| NOT NULL            |
| receiver  | VARCHAR(255)| NOT NULL            |
| content   | TEXT        | NOT NULL            |
| timestamp | DATETIME(6) | NOT NULL            |

---

## Setup Instructions

### Prerequisites
- JDK 21+
- MySQL 8.x running on `localhost:3306`
- Node.js 18+

### Backend Setup
1. Create MySQL database:
   ```sql
   CREATE DATABASE chatapp;
   ```
2. Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```
3. Run the backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Tables are auto-created via `ddl-auto=update`.

### Frontend Setup
1. Install dependencies (already done):
   ```bash
   cd frontend
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173`

---

## Key Design Decisions

- **Stateless JWT auth** — no sessions, token in `Authorization: Bearer` header
- **STOMP CONNECT headers** — JWT validated via `ChannelInterceptor` on WebSocket handshake
- **In-memory online tracking** — `ConcurrentHashMap.newKeySet()` for thread safety
- **Vite proxy** — API and WS requests proxied to backend at `:8080`
- **Glassmorphism UI** — dark theme with blur effects, gradient accents, micro-animations
