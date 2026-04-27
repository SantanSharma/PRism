'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ImpactNode, ImpactEdge, RiskLevel } from '@/types';

interface ImpactGraphProps {
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  onNodeSelect?: (nodeId: string) => void;
  selectedNode?: string;
  fullHeight?: boolean;
}

const riskColors: Record<RiskLevel, { bg: string; border: string; text: string }> = {
  low: { bg: '#166534', border: '#22c55e', text: '#86efac' },
  medium: { bg: '#854d0e', border: '#eab308', text: '#fef08a' },
  high: { bg: '#9a3412', border: '#f97316', text: '#fed7aa' },
  critical: { bg: '#991b1b', border: '#ef4444', text: '#fecaca' },
};

const nodeTypeColors: Record<string, { bg: string; border: string }> = {
  changed: { bg: '#1e3a5f', border: '#3b82f6' },
  affected: { bg: '#3f3f46', border: '#71717a' },
  test: { bg: '#134e4a', border: '#14b8a6' },
  config: { bg: '#4c1d95', border: '#8b5cf6' },
};

export function ImpactGraph({ nodes: impactNodes, edges: impactEdges, onNodeSelect, selectedNode, fullHeight = false }: ImpactGraphProps) {
  // Convert impact nodes/edges to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    // Simple layout algorithm: arrange in a grid
    const cols = Math.ceil(Math.sqrt(impactNodes.length));
    const spacing = { x: 200, y: 120 };

    return impactNodes.map((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const risk = riskColors[node.riskLevel];
      const typeColor = nodeTypeColors[node.type];

      return {
        id: node.id,
        position: { x: col * spacing.x + 100, y: row * spacing.y + 100 },
        data: {
          label: node.label,
          type: node.type,
          riskLevel: node.riskLevel,
          data: node.data,
        },
        style: {
          background: `linear-gradient(135deg, ${typeColor.bg} 0%, ${risk.bg} 100%)`,
          border: `2px solid ${selectedNode === node.id ? '#fff' : risk.border}`,
          borderRadius: '8px',
          padding: '12px 16px',
          color: risk.text,
          fontSize: '12px',
          fontWeight: 500,
          boxShadow: selectedNode === node.id 
            ? `0 0 20px ${risk.border}` 
            : `0 4px 6px rgba(0, 0, 0, 0.3)`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minWidth: '120px',
          textAlign: 'center' as const,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [impactNodes, selectedNode]);

  const initialEdges: Edge[] = useMemo(() => {
    return impactEdges.map((edge) => {
      const edgeColors = {
        imports: '#60a5fa',
        'imported-by': '#a78bfa',
        tests: '#34d399',
        configures: '#fbbf24',
      };

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: edge.type === 'imports',
        style: {
          stroke: edgeColors[edge.type] || '#71717a',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColors[edge.type] || '#71717a',
        },
        label: edge.type,
        labelStyle: {
          fill: '#a1a1aa',
          fontSize: 10,
        },
        labelBgStyle: {
          fill: '#18181b',
          fillOpacity: 0.8,
        },
      };
    });
  }, [impactEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  if (impactNodes.length === 0) {
    return (
      <div className={`flex items-center justify-center ${fullHeight ? 'h-[600px]' : 'h-[300px]'} text-zinc-500`}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p>No impact graph data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={fullHeight ? '' : 'bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden'}>
      {!fullHeight && (
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Impact Graph</h2>
            <p className="text-sm text-zinc-500">
              {impactNodes.length} nodes, {impactEdges.length} connections
            </p>
          </div>
          <Legend />
        </div>
      )}
      <div className={`relative ${fullHeight ? 'h-[600px]' : 'h-[500px]'}`}>
        {fullHeight && (
          <div className="absolute top-4 right-4 z-10 bg-zinc-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-zinc-700">
            <Legend />
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#27272a" gap={20} />
          <Controls
            showZoom={true}
            showFitView={true}
            showInteractive={false}
            position="bottom-right"
            style={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
            }}
          />
          <MiniMap
            nodeColor={(node) => {
              const riskLevel = node.data?.riskLevel as RiskLevel;
              return riskColors[riskLevel]?.border || '#71717a';
            }}
            maskColor="rgba(0, 0, 0, 0.8)"
            style={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-zinc-400">Low</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="text-zinc-400">Medium</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
        <span className="text-zinc-400">High</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-zinc-400">Critical</span>
      </div>
    </div>
  );
}
