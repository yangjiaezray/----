// ==========================================================================
// 贪吃蛇 AI 批量测试脚本 —— Node.js
// 不依赖浏览器，纯逻辑模拟
// ==========================================================================

const COLS = 20, ROWS = 20;
const AI_TARGET = 15;
const AI_SPEED = 70;
const AI_STARVE_LIMIT = 350;

// ====== 工具函数 ======
const key = p => p.x + ',' + p.y;
const eq = (a, b) => a.x === b.x && a.y === b.y;
const inside = p => p.x >= 0 && p.x < COLS && p.y >= 0 && p.y < ROWS;

// ====== BFS ======
function bfs(start, target, obstacles) {
  const queue = [[start]];
  let head = 0;
  const visited = new Set([key(start)]);
  const DIRS = [{ x:1,y:0 }, { x:-1,y:0 }, { x:0,y:1 }, { x:0,y:-1 }];
  while (head < queue.length) {
    const path = queue[head++];
    const current = path[path.length - 1];
    if (eq(current, target)) return path;
    for (const d of DIRS) {
      const n = { x: current.x + d.x, y: current.y + d.y };
      const nk = key(n);
      if (inside(n) && !visited.has(nk) && !obstacles.has(nk)) {
        visited.add(nk);
        queue.push([...path, n]);
      }
    }
  }
  return null;
}

function getDirection(from, to) {
  return { x: Math.sign(to.x - from.x), y: Math.sign(to.y - from.y) };
}

// ====== 洪水填充 ======
function countReachable(start, obstacles) {
  const visited = new Set([key(start)]);
  const queue = [start];
  let head = 0;
  const DIRS = [{ x:1,y:0 }, { x:-1,y:0 }, { x:0,y:1 }, { x:0,y:-1 }];
  while (head < queue.length) {
    const cur = queue[head++];
    for (const d of DIRS) {
      const n = { x: cur.x + d.x, y: cur.y + d.y };
      const nk = key(n);
      if (inside(n) && !visited.has(nk) && !obstacles.has(nk)) {
        visited.add(nk);
        queue.push(n);
      }
    }
  }
  return visited.size;
}

// ====== 安全性检查（双档位） ======
function isPathSafe(path, snake) {
  if (!path || path.length < 2) return false;
  const vSnake = snake.map(s => ({ x: s.x, y: s.y }));
  for (let i = 1; i < path.length; i++) {
    vSnake.unshift(path[i]);
    if (i < path.length - 1) vSnake.pop();
  }
  const vHead = vSnake[0];
  const vTail = vSnake[vSnake.length - 1];
  const obstacles = new Set(vSnake.slice(1, -1).map(key));
  return bfs(vHead, vTail, obstacles) !== null;
}

function isPathSafeLenient(path, snake) {
  if (!path || path.length < 2) return false;
  const vSnake = snake.map(s => ({ x: s.x, y: s.y }));
  for (let i = 1; i < path.length; i++) {
    vSnake.unshift(path[i]);
    if (i < path.length - 1) vSnake.pop();
  }
  const vHead = vSnake[0];
  const vTail = vSnake[vSnake.length - 1];
  const snakeLen = vSnake.length;
  const obstacles = new Set(vSnake.slice(1).map(key));
  obstacles.delete(key(vTail));
  const reachable = countReachable(vHead, obstacles);
  const DIRS = [{ x:1,y:0 }, { x:-1,y:0 }, { x:0,y:1 }, { x:0,y:-1 }];
  let escapeRoutes = 0;
  for (const d of DIRS) {
    const n = { x: vHead.x + d.x, y: vHead.y + d.y };
    if (inside(n) && !obstacles.has(key(n))) escapeRoutes++;
  }
  return reachable >= snakeLen * 0.30 && escapeRoutes >= 2;
}

// ====== 生成食物 ======
function makeFood(snake) {
  const occupied = new Set(snake.map(key));
  const free = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (!occupied.has(x + ',' + y)) free.push({ x, y });
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

// ====== AI 决策 ======
function aiDecide(snake, food, aiStepsNoFood) {
  const bodySet = new Set(snake.slice(0, -1).map(key));
  const pathToFood = bfs(snake[0], food, bodySet);
  const starving = aiStepsNoFood >= AI_STARVE_LIMIT;

  if (pathToFood && pathToFood.length >= 2) {
    // 正常模式：严格检查
    if (!starving) {
      if (isPathSafe(pathToFood, snake)) {
        return getDirection(snake[0], pathToFood[1]);
      }
      // 绕路策略
      const DIRS4 = [{ x:1,y:0 }, { x:-1,y:0 }, { x:0,y:1 }, { x:0,y:-1 }];
      for (const d of DIRS4) {
        const n = { x: snake[0].x + d.x, y: snake[0].y + d.y };
        if (!inside(n) || bodySet.has(key(n))) continue;
        let vSnake = snake.map(s => ({ x: s.x, y: s.y }));
        vSnake.unshift({ x: n.x, y: n.y });
        vSnake.pop();
        const localObs = new Set(vSnake.slice(0, -1).map(key));
        const detourPath = bfs(n, food, localObs);
        if (detourPath && detourPath.length >= 2 && isPathSafe(detourPath, vSnake)) {
          return d;
        }
      }
    }

    // 饥饿模式
    if (starving) {
      if (isPathSafeLenient(pathToFood, snake)) {
        return getDirection(snake[0], pathToFood[1]);
      }
      const DIRS4 = [{ x:1,y:0 }, { x:-1,y:0 }, { x:0,y:1 }, { x:0,y:-1 }];
      for (const d of DIRS4) {
        const n = { x: snake[0].x + d.x, y: snake[0].y + d.y };
        if (!inside(n) || bodySet.has(key(n))) continue;
        let vSnake = snake.map(s => ({ x: s.x, y: s.y }));
        vSnake.unshift({ x: n.x, y: n.y });
        vSnake.pop();
        const localObs = new Set(vSnake.slice(0, -1).map(key));
        const detourPath = bfs(n, food, localObs);
        if (detourPath && detourPath.length >= 2 && isPathSafeLenient(detourPath, vSnake)) {
          return d;
        }
      }
    }
  }

  const tail = snake[snake.length - 1];
  const allBody = new Set(snake.map(key));
  allBody.delete(key(tail));
  const pathToTail = bfs(snake[0], tail, allBody);
  if (pathToTail && pathToTail.length >= 2) {
    return getDirection(snake[0], pathToTail[1]);
  }

  const DIRS = [{ x:1,y:0 }, { x:-1,y:0 }, { x:0,y:1 }, { x:0,y:-1 }];
  const bodyObstacles = new Set(snake.slice(0, -1).map(key));
  for (const d of DIRS) {
    const n = { x: snake[0].x + d.x, y: snake[0].y + d.y };
    if (inside(n) && !bodyObstacles.has(key(n))) return d;
  }
  return snake.length > 0 ? { x: 1, y: 0 } : { x: 0, y: 0 };
}

// ====== 运行一局 AI ======
function runOneGame() {
  let snake = [{ x:10, y:10 }, { x:9, y:10 }, { x:8, y:10 }];
  let dir = { x:1, y:0 };
  let food = makeFood(snake);
  let eaten = 0;
  let score = 0;
  let aiStepsNoFood = 0;
  const maxSteps = 20000; // 安全上限

  for (let step = 0; step < maxSteps; step++) {
    if (!food) break; // 通关

    dir = aiDecide(snake, food, aiStepsNoFood);
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (!inside(head)) return { result: 'wall', eaten, score, length: snake.length, steps: step };
    const body = snake.slice(0, -1);
    if (body.some(s => eq(s, head))) return { result: 'self', eaten, score, length: snake.length, steps: step };

    snake.unshift(head);

    if (eq(head, food)) {
      score += 10;
      eaten++;
      aiStepsNoFood = 0;
      food = makeFood(snake);
    } else {
      snake.pop();
      aiStepsNoFood++;
    }
  }
  return { result: food ? 'timeout' : 'win', eaten, score, length: snake.length, steps: maxSteps };
}

// ====== 批量测试 ======
const TOTAL_RUNS = 150;
const results = [];
let wallDeaths = 0, selfDeaths = 0, wins = 0, timeouts = 0;
let totalLength = 0, maxLength = 0, minLength = Infinity;
let totalSteps = 0, totalEaten = 0;
const eatenDist = {};

console.log(`开始运行 ${TOTAL_RUNS} 局 AI 模拟测试...\n`);

for (let i = 0; i < TOTAL_RUNS; i++) {
  const r = runOneGame();
  results.push(r);

  if (r.result === 'wall') wallDeaths++;
  else if (r.result === 'self') selfDeaths++;
  else if (r.result === 'win') wins++;
  else timeouts++;

  totalLength += r.length;
  totalSteps += r.steps;
  totalEaten += r.eaten;
  if (r.length > maxLength) maxLength = r.length;
  if (r.length < minLength) minLength = r.length;

  const bucket = Math.floor(r.eaten / 10) * 10;
  eatenDist[bucket] = (eatenDist[bucket] || 0) + 1;

  if ((i + 1) % 25 === 0) {
    process.stdout.write(`  已完成 ${i + 1}/${TOTAL_RUNS} ...\r`);
  }
}

console.log(`\n\n========== 测试结果 (${TOTAL_RUNS} 局) ==========`);
console.log(`总死亡局数: ${wallDeaths + selfDeaths}`);
console.log(`  - 撞墙:    ${wallDeaths}  (${(wallDeaths / TOTAL_RUNS * 100).toFixed(1)}%)`);
console.log(`  - 撞自己:  ${selfDeaths}  (${(selfDeaths / TOTAL_RUNS * 100).toFixed(1)}%)`);
console.log(`  - 通关/超时: ${wins + timeouts}`);
console.log(`平均蛇长: ${(totalLength / TOTAL_RUNS).toFixed(1)}`);
console.log(`最大蛇长: ${maxLength}`);
console.log(`最小蛇长: ${minLength}`);
console.log(`平均吃食物: ${(totalEaten / TOTAL_RUNS).toFixed(1)}`);
console.log(`平均每食物步数: ${totalEaten > 0 ? (totalSteps / totalEaten).toFixed(1) : 'N/A'}`);

console.log(`\n吃食物数量分布:`);
const sortedBuckets = Object.keys(eatenDist).map(Number).sort((a, b) => a - b);
for (const b of sortedBuckets) {
  const bar = '█'.repeat(Math.max(1, Math.round(eatenDist[b] / TOTAL_RUNS * 50)));
  console.log(`  ${b}-${b + 9}: ${String(eatenDist[b]).padStart(3)} 局  ${bar}`);
}

// 统计死亡时蛇长分布
console.log(`\n死亡时蛇长分布 (仅死亡局):`);
const deathLengths = results.filter(r => r.result === 'wall' || r.result === 'self');
const lenDist = {};
deathLengths.forEach(r => {
  const bucket = Math.floor(r.length / 10) * 10;
  lenDist[bucket] = (lenDist[bucket] || 0) + 1;
});
const sortedLen = Object.keys(lenDist).map(Number).sort((a, b) => a - b);
for (const b of sortedLen) {
  const bar = '█'.repeat(Math.max(1, Math.round(lenDist[b] / deathLengths.length * 50)));
  console.log(`  ${b}-${b + 9}: ${String(lenDist[b]).padStart(3)} 局  ${bar}`);
}