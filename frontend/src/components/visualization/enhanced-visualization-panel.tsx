'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Boxes, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { VisualizationPanelProps } from '@/lib/types/types';
import { useExecutionStore } from '@/lib/store/executionStore';

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
// Hooks
// ---------------------------------------------------------------------------
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.5);

  // Auto-scroll to active node
  useEffect(() => {
    if (!data || !data.nodes) return;
    const activeNodeIdx = data.nodes.findIndex(n => n.active);
    if (containerRef.current && activeNodeIdx !== -1) {
      const nodeSpacing = 120;
      const startY = 50;
      const activeY = startY + activeNodeIdx * nodeSpacing;
      
      const containerHeight = containerRef.current.clientHeight;
      const targetScroll = (activeY * scale) - (containerHeight / 2);
      
      containerRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }, [data, scale]);

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

  const totalHeight = Math.max(300, startY + data.nodes.length * nodeSpacing + 100);

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-background/30 rounded border border-border/50">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 rounded-md border border-border bg-surface/80 p-1 backdrop-blur-sm shadow-sm transition-opacity">
        <button type="button" onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors" title="Zoom In">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => setScale(1)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors" title="Reset Zoom">
          <Maximize className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => setScale(s => Math.max(s - 0.2, 0.4))} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors" title="Zoom Out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin relative"
      >
        <motion.div 
          className="origin-top"
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: '100%', height: totalHeight * scale, minHeight: '100%' }}
        >
          <svg className="w-full" style={{ height: totalHeight }} viewBox={`0 0 800 ${totalHeight}`} preserveAspectRatio="xMidYMin meet">
            {/* Draw edges */}
            {data.edges.map((edge, idx) => {
              const fromNode = nodesWithPositions.find(n => n.id === edge.from);
              const toNode = nodesWithPositions.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isActive = edge.active;

              return (
                <g key={`edge-${idx}`}>
                  <motion.line
                    x1={fromNode.x}
                    y1={fromNode.y + 30}
                    x2={toNode.x}
                    y2={toNode.y - 30}
                    stroke={isActive ? '#3b82f6' : 'currentColor'}
                    className={isActive ? '' : 'text-border'}
                    markerEnd="url(#arrowhead)"
                    initial={false}
                    animate={{
                      strokeWidth: isActive ? 3 : 2,
                      opacity: isActive ? 1 : 0.3
                    }}
                    transition={{ duration: 0.3 }}
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
              const fillColor = isActive ? '#3b82f6' : '#1e293b';
              const strokeColor = isActive ? '#60a5fa' : 'currentColor';
              const scaleNode = isActive ? 1.05 : 1;
              const opacityNode = isActive ? 1 : 0.8;

              if (node.type === 'start' || node.type === 'end') {
                return (
                  <motion.g 
                    key={node.id} 
                    animate={{ scale: scaleNode, opacity: opacityNode }} 
                    style={{ originX: '50%', originY: '50%', transformOrigin: `${node.x}px ${node.y}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.ellipse
                      cx={node.x}
                      cy={node.y}
                      rx="50"
                      ry="25"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2"
                      className="text-border"
                      animate={{ fill: fillColor, stroke: strokeColor }}
                    />
                    <text x={node.x} y={node.y} className="fill-white text-xs font-medium" textAnchor="middle" dominantBaseline="middle">
                      {node.label}
                    </text>
                  </motion.g>
                );
              } else if (node.type === 'decision') {
                return (
                  <motion.g 
                    key={node.id} 
                    animate={{ scale: scaleNode, opacity: opacityNode }} 
                    style={{ originX: '50%', originY: '50%', transformOrigin: `${node.x}px ${node.y}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.rect
                      x={node.x - 35}
                      y={node.y - 35}
                      width="70"
                      height="70"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2"
                      className="text-border"
                      transform={`rotate(45 ${node.x} ${node.y})`}
                      animate={{ fill: fillColor, stroke: strokeColor }}
                    />
                    <text x={node.x} y={node.y} className="fill-white text-xs font-medium" textAnchor="middle" dominantBaseline="middle">
                      {node.label}
                    </text>
                  </motion.g>
                );
              } else {
                return (
                  <motion.g 
                    key={node.id} 
                    animate={{ scale: scaleNode, opacity: opacityNode }} 
                    style={{ originX: '50%', originY: '50%', transformOrigin: `${node.x}px ${node.y}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.rect
                      x={node.x - 60}
                      y={node.y - 25}
                      width="120"
                      height="50"
                      rx="5"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2"
                      className="text-border"
                      animate={{ fill: fillColor, stroke: strokeColor }}
                    />
                    <text x={node.x} y={node.y} className="fill-white text-xs font-medium" textAnchor="middle" dominantBaseline="middle">
                      {node.label}
                    </text>
                  </motion.g>
                );
              }
            })}
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Array Visualization (from original, with improvements)
// ---------------------------------------------------------------------------

function ArrayVisualization({ data = [], highlights = [], pointers = [] }: ArrayData) {
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <LayoutGroup>
      <div className="grid flex-1 items-end gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        <AnimatePresence>
          {data.map((element, index) => {
            const heightPercent = Math.max(12, (element.value / maxVal) * 100);
            const isHighlighted = highlights.includes(index);
            const pointer = pointers.find(p => p.index === index);

            let barClass = element.color ? '' : 'bg-secondary border-border';
            let labelClass = 'text-muted-foreground';

            if (element.color) {
              barClass = `border-2`;
              labelClass = 'text-foreground';
            } else if (isHighlighted) {
              barClass = 'bg-primary/20 border-primary border-2';
              labelClass = 'text-primary font-bold';
            }

            return (
              <motion.div
                key={`array-item-${element.value}-${index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-full flex-col justify-end gap-2"
                transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
              >
                {/* Pointer label */}
                <div className="h-5 flex items-end justify-center">
                  <AnimatePresence>
                    {pointer && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="rounded border border-primary bg-primary/20 px-1.5 py-0.5 text-center text-[10px] font-bold text-primary whitespace-nowrap shadow-sm"
                      >
                        {pointer.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bar */}
                <motion.div
                  layout
                  className={`relative rounded-t border transition-colors duration-200 ${barClass}`}
                  style={{ 
                    height: `${heightPercent}%`, 
                    minHeight: '2rem',
                    backgroundColor: element.color || undefined,
                    borderColor: element.color || undefined
                  }}
                  animate={{
                    y: isHighlighted ? -8 : 0,
                    scale: isHighlighted ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <span className="absolute inset-x-0 top-2 text-center text-xs font-medium text-white">
                    {typeof element.value === 'object' && element.value !== null ? String((element.value as Record<string, unknown>).value) : element.value}
                  </span>
                </motion.div>

                {/* Index label */}
                <div className={`rounded border border-border bg-background px-1 py-0.5 text-center text-[10px] transition-colors ${labelClass}`}>
                  [{index}]
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Dry Run Display
// ---------------------------------------------------------------------------

function EnhancedDryRunTrace({ frame }: { frame: Record<string, unknown> }) {
  const vars = frame.variables || {};
  const prevVars = usePrevious(vars) || {};

  return (
    <div className="flex h-full flex-col gap-4 p-2">
      {/* Step description & Active Line */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        key={`desc-${frame.frameIndex}`}
        className="rounded border border-primary/20 bg-primary/5 p-3 relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            Step Description
          </div>
          {frame.activeLine !== undefined && (
            <div className="text-[10px] rounded bg-primary/20 text-primary px-2 py-0.5 font-mono border border-primary/30">
              Line {typeof frame.activeLine === 'object' ? '...' : frame.activeLine}
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground">{frame.description}</p>
      </motion.div>

      {/* Array State (if available) */}
      {frame.array && frame.array.length > 0 && (
        <div className="rounded border border-border bg-surface p-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current Array State
          </div>
          <div className="flex flex-wrap gap-1">
            {frame.array.map((val: number, idx: number) => {
              const isComparing = frame.comparing?.includes(idx);
              const isSwapping = frame.swapping?.includes(idx);
              const isSorted = frame.sorted?.includes(idx);
              
              let bg = 'bg-background';
              let border = 'border-border';
              let text = 'text-foreground';

              if (isSwapping) {
                bg = 'bg-destructive/20';
                border = 'border-destructive';
                text = 'text-destructive';
              } else if (isComparing) {
                bg = 'bg-warning/20';
                border = 'border-warning';
                text = 'text-warning';
              } else if (isSorted) {
                bg = 'bg-success/20';
                border = 'border-success';
                text = 'text-success';
              }

              return (
                <motion.div 
                  key={`arr-${idx}-${typeof val === 'object' && val !== null ? (val as Record<string, unknown>).value : val}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex flex-col items-center justify-center rounded border ${border} ${bg} w-10 h-10`}
                >
                  <span className={`text-xs font-bold ${text}`}>{typeof val === 'object' && val !== null ? String((val as Record<string, unknown>).value) : val}</span>
                  <span className="text-[8px] text-muted-foreground">[{idx}]</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Variable state table */}
      <div className="rounded border border-border bg-surface p-3">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Variables
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
              <AnimatePresence>
                {Object.entries(vars).map(([key, val]: [string, Record<string, unknown>]) => {
                  const isChanged = prevVars[key] !== undefined && prevVars[key] !== val;
                  
                  return (
                    <motion.tr 
                      key={key} 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        backgroundColor: isChanged ? 'rgba(59, 130, 246, 0.15)' : 'transparent' 
                      }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-border/50"
                    >
                      <td className="py-2 pr-4 font-mono text-foreground">{key}</td>
                      <td className="py-2 pr-4">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                          {val?.type || typeof val}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-foreground font-bold relative">
                        <motion.span
                          key={`val-${typeof val === 'object' && val !== null ? (val as Record<string, unknown>).value : val}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {typeof val === 'object' && val !== null ? (val.value !== undefined ? String(val.value) : JSON.stringify(val)) : String(val)}
                        </motion.span>
                        {isChanged && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -right-2 top-2 w-1.5 h-1.5 rounded-full bg-primary"
                          />
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Enhanced Visualization Panel
// ---------------------------------------------------------------------------

export function EnhancedVisualizationPanel({
  activeTab,
  onTabChange,
}: VisualizationPanelProps) {
  const frames = useExecutionStore((state) => state.frames);
  const currentFrameIndex = useExecutionStore((state) => state.currentFrameIndex);
  const isPlaying = useExecutionStore((state) => state.isPlaying);
  
  const rawCurrentFrame = frames[currentFrameIndex] ?? null;
  let activeLine = 1;
  const language = useExecutionStore((state) => state.language);
  if (rawCurrentFrame?.activeLine !== undefined) {
    activeLine = typeof rawCurrentFrame.activeLine === 'object' 
      ? (rawCurrentFrame.activeLine as Record<string, number>)[language] || 1
      : rawCurrentFrame.activeLine;
  }
  const currentFrame = rawCurrentFrame ? { ...rawCurrentFrame, activeLine } : null;
  const totalFrames = frames.length || 1;
  
  if (!currentFrame || frames.length === 0) {
    return (
      <section className="flex h-full min-h-[26rem] flex-col items-center justify-center rounded border border-border bg-card p-4 text-center">
        <Boxes className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-foreground">Waiting for execution...</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Select an algorithm and click &quot;Run Code&quot; to view the live execution trace and visualization.
        </p>
      </section>
    );
  }

  const visualization = (currentFrame as Record<string, unknown>).visualization as Record<string, unknown>;
  const flowchart = (currentFrame as Record<string, unknown>).flowchart;
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
            Frame {(currentFrame as Record<string, unknown>).frameNumber || (currentFrame as Record<string, unknown>).frameIndex as number + 1} of {totalFrames}
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
                {tab === 'dry-run' ? 'Dry Run' : 'Visualization'}
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
              className="flex min-h-0 flex-1 flex-col gap-3"
            >
              {/* SWAPPED: Flowchart section is now TOP */}
              {flowchart && (
                <div className="rounded border border-border bg-surface p-3 flex flex-col flex-1 min-h-[14rem] max-h-[45%]">
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground flex-shrink-0 flex items-center justify-between">
                    <span>Algorithm Flow</span>
                    <span className="text-[8px] bg-background px-1.5 py-0.5 rounded border border-border text-primary/80">Interactive Viewport</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <FlowchartVisualization data={flowchart} />
                  </div>
                </div>
              )}

              {/* SWAPPED: Main visualization canvas is now BOTTOM */}
              <div className="relative flex min-h-[16rem] flex-1 flex-col overflow-hidden rounded border border-border bg-surface p-3">
                <div className="relative flex h-full flex-col">
                  {/* Status bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="rounded border border-border bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
                      {visualizationType === 'tree' && 'Tree Structure'}
                      {visualizationType === 'graph' && 'Graph Visualization'}
                      {visualizationType === 'array' && 'Array Visualization'}
                    </div>
                    <div
                      className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors duration-300 ${
                        isPlaying
                          ? 'border-success bg-success/15 text-success'
                          : 'border-primary bg-primary/15 text-primary'
                      }`}
                    >
                      {isPlaying ? 'Animating' : 'Paused'}
                    </div>
                  </div>

                  {/* Render appropriate visualization */}
                  <div className="flex flex-1 items-center justify-center min-h-0">
                    {visualizationType === 'tree' && <TreeVisualization data={visualization.data} />}
                    {visualizationType === 'graph' && <GraphVisualization data={visualization.data} />}
                    {visualizationType === 'array' && (
                      <ArrayVisualization
                        data={Array.isArray(visualization.data) ? visualization.data : (visualization.data?.data || [])}
                        highlights={visualization.data?.highlights || visualization.highlights || []}
                        pointers={visualization.data?.pointers || visualization.pointers || []}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dryrun-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="scrollbar-thin min-h-0 flex-1 overflow-auto bg-card rounded border border-border"
            >
              <EnhancedDryRunTrace frame={currentFrame} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
