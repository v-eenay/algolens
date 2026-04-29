# ProGyan AlgoLens - Data Flow Architecture

**Version**: 1.0  
**Last Updated**: 2024-01-15

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Primary Data Flows](#primary-data-flows)
3. [Component Interactions](#component-interactions)
4. [Real-Time Communication](#real-time-communication)
5. [Error Handling Flows](#error-handling-flows)

---

## System Overview

ProGyan AlgoLens follows a microservices architecture with clear data flow patterns between components. Data flows through multiple layers with appropriate transformations and validations at each stage.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Code Editor  │  │Visualization │  │  AI Explanation      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└────────────┬────────────────┬────────────────┬─────────────────┘
             │                │                │
             │ REST API       │ WebSocket      │ REST API
             │                │                │
┌────────────▼────────────────▼────────────────▼─────────────────┐
│                    API Gateway (Kong/Traefik)                   │
│              Rate Limiting │ Auth │ Load Balancing              │
└────────────┬────────────────┬────────────────┬─────────────────┘
             │                │                │
    ┌────────▼────────┐  ┌───▼────────┐  ┌───▼──────────┐
    │  Backend API    │  │ WebSocket  │  │  AI Service  │
    │   (FastAPI)     │  │  Server    │  │ (LangChain)  │
    └────────┬────────┘  └───┬────────┘  └───┬──────────┘
             │               │               │
             │               │               │
    ┌────────▼───────────────▼───────────────▼──────────┐
    │              Execution Engine (Python)             │
    │                  (Docker Sandbox)                  │
    └────────────────────────┬──────────────────────────┘
                             │
    ┌────────────────────────▼──────────────────────────┐
    │              Data Layer                            │
    │  PostgreSQL │ Redis │ S3/MinIO │ Pinecone         │
    └────────────────────────────────────────────────────┘
```

---

## Primary Data Flows

### Flow 1: User Authentication

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. POST /auth/login {email, password}
     ▼
┌─────────────┐
│  Frontend   │
└────┬────────┘
     │ 2. HTTP POST with credentials
     ▼
┌─────────────┐
│ API Gateway │ ──► Rate limit check
└────┬────────┘
     │ 3. Forward to backend
     ▼
┌─────────────┐
│  Backend    │ ──► 4. Query users table
└────┬────────┘         │
     │                  ▼
     │            ┌──────────────┐
     │            │  PostgreSQL  │
     │            └──────────────┘
     │ 5. Verify password hash
     │ 6. Generate JWT tokens
     │ 7. Store refresh token in Redis
     │
     ▼
┌─────────────┐
│   Redis     │ ──► Store: refresh_token:{user_id}
└─────────────┘
     │
     │ 8. Return tokens
     ▼
┌─────────────┐
│  Frontend   │ ──► Store in localStorage/cookie
└─────────────┘
```

**Data Transformations:**
1. User input → Validated credentials
2. Password → bcrypt hash comparison
3. User data → JWT payload
4. JWT payload → Signed token
5. Refresh token → Redis key-value

---

### Flow 2: Code Execution (Complete Flow)

```
┌─────────┐
│  User   │ Writes code in editor
└────┬────┘
     │ 1. Click "Execute"
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend                                                    │
│  ┌──────────────┐                                           │
│  │ Code Editor  │ ──► Validate syntax locally               │
│  └──────┬───────┘                                           │
│         │ 2. POST /execution/start                          │
│         │    {code, language, settings}                     │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  API Gateway                                                 │
│  ├─► Check rate limit (10 executions/minute)                │
│  ├─► Verify JWT token                                       │
│  └─► Forward to backend                                     │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend API                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 3. Create execution session                          │  │
│  │    session_id = UUID()                               │  │
│  │    status = "queued"                                 │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │ 4. Save to database                               │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ PostgreSQL   │ ──► INSERT INTO execution_sessions        │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 5. Enqueue Celery task                            │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │    Redis     │ ──► LPUSH execution_queue                 │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 6. Return session_id & WebSocket URL              │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend                                                    │
│  ├─► Store session_id                                       │
│  ├─► Connect to WebSocket                                   │
│  └─► Display "Execution queued..."                          │
└─────────────────────────────────────────────────────────────┘
          │
          │ 7. WebSocket connection established
          ▼
┌─────────────────────────────────────────────────────────────┐
│  WebSocket Server                                            │
│  ├─► Authenticate connection                                │
│  ├─► Subscribe to session updates                           │
│  └─► Send "connected" message                               │
└─────────────────────────────────────────────────────────────┘
          │
          │ Meanwhile, Celery worker picks up task
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Celery Worker                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 8. Dequeue task from Redis                           │  │
│  │    task = RPOP execution_queue                       │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │ 9. Update session status = "running"             │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ PostgreSQL   │ ──► UPDATE execution_sessions             │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 10. Call Execution Engine                         │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Execution Engine (Docker Container)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 11. Parse code → AST                                 │  │
│  │     Validate security (no dangerous imports)         │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │                                                    │
│         │ 12. Execute step-by-step                          │
│         │     For each line:                                │
│         │       - Capture state (variables, stack, heap)   │
│         │       - Create ExecutionStep object              │
│         │       - Send to backend via HTTP POST            │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Step 1: line 1, state {...}                          │  │
│  │ Step 2: line 2, state {...}                          │  │
│  │ Step 3: line 3, state {...}                          │  │
│  │ ...                                                   │  │
│  └──────┬───────────────────────────────────────────────┘  │
└─────────┼───────────────────────────────────────────────────┘
          │
          │ 13. Stream steps to backend
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend API                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 14. Receive execution step                           │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │                                                    │
│         │ 15. Save step to database                         │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ PostgreSQL   │ ──► INSERT INTO execution_steps           │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 16. Broadcast via WebSocket                       │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │   Redis      │ ──► PUBLISH execution:{session_id}        │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 17. Trigger AI explanation generation             │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  AI Service (Async)                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 18. Receive execution context                        │  │
│  │     {step, code, variables, stack}                   │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         │                                                    │
│         │ 19. Check cache                                   │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │    Redis     │ ──► GET explanation:{context_hash}        │
│  └──────┬───────┘                                           │
│         │ Cache miss                                        │
│         │                                                    │
│         │ 20. Retrieve relevant knowledge (RAG)             │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │   Pinecone   │ ──► Vector similarity search              │
│  └──────┬───────┘                                           │
│         │ Returns: Related algorithm concepts               │
│         │                                                    │
│         │ 21. Build prompt with context                     │
│         │ 22. Call OpenAI GPT-4                             │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │  OpenAI API  │ ──► Generate explanation                  │
│  └──────┬───────┘                                           │
│         │ Returns: Structured explanation                   │
│         │                                                    │
│         │ 23. Cache explanation                             │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │    Redis     │ ──► SET explanation:{hash} (24h TTL)      │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 24. Save to database                              │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ PostgreSQL   │ ──► INSERT INTO ai_explanations           │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 25. Send to frontend via WebSocket                │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  WebSocket Server                                            │
│  └─► Broadcast to client: ai:explanation                    │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 26. Receive step update                              │  │
│  │     Update execution timeline                        │  │
│  │     Update memory visualizer                         │  │
│  │     Update variable tracker                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 27. Receive AI explanation                           │  │
│  │     Display in explanation panel                     │  │
│  │     Highlight relevant concepts                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │
          │ Execution continues for all steps...
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Execution Engine                                            │
│  └─► 28. Execution complete                                 │
│       Return final result                                   │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend API                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 29. Update session status = "completed"              │  │
│  │     Save execution result                            │  │
│  │     Calculate statistics                             │  │
│  └──────┬───────────────────────────────────────────────┘  │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ PostgreSQL   │ ──► UPDATE execution_sessions             │
│  │              │ ──► INSERT INTO execution_results         │
│  │              │ ──► UPDATE user_progress                  │
│  └──────────────┘                                           │
│         │                                                    │
│         │ 30. Send completion message                       │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend                                                    │
│  └─► Display "Execution completed"                          │
│       Show final output                                     │
│       Enable replay controls                                │
└─────────────────────────────────────────────────────────────┘
```

**Key Data Transformations:**
1. User code → Validated code string
2. Code string → AST (Abstract Syntax Tree)
3. AST → Execution steps with state snapshots
4. Execution context → AI prompt
5. AI prompt → Structured explanation
6. Execution steps → Visualization data
7. Raw state → Formatted display data

---

### Flow 3: Real-Time Visualization Update

```
Execution Step Generated
         │
         ▼
┌─────────────────┐
│ Execution Engine│
└────────┬────────┘
         │ State snapshot: {variables, stack, heap}
         ▼
┌─────────────────┐
│  Backend API    │ ──► Transform state to visualization format
└────────┬────────┘
         │
         ├─► Identify data structures (array, tree, graph)
         ├─► Calculate layout coordinates
         ├─► Generate animation transitions
         │
         ▼
┌─────────────────┐
│   WebSocket     │ ──► Broadcast: visualization:update
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │
│ ┌─────────────┐ │
│ │Visualization│ │ ──► 1. Receive update
│ │   Engine    │ │ ──► 2. Select appropriate renderer
│ └─────────────┘ │ ──► 3. Apply layout algorithm
│                 │ ──► 4. Calculate animations
│                 │ ──► 5. Render to canvas/SVG
└─────────────────┘
```

---

### Flow 4: Adaptive Learning Feedback Loop

```
User provides feedback on explanation
         │
         ▼
┌─────────────────┐
│   Frontend      │ ──► POST /feedback {helpful: true/false}
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
└────────┬────────┘
         │
         ├─► Save feedback to database
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │ ──► INSERT INTO explanation_feedback
└─────────────────┘
         │
         ├─► Update learner profile
         │
         ▼
┌─────────────────┐
│ Learner Profiler│ ──► Adjust difficulty_score
└────────┬────────┘     Update concept_understanding
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │ ──► UPDATE learner_profiles
└─────────────────┘
         │
         ├─► Next explanation uses updated profile
         │
         ▼
┌─────────────────┐
│  AI Service     │ ──► Generate explanation at new difficulty
└─────────────────┘
```

---

## Component Interactions

### Frontend ↔ Backend API

**Request Flow:**
```
Frontend → API Gateway → Backend → Database/Services → Backend → API Gateway → Frontend
```

**Data Format:**
- Request: JSON with JWT in Authorization header
- Response: JSON with status code and data/error

**Example:**
```json
Request:
POST /api/v1/execution/start
Authorization: Bearer eyJhbGc...
{
  "code": "print('hello')",
  "language": "python"
}

Response:
{
  "session_id": "exec_123",
  "status": "queued",
  "websocket_url": "wss://api.algolens.com/ws/execution/exec_123"
}
```

---

### Backend ↔ Execution Engine

**Communication:** HTTP REST + gRPC (for performance)

**Request:**
```json
POST /execute
{
  "session_id": "exec_123",
  "code": "print('hello')",
  "language": "python",
  "limits": {
    "memory_mb": 256,
    "timeout_seconds": 30,
    "max_iterations": 1000000
  }
}
```

**Response Stream:**
```json
{
  "type": "step",
  "step_number": 1,
  "line": 1,
  "state": {...}
}
{
  "type": "step",
  "step_number": 2,
  "line": 1,
  "state": {...}
}
{
  "type": "complete",
  "result": "hello\n"
}
```

---

### Backend ↔ AI Service

**Communication:** HTTP REST (async)

**Request:**
```json
POST /explain
{
  "execution_context": {
    "step_number": 42,
    "line": 5,
    "code": "if arr[j] > arr[j+1]:",
    "variables": {...},
    "stack": [...]
  },
  "difficulty_level": "intermediate",
  "user_profile": {
    "difficulty_score": 0.6,
    "concept_understanding": {...}
  }
}
```

**Response:**
```json
{
  "explanation": {
    "what": "Comparing two adjacent elements...",
    "why": "To determine if they need swapping...",
    "how": "Using the > comparison operator...",
    "impact": "If true, next step will swap..."
  },
  "concepts": ["comparison", "conditional", "array_indexing"],
  "tokens_used": 245,
  "generation_time_ms": 1850
}
```

---

## Real-Time Communication

### WebSocket Message Types

**Client → Server:**
```json
{"type": "subscribe", "data": {"session_id": "exec_123"}}
{"type": "control", "data": {"action": "pause"}}
{"type": "control", "data": {"action": "resume"}}
{"type": "control", "data": {"action": "stop"}}
{"type": "request_explanation", "data": {"step_number": 42}}
```

**Server → Client:**
```json
{"type": "execution:started", "data": {...}}
{"type": "execution:step", "data": {...}}
{"type": "ai:explanation", "data": {...}}
{"type": "execution:completed", "data": {...}}
{"type": "execution:error", "data": {...}}
```

---

## Error Handling Flows

### Execution Error Flow

```
Execution Engine encounters error
         │
         ▼
┌─────────────────┐
│ Capture error   │ ──► {type, message, line, traceback}
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │ ──► Update session status = "failed"
└────────┬────────┘     Save error details
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │ ──► UPDATE execution_sessions
└─────────────────┘     SET error_message, error_traceback
         │
         ▼
┌─────────────────┐
│   WebSocket     │ ──► Broadcast: execution:error
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │ ──► Display error message
└─────────────────┘     Highlight error line
                        Show debugging hints
```

---

## Performance Optimizations

### Caching Strategy

```
Request → Check Redis Cache → Cache Hit? → Return cached data
                    │
                    │ Cache Miss
                    ▼
            Process request → Save to cache → Return data
```

### Batch Processing

```
Multiple execution steps generated
         │
         ▼
┌─────────────────┐
│ Batch buffer    │ ──► Collect steps for 100ms
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Batch insert    │ ──► INSERT INTO execution_steps (bulk)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Batch broadcast │ ──► Send multiple steps in one message
└─────────────────┘
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0