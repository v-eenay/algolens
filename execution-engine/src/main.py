from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from src.core.models import ExecutionRequest, ExecutionResult
from src.security.sandbox import ExecutionSandbox
import json
import asyncio

app = FastAPI(title="AlgoLens Execution Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sandbox = ExecutionSandbox()

@app.post("/api/execute", response_model=ExecutionResult)
async def execute_code(request: ExecutionRequest):
    try:
        result = sandbox.execute_in_sandbox(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/execute")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            request = ExecutionRequest(**payload)
            
            # For real-time streaming, we'd normally hook into the tracer directly.
            # For this MVP, we execute synchronously and then stream the states back with a slight delay
            # to simulate real-time execution.
            
            result = sandbox.execute_in_sandbox(request)
            
            for state in result.states:
                await websocket.send_text(state.model_dump_json())
                await asyncio.sleep(0.05)  # Simulate execution delay
                
            # Send terminal state
            await websocket.send_json({"type": "terminal", "success": result.success, "error": result.error})
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({"type": "error", "error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
