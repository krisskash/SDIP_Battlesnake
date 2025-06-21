/**
 * Determines move safety with simplified risk-reward analysis
 * @param {Object} gameState - Current game state
 * @returns {Object} Object with safety status for each direction
 */
export function getSafeMoves(gameState) {
  const myHead = gameState.you.body[0];
  const myLength = gameState.you.body.length;
  const myHealth = gameState.you.health;
  const board = gameState.board;
  
  // Initialize with all moves as potentially safe
  const isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true
  };
  
  // Track risk and reward scores for informed decisions
  const moveAnalysis = {
    up: { risk: 0, reward: 0 },
    down: { risk: 0, reward: 0 },
    left: { risk: 0, reward: 0 },
    right: { risk: 0, reward: 0 }
  };

  // STEP 1: Check for immediate collisions (walls and snake bodies)
  // Wall collisions
  if (myHead.x + 1 >= board.width) isMoveSafe.right = false;
  if (myHead.x - 1 < 0) isMoveSafe.left = false;
  if (myHead.y + 1 >= board.height) isMoveSafe.up = false;
  if (myHead.y - 1 < 0) isMoveSafe.down = false;
  
  // Will tail move? (Only if not eating)
  const willEat = board.food.some(food => 
    Math.abs(food.x - myHead.x) + Math.abs(food.y - myHead.y) === 1
  );
  
  // Snake body collisions (including own)
  board.snakes.forEach(snake => {
    const isSelf = snake.id === gameState.you.id;
    
    snake.body.forEach((segment, index) => {
      // Skip tail that will move (unless eating)
      if (isSelf && index === snake.body.length - 1 && !willEat) return;
      if (!isSelf && index === snake.body.length - 1) return; // Simplification: assume enemy tails move
      
      // Check collisions in each direction
      if (segment.x === myHead.x + 1 && segment.y === myHead.y) isMoveSafe.right = false;
      if (segment.x === myHead.x - 1 && segment.y === myHead.y) isMoveSafe.left = false;
      if (segment.x === myHead.x && segment.y === myHead.y + 1) isMoveSafe.up = false;
      if (segment.x === myHead.x && segment.y === myHead.y - 1) isMoveSafe.down = false;
    });
  });

  // STEP 2: For remaining safe moves, assess head-to-head risk
  board.snakes.forEach(snake => {
    if (snake.id === gameState.you.id) return; // Skip self
    
    const enemyHead = snake.body[0];
    const enemyLength = snake.body.length;
    
    // Check potential head-to-head in each direction
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(dir => {
      if (!isMoveSafe[dir]) return; // Skip already unsafe moves
      
      const newHead = getNextPosition(myHead, dir);
      
      // For each possible enemy move
      ['up', 'down', 'left', 'right'].forEach(enemyDir => {
        const enemyNext = getNextPosition(enemyHead, enemyDir);
        
        // Check for potential collision
        if (newHead.x === enemyNext.x && newHead.y === enemyNext.y) {
          // If we're smaller or equal, avoid the move
          if (myLength <= enemyLength) {
            isMoveSafe[dir] = false;
          }
        }
      });
    });
  });
  
  // STEP 3: Assess space and rewards for remaining safe moves
  const directions = ['up', 'down', 'left', 'right'];
  directions.forEach(dir => {
    if (!isMoveSafe[dir]) return;
    
    const newHead = getNextPosition(myHead, dir);
    
    // Assess available space (simplified flood fill)
    const space = countAccessibleSpace(newHead, gameState);
    
    // Mark unsafe if not enough space for our body
    if (space < myLength) {
      isMoveSafe[dir] = false;
    }
    
    // If health is very low, we might need to take risks for food
    if (!isMoveSafe[dir] && myHealth < 15) {
      // Check if this move leads directly to food
      const leadsToFood = board.food.some(food => 
        food.x === newHead.x && food.y === newHead.y
      );
      
      if (leadsToFood) {
        console.log(`Taking desperate risk for food: ${dir}`);
        isMoveSafe[dir] = true; // Override safety for critical food
      }
    }
  });

  return isMoveSafe;
}

/**
 * Simplified flood fill to count accessible spaces
 */
function countAccessibleSpace(startPos, gameState) {
  const visited = new Set();
  const queue = [startPos];
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;
  
  // Create quick lookup for obstacles
  const obstacles = new Set();
  gameState.board.snakes.forEach(snake => {
    snake.body.forEach(segment => {
      obstacles.add(`${segment.x},${segment.y}`);
    });
  });
  
  // Simple BFS
  while (queue.length > 0) {
    const pos = queue.shift();
    const posKey = `${pos.x},${pos.y}`;
    
    if (pos.x < 0 || pos.y < 0 || 
        pos.x >= boardWidth || pos.y >= boardHeight ||
        visited.has(posKey) || obstacles.has(posKey)) {
      continue;
    }
    
    visited.add(posKey);
    
    // Add adjacent cells
    queue.push({ x: pos.x + 1, y: pos.y });
    queue.push({ x: pos.x - 1, y: pos.y });
    queue.push({ x: pos.x, y: pos.y + 1 });
    queue.push({ x: pos.x, y: pos.y - 1 });
  }
  
  return visited.size;
}

/**
 * Calculate position after moving in a direction
 */
function getNextPosition(pos, direction) {
  switch(direction) {
    case 'up': return { x: pos.x, y: pos.y + 1 };
    case 'down': return { x: pos.x, y: pos.y - 1 };
    case 'left': return { x: pos.x - 1, y: pos.y };
    case 'right': return { x: pos.x + 1, y: pos.y };
  }
}

/**
 * Determines if a specific move is safe
 * @param {Object} gameState - Current game state
 * @param {Object} move - Move object with x and y properties
 * @returns {boolean} Whether the move is safe
 */
export function isMoveSafe(gameState, move) {
  const myHead = gameState.you.body[0];
  const newPos = { x: myHead.x + move.x, y: myHead.y + move.y };
  
  // Check for wall collisions
  if (gameState.board && 
      (newPos.x < 0 || newPos.y < 0 || 
       newPos.x >= gameState.board.width || 
       newPos.y >= gameState.board.height)) {
    return false;
  }
  
  // Check for self collisions (excluding tail which will move)
  for (let i = 0; i < gameState.you.body.length - 1; i++) {
    const segment = gameState.you.body[i];
    if (newPos.x === segment.x && newPos.y === segment.y) {
      return false;
    }
  }
  
  // Check for other snake collisions
  if (gameState.board && gameState.board.snakes) {
    for (const snake of gameState.board.snakes) {
      if (snake.id === gameState.you.id) continue; // Skip our own body as we checked it above
      for (const segment of snake.body) {
        if (newPos.x === segment.x && newPos.y === segment.y) {
          return false;
        }
      }
    }
  }
  
  return true;
}