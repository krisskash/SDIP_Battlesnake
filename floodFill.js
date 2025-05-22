/**
 * Performs a flood fill algorithm to count accessible cells from a position
 * @param {Object} board - The game board
 * @param {Object} position - The starting position {x, y}
 * @return {number} The count of accessible cells
 */
export function floodFill(board, position) {
  const width = board.width;
  const height = board.height;
  
  // Create a visited set using string keys like "x,y"
  const visited = new Set();
  
  // Create a queue for BFS
  const queue = [position];
  
  // Check if a position contains a snake body
  function hasSnake(x, y) {
    return board.snakes.some(snake => 
      snake.body.some(segment => segment.x === x && segment.y === y)
    );
  }
  
  // Check if a position is valid (in bounds and not a snake)
  function isValid(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height && !hasSnake(x, y);
  }
  
  // BFS to fill and count cells
  while (queue.length > 0) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;
    
    // Skip if already visited
    if (visited.has(key)) continue;
    
    // Mark as visited
    visited.add(key);
    
    // Check all four directions
    const directions = [
      { x: current.x + 1, y: current.y }, // Right
      { x: current.x - 1, y: current.y }, // Left
      { x: current.x, y: current.y + 1 }, // Up
      { x: current.x, y: current.y - 1 }, // Down
    ];
    
    for (const dir of directions) {
      if (isValid(dir.x, dir.y) && !visited.has(`${dir.x},${dir.y}`)) {
        queue.push(dir);
      }
    }
  }
  
  // Return the count of visited cells
  return visited.size;
}

/**
 * Calculate open space in each direction from the snake's head
 * @param {Object} gameState - The current game state
 * @return {Object} Space counts in each direction { up, down, left, right }
 */
export function calculateOpenSpace(gameState) {
  const myHead = gameState.you.body[0];
  const board = gameState.board;
  
  // Store open space in each direction
  const openSpace = {
    up: 0,
    down: 0,
    left: 0,
    right: 0
  };
  
  // Check if a move in a direction is valid
  const checkMove = (direction) => {
    let testPos;
    
    switch (direction) {
      case 'up':
        testPos = { x: myHead.x, y: myHead.y + 1 };
        break;
      case 'down':
        testPos = { x: myHead.x, y: myHead.y - 1 };
        break;
      case 'left':
        testPos = { x: myHead.x - 1, y: myHead.y };
        break;
      case 'right':
        testPos = { x: myHead.x + 1, y: myHead.y };
        break;
    }
    
    // Check if the move would be out of bounds
    if (testPos.x < 0 || testPos.x >= board.width || 
        testPos.y < 0 || testPos.y >= board.height) {
      return 0;
    }
    
    // Check if the move would hit a snake
    for (const snake of board.snakes) {
      for (const segment of snake.body) {
        if (segment.x === testPos.x && segment.y === testPos.y) {
          return 0;
        }
      }
    }
    
    // Calculate flood fill from this position
    return floodFill(board, testPos);
  };
  
  // Calculate open space in each direction
  openSpace.up = checkMove('up');
  openSpace.down = checkMove('down');
  openSpace.left = checkMove('left');
  openSpace.right = checkMove('right');
  
  return openSpace;
}