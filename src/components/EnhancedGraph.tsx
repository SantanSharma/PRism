'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ImpactNode, ImpactEdge, RiskLevel, FileCategory } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface EnhancedGraphProps {
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  onNodeSelect?: (nodeId: string) => void;
  selectedNode?: string;
}

type VisualizationMode = 'risk' | 'folder' | 'layer' | 'type';
type LayoutMode = 'dagre' | 'grid' | 'radial' | 'force';

const categoryLabels: Record<FileCategory, string> = {
  source: 'Source',
  test: 'Tests',
  config: 'Config',
  documentation: 'Docs',
  asset: 'Assets',
  dependency: 'Dependencies',
  infrastructure: 'Infrastructure',
  migration: 'Migrations',
  unknown: 'Other',
};

export function EnhancedGraph({ nodes, edges, onNodeSelect, selectedNode }: EnhancedGraphProps) {
  const { theme } = useTheme();
  const [vizMode, setVizMode] = useState<VisualizationMode>('risk');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('dagre');
  const [showLabels, setShowLabels] = useState(true);

  const getNodeColor = useCallback((node: ImpactNode): string => {
    const { colors } = theme;
    
    if (vizMode === 'risk') {
      const riskColors: Record<RiskLevel, string> = {
        low: colors.riskLow,
        medium: colors.riskMedium,
        high: colors.riskHigh,
        critical: colors.riskCritical,
      };
      return riskColors[node.data.riskLevel] || colors.textMuted;
    }
    
    if (vizMode === 'type') {
      const typeColors: Record<FileCategory, string> = {
        source: colors.nodeSource,
        test: colors.nodeTest,
        config: colors.nodeConfig,
        documentation: colors.nodeDoc,
        asset: colors.nodeAsset,
        dependency: colors.nodeDep,
        infrastructure: colors.nodeInfra,
        migration: colors.nodeInfra,
        unknown: colors.textMuted,
      };
      return typeColors[node.data.category] || colors.textMuted;
    }
    
    if (vizMode === 'folder') {
      const folderColors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', 
        '#22c55e', '#06b6d4', '#eab308', '#ef4444'
      ];
      const folderPath = node.data.filename.split('/').slice(0, -1).join('/');
      const hash = folderPath.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      return folderColors[hash % folderColors.length];
    }
    
    if (vizMode === 'layer') {
      const filename = node.data.filename.toLowerCase();
      if (filename.includes('controller') || filename.includes('api')) return '#ef4444';
      if (filename.includes('service') || filename.includes('manager')) return '#f97316';
      if (filename.includes('component') || filename.includes('view')) return '#eab308';
      if (filename.includes('model') || filename.includes('entity')) return '#22c55e';
      if (filename.includes('util') || filename.includes('helper')) return '#06b6d4';
      if (filename.includes('test') || filename.includes('spec')) return '#8b5cf6';
      return colors.textMuted;
    }
    
    return colors.textMuted;
  }, [vizMode, theme]);

  const flowNodes = useMemo((): Node[] => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = { x: 220, y: 100 };
    
    return nodes.map((node, index) => {
      let x = 0, y = 0;
      
      if (layoutMode === 'grid') {
        const col = index % cols;
        const row = Math.floor(index / cols);
        x = col * spacing.x + 50;
        y = row * spacing.y + 50;
      } else if (layoutMode === 'radial') {
        const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 250 + (index % 3) * 80;
        x = 400 + Math.cos(angle) * radius;
        y = 300 + Math.sin(angle) * radius;
      } else if (layoutMode === 'force') {
        x = 100 + Math.random() * 600;
        y = 100 + Math.random() * 400;
      } else {
        // Dagre-like layout
        const col = index % cols;
        const row = Math.floor(index / cols);
        x = col * spacing.x + 50 + (row % 2) * 40;
        y = row * spacing.y + 50;
      }
      
      const color = getNodeColor(node);
      const isSelected = node.id === selectedNode;
      const fileName = node.data.filename.split('/').pop() || node.data.filename;
      
      return {
        id: node.id,
        position: { x, y },
        data: {
          label: showLabels ? (fileName.length > 20 ? fileName.slice(0, 18) + '...' : fileName) : '',
          ...node.data,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `2px solid ${isSelected ? theme.colors.accentPrimary : color}`,
          borderRadius: '12px',
          padding: showLabels ? '12px 16px' : '8px',
          color: theme.colors.textPrimary,
          fontSize: '12px',
          fontWeight: 500,
          minWidth: showLabels ? '140px' : '40px',
          textAlign: 'center' as const,
          boxShadow: isSelected 
            ? `0 0 20px ${theme.colors.accentPrimary}40, 0 4px 20px ${color}30`
            : `0 4px 16px ${color}20`,
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        },
      };
    });
  }, [nodes, getNodeColor, layoutMode, selectedNode, showLabels, theme]);

  const flowEdges = useMemo((): Edge[] => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: edge.type === 'imports',
      style: {
        stroke: theme.colors.borderSecondary,
        strokeWidth: 1.5,
        opacity: 0.6,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: theme.colors.borderSecondary,
        width: 16,
        height: 16,
      },
    }));
  }, [edges, theme]);

  const [flowNodesState, setFlowNodes, onNodesChange] = useNodesState(flowNodes);
  const [flowEdgesState, setFlowEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update nodes and edges when visualization mode, layout mode, or selection changes
  useEffect(() => {
    setFlowNodes(flowNodes);
  }, [flowNodes, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(flowEdges);
  }, [flowEdges, setFlowEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeSelect?.(node.id);
  }, [onNodeSelect]);

  const getLegendItems = useMemo(() => {
    if (vizMode === 'risk') {
      return [
        { label: 'Low', color: theme.colors.riskLow },
        { label: 'Medium', color: theme.colors.riskMedium },
        { label: 'High', color: theme.colors.riskHigh },
        { label: 'Critical', color: theme.colors.riskCritical },
      ];
    }
    if (vizMode === 'type') {
      const usedCategories = new Set(nodes.map(n => n.data.category));
      return Array.from(usedCategories).map(cat => ({
        label: categoryLabels[cat],
        color: {
          source: theme.colors.nodeSource,
          test: theme.colors.nodeTest,
          config: theme.colors.nodeConfig,
          documentation: theme.colors.nodeDoc,
          asset: theme.colors.nodeAsset,
          dependency: theme.colors.nodeDep,
          infrastructure: theme.colors.nodeInfra,
          migration: theme.colors.nodeInfra,
          unknown: theme.colors.textMuted,
        }[cat],
      }));
    }
    if (vizMode === 'layer') {
      return [
        { label: 'Controller/API', color: '#ef4444' },
        { label: 'Service', color: '#f97316' },
        { label: 'Component/View', color: '#eab308' },
        { label: 'Model/Entity', color: '#22c55e' },
        { label: 'Utilities', color: '#06b6d4' },
        { label: 'Tests', color: '#8b5cf6' },
      ];
    }
    return [];
  }, [vizMode, nodes, theme]);

  if (nodes.length === 0) {
    return (
      <div 
        className="h-full flex flex-col items-center justify-center gap-4"
        style={{ background: theme.colors.bgPrimary }}
      >
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
             style={{ background: `linear-gradient(135deg, ${theme.colors.accentGradientFrom}20, ${theme.colors.accentGradientTo}20)` }}>
          <svg className="w-10 h-10" style={{ color: theme.colors.accentPrimary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p style={{ color: theme.colors.textSecondary }} className="text-lg font-medium">No impact graph available</p>
        <p style={{ color: theme.colors.textMuted }} className="text-sm">Analyze a PR to see the impact visualization</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" style={{ background: theme.colors.bgPrimary }}>
      <ReactFlow
        nodes={flowNodesState}
        edges={flowEdgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1} 
          color={theme.colors.borderPrimary}
        />
        
        {/* Mode Controls */}
        <Panel position="top-left" className="flex flex-col gap-3">
          {/* Visualization Mode */}
          <div 
            className="rounded-2xl p-1.5 backdrop-blur-xl shadow-2xl"
            style={{ 
              background: theme.colors.bgGlass,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <div className="flex items-center gap-1">
              {([
                { mode: 'risk', icon: '⚠️', label: 'Risk' },
                { mode: 'folder', icon: '📁', label: 'Folder' },
                { mode: 'layer', icon: '📊', label: 'Layer' },
                { mode: 'type', icon: '📄', label: 'Type' },
              ] as const).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setVizMode(mode)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: vizMode === mode 
                      ? `linear-gradient(135deg, ${theme.colors.accentGradientFrom}, ${theme.colors.accentGradientTo})`
                      : 'transparent',
                    color: vizMode === mode ? '#fff' : theme.colors.textSecondary,
                  }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Mode */}
          <div 
            className="rounded-2xl p-1.5 backdrop-blur-xl shadow-2xl"
            style={{ 
              background: theme.colors.bgGlass,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <div className="flex items-center gap-1">
              {([
                { mode: 'dagre', label: 'Flow' },
                { mode: 'grid', label: 'Grid' },
                { mode: 'radial', label: 'Radial' },
                { mode: 'force', label: 'Force' },
              ] as const).map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setLayoutMode(mode)}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: layoutMode === mode ? theme.colors.bgTertiary : 'transparent',
                    color: layoutMode === mode ? theme.colors.textPrimary : theme.colors.textMuted,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 backdrop-blur-xl shadow-lg"
            style={{ 
              background: theme.colors.bgGlass,
              border: `1px solid ${theme.colors.borderPrimary}`,
              color: theme.colors.textSecondary,
            }}
          >
            <span>{showLabels ? '🏷️' : '🔘'}</span>
            <span className="hidden sm:inline">{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
          </button>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left">
          <div 
            className="rounded-2xl p-4 backdrop-blur-xl shadow-2xl"
            style={{ 
              background: theme.colors.bgGlass,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: theme.colors.textMuted }}>
              {vizMode === 'risk' ? 'Risk Level' : vizMode === 'type' ? 'File Type' : vizMode === 'layer' ? 'Architecture' : 'Folder'}
            </div>
            <div className="flex flex-wrap gap-3">
              {getLegendItems.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-lg" 
                    style={{ 
                      background: color,
                      boxShadow: `0 0 8px ${color}60`,
                    }} 
                  />
                  <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Stats Panel */}
        <Panel position="top-right">
          <div 
            className="rounded-2xl p-4 backdrop-blur-xl shadow-2xl"
            style={{ 
              background: theme.colors.bgGlass,
              border: `1px solid ${theme.colors.borderPrimary}`,
            }}
          >
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{nodes.length}</div>
                <div className="text-xs font-medium" style={{ color: theme.colors.textMuted }}>Nodes</div>
              </div>
              <div className="h-8 w-px" style={{ background: theme.colors.borderPrimary }} />
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{edges.length}</div>
                <div className="text-xs font-medium" style={{ color: theme.colors.textMuted }}>Edges</div>
              </div>
            </div>
          </div>
        </Panel>

        <Controls 
          className="!rounded-2xl !border-0 !shadow-2xl overflow-hidden"
          style={{ 
            background: theme.colors.bgGlass,
            backdropFilter: 'blur(12px)',
          }}
        />
        <MiniMap
          style={{
            background: theme.colors.bgSecondary,
            borderRadius: '16px',
            border: `1px solid ${theme.colors.borderPrimary}`,
            overflow: 'hidden',
          }}
          nodeColor={(n) => getNodeColor(nodes.find(node => node.id === n.id) || nodes[0])}
          maskColor={`${theme.colors.bgPrimary}90`}
        />
      </ReactFlow>
    </div>
  );
}
