from abc import ABC, abstractmethod
from typing import Dict, Any
from src.core.models import ExecutionResult, ExecutionRequest

class LanguagePlugin(ABC):
    @property
    @abstractmethod
    def language_name(self) -> str:
        pass

    @abstractmethod
    def execute(self, request: ExecutionRequest) -> ExecutionResult:
        """Executes the code and returns the execution trace result."""
        pass
