# Conversation Flow System

A scalable backend system for a **modular, state-driven conversation engine**, where questions form a graph and user progression is deterministic and auditable.

Built as part of a Backend Engineer (Junior) take-home assignment.

---

## 🚀 Key Highlights

* Graph-based conversation engine (state machine model)
* Strict separation of **state vs history (immutable logging)**
* Checkpoint-aware navigation with controlled rollback
* Defensive handling of invalid flows and broken references
* Extensible across modules and conversation flows

---

## 🛠 Tech Stack

* Node.js, Express
* MongoDB, Mongoose
* Joi (validation)

---

## ⚙️ Setup

```bash
git clone <your-repo-url>
cd conversation-flow
npm install
```

Create `.env`:

```
MONGO_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
```

Run:

```bash
npm run seed
npm run dev
```

---

## 📡 API

| Method | Endpoint                               | Description                |
| ------ | -------------------------------------- | -------------------------- |
| POST   | `/modules/:moduleId/start`             | Start module               |
| POST   | `/answer`                              | Submit answer              |
| GET    | `/users/:userId/current`               | Current question           |
| GET    | `/users/:userId/history`               | Full history               |
| GET    | `/users/questions/:questionId?userId=` | Deep link                  |
| POST   | `/go-back`                             | Go back (checkpoint-aware) |

---

## 🧠 Architecture

### State vs History

* `User` → current position
* `History` → append-only log

Ensures scalability and auditability.

---

## 🗺 Conversation Flow Diagram

```mermaid
flowchart TD
  A1["Q1: What is your name?"] -->|Option A: Go to Q2| A2
  A1 -->|Option B: Go to Q3| A3

  A2["Q2: What is your age? ✅ checkpoint"] -->|Option A: Go to Q3| A3

  A3["Q3: What is your location?"] -->|Option A: Stay in Module A| A3
  A3 -->|Option B: Go to Module B| B1

  B1["Q4: Years of experience?"] -->|Any option| B2

  B2["Q5: Final question ⏹ terminal"]

  style A2 fill:#EEEDFE,stroke:#534AB7,color:#26215C
  style B2 fill:#E1F5EE,stroke:#0F6E56,color:#04342C
```

> **Checkpoint (purple):** go-back cannot move past this point.  
> **Terminal (green):** flow ends here, no next question.
>
> 
### Graph-Based Flow

* Questions = nodes
* Options = edges
* Supports cross-module navigation and terminal states

---

### Checkpoints

* Stored as `checkpointQuestionIds[]`
* Prevents invalid rollback
* History remains unchanged

---

### Deep Link Handling

* Invalid/stale → fallback to current
* Always returns safe state (`redirected: true`)

---

### Defensive Handling

* Invalid input → 400
* Missing data → 400
* Not found → 404
* Broken references → fallback

---

## 🧪 Testing

* Postman tested
* Edge cases validated
* Automated test coverage included

---

## 📁 Structure

```
src/
├── controllers/
├── services/
├── models/
├── routes/
├── config/
└── tests/
```

---

## 💡 Principles

* Backend is source of truth
* History is immutable
* State transitions are deterministic
* System is extensible

---

## 📌 Note

Focus is on **correctness, reliability, and clean architecture** rather than quick implementation.
