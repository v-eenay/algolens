# ProGyan AlgoLens - Project Structure

## Optimal Technology Stack Decision

### Stack Selection Rationale
Based on medium-scale deployment (1000-10000 concurrent users), language-agnostic design requirements, and maintainability needs:

**Frontend Stack:**
- **Framework**: Next.js 14+ (App Router)
  - Rationale: SSR/SSG capabilities, excellent performance, built-in API routes, great DX
- **Code Editor**: Monaco Editor (VS Code engine)
  - Rationale: Industry-standard, excellent language support, extensible
- **Visualization**: D3.js + React Flow + Framer Motion
  - Rationale: D3 for data structures, React Flow for execution graphs, Framer for smooth animations
- **Styling**: TailwindCSS + shadcn/ui
  - Rationale: Rapid development, consistent design system, accessible components
- **State Management**: Zustand + React Query
  - Rationale: Lightweight, performant, excellent for real-time data

**Backend Stack:**
- **Primary API**: FastAPI (Python 3.11+)
  - Rationale: High performance, async support, automatic OpenAPI docs, type safety
- **Real-time Layer**: FastAPI WebSockets + Redis Pub/Sub
  - Rationale: Native WebSocket support, Redis for horizontal scaling
- **Task Queue**: Celery + Redis
  - Rationale: Handle long-running execution tasks, prevent timeout issues

**Execution Engine:**
- **Architecture**: Plugin-based language-agnostic design
- **Python Implementation**: Custom AST parser + sys.settrace + RestrictedPython
  - Rationale: Full control, security sandboxing, detailed execution tracking
- **Containerization**: Docker + gVisor (for security)
  - Rationale: Isolated execution environment, prevents malicious code

**AI Layer:**
- **Primary**: OpenAI GPT-4 API + LangChain
  - Rationale: Best explanation quality, LangChain for prompt management
- **Fallback**: Anthropic Claude API
  - Rationale: Redundancy, cost optimization
- **Vector Store**: Pinecone + LangChain
  - Rationale: RAG for algorithm knowledge base, contextual explanations

**Database:**
- **Primary**: PostgreSQL 15+
  - Rationale: ACID compliance, complex queries, user data integrity
- **Cache**: Redis 7+
  - Rationale: Session management, execution state caching, pub/sub
- **Object Storage**: AWS S3 / MinIO
  - Rationale: Store execution recordings, visualizations, user code

**Infrastructure:**
- **Container Orchestration**: Kubernetes (K8s)
  - Rationale: Auto-scaling, load balancing, self-healing
- **API Gateway**: Kong / Traefik
  - Rationale: Rate limiting, authentication, routing
- **Monitoring**: Prometheus + Grafana + Sentry
  - Rationale: Metrics, visualization, error tracking
- **CI/CD**: GitHub Actions + ArgoCD
  - Rationale: Automated testing, GitOps deployment

---

## Complete Project Structure

```
progyan-algolens/
│
├── .github/
│   ├── workflows/
│   │   ├── ci-frontend.yml
│   │   ├── ci-backend.yml
│   │   ├── ci-execution-engine.yml
│   │   ├── cd-staging.yml
│   │   └── cd-production.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── frontend/
│   ├── .next/
│   ├── public/
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   ├── images/
│   │   │   └── animations/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── workspace/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── algorithms/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── visualize/
│   │   │   │   │   └── [sessionId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── history/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── api/
│   │   │   │   └── health/
│   │   │   │       └── route.ts
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── toast.tsx
│   │   │   ├── editor/
│   │   │   │   ├── CodeEditor.tsx
│   │   │   │   ├── EditorToolbar.tsx
│   │   │   │   ├── LanguageSelector.tsx
│   │   │   │   └── ThemeSelector.tsx
│   │   │   ├── visualization/
│   │   │   │   ├── ExecutionTimeline.tsx
│   │   │   │   ├── MemoryVisualizer.tsx
│   │   │   │   ├── StackVisualizer.tsx
│   │   │   │   ├── VariableTracker.tsx
│   │   │   │   ├── DataStructureRenderer.tsx
│   │   │   │   ├── CallGraphVisualizer.tsx
│   │   │   │   └── AnimationController.tsx
│   │   │   ├── ai-explanation/
│   │   │   │   ├── ExplanationPanel.tsx
│   │   │   │   ├── StepExplanation.tsx
│   │   │   │   ├── ConceptHighlighter.tsx
│   │   │   │   └── AdaptiveFeedback.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── WorkspaceLayout.tsx
│   │   │   └── shared/
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   ├── endpoints.ts
│   │   │   │   └── websocket.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useExecution.ts
│   │   │   │   ├── useVisualization.ts
│   │   │   │   ├── useAIExplanation.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── useAuth.ts
│   │   │   ├── store/
│   │   │   │   ├── executionStore.ts
│   │   │   │   ├── visualizationStore.ts
│   │   │   │   ├── uiStore.ts
│   │   │   │   └── authStore.ts
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   ├── animations.ts
│   │   │   │   └── constants.ts
│   │   │   └── types/
│   │   │       ├── execution.ts
│   │   │       ├── visualization.ts
│   │   │       ├── api.ts
│   │   │       └── user.ts
│   │   └── styles/
│   │       ├── animations.css
│   │       └── visualizations.css
│   ├── .env.local
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── execution.py
│   │   │   │   │   ├── visualization.py
│   │   │   │   │   ├── ai_explanation.py
│   │   │   │   │   ├── algorithms.py
│   │   │   │   │   ├── users.py
│   │   │   │   │   └── health.py
│   │   │   │   └── websockets/
│   │   │   │       ├── __init__.py
│   │   │   │       ├── connection_manager.py
│   │   │   │       ├── execution_ws.py
│   │   │   │       └── collaboration_ws.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   ├── auth.py
│   │   │   ├── rate_limiter.py
│   │   │   └── exceptions.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py
│   │   │   │   ├── execution_session.py
│   │   │   │   ├── algorithm.py
│   │   │   │   ├── explanation.py
│   │   │   │   └── analytics.py
│   │   │   └── repositories/
│   │   │       ├── __init__.py
│   │   │       ├── user_repository.py
│   │   │       ├── execution_repository.py
│   │   │       ├── algorithm_repository.py
│   │   │       └── analytics_repository.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── execution_orchestrator.py
│   │   │   ├── ai_service.py
│   │   │   ├── visualization_service.py
│   │   │   ├── cache_service.py
│   │   │   ├── storage_service.py
│   │   │   └── analytics_service.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── execution.py
│   │   │   ├── visualization.py
│   │   │   ├── ai_explanation.py
│   │   │   ├── user.py
│   │   │   └── algorithm.py
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py
│   │   │   ├── execution_tasks.py
│   │   │   └── ai_tasks.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── logger.py
│   │       ├── validators.py
│   │       └── helpers.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── unit/
│   │   │   ├── test_execution.py
│   │   │   ├── test_ai_service.py
│   │   │   └── test_visualization.py
│   │   ├── integration/
│   │   │   ├── test_api_endpoints.py
│   │   │   └── test_websockets.py
│   │   └── e2e/
│   │       └── test_full_execution_flow.py
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml
│   ├── pytest.ini
│   └── alembic.ini
│
├── execution-engine/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── engine_interface.py
│   │   │   ├── execution_context.py
│   │   │   ├── step_tracker.py
│   │   │   └── memory_tracker.py
│   │   ├── languages/
│   │   │   ├── __init__.py
│   │   │   ├── base_executor.py
│   │   │   ├── python/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── python_executor.py
│   │   │   │   ├── ast_parser.py
│   │   │   │   ├── tracer.py
│   │   │   │   ├── sandbox.py
│   │   │   │   └── builtin_handlers.py
│   │   │   └── plugins/
│   │   │       ├── __init__.py
│   │   │       └── plugin_loader.py
│   │   ├── security/
│   │   │   ├── __init__.py
│   │   │   ├── sandbox_manager.py
│   │   │   ├── resource_limiter.py
│   │   │   └── code_validator.py
│   │   ├── analysis/
│   │   │   ├── __init__.py
│   │   │   ├── complexity_analyzer.py
│   │   │   ├── pattern_detector.py
│   │   │   └── optimization_suggester.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── serializers.py
│   │       └── formatters.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_python_executor.py
│   │   ├── test_sandbox.py
│   │   └── test_memory_tracking.py
│   ├── examples/
│   │   ├── sorting_algorithms.py
│   │   ├── data_structures.py
│   │   └── graph_algorithms.py
│   ├── requirements.txt
│   ├── setup.py
│   └── README.md
│
├── ai-service/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── prompts/
│   │   │   ├── __init__.py
│   │   │   ├── base_prompts.py
│   │   │   ├── step_explanation_prompts.py
│   │   │   ├── concept_explanation_prompts.py
│   │   │   ├── adaptive_prompts.py
│   │   │   └── prompt_templates/
│   │   │       ├── beginner.txt
│   │   │       ├── intermediate.txt
│   │   │       └── advanced.txt
│   │   ├── chains/
│   │   │   ├── __init__.py
│   │   │   ├── explanation_chain.py
│   │   │   ├── adaptive_chain.py
│   │   │   └── rag_chain.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── llm_manager.py
│   │   │   ├── embedding_manager.py
│   │   │   └── fallback_handler.py
│   │   ├── knowledge_base/
│   │   │   ├── __init__.py
│   │   │   ├── vector_store.py
│   │   │   ├── algorithm_kb.py
│   │   │   └── concept_kb.py
│   │   ├── adaptive/
│   │   │   ├── __init__.py
│   │   │   ├── learner_profiler.py
│   │   │   ├── difficulty_adjuster.py
│   │   │   └── feedback_analyzer.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── token_counter.py
│   │       └── cache_manager.py
│   ├── data/
│   │   ├── algorithms/
│   │   │   ├── sorting.json
│   │   │   ├── searching.json
│   │   │   ├── graphs.json
│   │   │   └── dynamic_programming.json
│   │   └── concepts/
│   │       ├── time_complexity.json
│   │       ├── space_complexity.json
│   │       └── data_structures.json
│   ├── tests/
│   │   ├── test_prompts.py
│   │   ├── test_chains.py
│   │   └── test_adaptive.py
│   ├── requirements.txt
│   └── README.md
│
├── visualization-engine/
│   ├── src/
│   │   ├── index.ts
│   │   ├── core/
│   │   │   ├── VisualizationEngine.ts
│   │   │   ├── RenderPipeline.ts
│   │   │   └── AnimationController.ts
│   │   ├── renderers/
│   │   │   ├── BaseRenderer.ts
│   │   │   ├── MemoryRenderer.ts
│   │   │   ├── StackRenderer.ts
│   │   │   ├── HeapRenderer.ts
│   │   │   ├── ArrayRenderer.ts
│   │   │   ├── TreeRenderer.ts
│   │   │   ├── GraphRenderer.ts
│   │   │   └── LinkedListRenderer.ts
│   │   ├── animations/
│   │   │   ├── TransitionManager.ts
│   │   │   ├── EasingFunctions.ts
│   │   │   └── AnimationQueue.ts
│   │   ├── layouts/
│   │   │   ├── TreeLayout.ts
│   │   │   ├── GraphLayout.ts
│   │   │   └── ForceDirectedLayout.ts
│   │   └── utils/
│   │       ├── ColorSchemes.ts
│   │       ├── Formatters.ts
│   │       └── Constants.ts
│   ├── tests/
│   │   ├── renderers.test.ts
│   │   └── animations.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── infrastructure/
│   ├── docker/
│   │   ├── frontend.Dockerfile
│   │   ├── backend.Dockerfile
│   │   ├── execution-engine.Dockerfile
│   │   ├── ai-service.Dockerfile
│   │   └── nginx.Dockerfile
│   ├── kubernetes/
│   │   ├── namespaces/
│   │   │   ├── production.yaml
│   │   │   └── staging.yaml
│   │   ├── deployments/
│   │   │   ├── frontend-deployment.yaml
│   │   │   ├── backend-deployment.yaml
│   │   │   ├── execution-engine-deployment.yaml
│   │   │   ├── ai-service-deployment.yaml
│   │   │   ├── redis-deployment.yaml
│   │   │   └── postgres-deployment.yaml
│   │   ├── services/
│   │   │   ├── frontend-service.yaml
│   │   │   ├── backend-service.yaml
│   │   │   ├── execution-engine-service.yaml
│   │   │   └── ai-service-service.yaml
│   │   ├── ingress/
│   │   │   └── ingress.yaml
│   │   ├── configmaps/
│   │   │   ├── backend-config.yaml
│   │   │   └── frontend-config.yaml
│   │   ├── secrets/
│   │   │   └── secrets.yaml.example
│   │   └── hpa/
│   │       ├── backend-hpa.yaml
│   │       └── execution-engine-hpa.yaml
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── vpc/
│   │   │   ├── eks/
│   │   │   ├── rds/
│   │   │   └── s3/
│   │   └── environments/
│   │       ├── staging/
│   │       └── production/
│   ├── monitoring/
│   │   ├── prometheus/
│   │   │   └── prometheus.yaml
│   │   ├── grafana/
│   │   │   ├── dashboards/
│   │   │   └── datasources/
│   │   └── alertmanager/
│   │       └── alertmanager.yaml
│   └── scripts/
│       ├── deploy.sh
│       ├── rollback.sh
│       └── backup.sh
│
├── docs/
│   ├── architecture/
│   │   ├── system-design.md
│   │   ├── data-flow.md
│   │   ├── api-contracts.md
│   │   └── security-model.md
│   ├── development/
│   │   ├── setup-guide.md
│   │   ├── coding-standards.md
│   │   └── contribution-guide.md
│   ├── deployment/
│   │   ├── deployment-guide.md
│   │   └── scaling-guide.md
│   └── api/
│       ├── rest-api.md
│       └── websocket-api.md
│
├── scripts/
│   ├── setup/
│   │   ├── setup-dev.sh
│   │   ├── setup-db.sh
│   │   └── seed-data.py
│   ├── testing/
│   │   ├── run-tests.sh
│   │   └── load-test.py
│   └── utils/
│       ├── generate-types.sh
│       └── check-health.sh
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── .gitignore
├── .dockerignore
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

---

## Key Architectural Decisions

### 1. Microservices Architecture
- **Frontend**: Standalone Next.js application
- **Backend API**: FastAPI orchestration layer
- **Execution Engine**: Isolated Python service (containerized)
- **AI Service**: Separate service for LLM operations
- **Visualization Engine**: Shared TypeScript library

### 2. Communication Patterns
- **REST API**: Standard CRUD operations
- **WebSockets**: Real-time execution updates
- **Redis Pub/Sub**: Inter-service communication
- **Message Queue**: Celery for async tasks

### 3. Data Flow
```
User Code Input → Backend API → Execution Engine (Docker) → Step-by-step execution
                                                          ↓
                                                    Memory snapshots
                                                          ↓
                                    AI Service ← Execution context
                                         ↓
                                   Explanations generated
                                         ↓
                    Frontend ← WebSocket updates (execution + explanations + visualizations)
```

### 4. Security Layers
- **Code Execution**: Docker + gVisor sandboxing
- **API**: JWT authentication + rate limiting
- **Network**: API Gateway with WAF
- **Data**: Encryption at rest and in transit

### 5. Scalability Strategy
- **Horizontal Scaling**: K8s HPA for all services
- **Caching**: Redis for execution states and AI responses
- **CDN**: Static assets and frontend
- **Database**: Read replicas for PostgreSQL
- **Load Balancing**: K8s ingress controller

---

## File Descriptions

### Frontend (`/frontend`)
- **Next.js App Router**: Modern React framework with SSR
- **Monaco Editor**: Code editing with syntax highlighting
- **D3.js + React Flow**: Data structure and execution graph visualization
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching

### Backend (`/backend`)
- **FastAPI**: High-performance async Python API
- **SQLAlchemy**: ORM for PostgreSQL
- **Celery**: Distributed task queue
- **WebSockets**: Real-time communication
- **Alembic**: Database migrations

### Execution Engine (`/execution-engine`)
- **Plugin Architecture**: Language-agnostic design
- **Python Executor**: AST parsing + sys.settrace
- **Sandbox**: RestrictedPython + Docker isolation
- **Memory Tracking**: Detailed variable and memory state capture
- **Security**: Resource limits and code validation

### AI Service (`/ai-service`)
- **LangChain**: LLM orchestration framework
- **Prompt Engineering**: Adaptive explanation generation
- **RAG**: Vector store for algorithm knowledge
- **Learner Profiling**: Adaptive difficulty adjustment
- **Multi-LLM**: OpenAI + Anthropic with fallback

### Visualization Engine (`/visualization-engine`)
- **TypeScript Library**: Shared visualization logic
- **Renderers**: Specialized renderers for each data structure
- **Animation System**: Smooth transitions and highlights
- **Layout Algorithms**: Force-directed, tree, and graph layouts

### Infrastructure (`/infrastructure`)
- **Docker**: Containerization for all services
- **Kubernetes**: Orchestration and scaling
- **Terraform**: Infrastructure as Code
- **Monitoring**: Prometheus + Grafana + Sentry

---

## Next Steps

This structure provides:
1. ✅ Clear separation of concerns
2. ✅ Scalable microservices architecture
3. ✅ Language-agnostic execution engine design
4. ✅ Comprehensive security layers
5. ✅ Production-ready infrastructure setup
6. ✅ Complete testing framework
7. ✅ CI/CD pipeline structure

The next phase will involve creating detailed implementation plans for each component.