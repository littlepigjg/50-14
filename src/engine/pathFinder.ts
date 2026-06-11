import type { CellType, Position } from './types';
import { positionEquals } from './GameEngine';

export interface PathResult {
  reachable: boolean;
  path: Position[];
  distance: number;
}

export interface ReachabilityReport {
  reachableFromStart: Set<string>;
  unreachableStars: Position[];
  allStarsReachable: boolean;
}

const FOUR_DIRS = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

const posKey = (p: Position) => `${p.x},${p.y}`;

function isPassable(cell: CellType, avoidPits: boolean): boolean {
  if (cell === 'wall') return false;
  if (avoidPits && cell === 'pit') return false;
  return true;
}

export function bfsShortestPath(
  grid: CellType[][],
  width: number,
  height: number,
  start: Position,
  end: Position,
  avoidPits: boolean = true
): PathResult {
  if (positionEquals(start, end)) {
    return { reachable: true, path: [{ ...start }], distance: 0 };
  }

  const visited = new Set<string>();
  const parent = new Map<string, Position | null>();
  const queue: Position[] = [];

  visited.add(posKey(start));
  parent.set(posKey(start), null);
  queue.push(start);

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const dir of FOUR_DIRS) {
      const next: Position = { x: current.x + dir.dx, y: current.y + dir.dy };
      const key = posKey(next);

      if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) continue;
      if (visited.has(key)) continue;

      const cell = grid[next.y][next.x];
      if (!isPassable(cell, avoidPits)) continue;

      visited.add(key);
      parent.set(key, current);

      if (positionEquals(next, end)) {
        found = true;
        break;
      }

      queue.push(next);
    }

    if (found) break;
  }

  if (!found) {
    return { reachable: false, path: [], distance: -1 };
  }

  const path: Position[] = [];
  let cur: Position | null = end;
  while (cur !== null) {
    path.unshift({ ...cur });
    cur = parent.get(posKey(cur)) || null;
  }

  return { reachable: true, path, distance: path.length - 1 };
}

export function findReachableCells(
  grid: CellType[][],
  width: number,
  height: number,
  start: Position,
  avoidPits: boolean = true
): Set<string> {
  const reachable = new Set<string>();
  const queue: Position[] = [];

  reachable.add(posKey(start));
  queue.push(start);

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const dir of FOUR_DIRS) {
      const next: Position = { x: current.x + dir.dx, y: current.y + dir.dy };
      const key = posKey(next);

      if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) continue;
      if (reachable.has(key)) continue;

      const cell = grid[next.y][next.x];
      if (!isPassable(cell, avoidPits)) continue;

      reachable.add(key);
      queue.push(next);
    }
  }

  return reachable;
}

export function checkReachability(
  grid: CellType[][],
  width: number,
  height: number,
  start: Position,
  goal: Position,
  stars: Position[],
  avoidPits: boolean = true
): ReachabilityReport {
  const reachableFromStart = findReachableCells(grid, width, height, start, avoidPits);
  const unreachableStars = stars.filter((s) => !reachableFromStart.has(posKey(s)));
  return {
    reachableFromStart,
    unreachableStars,
    allStarsReachable: unreachableStars.length === 0,
  };
}

export function findIsolatedAreas(
  grid: CellType[][],
  width: number,
  height: number,
  avoidPits: boolean = true
): Position[][] {
  const visited = new Set<string>();
  const areas: Position[][] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      if (!isPassable(cell, avoidPits)) continue;

      const key = posKey({ x, y });
      if (visited.has(key)) continue;

      const area: Position[] = [];
      const queue: Position[] = [{ x, y }];
      visited.add(key);

      while (queue.length > 0) {
        const current = queue.shift()!;
        area.push(current);

        for (const dir of FOUR_DIRS) {
          const next: Position = { x: current.x + dir.dx, y: current.y + dir.dy };
          const nextKey = posKey(next);

          if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) continue;
          if (visited.has(nextKey)) continue;

          const nextCell = grid[next.y][next.x];
          if (!isPassable(nextCell, avoidPits)) continue;

          visited.add(nextKey);
          queue.push(next);
        }
      }

      if (area.length > 0) {
        areas.push(area);
      }
    }
  }

  return areas.sort((a, b) => b.length - a.length);
}

export function findDeadEnds(
  grid: CellType[][],
  width: number,
  height: number,
  avoidPits: boolean = true
): Position[] {
  const deadEnds: Position[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      if (!isPassable(cell, avoidPits)) continue;

      let openNeighbors = 0;
      for (const dir of FOUR_DIRS) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        if (isPassable(grid[ny][nx], avoidPits)) {
          openNeighbors++;
        }
      }

      if (openNeighbors === 1) {
        deadEnds.push({ x, y });
      }
    }
  }

  return deadEnds;
}
