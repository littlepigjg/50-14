import type { CellType, Level, Position } from './types';
import { positionEquals, createEmptyGrid } from './GameEngine';
import { getCell } from './gridEditor';
import {
  bfsShortestPath,
  findReachableCells,
  findDeadEnds,
  findIsolatedAreas,
} from './pathFinder';
export type { PathResult } from './pathFinder';

export interface StarReachabilityInfo {
  star: Position;
  reachable: boolean;
  distanceFromStart: number;
  distanceFromGoal: number;
}

export interface LevelAnalysis {
  hasPathToGoal: boolean;
  shortestPathToGoal: Position[];
  goalDistance: number;
  allStarsReachable: boolean;
  starInfos: StarReachabilityInfo[];
  unreachableStars: Position[];
  deadEnds: Position[];
  isolatedAreas: Position[][];
  warnings: LevelWarning[];
}

export interface LevelWarning {
  type: 'critical' | 'warning' | 'info';
  message: string;
  positions?: Position[];
}

export function analyzeLevel(
  level: Pick<Level, 'grid' | 'width' | 'height' | 'start' | 'goal' | 'stars'>
): LevelAnalysis {
  const { grid, width, height, start, goal, stars } = level;

  const goalResult = bfsShortestPath(grid, width, height, start, goal, true);

  const reachableFromStart = findReachableCells(grid, width, height, start, true);
  const posKey = (p: Position) => `${p.x},${p.y}`;

  const starInfos: StarReachabilityInfo[] = stars.map((star) => {
    const reachable = reachableFromStart.has(posKey(star));
    const fromStart = bfsShortestPath(grid, width, height, start, star, true);
    const fromGoal = bfsShortestPath(grid, width, height, star, goal, true);
    return {
      star,
      reachable,
      distanceFromStart: fromStart.distance,
      distanceFromGoal: fromGoal.distance,
    };
  });

  const unreachableStars = starInfos.filter((s) => !s.reachable).map((s) => s.star);

  const deadEnds = findDeadEnds(grid, width, height, true);
  const isolatedAreas = findIsolatedAreas(grid, width, height, true);

  const warnings: LevelWarning[] = [];

  if (!goalResult.reachable) {
    warnings.push({
      type: 'critical',
      message: '起点无法到达终点！请检查墙壁和陷阱布局，确保存在至少一条通路。',
      positions: [start, goal],
    });
  }

  if (unreachableStars.length > 0) {
    warnings.push({
      type: 'critical',
      message: `有 ${unreachableStars.length} 颗星星无法收集！玩家无法通过这些关卡。`,
      positions: unreachableStars,
    });
  }

  const significantDeadEnds = deadEnds.filter(
    (d) => !positionEquals(d, start) && !positionEquals(d, goal)
  );
  if (significantDeadEnds.length > 2) {
    warnings.push({
      type: 'warning',
      message: `存在 ${significantDeadEnds.length} 个死胡同，过多的死路可能让玩家感到挫败。`,
      positions: significantDeadEnds.slice(0, 5),
    });
  }

  if (isolatedAreas.length > 1) {
    warnings.push({
      type: 'warning',
      message: `地图被分割成 ${isolatedAreas.length} 个独立区域，确保设计意图。`,
    });
  }

  if (goalResult.distance > 0 && goalResult.distance < 3) {
    warnings.push({
      type: 'info',
      message: `起点到终点距离仅 ${goalResult.distance} 步，关卡可能过于简单。`,
    });
  }

  const totalCells = width * height;
  let wallCount = 0;
  let pitCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 'wall') wallCount++;
      if (grid[y][x] === 'pit') pitCount++;
    }
  }

  const wallRatio = wallCount / totalCells;
  if (wallRatio > 0.5) {
    warnings.push({
      type: 'warning',
      message: `墙壁占比 ${(wallRatio * 100).toFixed(1)}%，过高可能导致路径选择过少。`,
    });
  }

  if (pitCount > 0) {
    const pitsNearStart = stars.filter((s) => {
      const dist = Math.abs(s.x - start.x) + Math.abs(s.y - start.y);
      return dist <= 2;
    });
    if (pitsNearStart.length > 0) {
      warnings.push({
        type: 'info',
        message: '起点附近有星星，玩家可能很快就能收集到。',
      });
    }
  }

  if (stars.length > 0 && goalResult.reachable) {
    const avgStarDist =
      starInfos.reduce((sum, s) => sum + Math.max(0, s.distanceFromStart), 0) / stars.length;
    if (avgStarDist < goalResult.distance * 0.3) {
      warnings.push({
        type: 'info',
        message: '大部分星星分布在起点附近，收集难度较低。',
      });
    }
  }

  return {
    hasPathToGoal: goalResult.reachable,
    shortestPathToGoal: goalResult.path,
    goalDistance: goalResult.distance,
    allStarsReachable: unreachableStars.length === 0,
    starInfos,
    unreachableStars,
    deadEnds,
    isolatedAreas,
    warnings,
  };
}

export type SymmetryType = 'horizontal' | 'vertical' | 'center' | 'diagonal1' | 'diagonal2';

export function applySymmetry(
  grid: CellType[][],
  width: number,
  height: number,
  type: SymmetryType
): CellType[][] {
  const newGrid = grid.map((row) => [...row]);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      if (cell === 'empty') continue;

      let sx: number, sy: number;

      switch (type) {
        case 'horizontal':
          sx = width - 1 - x;
          sy = y;
          break;
        case 'vertical':
          sx = x;
          sy = height - 1 - y;
          break;
        case 'center':
          sx = width - 1 - x;
          sy = height - 1 - y;
          break;
        case 'diagonal1':
          sx = y;
          sy = x;
          if (sx >= width || sy >= height) continue;
          break;
        case 'diagonal2':
          sx = height - 1 - y;
          sy = width - 1 - x;
          if (sx >= width || sy >= height) continue;
          break;
        default:
          sx = x;
          sy = y;
      }

      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        newGrid[sy][sx] = cell;
      }
    }
  }

  return newGrid;
}

export type PatternType =
  | 'border'
  | 'checkerboard'
  | 'frame'
  | 'cross'
  | 'diamond'
  | 'spiral';

export function generatePattern(
  width: number,
  height: number,
  type: PatternType,
  cellType: CellType = 'wall'
): CellType[][] {
  const grid = createEmptyGrid(width, height);

  switch (type) {
    case 'border':
      for (let x = 0; x < width; x++) {
        grid[0][x] = cellType;
        grid[height - 1][x] = cellType;
      }
      for (let y = 0; y < height; y++) {
        grid[y][0] = cellType;
        grid[y][width - 1] = cellType;
      }
      break;

    case 'checkerboard':
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if ((x + y) % 2 === 0) {
            grid[y][x] = cellType;
          }
        }
      }
      break;

    case 'frame':
      for (let x = 0; x < width; x++) {
        grid[0][x] = cellType;
        grid[height - 1][x] = cellType;
      }
      for (let y = 0; y < height; y++) {
        grid[y][0] = cellType;
        grid[y][width - 1] = cellType;
      }
      const innerOffset = 2;
      if (width > innerOffset * 2 && height > innerOffset * 2) {
        for (let x = innerOffset; x < width - innerOffset; x++) {
          grid[innerOffset][x] = cellType;
          grid[height - 1 - innerOffset][x] = cellType;
        }
        for (let y = innerOffset; y < height - innerOffset; y++) {
          grid[y][innerOffset] = cellType;
          grid[y][width - 1 - innerOffset] = cellType;
        }
      }
      break;

    case 'cross': {
      const midX = Math.floor(width / 2);
      const midY = Math.floor(height / 2);
      for (let x = 0; x < width; x++) {
        grid[midY][x] = cellType;
      }
      for (let y = 0; y < height; y++) {
        grid[y][midX] = cellType;
      }
      break;
    }

    case 'diamond': {
      const midX = Math.floor(width / 2);
      const midY = Math.floor(height / 2);
      const radius = Math.min(midX, midY);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dist = Math.abs(x - midX) + Math.abs(y - midY);
          if (dist === radius) {
            grid[y][x] = cellType;
          }
        }
      }
      break;
    }

    case 'spiral': {
      let x = 0;
      let y = 0;
      let dx = 1;
      let dy = 0;
      let steps = width;
      let stepCount = 0;
      let segment = 0;

      for (let i = 0; i < width * height; i++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          grid[y][x] = cellType;
        }
        stepCount++;
        if (stepCount >= steps) {
          stepCount = 0;
          segment++;
          const temp = dx;
          dx = -dy;
          dy = temp;
          if (segment % 2 === 0) {
            steps = Math.max(1, steps - 1);
          }
        }
        x += dx;
        y += dy;
      }
      break;
    }
  }

  return grid;
}

export function fillArea(
  grid: CellType[][],
  width: number,
  height: number,
  startPos: Position,
  targetType: CellType,
  fillType: CellType
): CellType[][] {
  const newGrid = grid.map((row) => [...row]);
  const startCell = getCell(grid, startPos);

  if (startCell === null || startCell !== targetType) {
    return newGrid;
  }

  const posKey = (p: Position) => `${p.x},${p.y}`;
  const visited = new Set<string>();
  const queue: Position[] = [startPos];
  visited.add(posKey(startPos));

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    newGrid[current.y][current.x] = fillType;

    for (const dir of directions) {
      const next: Position = { x: current.x + dir.dx, y: current.y + dir.dy };
      const key = posKey(next);

      if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) continue;
      if (visited.has(key)) continue;

      const cell = getCell(newGrid, next);
      if (cell === targetType) {
        visited.add(key);
        queue.push(next);
      }
    }
  }

  return newGrid;
}

export function shiftGrid(
  grid: CellType[][],
  width: number,
  height: number,
  dx: number,
  dy: number,
  fillType: CellType = 'empty'
): CellType[][] {
  const newGrid = createEmptyGrid(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = x - dx;
      const srcY = y - dy;
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        newGrid[y][x] = grid[srcY][srcX];
      } else {
        newGrid[y][x] = fillType;
      }
    }
  }

  return newGrid;
}

export function rotateGrid(
  grid: CellType[][],
  width: number,
  height: number,
  clockwise: boolean = true
): CellType[][] {
  const newGrid: CellType[][] = [];

  if (clockwise) {
    for (let x = 0; x < width; x++) {
      const newRow: CellType[] = [];
      for (let y = height - 1; y >= 0; y--) {
        newRow.push(grid[y][x]);
      }
      newGrid.push(newRow);
    }
  } else {
    for (let x = width - 1; x >= 0; x--) {
      const newRow: CellType[] = [];
      for (let y = 0; y < height; y++) {
        newRow.push(grid[y][x]);
      }
      newGrid.push(newRow);
    }
  }

  return newGrid;
}
