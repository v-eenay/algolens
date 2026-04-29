# ProGyan AlgoLens

**AI-Powered Algorithm Visualization and Learning Platform**

ProGyan AlgoLens is an interactive, web-based platform designed to transform static source code into a dynamic, step-by-step execution experience. The system combines real-time algorithm visualization with AI-driven explanations to help learners develop a deeper understanding of computational processes, data structure behavior, and algorithmic logic.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Features](#core-features)
3. [System Architecture Overview](#system-architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Setup Instructions](#setup-instructions)
7. [Security Model](#security-model)
8. [Testing Strategy](#testing-strategy)
9. [Contributing](#contributing)
10. [License](#license)

---

## Introduction

Traditional programming education often relies on static reading of code and manual tracing of execution flow. ProGyan AlgoLens addresses this limitation by providing an instrumented execution environment that captures every state transition during program execution and renders it visually in the browser.

The platform is composed of four primary subsystems: a frontend interface for code editing and visualization, a backend API for orchestration, a sandboxed execution engine for safe code evaluation, and an AI service for generating context-aware explanations. Together, these components form a cohesive learning environment suitable for both self-directed study and classroom instruction.

---

## Core Features

### Step-by-Step Code Execution
- Line-by-line execution tracking with full state capture
- Variable state monitoring at each execution step
- Memory and stack visualization
- Call graph generation

### Real-Time Visualization
- Data structure rendering for arrays, trees, graphs, and linked lists
- Memory layout and allocation visualization
- Stack and heap tracking with animated state transitions
- Force-directed and hierarchical layout algorithms

### AI-Powered Explanations
- Context-aware explanations generated per execution step
- Concept highlighting and targeted teaching
- Adaptive difficulty adjustment based on learner proficiency
- Multi-level explanations (beginner, intermediate, advanced)

### Language-Agnostic Architecture
- Plugin-based execution engine supporting multiple languages
- Python implementation as the initial supported language
- Extensible design for JavaScript, Java, C++, and others

### Collaborative Learning
- Real-time code sharing between users
- Execution recording and replay
- Learner progress tracking and analytics

---

## System Architecture Overview

The platform follows a microservices architecture with clearly separated concerns across five layers:

```
+------------------------------------------------------------------+
|                         User Interface                            |
|  (Next.js + Monaco Editor + D3.js + React Flow + TailwindCSS)    |
+-------------------------------+----------------------------------+
                                |
                                | REST API + WebSockets
                                |
+-------------------------------v----------------------------------+
|                       API Gateway Layer                           |
|               (Kong/Traefik + Rate Limiting + Auth)               |
+-------------------------------+----------------------------------+
                                |
            +-------------------+-------------------+
            |                   |                   |
            v                   v                   v
   +-----------------+  +----------------+  +------------------+
   |   Backend API   |  |   Execution    |  |   AI Service     |
   |   (FastAPI)     |  |   Engine       |  |   (LangChain     |
   |                 |  |   (Python)     |  |    + OpenAI)     |
   +--------+--------+  +-------+--------+  +---------+--------+
            |                   |                      |
            v                   v                      v
   +------------------------------------------------------------+
   |                   Data and Cache Layer                      |
   |        PostgreSQL + Redis + S3/MinIO + Pinecone             |
   +------------------------------------------------------------+
```

### Component Responsibilities

**Frontend (Next.js)** -- Provides the code editor with syntax highlighting, real-time execution visualization, AI explanation display, user authentication, and a responsive, accessible interface.

**Backend API (FastAPI)** -- Handles request orchestration, authentication and authorization, session management, WebSocket connections, and API rate limiting.

**Execution Engine (Python + Docker)** -- Implements a language-agnostic plugin architecture for secure, sandboxed code execution. Captures step-by-step execution traces including memory state, variable values, and call stacks.

**AI Service (LangChain + OpenAI)** -- Generates context-aware explanations using retrieval-augmented generation (RAG), adapts learning paths based on user proficiency, and supports multi-level explanation output.

**Visualization Engine (TypeScript)** -- Renders data structures, manages animation transitions, and applies layout algorithms (tree, graph, force-directed) with configurable theming.

---

## Technology Stack

### Frontend
| Component       | Technology                               |
|-----------------|------------------------------------------|
| Framework       | Next.js 14 (App Router)                  |
| Language        | TypeScript                               |
| Code Editor     | Monaco Editor                            |
| Visualization   | D3.js, React Flow, Framer Motion         |
| Styling         | TailwindCSS, shadcn/ui                   |
| State Management| Zustand, React Query                     |
| Testing         | Jest, React Testing Library, Playwright  |

### Backend
| Component       | Technology                               |
|-----------------|------------------------------------------|
| Framework       | FastAPI                                  |
| Language        | Python 3.11+                             |
| Database        | PostgreSQL 15+                           |
| Cache           | Redis 7+                                 |
| ORM             | SQLAlchemy                               |
| Migrations      | Alembic                                  |
| Task Queue      | Celery                                   |
| Testing         | pytest, pytest-asyncio                   |

### Execution Engine
| Component       | Technology                               |
|-----------------|------------------------------------------|
| Language        | Python 3.11+                             |
| Parsing         | AST module                               |
| Tracing         | sys.settrace                             |
| Sandboxing      | RestrictedPython, Docker, gVisor         |

### AI Service
| Component       | Technology                               |
|-----------------|------------------------------------------|
| Framework       | LangChain                                |
| LLM Provider    | OpenAI GPT-4, Anthropic Claude (fallback)|
| Vector Store    | Pinecone                                 |
| Embeddings      | OpenAI text-embedding-3-large            |
| Caching         | Redis                                   |

### Infrastructure
| Component       | Technology                               |
|-----------------|------------------------------------------|
| Containerization| Docker                                   |
| Orchestration   | Kubernetes                               |
| IaC             | Terraform                                |
| CI/CD           | GitHub Actions, ArgoCD                   |
| Monitoring      | Prometheus, Grafana, Sentry              |
| API Gateway     | Kong / Traefik                           |

---

## Project Structure

```
progyan-algolens/
├── frontend/              # Next.js frontend application
├── backend/               # FastAPI backend service
├── execution-engine/      # Language-agnostic execution engine
├── ai-service/            # AI explanation service
├── visualization-engine/  # Shared visualization library
├── infrastructure/        # Docker, Kubernetes, and Terraform configs
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

Refer to [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for a detailed breakdown.

---

## Setup Instructions

### Prerequisites

- **Node.js** 18 or later
- **Python** 3.11 or later
- **Docker** 24 or later
- **PostgreSQL** 15 or later
- **Redis** 7 or later
- **Kubernetes** 1.28 or later (optional; required for production deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/progyan-algolens.git
cd progyan-algolens
```

### 2. Configure Environment Variables

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

Update each `.env` file with the appropriate credentials:
- Database connection string
- Redis connection URL
- OpenAI API key
- Object storage credentials (AWS S3 or MinIO)
- Pinecone API key

### 3. Start the Development Environment

**Option A: Docker Compose (recommended)**

```bash
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
```

**Option B: Manual Setup**

```bash
# Terminal 1 -- Start database and cache
docker-compose up -d postgres redis

# Terminal 2 -- Start backend API
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Terminal 3 -- Start execution engine
cd execution-engine
pip install -e .
python -m src.main

# Terminal 4 -- Start AI service
cd ai-service
pip install -r requirements.txt
python -m src.main

# Terminal 5 -- Start frontend
cd frontend
npm install
npm run dev
```

### 4. Access the Application

| Service         | URL                          |
|-----------------|------------------------------|
| Frontend        | http://localhost:3000         |
| Backend API     | http://localhost:8000         |
| API Documentation | http://localhost:8000/docs  |
| AI Service      | http://localhost:8001         |

---

## Security Model

### Code Execution Security
- Docker containers with gVisor runtime for sandboxed execution
- CPU, memory, and time resource constraints
- AST-based static analysis for code validation
- Restricted Python builtins access
- Full network isolation for execution containers

### API Security
- JWT-based authentication
- Role-based access control (RBAC)
- Per-user and per-IP rate limiting
- Pydantic schema validation on all inputs
- CORS restricted to configured origins

### Data Security
- Encryption at rest for database and object storage
- TLS 1.3 for all connections in transit
- Secret management via Kubernetes Secrets or AWS Secrets Manager
- Audit logging for all sensitive operations

---

## Testing Strategy

| Test Level       | Scope                                      | Target Coverage |
|------------------|--------------------------------------------|-----------------|
| Unit Tests       | Backend (pytest), Frontend (Jest), Engine   | 70--90%         |
| Integration Tests| API endpoints, WebSocket, database layer    | --              |
| End-to-End Tests | Full execution flow, user journeys (Playwright) | --          |
| Load Tests       | API (Locust), WebSocket (K6)               | 10,000 concurrent users |

---

## Contributing

Contributions are welcome. Please refer to [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed guidelines.

### Development Workflow

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m 'Add feature description'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request for review.

### Contributors

| Role                    |
|-------------------------|
| Project Lead            |
| Frontend Developer      |
| Backend Developer       |
| AI Systems Engineer     |
| DevOps Engineer         |

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 ProGyan AlgoLens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```