import pytest
from src.core.tracer import CodeTracer

def test_simple_loop():
    code = """
sum = 0
for i in range(3):
    sum += i
"""
    tracer = CodeTracer(code)
    states = tracer.run()
    
    assert len(states) > 0
    # Final state should have sum = 3
    final_frame = states[-1].call_stack[0]
    assert 'sum' in final_frame.local_variables
    assert final_frame.local_variables['sum'].value == 3

def test_syntax_error():
    code = """
def broken():
  print("missing closing quote)
"""
    tracer = CodeTracer(code)
    states = tracer.run()
    
    assert len(states) == 1
    assert "SyntaxError" in states[0].error

def test_infinite_loop_prevention():
    code = """
while True:
    pass
"""
    tracer = CodeTracer(code)
    states = tracer.run()
    
    # Should stop due to max steps
    assert len(states) > 0
    assert "Maximum execution steps" in states[-1].error
