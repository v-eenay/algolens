# ProGyan AlgoLens

**AI-Powered Algorithm Visualization & Learning Platform**

ProGyan AlgoLens transforms static code into an interactive, visual, and AI-explained execution experience. It helps learners understand algorithms deeply through step-by-step simulation, real-time visualization, and adaptive AI-driven explanations.

---

## 🎯 Vision

To revolutionize programming education by making algorithm execution transparent, visual, and intelligently explained—bridging the gap between theory and practical understanding.

---

## ✨ Core Features

### 1. **Step-by-Step Code Execution**
- Line-by-line execution tracking
- Variable state monitoring at each step
- Memory and stack visualization
- Call graph generation

### 2. **Real-Time Visualization**
- Data structure rendering (arrays, trees, graphs, linked lists)
- Memory layout visualization
- Stack and heap tracking
- Animated transitions between states

### 3. **AI-Powered Explanations**
- Context-aware step explanations
- Concept highlighting and teaching
- Adaptive difficulty based on learner understanding
- Multi-level explanations (beginner, intermediate, advanced)

### 4. **Language-Agnostic Architecture**
- Plugin-based execution engine
- Python implementation (initial)
- Extensible to JavaScript, Java, C++, etc.

### 5. **Collaborative Learning**
- Real-time code sharing
- Execution replay and recording
- Progress tracking and analytics

---

## 🏗️ Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  (Next.js + Monaco Editor + D3.js + React Flow + TailwindCSS)  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API + WebSockets
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API Gateway Layer                          │
│              (Kong/Traefik + Rate Limiting + Auth)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌──────────────┐ ┌─────────────────┐
│   Backend     │ │  Execution   │ │   AI Service    │
│   API         │ │  Engine      │ │   (LangChain)   │
│  (FastAPI)    │ │  (Python)    │ │   + OpenAI      │
└───────┬───────┘ └──────┬───────┘ └────────┬────────┘
        │                │                   │
        │                │                   │
        ▼                ▼                   ▼
┌───────────────────────────────────────────────────┐
│              Data & Cache Layer                   │
│  PostgreSQL + Redis + S3/MinIO + Pinecone        │
└───────────────────────────────────────────────────┘
```

### Component Responsibilities

#### **Frontend (Next.js)**
- Code editor with syntax highlighting
- Real-time execution visualization
- AI explanation display
- User authentication and session management
- Responsive and accessible UI

#### **Backend API (FastAPI)**
- Request orchestration
- Authentication and authorization
- Session management
- WebSocket connection handling
- API rate limiting

#### **Execution Engine (Python + Docker)**
- Language-agnostic plugin architecture
- Secure code execution in sandboxed environment
- Step-by-step execution tracking
- Memory and variable state capture
- Resource limitation and timeout handling

#### **AI Service (LangChain + OpenAI)**
- Context-aware explanation generation
- Adaptive learning path adjustment
- RAG-based algorithm knowledge retrieval
- Multi-level explanation generation
- Learner profiling and feedback analysis

#### **Visualization Engine (TypeScript)**
- Data structure rendering
- Animation and transition management
- Layout algorithms (tree, graph, force-directed)
- Color schemes and theming

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18+ (for frontend and visualization engine)
- **Python**: 3.11+ (for backend and execution engine)
- **Docker**: 24+ (for containerization)
- **PostgreSQL**: 15+ (for database)
- **Redis**: 7+ (for caching and pub/sub)
- **Kubernetes**: 1.28+ (for production deployment, optional for dev)

### Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/progyan-algolens.git
cd progyan-algolens
```

#### 2. Environment Configuration

```bash
# Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

Edit the `.env` files with your configuration:
- Database credentials
- Redis connection
- OpenAI API key
- AWS/MinIO credentials (for storage)
- Pinecone API key (for vector store)

#### 3. Start Development Environment

**Option A: Docker Compose (Recommended)**

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Option B: Manual Setup**

```bash
# Terminal 1: Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Terminal 2: Start Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Terminal 3: Start Execution Engine
cd execution-engine
pip install -e .
python -m src.main

# Terminal 4: Start AI Service
cd ai-service
pip install -r requirements.txt
python -m src.main

# Terminal 5: Start Frontend
cd frontend
npm install
npm run dev
```

#### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **AI Service**: http://localhost:8001

#### 5. Run Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Execution engine tests
cd execution-engine
pytest

# E2E tests
npm run test:e2e
```

---

## 📊 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Editor**: Monaco Editor
- **Visualization**: D3.js, React Flow, Framer Motion
- **Styling**: TailwindCSS, shadcn/ui
- **State**: Zustand, React Query
- **Testing**: Jest, React Testing Library, Playwright

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **ORM**: SQLAlchemy
- **Migration**: Alembic
- **Task Queue**: Celery
- **Testing**: pytest, pytest-asyncio

### Execution Engine
- **Language**: Python 3.11+
- **Parsing**: AST module
- **Tracing**: sys.settrace
- **Security**: RestrictedPython, Docker, gVisor
- **Isolation**: Docker containers

### AI Service
- **Framework**: LangChain
- **LLM**: OpenAI GPT-4, Anthropic Claude (fallback)
- **Vector Store**: Pinecone
- **Embeddings**: OpenAI text-embedding-3-large
- **Caching**: Redis

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **IaC**: Terraform
- **CI/CD**: GitHub Actions, ArgoCD
- **Monitoring**: Prometheus, Grafana, Sentry
- **API Gateway**: Kong / Traefik

---

## 📁 Project Structure

```
progyan-algolens/
├── frontend/              # Next.js frontend application
├── backend/               # FastAPI backend service
├── execution-engine/      # Language-agnostic execution engine
├── ai-service/           # AI explanation service
├── visualization-engine/  # Shared visualization library
├── infrastructure/        # Docker, K8s, Terraform configs
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

See [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for detailed structure.

---

## 🔐 Security

### Code Execution Security
- **Sandboxing**: Docker containers with gVisor runtime
- **Resource Limits**: CPU, memory, and time constraints
- **Code Validation**: AST-based static analysis
- **Restricted Builtins**: Limited Python builtins access
- **Network Isolation**: No network access from execution containers

### API Security
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Per-user and per-IP rate limits
- **Input Validation**: Pydantic schemas for all inputs
- **CORS**: Configured for specific origins only

### Data Security
- **Encryption at Rest**: Database and S3 encryption
- **Encryption in Transit**: TLS 1.3 for all connections
- **Secret Management**: Kubernetes secrets / AWS Secrets Manager
- **Audit Logging**: All sensitive operations logged

---

## 📈 Scalability

### Horizontal Scaling
- **Frontend**: CDN + multiple Next.js instances
- **Backend**: Kubernetes HPA (Horizontal Pod Autoscaler)
- **Execution Engine**: Auto-scaling based on queue depth
- **AI Service**: Load-balanced LLM API calls

### Caching Strategy
- **Redis**: Session data, execution states, AI responses
- **CDN**: Static assets, frontend bundles
- **Database**: Read replicas for analytics queries

### Performance Targets
- **API Response Time**: < 100ms (p95)
- **Execution Start Time**: < 500ms
- **Visualization Render**: < 50ms per frame
- **AI Explanation**: < 2s (cached: < 100ms)
- **Concurrent Users**: 10,000+ per cluster

---

## 🧪 Testing Strategy

### Unit Tests
- Backend: pytest with 80%+ coverage
- Frontend: Jest with 70%+ coverage
- Execution Engine: pytest with 90%+ coverage

### Integration Tests
- API endpoint testing
- WebSocket communication testing
- Database integration testing

### E2E Tests
- Full execution flow testing
- User journey testing
- Cross-browser testing (Playwright)

### Load Tests
- Locust for API load testing
- K6 for WebSocket load testing
- Target: 10,000 concurrent users

---

## 📚 Documentation

- **Architecture**: [`docs/architecture/system-design.md`](docs/architecture/system-design.md)
- **API Reference**: [`docs/api/rest-api.md`](docs/api/rest-api.md)
- **Development Guide**: [`docs/development/setup-guide.md`](docs/development/setup-guide.md)
- **Deployment Guide**: [`docs/deployment/deployment-guide.md`](docs/deployment/deployment-guide.md)
- **Contributing**: [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## 🗺️ Roadmap

### Phase 1: MVP (Months 1-3)
- ✅ Project setup and architecture
- ✅ Python execution engine
- ✅ Basic visualization (arrays, variables)
- ✅ Simple AI explanations
- ✅ Core frontend UI

### Phase 2: Enhanced Features (Months 4-6)
- Advanced data structure visualization (trees, graphs)
- Adaptive AI explanations
- User authentication and profiles
- Execution recording and replay
- Performance optimization

### Phase 3: Scale & Polish (Months 7-9)
- Multi-language support (JavaScript, Java)
- Collaborative features
- Advanced analytics
- Mobile-responsive design
- Production deployment

### Phase 4: Advanced Features (Months 10-12)
- Real-time collaboration
- Custom algorithm library
- Gamification and challenges
- Integration with LMS platforms
- Advanced AI tutoring

---

## 🤝 Contributing

We welcome contributions! Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

---

## 👥 Team

- **Project Lead**: [Your Name]
- **Backend Lead**: [Name]
- **Frontend Lead**: [Name]
- **AI/ML Lead**: [Name]
- **DevOps Lead**: [Name]

---

## 📞 Support

- **Documentation**: [docs.progyan-algolens.com](https://docs.progyan-algolens.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/progyan-algolens/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/progyan-algolens/discussions)
- **Email**: support@progyan-algolens.com

---

## 🙏 Acknowledgments

- Monaco Editor by Microsoft
- D3.js visualization library
- FastAPI framework
- LangChain for LLM orchestration
- OpenAI for GPT-4 API

---

**Built with ❤️ for learners worldwide**