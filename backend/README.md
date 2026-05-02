# ProGyan AlgoLens - Backend API

FastAPI backend orchestrator for ProGyan AlgoLens.

## Features
- **User Authentication**: JWT-based login and registration.
- **Algorithm Persistence**: Save and manage user-defined algorithms.
- **Collaboration Support**: Share algorithms with granular permissions (view/edit).
- **Execution Orchestration**: Securely proxy and manage code execution sessions.
- **AI Integration**: Interface with LangChain service for contextual explanations.

## Tech Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy + Alembic)
- **Cache/Queue**: Redis + Celery
- **Authentication**: JWT + Passlib (bcrypt)
