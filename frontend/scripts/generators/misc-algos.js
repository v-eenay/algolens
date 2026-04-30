const fs = require('fs');
const path = require('path');

const ALGO_DIR = path.join(__dirname, '../../src/lib/mock-data/algorithms');

class FrameBuilder {
    constructor() {
        this.frames = [];
        this.frameIndex = 0;
        this.flowchartTemplate = null;
    }
    setFlowchartTemplate(nodes, edges) {
        this.flowchartTemplate = { nodes, edges };
    }
    addFrame(obj) {
        let flowchart = null;
        if (this.flowchartTemplate && obj.activeNode) {
            flowchart = {
                nodes: this.flowchartTemplate.nodes.map(n => ({ ...n, active: n.id === obj.activeNode })),
                edges: this.flowchartTemplate.edges.map(e => ({ ...e, active: e.to === obj.activeNode }))
            };
        }
        
        this.frames.push({
            frameIndex: this.frameIndex++,
            activeLine: obj.lines,
            array: obj.array,
            comparing: obj.comparing || [],
            swapping: obj.swapping || [],
            sorted: obj.sorted || [],
            variables: obj.variables || {},
            description: obj.desc,
            visualization: obj.visualization,
            flowchart
        });
    }
    build(filename) {
        const filepath = path.join(ALGO_DIR, filename);
        let data = { executionFrames: [] };
        if (fs.existsSync(filepath)) {
            data = require(filepath);
        }
        data.executionFrames = this.frames;
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`Generated ${this.frames.length} frames for ${filename}`);
    }
}

const dsFlowchart = {
    nodes: [
        { id: 'start', label: 'Start Operation' },
        { id: 'execute', label: 'Execute Logic' },
        { id: 'update', label: 'Update State' },
        { id: 'end', label: 'End Operation' }
    ],
    edges: [
        { from: 'start', to: 'execute' },
        { from: 'execute', to: 'update' },
        { from: 'update', to: 'end' }
    ]
};

// 1. Stack
function generateStack() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dsFlowchart.nodes, dsFlowchart.edges);
    let stack = [];
    const push = (val) => {
        builder.addFrame({ lines: { Python: 5, 'C++': 13, JavaScript: 6 }, desc: `Pushing ${val} to stack`, activeNode: 'start', array: [...stack], visualization: { type: 'array', data: { data: stack.map(v => ({value: v})) } }});
        stack.push(val);
        builder.addFrame({ lines: { Python: 6, 'C++': 15, JavaScript: 7 }, desc: `Pushed ${val}`, activeNode: 'end', array: [...stack], visualization: { type: 'array', data: { data: stack.map(v => ({value: v})) } }});
    };
    const pop = () => {
        builder.addFrame({ lines: { Python: 9, 'C++': 20, JavaScript: 11 }, desc: `Popping from stack`, activeNode: 'start', array: [...stack], visualization: { type: 'array', data: { data: stack.map(v => ({value: v})) } }});
        const v = stack.pop();
        builder.addFrame({ lines: { Python: 12, 'C++': 24, JavaScript: 15 }, desc: `Popped ${v}`, activeNode: 'end', array: [...stack], visualization: { type: 'array', data: { data: stack.map(v => ({value: v})) } }});
    };
    builder.addFrame({ lines: { Python: 20, 'C++': 41, JavaScript: 27 }, desc: `Initial empty stack`, activeNode: 'start', array: [...stack], visualization: { type: 'array', data: { data: stack.map(v => ({value: v})) } }});
    push(10); push(20); push(30); pop(); push(40);
    builder.build('stack.json');
}

// 2. Queue
function generateQueue() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dsFlowchart.nodes, dsFlowchart.edges);
    let queue = [];
    const enqueue = (val) => {
        builder.addFrame({ lines: { Python: 5, 'C++': 13, JavaScript: 6 }, desc: `Enqueueing ${val}`, activeNode: 'start', array: [...queue], visualization: { type: 'array', data: { data: queue.map(v => ({value: v})) } }});
        queue.push(val);
        builder.addFrame({ lines: { Python: 6, 'C++': 15, JavaScript: 7 }, desc: `Enqueued ${val}`, activeNode: 'end', array: [...queue], visualization: { type: 'array', data: { data: queue.map(v => ({value: v})) } }});
    };
    const dequeue = () => {
        builder.addFrame({ lines: { Python: 9, 'C++': 20, JavaScript: 11 }, desc: `Dequeueing`, activeNode: 'start', array: [...queue], visualization: { type: 'array', data: { data: queue.map(v => ({value: v})) } }});
        const v = queue.shift();
        builder.addFrame({ lines: { Python: 12, 'C++': 24, JavaScript: 15 }, desc: `Dequeued ${v}`, activeNode: 'end', array: [...queue], visualization: { type: 'array', data: { data: queue.map(v => ({value: v})) } }});
    };
    builder.addFrame({ lines: { Python: 20, 'C++': 41, JavaScript: 27 }, desc: `Initial empty queue`, activeNode: 'start', array: [...queue], visualization: { type: 'array', data: { data: queue.map(v => ({value: v})) } }});
    enqueue(10); enqueue(20); enqueue(30); dequeue(); enqueue(40);
    builder.build('queue.json');
}

const dpFlowchart = {
    nodes: [
        { id: 'start', label: 'Call fib(n)' },
        { id: 'base', label: 'Check Base Case' },
        { id: 'memo', label: 'Check Memo' },
        { id: 'calc', label: 'Calculate & Store' },
        { id: 'end', label: 'Return Result' }
    ],
    edges: [
        { from: 'start', to: 'base' },
        { from: 'base', to: 'memo' },
        { from: 'memo', to: 'calc' },
        { from: 'calc', to: 'end' }
    ]
};

// 3. Fibonacci DP
function generateFibonacci() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dpFlowchart.nodes, dpFlowchart.edges);
    let memo = {};
    function fib(n) {
        builder.addFrame({ lines: { Python: 3, 'C++': 6, JavaScript: 3 }, desc: `fib(${n}) called`, activeNode: 'start', variables: { n: { value: n, type: 'int' } }, visualization: { type: 'array', data: { data: Object.values(memo).map(v => ({value: v})) } }});
        if (n <= 1) return n;
        if (memo[n]) {
            builder.addFrame({ lines: { Python: 6, 'C++': 9, JavaScript: 6 }, desc: `Found fib(${n}) in memo`, activeNode: 'memo', variables: { n: { value: n, type: 'int' } }, visualization: { type: 'array', data: { data: Object.values(memo).map(v => ({value: v})) } }});
            return memo[n];
        }
        builder.addFrame({ lines: { Python: 10, 'C++': 13, JavaScript: 10 }, desc: `Calculating fib(${n})`, activeNode: 'calc', variables: { n: { value: n, type: 'int' } }, visualization: { type: 'array', data: { data: Object.values(memo).map(v => ({value: v})) } }});
        memo[n] = fib(n - 1) + fib(n - 2);
        builder.addFrame({ lines: { Python: 11, 'C++': 14, JavaScript: 11 }, desc: `Stored fib(${n}) = ${memo[n]}`, activeNode: 'end', variables: { n: { value: n, type: 'int' }, res: { value: memo[n], type: 'int' } }, visualization: { type: 'array', data: { data: Object.values(memo).map(v => ({value: v})) } }});
        return memo[n];
    }
    builder.addFrame({ lines: { Python: 14, 'C++': 19, JavaScript: 15 }, desc: `Starting Fibonacci DP`, activeNode: 'start', variables: {}, visualization: { type: 'array', data: { data: [] } }});
    fib(5);
    builder.build('fibonacci-dp.json');
}

// 4. Hash Table
function generateHashTable() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dsFlowchart.nodes, dsFlowchart.edges);
    let table = new Array(5).fill(null).map(() => []);
    function put(k, v) {
        let idx = k % 5;
        builder.addFrame({ lines: { Python: 5, 'C++': 15, JavaScript: 6 }, desc: `Hashing key ${k} to index ${idx}`, activeNode: 'execute', variables: { key: { value: k, type: 'int' }, val: { value: v, type: 'int' } }, visualization: { type: 'array', data: { data: table.map((b, i) => ({ value: `[${i}]: ${b.join(', ')}` })) } }});
        table[idx].push({k, v});
        builder.addFrame({ lines: { Python: 10, 'C++': 20, JavaScript: 11 }, desc: `Inserted [${k}, ${v}] at index ${idx}`, activeNode: 'update', variables: { key: { value: k, type: 'int' }, val: { value: v, type: 'int' } }, visualization: { type: 'array', data: { data: table.map((b, i) => ({ value: `[${i}]: ${b.map(x=>x.k+":"+x.v).join(', ')}` })) } }});
    }
    put(1, 10); put(6, 60); put(2, 20);
    builder.build('hash-table.json');
}

generateStack();
generateQueue();
generateFibonacci();
generateHashTable();
