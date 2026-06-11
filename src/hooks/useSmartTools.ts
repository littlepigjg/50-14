import { useCallback } from 'react';
import type { CellType, Position } from '../engine/types';
import {
  clampPosition,
  resizeEditorGrid,
} from '../engine/gridEditor';
import {
  applySymmetry,
  generatePattern,
  shiftGrid,
  rotateGrid,
  type SymmetryType,
  type PatternType,
} from '../engine/levelAnalyzer';

interface UseSmartToolsParams {
  grid: CellType[][];
  width: number;
  height: number;
  start: Position;
  goal: Position;
  stars: Position[];
  setGrid: (grid: CellType[][]) => void;
  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setStart: (pos: Position) => void;
  setGoal: (pos: Position) => void;
  setStars: (stars: Position[]) => void;
  showToast: (message: string, type?: 'info' | 'warning' | 'error') => void;
}

interface UseSmartToolsResult {
  handleApplySymmetry: (type: SymmetryType) => void;
  handleApplyPattern: (type: PatternType) => void;
  handleRotate: (clockwise: boolean) => void;
  handleShift: (dx: number, dy: number) => void;
  handleClearGrid: () => void;
}

export function useSmartTools(params: UseSmartToolsParams): UseSmartToolsResult {
  const {
    grid,
    width,
    height,
    start,
    goal,
    stars,
    setGrid,
    setWidth,
    setHeight,
    setStart,
    setGoal,
    setStars,
    showToast,
  } = params;

  const handleApplySymmetry = useCallback(
    (type: SymmetryType) => {
      const newGrid = applySymmetry(grid, width, height, type);
      const labelMap: Record<SymmetryType, string> = {
        horizontal: '水平对称',
        vertical: '垂直对称',
        center: '中心对称',
        diagonal1: '对角线对称',
        diagonal2: '反对角线对称',
      };
      setGrid(newGrid);
      showToast(`已应用${labelMap[type]}`, 'info');
    },
    [grid, width, height, setGrid, showToast]
  );

  const handleApplyPattern = useCallback(
    (type: PatternType) => {
      const newGrid = generatePattern(width, height, type, 'wall');
      const labelMap: Record<PatternType, string> = {
        border: '边框',
        checkerboard: '棋盘格',
        frame: '双框',
        cross: '十字',
        diamond: '菱形',
        spiral: '螺旋',
      };
      setGrid(newGrid);
      setStart({ x: 0, y: 0 });
      setGoal({ x: width - 1, y: height - 1 });
      setStars([]);
      showToast(`已生成${labelMap[type]}图案`, 'info');
    },
    [width, height, setGrid, setStart, setGoal, setStars, showToast]
  );

  const handleRotate = useCallback(
    (clockwise: boolean) => {
      const newGrid = rotateGrid(grid, width, height, clockwise);
      const newWidth = height;
      const newHeight = width;
      const newStart = clockwise
        ? { x: height - 1 - start.y, y: start.x }
        : { x: start.y, y: width - 1 - start.x };
      const newGoal = clockwise
        ? { x: height - 1 - goal.y, y: goal.x }
        : { x: goal.y, y: width - 1 - goal.x };
      const newStars = stars.map((s) =>
        clockwise
          ? { x: height - 1 - s.y, y: s.x }
          : { x: s.y, y: width - 1 - s.x }
      );
      setGrid(newGrid);
      setWidth(newWidth);
      setHeight(newHeight);
      setStart(clampPosition(newStart, newWidth, newHeight));
      setGoal(clampPosition(newGoal, newWidth, newHeight));
      setStars(newStars.filter((s) => s.x < newWidth && s.y < newHeight));
      showToast(clockwise ? '已顺时针旋转90度' : '已逆时针旋转90度', 'info');
    },
    [grid, width, height, start, goal, stars, setGrid, setWidth, setHeight, setStart, setGoal, setStars, showToast]
  );

  const handleShift = useCallback(
    (dx: number, dy: number) => {
      const newGrid = shiftGrid(grid, width, height, dx, dy, 'empty');
      const newStart = { x: start.x + dx, y: start.y + dy };
      const newGoal = { x: goal.x + dx, y: goal.y + dy };
      const newStars = stars.map((s) => ({ x: s.x + dx, y: s.y + dy }));
      setGrid(newGrid);
      setStart(clampPosition(newStart, width, height));
      setGoal(clampPosition(newGoal, width, height));
      setStars(newStars.filter((s) => s.x >= 0 && s.x < width && s.y >= 0 && s.y < height));
      const dirLabel = dx > 0 ? '右' : dx < 0 ? '左' : dy > 0 ? '下' : '上';
      showToast(`已向${dirLabel}移一格`, 'info');
    },
    [grid, width, height, start, goal, stars, setGrid, setStart, setGoal, setStars, showToast]
  );

  const handleClearGrid = useCallback(() => {
    if (!confirm('确定要清空所有墙壁和陷阱吗？')) return;
    const newGrid = resizeEditorGrid([], 0, 0, width, height);
    setGrid(newGrid);
    showToast('已清空地图', 'info');
  }, [width, height, setGrid, showToast]);

  return {
    handleApplySymmetry,
    handleApplyPattern,
    handleRotate,
    handleShift,
    handleClearGrid,
  };
}

export default useSmartTools;
