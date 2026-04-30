const fs = require('fs');
const path = require('path');

const ALGO_DIR = path.join(process.cwd(), 'src/lib/mock-data/algorithms');

class FrameBuilder {
    constructor() {
        this.frames = [];
        this.frameIndex = 0;
        this.flowchartTemplate = null;
    }

    setFlowchartTemplate(nodes, edges) {
        this.flowchartTemplate = { nodes, edges };
    }

    addFrame({ lines, desc, activeNode, array, comparing, swapping, sorted, variables, visualization }) {
        let flowchart = null;
        if (this.flowchartTemplate && activeNode) {
            flowchart = {
                nodes: this.flowchartTemplate.nodes.map(n => ({ ...n, active: n.id === activeNode })),
                edges: this.flowchartTemplate.edges.map(e => ({ ...e, active: e.to === activeNode }))
            };
        }

        this.frames.push({
            frameIndex: this.frameIndex++,
            activeLine: lines,
            array: array,
            comparing: comparing || [],
            swapping: swapping || [],
            sorted: sorted || [],
            variables: variables || {},
            description: desc,
            visualization: visualization,
            flowchart
        });
    }

    build(filename) {
        const filepath = path.join(ALGO_DIR, filename);
        const data = require(filepath);
        data.executionFrames = this.frames;
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`Generated ${this.frames.length} frames for ${filename}`);
    }
}

function createVariable(val, type) {
    return { value: val, type };
}

module.exports = { FrameBuilder, createVariable };
