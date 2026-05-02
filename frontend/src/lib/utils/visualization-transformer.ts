import { RawExecutionState } from '../hooks/useExecutionSocket';
import { ExecutionFrame } from '../types/types';

/**
 * Transforms raw Execution Engine state into Frontend Visualization Frames
 */
export function transformExecutionStates(states: RawExecutionState[]): ExecutionFrame[] {
  return states.map((state, index) => {
    
    // Extract variables from the top frame of the call stack
    const localVars = state.call_stack.length > 0 
      ? state.call_stack[0].local_variables 
      : {};

    // Build the simple variable record
    const variables: Record<string, number> = {};
    const arrayElements: number[] = [];
    const pointers: Record<string, number> = {};
    
    // Analyze local variables to extract semantic meaning
    for (const [name, variableState] of Object.entries(localVars)) {
      if (variableState.type === 'list' && Array.isArray(variableState.value)) {
        // Assume the main array is what we want to visualize
        // In a real implementation, we'd look for specific variable names or heuristics
        if (arrayElements.length === 0) {
            arrayElements.push(...variableState.value);
        }
      } else if (variableState.type === 'int' || variableState.type === 'float') {
        variables[name] = variableState.value;
        
        // Simple heuristic: if it's named 'i', 'j', 'left', 'right', it's a pointer
        if (['i', 'j', 'left', 'right', 'mid'].includes(name)) {
          pointers[name] = variableState.value;
        }
      }
    }

    // Determine what action is happening (for the description)
    // For MVP, we just mention the line
    const description = `Executing line ${state.current_line}`;

    return {
      frameIndex: index,
      activeLine: state.current_line,
      array: arrayElements.length > 0 ? arrayElements : undefined,
      variables: Object.keys(variables).length > 0 ? variables : undefined,
      description: description,
      // Pass raw state to visualization engine for advanced use
      visualization: {
        type: arrayElements.length > 0 ? 'array' : 'table',
        data: {
          pointers,
          stdout: state.stdout
        }
      }
    };
  });
}
