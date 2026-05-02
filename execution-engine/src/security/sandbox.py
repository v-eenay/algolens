from typing import Optional
from src.core.models import ExecutionRequest, ExecutionResult
from src.languages.python_plugin import PythonPlugin

class ExecutionSandbox:
    def __init__(self):
        # In a full implementation, this would manage Docker containers via docker-py
        self.plugins = {
            "python": PythonPlugin()
        }

    def execute_in_sandbox(self, request: ExecutionRequest) -> ExecutionResult:
        """
        Executes the code securely.
        For MVP, we just use the direct plugin.
        In production, this spins up a Docker container with gVisor.
        """
        plugin = self.plugins.get(request.language.lower())
        if not plugin:
            return ExecutionResult(
                success=False,
                states=[],
                error=f"Unsupported language: {request.language}"
            )
            
        return plugin.execute(request)
