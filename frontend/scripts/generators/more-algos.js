const { FrameBuilder, createVariable } = require('./utils');

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

// 5. Linked List
function generateLinkedList() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dsFlowchart.nodes, dsFlowchart.edges);
    let list = [];
    const insert = (val) => {
        builder.addFrame({ lines: { Python: 5, 'C++': 15, JavaScript: 6 }, desc: `Inserting ${val} at head`, activeNode: 'start', array: [...list], visualization: { type: 'array', data: { data: list.map(v => ({value: v})) } }});
        list.unshift(val);
        builder.addFrame({ lines: { Python: 8, 'C++': 20, JavaScript: 9 }, desc: `Inserted ${val}`, activeNode: 'end', array: [...list], visualization: { type: 'array', data: { data: list.map(v => ({value: v})) } }});
    };
    builder.addFrame({ lines: { Python: 20, 'C++': 41, JavaScript: 27 }, desc: `Initial empty list`, activeNode: 'start', array: [...list], visualization: { type: 'array', data: { data: list.map(v => ({value: v})) } }});
    insert(10); insert(20); insert(30);
    builder.build('linked-list.json');
}

// 6. BST
function generateBST() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dsFlowchart.nodes, dsFlowchart.edges);
    let nodes = [];
    const insert = (val) => {
        builder.addFrame({ lines: { Python: 5, 'C++': 15, JavaScript: 6 }, desc: `Inserting ${val} into BST`, activeNode: 'start', array: [...nodes], visualization: { type: 'tree', data: { nodes: nodes.map((n, i) => ({ id: ''+n, value: n, x: 200+i*30, y: 50+i*30 })), edges: [] } }});
        nodes.push(val);
        builder.addFrame({ lines: { Python: 10, 'C++': 20, JavaScript: 11 }, desc: `Inserted ${val}`, activeNode: 'end', array: [...nodes], visualization: { type: 'tree', data: { nodes: nodes.map((n, i) => ({ id: ''+n, value: n, x: 200+i*30, y: 50+i*30 })), edges: [] } }});
    };
    builder.addFrame({ lines: { Python: 20, 'C++': 41, JavaScript: 27 }, desc: `Initial empty BST`, activeNode: 'start', array: [...nodes], visualization: { type: 'tree', data: { nodes: [], edges: [] } }});
    insert(50); insert(30); insert(70);
    builder.build('bst.json');
}

// 7. Dijkstra
function generateDijkstra() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dsFlowchart.nodes, dsFlowchart.edges);
    let dist = [0, Infinity, Infinity];
    builder.addFrame({ lines: { Python: 5, 'C++': 15, JavaScript: 6 }, desc: `Initialize distances`, activeNode: 'start', array: [...dist], visualization: { type: 'graph', data: { nodes: [{id: '0', value: 0}, {id: '1', value: Infinity}, {id: '2', value: Infinity}], edges: [] } }});
    dist = [0, 10, 5];
    builder.addFrame({ lines: { Python: 10, 'C++': 20, JavaScript: 11 }, desc: `Relax edges from 0`, activeNode: 'execute', array: [...dist], visualization: { type: 'graph', data: { nodes: [{id: '0', value: 0}, {id: '1', value: 10}, {id: '2', value: 5}], edges: [] } }});
    builder.build('dijkstra.json');
}

// 8. N-Queens
function generateNQueens() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(dsFlowchart.nodes, dsFlowchart.edges);
    builder.addFrame({ lines: { Python: 5, 'C++': 15, JavaScript: 6 }, desc: `Start N-Queens (N=4)`, activeNode: 'start', array: [], visualization: { type: 'array', data: { data: [] } }});
    builder.addFrame({ lines: { Python: 10, 'C++': 20, JavaScript: 11 }, desc: `Placing queen at (0, 1)`, activeNode: 'execute', array: [], visualization: { type: 'array', data: { data: [] } }});
    builder.addFrame({ lines: { Python: 15, 'C++': 25, JavaScript: 16 }, desc: `Found solution`, activeNode: 'end', array: [], visualization: { type: 'array', data: { data: [] } }});
    builder.build('n-queens.json');
}

generateLinkedList();
generateBST();
generateDijkstra();
generateNQueens();
