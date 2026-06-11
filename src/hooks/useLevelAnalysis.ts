import { useState, useEffect, useCallback, useRef } from 'react';
import type { CellType, Position } from '../engine/types';
import {
  analyzeLevel,
  type LevelAnalysis,
} from '../engine/levelAnalyzer';

interface UseLevelAnalysisParams {
  grid: CellType[][];
  width: number;
  height: number;
  start: Position;
  goal: Position;
  stars: Position[];
  autoUpdate?: boolean;
}

interface UseLevelAnalysisResult {
  analysis: LevelAnalysis | null;
  showPath: boolean;
  showAnalysis: boolean;
  setShowAnalysis: (show: boolean) => void;
  runAnalysis: () => LevelAnalysis;
  toggleShowPath: () => void;
  setShowPath: (show: boolean) => void;
  isAnalyzing: boolean;
}

export function useLevelAnalysis(
  params: UseLevelAnalysisParams
): UseLevelAnalysisResult {
  const { grid, width, height, start, goal, stars, autoUpdate = true } = params;

  const [analysis, setAnalysis] = useState<LevelAnalysis | null>(null);
  const [showPath, setShowPath] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const prevAnalysisTriggerRef = useRef<string>('');

  const getAnalysisTriggerKey = useCallback(() => {
    const gridKey = grid.map((row) => row.join(',')).join(';');
    return `${width}-${height}-${start.x},${start.y}-${goal.x},${goal.y}-${stars.map((s) => `${s.x},${s.y}`).join('|')}-${gridKey}`;
  }, [grid, width, height, start, goal, stars]);

  const runAnalysis = useCallback((): LevelAnalysis => {
    setIsAnalyzing(true);
    const result = analyzeLevel({ grid, width, height, start, goal, stars });
    setAnalysis(result);
    prevAnalysisTriggerRef.current = getAnalysisTriggerKey();
    setTimeout(() => setIsAnalyzing(false), 0);
    return result;
  }, [grid, width, height, start, goal, stars, getAnalysisTriggerKey]);

  const toggleShowPath = useCallback(() => {
    setShowPath((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => runAnalysis(), 0);
      }
      return next;
    });
  }, [runAnalysis]);

  useEffect(() => {
    if (!showPath || !autoUpdate) return;

    const currentKey = getAnalysisTriggerKey();
    if (currentKey !== prevAnalysisTriggerRef.current) {
      const timeoutId = setTimeout(() => {
        runAnalysis();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [showPath, autoUpdate, getAnalysisTriggerKey, runAnalysis]);

  return {
    analysis,
    showPath,
    showAnalysis,
    setShowAnalysis,
    runAnalysis,
    toggleShowPath,
    setShowPath,
    isAnalyzing,
  };
}

export default useLevelAnalysis;
