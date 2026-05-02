from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class VariableState(BaseModel):
    name: str
    type: str
    value: Any  # Could be a primitive or a structured representation of an object/array

class FrameState(BaseModel):
    function_name: str
    local_variables: Dict[str, VariableState]

class ExecutionState(BaseModel):
    step: int
    current_line: int
    call_stack: List[FrameState]
    stdout: str = ""
    error: Optional[str] = None

class ExecutionRequest(BaseModel):
    code: str
    language: str
    inputs: Dict[str, Any] = Field(default_factory=dict)

class ExecutionResult(BaseModel):
    success: bool
    states: List[ExecutionState]
    error: Optional[str] = None
