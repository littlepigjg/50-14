import React, { useState } from 'react';
import type { SymmetryType, PatternType } from '../../engine/levelAnalyzer';

export interface SmartToolConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  category: 'analyze' | 'symmetry' | 'pattern' | 'transform';
}

export const SMART_TOOLS: SmartToolConfig[] = [
  {
    id: 'analyze',
    label: '智能分析',
    icon: '🔍',
    color: 'bg-blue-500',
    description: '自动检测路径可达性、死胡同和设计问题',
    category: 'analyze',
  },
  {
    id: 'showPath',
    label: '显示路径',
    icon: '🛤️',
    color: 'bg-green-500',
    description: '在地图上显示从起点到终点的最短路径',
    category: 'analyze',
  },
  {
    id: 'symmetry-h',
    label: '水平对称',
    icon: '↔️',
    color: 'bg-purple-500',
    description: '将左侧内容镜像复制到右侧',
    category: 'symmetry',
  },
  {
    id: 'symmetry-v',
    label: '垂直对称',
    icon: '↕️',
    color: 'bg-purple-500',
    description: '将上方内容镜像复制到下方',
    category: 'symmetry',
  },
  {
    id: 'symmetry-c',
    label: '中心对称',
    icon: '🔄',
    color: 'bg-purple-500',
    description: '中心对称变换（180度旋转镜像）',
    category: 'symmetry',
  },
  {
    id: 'pattern-border',
    label: '边框',
    icon: '🔲',
    color: 'bg-amber-500',
    description: '一键生成墙壁边框',
    category: 'pattern',
  },
  {
    id: 'pattern-checkerboard',
    label: '棋盘',
    icon: '♟️',
    color: 'bg-amber-500',
    description: '生成棋盘格图案',
    category: 'pattern',
  },
  {
    id: 'pattern-frame',
    label: '双框',
    icon: '◻️',
    color: 'bg-amber-500',
    description: '生成双层边框图案',
    category: 'pattern',
  },
  {
    id: 'pattern-cross',
    label: '十字',
    icon: '➕',
    color: 'bg-amber-500',
    description: '生成十字形图案',
    category: 'pattern',
  },
  {
    id: 'pattern-diamond',
    label: '菱形',
    icon: '🔷',
    color: 'bg-amber-500',
    description: '生成菱形轮廓',
    category: 'pattern',
  },
  {
    id: 'pattern-spiral',
    label: '螺旋',
    icon: '🌀',
    color: 'bg-amber-500',
    description: '生成螺旋形图案',
    category: 'pattern',
  },
  {
    id: 'rotate-cw',
    label: '顺时针',
    icon: '↻',
    color: 'bg-teal-500',
    description: '顺时针旋转90度',
    category: 'transform',
  },
  {
    id: 'rotate-ccw',
    label: '逆时针',
    icon: '↺',
    color: 'bg-teal-500',
    description: '逆时针旋转90度',
    category: 'transform',
  },
  {
    id: 'shift-up',
    label: '上移',
    icon: '⬆️',
    color: 'bg-teal-500',
    description: '整体上移一格',
    category: 'transform',
  },
  {
    id: 'shift-down',
    label: '下移',
    icon: '⬇️',
    color: 'bg-teal-500',
    description: '整体下移一格',
    category: 'transform',
  },
  {
    id: 'shift-left',
    label: '左移',
    icon: '⬅️',
    color: 'bg-teal-500',
    description: '整体左移一格',
    category: 'transform',
  },
  {
    id: 'shift-right',
    label: '右移',
    icon: '➡️',
    color: 'bg-teal-500',
    description: '整体右移一格',
    category: 'transform',
  },
  {
    id: 'clear',
    label: '清空',
    icon: '🗑️',
    color: 'bg-red-500',
    description: '清空所有墙壁和陷阱',
    category: 'transform',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  analyze: '分析',
  symmetry: '对称',
  pattern: '图案',
  transform: '变换',
};

interface SmartToolsProps {
  onAnalyze: () => void;
  onShowPath: () => void;
  onApplySymmetry: (type: SymmetryType) => void;
  onApplyPattern: (type: PatternType) => void;
  onRotate: (clockwise: boolean) => void;
  onShift: (dx: number, dy: number) => void;
  onClear: () => void;
  showPathActive: boolean;
}

export const SmartTools: React.FC<SmartToolsProps> = ({
  onAnalyze,
  onShowPath,
  onApplySymmetry,
  onApplyPattern,
  onRotate,
  onShift,
  onClear,
  showPathActive,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('analyze');

  const categories = ['analyze', 'symmetry', 'pattern', 'transform'];

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case 'analyze':
        onAnalyze();
        break;
      case 'showPath':
        onShowPath();
        break;
      case 'symmetry-h':
        onApplySymmetry('horizontal');
        break;
      case 'symmetry-v':
        onApplySymmetry('vertical');
        break;
      case 'symmetry-c':
        onApplySymmetry('center');
        break;
      case 'pattern-border':
        onApplyPattern('border');
        break;
      case 'pattern-checkerboard':
        onApplyPattern('checkerboard');
        break;
      case 'pattern-frame':
        onApplyPattern('frame');
        break;
      case 'pattern-cross':
        onApplyPattern('cross');
        break;
      case 'pattern-diamond':
        onApplyPattern('diamond');
        break;
      case 'pattern-spiral':
        onApplyPattern('spiral');
        break;
      case 'rotate-cw':
        onRotate(true);
        break;
      case 'rotate-ccw':
        onRotate(false);
        break;
      case 'shift-up':
        onShift(0, -1);
        break;
      case 'shift-down':
        onShift(0, 1);
        break;
      case 'shift-left':
        onShift(-1, 0);
        break;
      case 'shift-right':
        onShift(1, 0);
        break;
      case 'clear':
        onClear();
        break;
    }
  };

  const filteredTools = SMART_TOOLS.filter((t) => t.category === activeCategory);

  const getToolButtonClass = (tool: SmartToolConfig) => {
    const isActive = tool.id === 'showPath' && showPathActive;
    return `
      px-3 py-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-all
      hover:scale-105 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50
      ${isActive ? 'ring-2 ring-offset-1 ring-green-500 bg-green-50 border-green-300' : ''}
    `;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-3 py-1.5 rounded-lg font-medium transition-all
              ${activeCategory === cat
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={getToolButtonClass(tool)}
            title={tool.description}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="text-gray-700">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 flex items-start gap-2">
        <span className="text-purple-500 font-bold">💡</span>
        <span>
          <strong className="text-purple-700">智能工具：</strong>
          使用对称和图案工具快速生成关卡布局，分析工具检查设计合理性。
        </span>
      </div>
    </div>
  );
};

export default SmartTools;
