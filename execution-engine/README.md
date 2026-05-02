# ProGyan AlgoLens - Execution Engine

Language-agnostic code execution engine for ProGyan AlgoLens.

## Features
- **Multi-language Support**: Initial support for Python with plugin architecture for others.
- **Step-by-Step Tracing**: Capture local variables and memory states at every line.
- **Sandboxing**: Isolated execution using Docker and gVisor to prevent system access.
- **Resource Limiting**: CPU and memory constraints for user-submitted code.
- **AST Validation**: Static analysis to prevent malicious code imports.

## Architecture
- **Tracer**: uses `sys.settrace` for granular execution tracking.
- **Orchestrator**: FastAPI WebSocket server streaming frames in real-time.
- **Sandbox Manager**: Handles containerized environment lifecycle.
