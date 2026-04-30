const { FrameBuilder, createVariable } = require('./utils');

const sortFlowchart = {
    nodes: [
        { id: 'start', label: 'Start Sort' },
        { id: 'divide', label: 'Divide Array' },
        { id: 'conquer', label: 'Recursive Sort' },
        { id: 'merge', label: 'Merge Halves' },
        { id: 'end', label: 'End Sort' }
    ],
    edges: [
        { from: 'start', to: 'divide' },
        { from: 'divide', to: 'conquer' },
        { from: 'conquer', to: 'merge' },
        { from: 'merge', to: 'end' },
        { from: 'conquer', to: 'divide' }
    ]
};

function generate() {
    const builder = new FrameBuilder();
    builder.setFlowchartTemplate(sortFlowchart.nodes, sortFlowchart.edges);
    let arr = [38, 27, 43, 3, 9, 82, 10];

    function addArrFrame(lines, desc, comp = [], swap = [], vars = {}) {
        let activeNode = 'start';
        if (desc.includes('Merge') || desc.includes('Merged') || desc.includes('Copy')) activeNode = 'merge';
        else if (desc.includes('Sort')) activeNode = 'conquer';
        else if (desc.includes('Divide') || desc.includes('mid')) activeNode = 'divide';
        else if (desc.includes('Done')) activeNode = 'end';
        
        builder.addFrame({
            activeNode,
            lines, desc, array: [...arr], comparing: comp, swapping: swap, sorted: [], variables: vars,
            visualization: { type: 'array', data: { data: arr.map((v, i) => ({ value: v, index: i })) } }
        });
    }

    function merge(l, m, r) {
        addArrFrame({ Python: 13, 'C++': 8, JavaScript: 15 }, `Merging subarrays [${l}..${m}] and [${m+1}..${r}]`, [l, r], [], { l: createVariable(l, 'int'), m: createVariable(m, 'int'), r: createVariable(r, 'int') });
        
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[l + i];
        for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            addArrFrame({ Python: 24, 'C++': 19, JavaScript: 26 }, `Comparing L[${i}]=${L[i]} and R[${j}]=${R[j]}`, [l + i, m + 1 + j], [], { i: createVariable(i, 'int'), j: createVariable(j, 'int'), k: createVariable(k, 'int') });
            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
                addArrFrame({ Python: 26, 'C++': 21, JavaScript: 28 }, `Placed ${arr[k]} into array at index ${k}`, [], [k], { i: createVariable(i, 'int'), k: createVariable(k, 'int') });
            } else {
                arr[k] = R[j];
                j++;
                addArrFrame({ Python: 29, 'C++': 24, JavaScript: 31 }, `Placed ${arr[k]} into array at index ${k}`, [], [k], { j: createVariable(j, 'int'), k: createVariable(k, 'int') });
            }
            k++;
        }

        while (i < n1) {
            arr[k] = L[i];
            i++; k++;
            addArrFrame({ Python: 34, 'C++': 29, JavaScript: 36 }, `Copying remaining L element ${arr[k-1]}`, [], [k-1], {});
        }

        while (j < n2) {
            arr[k] = R[j];
            j++; k++;
            addArrFrame({ Python: 39, 'C++': 34, JavaScript: 41 }, `Copying remaining R element ${arr[k-1]}`, [], [k-1], {});
        }
    }

    function mergeSort(l, r) {
        addArrFrame({ Python: 3, 'C++': 40, JavaScript: 3 }, `mergeSort called for [${l}..${r}]`, [], [], { l: createVariable(l, 'int'), r: createVariable(r, 'int') });
        if (l < r) {
            let m = Math.floor(l + (r - l) / 2);
            addArrFrame({ Python: 6, 'C++': 43, JavaScript: 6 }, `Calculated mid = ${m}`, [m], [], { m: createVariable(m, 'int') });
            mergeSort(l, m);
            mergeSort(m + 1, r);
            merge(l, m, r);
        }
    }

    addArrFrame({ Python: 44, 'C++': 50, JavaScript: 47 }, `Initial array`, [], [], {});
    mergeSort(0, arr.length - 1);
    addArrFrame({ Python: 46, 'C++': 54, JavaScript: 49 }, `Array is fully sorted`, [], [], {});

    builder.build('merge-sort.json');
}

generate();
