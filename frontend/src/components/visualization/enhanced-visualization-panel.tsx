'use client';

import { Activity, Boxes, Loader2, PlaySquare } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { VisualizationPanelProps } from '@/lib/types/types';

// ---------------------------------------------------------------------------
// Type definitions for enhanced visualizations
// ---------------------------------------------------------------------------

interface TreeNode {
  id: string;
  value: number;
  x: number;
  y: number;
  color?: string;
}

interface TreeEdge {
  from: string;
  to: string;
  label?: string;
}

interface TreeData {
  nodes: TreeNode[];
  edges: TreeEdge[];
}

interface GraphNode {
  id: string;
  label: string;
  distance?: number | string;
  color?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  active?: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end';
  label: string;
  active: boolean;
}

interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  active: boolean;
}

interface FlowchartData {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

interface ArrayElement {
  value: number;
  index: number;
  color?: string;
}

interface ArrayPointer {
  index: number;
  label: string;
}

interface ArrayData {
  data: ArrayElement[];
  highlights: number[];
  pointers: ArrayPointer[];
}

// ---------------------------------------------------------------------------
// Tree Visualization Component
// ---------------------------------------------------------------------------

function TreeVisualization({ data }: { data: TreeData }) {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Empty tree</p>
      </div>
    );
  }

  return (
    <svg className="h-full w-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
      {/* Draw edges first */}
      {data.edges.map((edge, idx) => {
        const fromNode = data.nodes.find(n => n.id === edge.from);
        const toNode = data.nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        return (
          <g key={`edge-${idx}`}>
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            {edge.label && (
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 5}
                className="fill-muted-foreground text-[10px]"
                textAnchor="middle"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Draw nodes */}
      {data.nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="20"
            fill={node.color || '#64748b'}
            stroke="currentColor"
            strokeWidth="2"
            className="text-border transition-all duration-300"
          />
          <text
            x={node.x}
            y={node.y}
            className="fill-white text-sm font-medium"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {node.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Graph Visualization Component
// ---------------------------------------------------------------------------

function GraphVisualization({ data }: { data: GraphData }) {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Empty graph</p>
      </div>
    );
  }

  // Calculate positions in a circle
  const centerX = 400;
  const centerY = 200;
  const radius = 120;
  const angleStep = (2 * Math.PI) / data.nodes.length;

  const nodesWithPositions = data.nodes.map((node, idx) => ({
    ...node,
    x: centerX + radius * Math.cos(idx * angleStep - Math.PI / 2),
    y: centerY + radius * Math.sin(idx * angleStep - Math.PI / 2),
  }));

  return (
    <svg className="h-full w-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
      {/* Draw edges */}
      {data.edges.map((edge, idx) => {
        const fromNode = nodesWithPositions.find(n => n.id === edge.from);
        const toNode = nodesWithPositions.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        const isActive = edge.active;

        return (
          <g key={`edge-${idx}`}>
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={isActive ? '#3b82f6' : 'currentColor'}
              strokeWidth={isActive ? '3' : '2'}
              className={isActive ? '' : 'text-border'}
            />
            {edge.weight !== undefined && (
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 8}
                className="fill-foreground text-xs font-medium"
                textAnchor="middle"
              >
                {edge.weight}
              </text>
            )}
          </g>
        );
      })}

      {/* Draw nodes */}
      {nodesWithPositions.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="25"
            fill={node.color || '#64748b'}
            stroke="currentColor"
            strokeWidth="2"
            className="text-border transition-all duration-300"
          />
          <text
            x={node.x}
            y={node.y - 5}
            className="fill-white text-sm font-bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {node.label}
          </text>
          {node.distance !== undefined && (
            <text
              x={node.x}
              y={node.y + 10}
              className="fill-white text-[10px]"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {node.distance}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Flowchart Visualization Component
// ---------------------------------------------------------------------------

function FlowchartVisualization({ data }: { data: FlowchartData }) {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">No flowchart data</p>
      </div>
    );
  }

  const nodeSpacing = 120;
  const startY = 50;

  const nodesWithPositions = data.nodes.map((node, idx) => ({
    ...node,
    x: 400,
    y: startY + idx * nodeSpacing,
  }));

  const getNodeShape = (type: string) => {
    switch (type) {
      case 'start':
      case 'end':
        return 'rounded-full';
      case 'decision':
        return 'rotate-45';
      default:
        return '';
    }
  };

  return (
    <svg className="h-full w-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
      {/* Draw edges */}
      {data.edges.map((edge, idx) => {
        const fromNode = nodesWithPositions.find(n => n.id === edge.from);
        const toNode = nodesWithPositions.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        const isActive = edge.active;

        return (
          <g key={`edge-${idx}`}>
            <line
              x1={fromNode.x}
              y1={fromNode.y + 30}
              x2={toNode.x}
              y2={toNode.y - 30}
              stroke={isActive ? '#3b82f6' : 'currentColor'}
              strokeWidth={isActive ? '3' : '2'}
              className={isActive ? '' : 'text-border'}
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="currentColor" className="text-border" />
        </marker>
      </defs>

      {/* Draw nodes */}
      {nodesWithPositions.map((node) => {
        const isActive = node.active;
        const fillColor = isActive ? '#3b82f6' : '#64748b';

        if (node.type === 'start' || node.type === 'end') {
          return (
            <g key={node.id}>
              <ellipse
                cx={node.x}
                cy={node.y}
                rx="50"
                ry="25"
                fill={fillColor}
                stroke="currentColor"
                strokeWidth="2"
                className="text-border transition-all duration-300"
              />
              <text
                x={node.x}
                y={node.y}
                className="fill-white text-xs font-medium"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {node.label}
              </text>
            </g>
          );
        } else if (node.type === 'decision') {
          return (
            <g key={node.id}>
              <rect
                x={node.x - 35}
                y={node.y - 35}
                width="70"
                height="70"
                fill={fillColor}
                stroke="currentColor"
                strokeWidth="2"
                className="text-border transition-all duration-300"
                transform={`rotate(45 ${node.x} ${node.y})`}
              />
              <text
                x={node.x}
                y={node.y}
                className="fill-white text-xs font-medium"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {node.label}
              </text>
            </g>
          );
        } else {
          return (
            <g key={node.id}>
              <rect
                x={node.x - 60}
                y={node.y - 25}
                width="120"
                height="50"
                rx="5"
                fill={fillColor}
                stroke="currentColor"
                strokeWidth="2"
                className="text-border transition-all duration-300"
              />
              <text
                x={node.x}
                y={node.y}
                className="fill-white text-xs font-medium"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {node.label}
              </text>
            </g>
          );
        }
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Array Visualization (from original, with improvements)
// ---------------------------------------------------------------------------

function ArrayVisualization({ data, highlights, pointers }: ArrayData) {
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <LayoutGroup>
      <div className="grid flex-1 items-end gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map((element, index) => {
          const heightPercent = Math.max(12, (element.value / maxVal) * 100);
          const isHighlighted = highlights.includes(index);
          const pointer = pointers.find(p => p.index === index);

          let barClass = element.color ? '' : 'bg-secondary border-border';
          let labelClass = 'text-muted-foreground';

          if (element.color) {
            barClass = `border-2`;
            labelClass = 'text-foreground';
          }

          return (
            <motion.div
              key={`bar-${data.length}-${index}`}
              layout
              layoutId={`array-bar-${element.value}-${index}`}
              className="flex h-full flex-col justify-end gap-2"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
              {/* Pointer label */}
              {pointer && (
                <div className="rounded border border-primary bg-primary/10 px-1 py-0.5 text-center text-[10px] text-primary">
                  {pointer.label}
                </div>
              )}

              {/* Bar */}
              <motion.div
                layout
                className={`relative rounded-t border transition-colors duration-300 ${barClass}`}
                style={{ 
                  height: `${heightPercent}%`, 
                  minHeight: '2rem',
                  backgroundColor: element.color || undefined,
                  borderColor: element.color || undefined
                }}
                initial={false}
                animate={{
                  y: isHighlighted ? -6 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className="absolute inset-x-0 top-2 text-center text-xs font-medium text-white">
                  {element.value}
                </span>
              </motion.div>

              {/* Index label */}
              <div className={`rounded border border-border bg-background px-1 py-0.5 text-center text-[10px] ${labelClass}`}>
                [{index}]
              </div>
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Dry Run Display
// ---------------------------------------------------------------------------

function EnhancedDryRunTrace({ frame }: { frame: any }) {
  const vars = frame.variables || {};

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Variable state table */}
      <div className="rounded border border-border bg-surface p-3">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
          Variables — Frame {frame.frameNumber || frame.frameIndex + 1}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">Type</th>
                <th className="pb-2 text-left font-medium text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(vars).map(([key, val]: [string, any]) => (
                <tr key={key} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-foreground">{key}</td>
                  <td className="py-2 pr-4">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {val.type || typeof val}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-foreground">
                    {val.value !== undefined ? String(val.value) : String(val)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step description */}
      <div className="rounded border border-border bg-surface p-3">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
          Step Description
        </div>
        <p className="text-sm leading-relaxed text-foreground">{frame.description}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Enhanced Visualization Panel
// ---------------------------------------------------------------------------

export function EnhancedVisualizationPanel({
  activeTab,
  currentFrame,
  totalFrames,
  isPlaying,
  onTabChange,
  isLoading = false,
}: VisualizationPanelProps) {
  if (isLoading || !currentFrame) {
    return (
      <section className="flex h-full min-h-[26rem] flex-col items-center justify-center rounded border border-border bg-card p-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading visualizer…</p>
      </section>
    );
  }

  const visualization = (currentFrame as any).visualization;
  const flowchart = (currentFrame as any).flowchart;
  const visualizationType = visualization?.type || 'array';

  return (
    <section className="flex h-full min-h-[26rem] flex-col rounded border border-border bg-card p-2">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary">
            <Boxes className="h-3.5 w-3.5" />
            Visualizer
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Frame {(currentFrame as any).frameNumber || (currentFrame as any).frameIndex + 1} of {totalFrames}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex rounded border border-border bg-surface p-0.5">
          {(['dry-run', 'animated'] as const).map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                className={`rounded px-3 py-1.5 text-xs transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                }`}
                onClick={() => onTabChange(tab)}
                type="button"
              >
                {tab === 'dry-run' ? 'Dry Run' : 'Animated'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'animated' ? (
            <motion.div
              key="animated-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex min-h-0 flex-1 flex-col gap-2"
            >
              {/* Main visualization canvas */}
              <div className="relative flex min-h-[18rem] flex-1 flex-col overflow-hidden rounded border border-border bg-surface p-3">
                <div className="relative flex h-full flex-col">
                  {/* Status bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="rounded border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {visualizationType === 'tree' && 'Tree Structure'}
                      {visualizationType === 'graph' && 'Graph Visualization'}
                      {visualizationType === 'array' && 'Array Visualization'}
                    </div>
                    <div
                      className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        isPlaying
                          ? 'border-success bg-success/10 text-success'
                          : 'border-primary bg-primary/10 text-primary'
                      }`}
                    >
                      {isPlaying ? 'Animating' : 'Paused'}
                    </div>
                  </div>

                  {/* Render appropriate visualization */}
                  <div className="flex flex-1 items-center justify-center">
                    {visualizationType === 'tree' && <TreeVisualization data={visualization.data} />}
                    {visualizationType === 'graph' && <GraphVisualization data={visualization.data} />}
                    {visualizationType === 'array' && (
                      <ArrayVisualization
                        data={visualization.data}
                        highlights={visualization.highlights || []}
                        pointers={visualization.pointers || []}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Flowchart section */}
              {flowchart && (
                <div className="rounded border border-border bg-surface p-3">
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Algorithm Flow
                  </div>
                  <div className="h-32">
                    <FlowchartVisualization data={flowchart} />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dryrun-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="scrollbar-thin min-h-0 flex-1 overflow-auto"
            >
              <EnhancedDryRunTrace frame={currentFrame} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
