/**
 * Hunt smaller snake or vulnerable targets
 */
export function huntSmallerSnake(gameState, isMoveSafe, openSpace) {
  const myHead = gameState.you.body[0];
  const myLength = gameState.you.body.length;
  const myHealth = gameState.you.health;
  
  // Skip hunting if very low health
  if (myHealth < 20) return null;
  
  const opponents = gameState.board.snakes.filter(s => s.id !== gameState.you.id);
  if (opponents.length === 0) return null;
  
  // Find vulnerable targets (smaller or low health)
  const targets = opponents.map(snake => {
    const head = snake.body[0];
    const distance = Math.abs(myHead.x - head.x) + Math.abs(myHead.y - head.y);
    const sizeDiff = myLength - snake.body.length;
    const healthFactor = (100 - snake.health) / 10;
    
    return {
      ...snake,
      distance,
      score: sizeDiff * 2 + healthFactor
    };
  })
  .filter(snake => (snake.body.length < myLength || snake.health < 30) && snake.distance <= 8)
  .sort((a, b) => b.score - a.score);
  
  // Hunt most vulnerable target
  if (targets.length > 0) {
    const target = targets[0];
    
    // Try food ambush for hungry targets
    if (target.health < 40) {
      const ambushMove = setupAmbush(target, gameState, isMoveSafe, openSpace);
      if (ambushMove) return ambushMove;
    }
    
    // Direct pursuit
    return pursueSnake(target, myHead, isMoveSafe, openSpace, gameState);
  }
  
  // Head-to-head opportunity when we're much bigger
  const biggestOpponent = opponents.reduce(
    (max, s) => s.body.length > max.body.length ? s : max, 
    { body: { length: 0 } }
  );
  
  if (myLength > biggestOpponent.body.length + 2) {
    for (const snake of opponents) {
      if (snake.body.length < myLength) {
        const headToHead = findHeadToHead(snake, myHead, isMoveSafe, openSpace);
        if (headToHead) return headToHead;
      }
    }
  }
  
  return null;
}

/**
 * Try to ambush a hungry snake at food
 */
function setupAmbush(targetSnake, gameState, isMoveSafe, openSpace) {
  const myHead = gameState.you.body[0];
  const enemyHead = targetSnake.body[0];
  
  // Find food the enemy might target
  const nearestFood = findNearestFood(enemyHead, gameState);
  if (!nearestFood) return null;
  
  const enemyDistToFood = Math.abs(enemyHead.x - nearestFood.x) + 
                          Math.abs(enemyHead.y - nearestFood.y);
  const myDistToFood = Math.abs(myHead.x - nearestFood.x) + 
                       Math.abs(myHead.y - nearestFood.y);
  
  // Only try intercept if enemy is close to food and hungry
  if (enemyDistToFood > 3 || targetSnake.health > 50 || myDistToFood > enemyDistToFood + 1) {
    return null;
  }
  
  // Find best interception move
  const moves = [];
  ['up', 'down', 'left', 'right'].forEach(dir => {
    if (!isMoveSafe[dir]) return;
    
    const newPos = getNextPosition(myHead, dir);
    const interceptDist = Math.abs(newPos.x - nearestFood.x) + 
                          Math.abs(newPos.y - nearestFood.y);
    
    if (interceptDist <= 1) {
      moves.push({ dir, score: openSpace[dir] + (1 / interceptDist) * 5 });
    }
  });
  
  // Return best move if any
  return moves.length > 0 ? 
    moves.sort((a, b) => b.score - a.score)[0].dir : null;
}

/**
 * Pursue a target snake with prediction
 */
function pursueSnake(targetSnake, myHead, isMoveSafe, openSpace, gameState) {
  const target = targetSnake.body[0];
  
  // Predict next position based on hunger and food
  let predictedPos = target;
  if (targetSnake.health < 30) {
    const food = findNearestFood(target, gameState);
    if (food) {
      // Predict move toward food
      const dx = food.x - target.x;
      const dy = food.y - target.y;
      const dir = Math.abs(dx) > Math.abs(dy) ? 
                 (dx > 0 ? 'right' : 'left') : 
                 (dy > 0 ? 'up' : 'down');
      predictedPos = getNextPosition(target, dir);
    }
  } else if (targetSnake.body.length >= 2) {
    // Predict continuing in current direction
    const dir = getDirection(targetSnake.body[1], target);
    if (dir) predictedPos = getNextPosition(target, dir);
  }
  
  // Calculate moves toward predicted position
  const dx = predictedPos.x - myHead.x;
  const dy = predictedPos.y - myHead.y;
  
  const moves = [
    { dir: 'right', score: dx > 0 ? 2 : -1 },
    { dir: 'left', score: dx < 0 ? 2 : -1 },
    { dir: 'up', score: dy > 0 ? 2 : -1 },
    { dir: 'down', score: dy < 0 ? 2 : -1 }
  ].sort((a, b) => b.score - a.score);
  
  // Try moves in order of preference
  const minSpace = targetSnake.distance <= 2 ? 2 : 3;
  for (const move of moves) {
    if (isMoveSafe[move.dir] && openSpace[move.dir] > minSpace) {
      return move.dir;
    }
  }
  
  return null;
}

/**
 * Find head-to-head opportunity
 */
function findHeadToHead(snake, myHead, isMoveSafe, openSpace) {
  const head = snake.body[0];
  const dx = head.x - myHead.x;
  const dy = head.y - myHead.y;
  
  // Check for diagonal adjacency
  if (Math.abs(dx) + Math.abs(dy) === 2 && dx !== 0 && dy !== 0) {
    if (dx > 0 && isMoveSafe.right && openSpace.right > 1) return 'right';
    if (dx < 0 && isMoveSafe.left && openSpace.left > 1) return 'left';
    if (dy > 0 && isMoveSafe.up && openSpace.up > 1) return 'up';
    if (dy < 0 && isMoveSafe.down && openSpace.down > 1) return 'down';
  }
  
  return null;
}

/**
 * Find nearest food
 */
function findNearestFood(pos, gameState) {
  return gameState.board.food.reduce((closest, food) => {
    const dist = Math.abs(pos.x - food.x) + Math.abs(pos.y - food.y);
    if (!closest || dist < closest.dist) return { food, dist };
    return closest;
  }, null)?.food || null;
}

/**
 * Helper functions
 */
function getNextPosition(pos, dir) {
  switch (dir) {
    case 'up': return { x: pos.x, y: pos.y + 1 };
    case 'down': return { x: pos.x, y: pos.y - 1 };
    case 'left': return { x: pos.x - 1, y: pos.y };
    case 'right': return { x: pos.x + 1, y: pos.y };
  }
}

function getDirection(neck, head) {
  if (head.x > neck.x) return 'right';
  if (head.x < neck.x) return 'left';
  if (head.y > neck.y) return 'up';
  if (head.y < neck.y) return 'down';
  return null;
}