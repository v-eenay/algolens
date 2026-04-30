'use client';

import { ChevronDown } from 'lucide-react';

export interface AlgorithmOption {
  id: string;
  name: string;
  category: string;
  file: string;
}

interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithmId: string) => void;
}

const algorithms: AlgorithmOption[] = [
  // Data Structures
  { id: 'bst', name: 'Binary Search Tree', category: 'Data Structures', file: 'bst.json' },
  { id: 'linked-list', name: 'Linked List', category: 'Data Structures', file: 'linked-list.json' },
  { id: 'stack', name: 'Stack', category: 'Data Structures', file: 'stack.json' },
  { id: 'queue', name: 'Queue', category: 'Data Structures', file: 'queue.json' },
  { id: 'hash-table', name: 'Hash Table', category: 'Data Structures', file: 'hash-table.json' },
  
  // Sorting
  { id: 'quick-sort', name: 'Quick Sort', category: 'Sorting', file: 'quick-sort.json' },
  { id: 'merge-sort', name: 'Merge Sort', category: 'Sorting', file: 'merge-sort.json' },
  
  // Graph
  { id: 'dijkstra', name: 'Dijkstra\'s Algorithm', category: 'Graph', file: 'dijkstra.json' },
  
  // Dynamic Programming
  { id: 'fibonacci-dp', name: 'Fibonacci (DP)', category: 'Dynamic Programming', file: 'fibonacci-dp.json' },
  
  // Backtracking
  { id: 'n-queens', name: 'N-Queens', category: 'Backtracking', file: 'n-queens.json' },
];

// Group algorithms by category
const groupedAlgorithms = algorithms.reduce((acc, algo) => {
  if (!acc[algo.category]) {
    acc[algo.category] = [];
  }
  acc[algo.category].push(algo);
  return acc;
}, {} as Record<string, AlgorithmOption[]>);

export function AlgorithmSelector({ selectedAlgorithm, onAlgorithmChange }: AlgorithmSelectorProps) {
  // const selectedAlgo = algorithms.find(a => a.id === selectedAlgorithm);

  return (
    <div className="relative inline-flex items-center">
      <select
        id="algorithm-selector"
        className="h-8 appearance-none rounded border border-border bg-background px-3 pr-8 text-xs text-foreground outline-none transition-colors duration-200 focus:border-primary"
        value={selectedAlgorithm}
        onChange={(e) => onAlgorithmChange(e.target.value)}
      >
        {Object.entries(groupedAlgorithms).map(([category, algos]) => (
          <optgroup key={category} label={category}>
            {algos.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

// Export algorithms list for use in other components
export { algorithms };
