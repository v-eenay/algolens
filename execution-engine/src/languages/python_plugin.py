from src.languages.base import LanguagePlugin
from src.core.models import ExecutionResult, ExecutionRequest
from src.core.tracer import CodeTracer

class PythonPlugin(LanguagePlugin):
    @property
    def language_name(self) -> str:
        return "python"

    def execute(self, request: ExecutionRequest) -> ExecutionResult:
        tracer = CodeTracer(request.code)
        
        try:
            states = tracer.run()
            # If the last state has an error, mark as failure
            success = True
            error_msg = None
            if states and states[-1].error:
                success = False
                error_msg = states[-1].error
                
            return ExecutionResult(
                success=success,
                states=states,
                error=error_msg
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                states=tracer.states if 'tracer' in locals() else [],
                error=str(e)
            )
