/**
 * Implements a zigzag movement pattern to prevent the snake from cornering itself
 * 
 * @param {Object} gameState - Current game state
 * @param {Object} isMoveSafe - Object with directions as keys and boolean safety values
 * @param {Object} openSpace - Object with directions as keys and space count values
 * @returns {string|null} Direction to move or null if no safe zigzag move
 */
export function zigZagMovement(gameState, isMoveSafe, openSpace) {
  const myHead = gameState.you.body[0];
  const myLength = gameState.you.body.length;
  const turn = gameState.turn;
  
  // Get previous move direction
  let lastDirection = null;
  if (gameState.you.body.length >= 2) {
    const neck = gameState.you.body[1];
    lastDirection = getDirection(neck, myHead);
  }
  
  // For larger snakes, check escape routes to avoid self-boxing
  if (myLength >= 8) {
    const bestEscapeMove = findBestEscapeMove(gameState, isMoveSafe, openSpace);
    if (bestEscapeMove) return bestEscapeMove;
  }
  
  // Determine primary axis (horizontal or vertical) based on turn and previous direction
  let primaryDirections, secondaryDirections;
  
  // If we have a previous direction, prioritize perpendicular movement (true zigzag)
  if (lastDirection) {
    if (lastDirection === 'left' || lastDirection === 'right') {
      primaryDirections = ['up', 'down'];
      secondaryDirections = ['left', 'right'];
    } else {
      primaryDirections = ['left', 'right'];
      secondaryDirections = ['up', 'down'];
    }
  } else {
    // No previous direction, alternate axes based on turn number
    const useHorizontalAxis = Math.floor(turn / 2) % 2 === 0;
    primaryDirections = useHorizontalAxis ? ['left', 'right'] : ['up', 'down'];
    secondaryDirections = useHorizontalAxis ? ['up', 'down'] : ['left', 'right'];
  }
  
  // Combine directions with primary first
  const allDirections = [...primaryDirections, ...secondaryDirections];
  
  // Find the direction with the most open space that follows our zigzag pattern
  let bestMove = null;
  let maxOpenSpace = 0;
  
  for (const dir of allDirections) {
    if (isMoveSafe[dir] && openSpace[dir] > maxOpenSpace) {
      bestMove = dir;
      maxOpenSpace = openSpace[dir];
    }
  }
  
  // Make sure we have enough open space (scaled by snake length)
  const minRequiredSpace = Math.min(5, Math.floor(myLength / 3));
  
  if (bestMove && maxOpenSpace > minRequiredSpace) {
    return bestMove;
  }
  
  return null;
}

/**
 * Find the best move to avoid being boxed in
 */
function findBestEscapeMove(gameState, isMoveSafe, openSpace) {
  const myHead = gameState.you.body[0];
  const directions = ['up', 'down', 'left', 'right'];
  const escapeScores = {};
  
  // Calculate escape routes for each possible move
  for (const dir of directions) {
    if (!isMoveSafe[dir]) continue;
    
    const newPos = getNextPosition(myHead, dir);
    const escapeRoutes = countEscapeRoutes(newPos, gameState);
    
    // Score based on escape routes and open space
    escapeScores[dir] = escapeRoutes * 2 + openSpace[dir];
  }
  
  // Find the move with highest escape score
  let bestMove = null;
  let bestScore = -1;
  
  for (const dir of directions) {
    if (!isMoveSafe[dir] || !escapeScores[dir]) continue;
    if (escapeScores[dir] > bestScore) {
      bestScore = escapeScores[dir];
      bestMove = dir;
    }
  }
  
  // Only suggest escape move if there's a significant difference between options
  const escapeValues = Object.values(escapeScores);
  if (escapeValues.length > 1 && Math.max(...escapeValues) - Math.min(...escapeValues) > 5) {
    return bestMove;
  }
  
  return null;
}

/**
 * Count accessible escape routes from a position
 */
function countEscapeRoutes(pos, gameState) {
  const board = gameState.board;
  const directions = ['up', 'down', 'left', 'right'];
  let count = 0;
  
  for (const dir of directions) {
    const nextPos = getNextPosition(pos, dir);
    
    // Check if position is valid (not wall or snake)
    if (nextPos.x >= 0 && nextPos.x < board.width &&
        nextPos.y >= 0 && nextPos.y < board.height &&
        !isOccupied(nextPos, gameState)) {
      count++;
    }
  }
  
  return count;
}

/**
 * Check if a position is occupied by any snake
 */
function isOccupied(pos, gameState) {
  return gameState.board.snakes.some(snake => 
    snake.body.some(segment => segment.x === pos.x && segment.y === pos.y)
  );
}

/**
 * Get new position after moving in a direction
 */
function getNextPosition(pos, direction) {
  switch (direction) {
    case 'up': return { x: pos.x, y: pos.y + 1 };
    case 'down': return { x: pos.x, y: pos.y - 1 };
    case 'left': return { x: pos.x - 1, y: pos.y };
    case 'right': return { x: pos.x + 1, y: pos.y };
  }
}

/**
 * Get current direction based on head and neck position
 */
function getDirection(neck, head) {
  if (head.x > neck.x) return 'right';
  if (head.x < neck.x) return 'left';
  if (head.y > neck.y) return 'up';
  if (head.y < neck.y) return 'down';
  return null;
}