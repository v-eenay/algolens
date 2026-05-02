import sys
import copy
import traceback
import io
from typing import Any, Dict, List, Optional
from .models import ExecutionState, FrameState, VariableState

class CodeTracer:
    def __init__(self, code: str):
        self.code = code
        self.states: List[ExecutionState] = []
        self.step = 0
        self.stdout_capture = io.StringIO()
        self._max_steps = 1000  # Prevent infinite loops
        
    def _serialize_value(self, value: Any) -> Any:
        # Basic serialization to ensure JSON compatibility for the frontend
        try:
            if isinstance(value, (int, float, str, bool, type(None))):
                return value
            elif isinstance(value, list):
                # Cap list size to prevent huge payload
                if len(value) > 100:
                    return [self._serialize_value(v) for v in value[:100]] + ["..."]
                return [self._serialize_value(v) for v in value]
            elif isinstance(value, dict):
                # Cap dict size
                items = list(value.items())
                if len(items) > 50:
                    items = items[:50]
                return {str(k): self._serialize_value(v) for k, v in items}
            else:
                return str(value)
        except Exception:
            return "<unserializable>"

    def trace_calls(self, frame, event, arg):
        if event != 'line':
            return self.trace_calls
            
        if self.step >= self._max_steps:
            raise RuntimeError(f"Maximum execution steps ({self._max_steps}) exceeded.")

        # Capture state
        local_vars = {}
        for name, value in frame.f_locals.items():
            if not name.startswith('__'):  # Ignore internal variables
                local_vars[name] = VariableState(
                    name=name,
                    type=type(value).__name__,
                    value=self._serialize_value(value)
                )

        frame_state = FrameState(
            function_name=frame.f_code.co_name,
            local_variables=local_vars
        )

        self.states.append(ExecutionState(
            step=self.step,
            current_line=frame.f_lineno,
            call_stack=[frame_state],  # Simplified to top frame for MVP
            stdout=self.stdout_capture.getvalue()
        ))
        
        self.step += 1
        return self.trace_calls

    def run(self) -> List[ExecutionState]:
        self.states = []
        self.step = 0
        
        # Compile code
        try:
            compiled_code = compile(self.code, '<string>', 'exec')
        except SyntaxError as e:
            self.states.append(ExecutionState(
                step=self.step,
                current_line=e.lineno or 0,
                call_stack=[],
                error=f"SyntaxError: {str(e)}"
            ))
            return self.states

        # Execute with tracing
        global_env = {}
        old_stdout = sys.stdout
        sys.stdout = self.stdout_capture
        sys.settrace(self.trace_calls)
        
        try:
            exec(compiled_code, global_env)
        except Exception as e:
            exc_type, exc_value, exc_traceback = sys.exc_info()
            # Find the line number where it failed in the traced code
            lineno = 0
            for tb_frame in traceback.extract_tb(exc_traceback):
                if tb_frame.filename == '<string>':
                    lineno = tb_frame.lineno
            self.states.append(ExecutionState(
                step=self.step,
                current_line=lineno,
                call_stack=[],
                error=f"{type(e).__name__}: {str(e)}"
            ))
        finally:
            sys.settrace(None)
            sys.stdout = old_stdout

        return self.states
