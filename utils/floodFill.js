/**
 * Performs a breadth-first flood fill algorithm to count accessible cells
 * 
 * @param {Object} board - The game board object
 * @param {Object} position - Starting position for the flood fill
 * @returns {number} The count of accessible cells from the position
 */
export function floodFill(board, position) {
  // Skip invalid positions
  if (position.x < 0 || position.y < 0 || 
      position.x >= board.width || position.y >= board.height) {
    return 0;
  }
  
  // First check if the starting position itself has a snake
  for (const snake of board.snakes) {
    for (const segment of snake.body) {
      if (segment.x === position.x && segment.y === position.y) {
        return 0; // Starting position has a snake, so there's no open space
      }
    }
  }
  
  // Create a visited set to track cells we've seen
  const visited = new Set();
  const queue = [position];
  let count = 0;
  
  // Mark starting position as visited
  visited.add(`${position.x},${position.y}`);
  
  // BFS to count accessible cells
  while (queue.length > 0) {
    const cell = queue.shift();
    count++;
    
    // Check all 4 adjacent cells
    const neighbors = [
      { x: cell.x, y: cell.y + 1 }, // up
      { x: cell.x, y: cell.y - 1 }, // down
      { x: cell.x - 1, y: cell.y }, // left
      { x: cell.x + 1, y: cell.y }, // right
    ];
    
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      
      // Skip cells outside the board
      if (neighbor.x < 0 || neighbor.y < 0 || 
          neighbor.x >= board.width || neighbor.y >= board.height) {
        continue;
      }
      
      // Skip visited cells
      if (visited.has(key)) {
        continue;
      }
      
      // Skip cells with snakes
      let hasSnake = false;
      for (const snake of board.snakes) {
        for (const segment of snake.body) {
          if (segment.x === neighbor.x && segment.y === neighbor.y) {
            hasSnake = true;
            break;
          }
        }
        if (hasSnake) break;
      }
      
      if (!hasSnake) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }
  
  return count;
}

/**
 * Calculates available open space in each possible move direction
 * 
 * @param {Object} gameState - The current game state
 * @returns {Object} Space counts in each cardinal direction
 */
export function calculateOpenSpace(gameState) {
  try {
    const board = gameState.board;
    const myHead = gameState.you.body[0];
    
    // Initialize result object with all directions
    const result = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
    
    // Calculate positions in each direction
    const positions = {
      up: { x: myHead.x, y: myHead.y + 1 },
      down: { x: myHead.x, y: myHead.y - 1 },
      left: { x: myHead.x - 1, y: myHead.y },
      right: { x: myHead.x + 1, y: myHead.y }
    };
    
    // Check each direction
    Object.keys(positions).forEach(direction => {
      const pos = positions[direction];
      
      // Check if position is within bounds
      if (pos.x >= 0 && pos.x < board.width && 
          pos.y >= 0 && pos.y < board.height) {
        // Call floodFill for this position
        result[direction] = floodFill(board, pos);
      }
    });
    
    return result;
  } catch (error) {
    console.error("Error calculating open space:", error);
    // Return default values if something goes wrong
    return {
      up: 1,
      down: 1,
      left: 1,
      right: 1
    };
  }
}