import React from 'react';
import type { LevelAnalysis } from '../../engine/levelAnalyzer';

interface SmartAnalysisPanelProps {
  analysis: LevelAnalysis | null;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

export const SmartAnalysisPanel: React.FC<SmartAnalysisPanelProps> = ({
  analysis,
  onAnalyze,
  isAnalyzing = false,
}) => {
  if (!analysis) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        点击下方按钮开始智能分析
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="mt-3 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? '🔄 分析中...' : '🔍 开始分析'}
        </button>
      </div>
    );
  }

  const criticalCount = analysis.warnings.filter((w) => w.type === 'critical').length;
  const warningCount = analysis.warnings.filter((w) => w.type === 'warning').length;
  const infoCount = analysis.warnings.filter((w) => w.type === 'info').length;

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      <div className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg p-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              analysis.hasPathToGoal ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-gray-600">
            可达性：{analysis.hasPathToGoal ? '正常' : '阻塞'}
          </span>
        </div>
        <div className="text-gray-600">
          最短距离：<strong>{analysis.goalDistance > 0 ? analysis.goalDistance : '-'}</strong> 步
        </div>
        <div className="text-gray-600">
          区域数：<strong>{analysis.isolatedAreas.length}</strong>
        </div>
      </div>

      {(criticalCount > 0 || warningCount > 0 || infoCount > 0) && (
        <div className="flex items-center gap-3 text-xs">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
              ❌ {criticalCount} 严重
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
              ⚠️ {warningCount} 警告
            </span>
          )}
          {infoCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              💡 {infoCount} 建议
            </span>
          )}
        </div>
      )}

      {analysis.warnings.length > 0 ? (
        <div className="space-y-1.5">
          {analysis.warnings.map((warning, idx) => (
            <div
              key={idx}
              className={`text-xs p-2 rounded-lg flex items-start gap-2 ${
                warning.type === 'critical'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : warning.type === 'warning'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {warning.type === 'critical'
                  ? '❌'
                  : warning.type === 'warning'
                  ? '⚠️'
                  : '💡'}
              </span>
              <span className="flex-1">{warning.message}</span>
              {warning.positions && warning.positions.length > 0 && (
                <span className="flex-shrink-0 text-xs opacity-70">
                  {warning.positions.length}处
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-green-600 bg-green-50 rounded-lg">
          ✅ 未发现明显问题
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full text-xs py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? '🔄 分析中...' : '🔄 重新分析'}
      </button>
    </div>
  );
};

export default SmartAnalysisPanel;
