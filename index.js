// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

// Import the flood fill functions
import runServer from './server.js';
import chalk from 'chalk';
import { calculateOpenSpace } from './floodFill.js';

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info() {
  console.log('INFO');

  return {
    apiversion: '1',
    author: 'B1G_THAN0S, L1L 4GGELOS, CHR1S SL1M3',
    color: '#D2042D', // Cherry Red
    head: 'silly', // Silly face head
    tail: 'bolt', // Lightning bolt tail
  };
}

// start is called when your Battlesnake begins a game
function start(gameState) {
  console.log('GAME START');
}

// end is called when your Battlesnake finishes a game
function end(gameState) {
  console.log('GAME OVER\n');
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function printBoard(gameState) {
  const board = gameState.board;
  const width = board.width;
  const height = board.height;

  // Create empty board
  let boardMap = new Map();

  // Mark food with apple emoji
  board.food.forEach((f) => {
    boardMap.set(`${f.x},${f.y}`, '🍎');
  });

  // Mark snakes - body with snake emoji, head with crown
  board.snakes.forEach((snake) => {
    const isMySnake = snake.id === gameState.you.id;
    snake.body.forEach((b, i) => {
      if (i === 0) {
        // Snake head
        boardMap.set(
          `${b.x},${b.y}`,
          isMySnake ? chalk.green('👑') : chalk.red('👑')
        );
      } else {
        // Snake body
        boardMap.set(
          `${b.x},${b.y}`,
          isMySnake ? chalk.green('🟩') : chalk.red('🟥')
        );
      }
    });
  });

  // Print the board
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const cell = boardMap.get(`${x},${y}`) || '⬜';
      process.stdout.write(cell + ' ');
    }
    console.log(); // New line after each row
  }
  console.log(); // Empty line after board
}

// This function calculates the closest food based on Manhattan distance
// and returns the cardinal direction to move towards it.
export function seekFood(gameState) {
  const myHead = gameState.you.body[0];
  const food = gameState.board.food;

  // If there's no food, return null
  if (food.length === 0) {
    return null;
  }

  // Find closest food using Manhattan distance
  let closestFood = null;
  let minDistance = Infinity;

  food.forEach((f) => {
    const distance = Math.abs(f.x - myHead.x) + Math.abs(f.y - myHead.y);
    if (distance < minDistance) {
      minDistance = distance;
      closestFood = f;
    }
  });

  // Determine direction to move towards food
  if (closestFood.x < myHead.x) {
    return 'left';
  } else if (closestFood.x > myHead.x) {
    return 'right';
  } else if (closestFood.y < myHead.y) {
    return 'down';
  } else if (closestFood.y > myHead.y) {
    return 'up';
  }

  return null;
}

function move(gameState) {
  printBoard(gameState);

  const isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;
  const myHead = gameState.you.body[0];
  const myLength = gameState.you.body.length;

  // Prevent out-of-bounds moves
  if (myHead.x + 1 >= boardWidth) {
    isMoveSafe.right = false;
  }
  if (myHead.x - 1 < 0) {
    isMoveSafe.left = false;
  }
  if (myHead.y + 1 >= boardHeight) {
    isMoveSafe.up = false;
  }
  if (myHead.y - 1 < 0) {
    isMoveSafe.down = false;
  }

  // Prevent collisions with the snake's own body
  const myBody = gameState.you.body;
  myBody.forEach((segment) => {
    if (segment.x === myHead.x + 1 && segment.y === myHead.y) {
      isMoveSafe.right = false;
    }
    if (segment.x === myHead.x - 1 && segment.y === myHead.y) {
      isMoveSafe.left = false;
    }
    if (segment.x === myHead.x && segment.y === myHead.y + 1) {
      isMoveSafe.up = false;
    }
    if (segment.x === myHead.x && segment.y === myHead.y - 1) {
      isMoveSafe.down = false;
    }
  });

  // Prevent collisions with other snakes
  const opponents = gameState.board.snakes.filter(
    (s) => s.id !== gameState.you.id
  );
  opponents.forEach((snake) => {
    // Get the snake's head and tail positions
    const opponentHead = snake.body[0];
    const opponentTail = snake.body[snake.body.length - 1];
    
    // Check if opponent might eat food in next move
    const mightEatFood = gameState.board.food.some(food => 
      (Math.abs(food.x - opponentHead.x) + Math.abs(food.y - opponentHead.y)) === 1
    );
    
    // Process each segment of the opponent snake
    snake.body.forEach((segment, index) => {
      // Skip the tail segment if the snake won't eat food (tail will move next turn)
      if (index === snake.body.length - 1 && !mightEatFood) {
        return; // Skip marking this segment as unsafe
      }
      
      // Mark other segments as unsafe
      if (segment.x === myHead.x + 1 && segment.y === myHead.y) {
        isMoveSafe.right = false;
      }
      if (segment.x === myHead.x - 1 && segment.y === myHead.y) {
        isMoveSafe.left = false;
      }
      if (segment.x === myHead.x && segment.y === myHead.y + 1) {
        isMoveSafe.up = false;
      }
      if (segment.x === myHead.x && segment.y === myHead.y - 1) {
        isMoveSafe.down = false;
      }
    });

    // Check for head-to-head collisions
    const opponentLength = snake.body.length;

    if (opponentHead.x === myHead.x + 1 && opponentHead.y === myHead.y) {
      // Even when equal length, avoid head-to-head collisions
      isMoveSafe.right = false;
    }
    if (opponentHead.x === myHead.x - 1 && opponentHead.y === myHead.y) {
      // Even when equal length, avoid head-to-head collisions
      isMoveSafe.left = false;
    }
    if (opponentHead.x === myHead.x && opponentHead.y === myHead.y + 1) {
      // Even when equal length, avoid head-to-head collisions
      isMoveSafe.up = false;
    }
    if (opponentHead.x === myHead.x && opponentHead.y === myHead.y - 1) {
      // Even when equal length, avoid head-to-head collisions
      isMoveSafe.down = false;
    }
  });

  if (process.env.DEBUG === 'true') {
    console.log('Safe Moves Before Filtering:', isMoveSafe);
  }

  // Calculate open space in each direction
  const openSpace = calculateOpenSpace(gameState);
  
  if (process.env.DEBUG === 'true') {
    console.log('Open Space in Each Direction:', openSpace);
  }

  // Check for hunting opportunities
  const huntableSnakes = findHuntableSnakes(gameState);
  let huntDirection = null;

  if (huntableSnakes.length > 0 && gameState.you.health > 30) {
    // Only hunt if we have decent health
    const closestPrey = huntableSnakes[0];
    
    // Only hunt if the prey is reasonably close (within 5 moves)
    if (closestPrey.distance <= 5) {
      huntDirection = calculateHuntDirection(gameState, closestPrey);
      console.log(`Hunting snake ${closestPrey.id} (length: ${closestPrey.length}) in direction: ${huntDirection}`);
    }
  }

  // Priority 1: Hunt smaller snakes (if safe and we have good health)
  if (huntDirection && isMoveSafe[huntDirection] && openSpace[huntDirection] > 5) {
    console.log(`Aggressive hunting: ${huntDirection}`);
    return { move: huntDirection };
  }

  // Priority 2: Seek food (existing logic)
  const foodDirection = seekFood(gameState);
  if (foodDirection && isMoveSafe[foodDirection] && openSpace[foodDirection] > 3) {
    console.log(`Seeking food: ${foodDirection}`);
    return { move: foodDirection };
  }

  // Priority 3: Hunt with lower safety threshold (if no food available)
  if (huntDirection && isMoveSafe[huntDirection] && openSpace[huntDirection] > 2) {
    console.log(`Opportunistic hunting: ${huntDirection}`);
    return { move: huntDirection };
  }

  // Priority 4: Choose direction with most open space (existing logic)
  let bestMove = null;
  let maxSpace = -1;

  Object.keys(isMoveSafe).forEach(move => {
    if (isMoveSafe[move] && openSpace[move] > maxSpace) {
      maxSpace = openSpace[move];
      bestMove = move;
    }
  });

  // If we found a move with open space, use it
  if (bestMove !== null) {
    console.log(`MOVE ${gameState.turn}: ${bestMove} (open space: ${maxSpace})`);
    return { move: bestMove };
  }

  // Fall back to the priority-based system if no move has open space
  const movePriority = ['up', 'right', 'down', 'left']; 
  for (const move of movePriority) {
    if (isMoveSafe[move]) {
      console.log(`MOVE ${gameState.turn}: ${move} (fallback)`);
      return { move };
    }
  }

  // If no safe moves, move down
  console.log('No safe moves available. Moving down as a last resort.');
  return { move: 'down' };
}

/**
 * Identifies smaller snakes that can be hunted
 * @param {Object} gameState - The current game state
 * @returns {Array} Array of huntable snake heads with their positions and lengths
 */
export function findHuntableSnakes(gameState) {
  const myLength = gameState.you.body.length;
  const myHead = gameState.you.body[0];
  
  const huntableSnakes = [];
  
  gameState.board.snakes.forEach(snake => {
    if (snake.id !== gameState.you.id && snake.body.length < myLength) {
      const enemyHead = snake.body[0];
      const distance = Math.abs(enemyHead.x - myHead.x) + Math.abs(enemyHead.y - myHead.y);
      
      huntableSnakes.push({
        id: snake.id,
        head: enemyHead,
        length: snake.body.length,
        distance: distance,
        body: snake.body
      });
    }
  });
  
  // Sort by distance (closest first)
  return huntableSnakes.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculates the direction to hunt a specific snake
 * @param {Object} gameState - The current game state
 * @param {Object} targetSnake - The snake to hunt
 * @returns {string|null} Direction to move towards the target snake
 */
export function calculateHuntDirection(gameState, targetSnake) {
  const myHead = gameState.you.body[0];
  const targetHead = targetSnake.head;
  
  // Calculate potential hunting moves
  const huntingMoves = [];
  
  // Predict where the target snake might move
  const possibleTargetMoves = ['up', 'down', 'left', 'right'];
  
  possibleTargetMoves.forEach(move => {
    let newTargetX = targetHead.x;
    let newTargetY = targetHead.y;
    
    switch(move) {
      case 'up': newTargetY++; break;
      case 'down': newTargetY--; break;
      case 'left': newTargetX--; break;
      case 'right': newTargetX++; break;
    }
    
    // Check if this predicted position is closer than current
    const currentDistance = Math.abs(targetHead.x - myHead.x) + Math.abs(targetHead.y - myHead.y);
    const predictedDistance = Math.abs(newTargetX - myHead.x) + Math.abs(newTargetY - myHead.y);
    
    if (predictedDistance < currentDistance) {
      huntingMoves.push({
        targetX: newTargetX,
        targetY: newTargetY,
        distance: predictedDistance
      });
    }
  });
  
  // If no good hunting moves, just move towards current position
  if (huntingMoves.length === 0) {
    const dx = targetHead.x - myHead.x;
    const dy = targetHead.y - myHead.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'up' : 'down';
    }
  }
  
  // Choose the closest predicted position
  const bestHunt = huntingMoves.sort((a, b) => a.distance - b.distance)[0];
  const dx = bestHunt.targetX - myHead.x;
  const dy = bestHunt.targetY - myHead.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'up' : 'down';
  }
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});
