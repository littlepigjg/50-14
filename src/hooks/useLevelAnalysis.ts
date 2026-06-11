import { useState, useMemo, useCallback } from 'react';
import type { CellType, Position } from '../engine/types';
import { bfsShortestPath } from '../engine/pathFinder';
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
}

interface UseLevelAnalysisResult {
  analysis: LevelAnalysis | null;
  livePath: Position[];
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
  const { grid, width, height, start, goal, stars } = params;

  const [manualAnalysis, setManualAnalysis] = useState<LevelAnalysis | null>(null);
  const [showPath, setShowPath] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const livePath = useMemo(() => {
    if (!showPath) return [];
    const result = bfsShortestPath(grid, width, height, start, goal, true);
    return result.reachable ? result.path : [];
  }, [showPath, grid, width, height, start, goal]);

  const analysis = useMemo(() => {
    if (showAnalysis && manualAnalysis) return manualAnalysis;
    if (showPath) {
      return analyzeLevel({ grid, width, height, start, goal, stars });
    }
    return manualAnalysis;
  }, [showAnalysis, manualAnalysis, showPath, grid, width, height, start, goal, stars]);

  const runAnalysis = useCallback((): LevelAnalysis => {
    setIsAnalyzing(true);
    const result = analyzeLevel({ grid, width, height, start, goal, stars });
    setManualAnalysis(result);
    setShowAnalysis(true);
    setTimeout(() => setIsAnalyzing(false), 0);
    return result;
  }, [grid, width, height, start, goal, stars]);

  const toggleShowPath = useCallback(() => {
    setShowPath((prev) => !prev);
  }, []);

  return {
    analysis,
    livePath,
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
