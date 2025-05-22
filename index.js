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

import runServer from './server.js';
import chalk from 'chalk';

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

  console.log('Snake Head:', myHead); 
  console.log('Food:', food); 

  if (food.length === 0) {
    return null;
  }

  const closestFood = food.reduce((closest, current) => {
    const closestDistance =
      Math.abs(closest.x - myHead.x) + Math.abs(closest.y - myHead.y);
    const currentDistance =
      Math.abs(current.x - myHead.x) + Math.abs(current.y - myHead.y);
    return currentDistance < closestDistance ? current : closest;
  });

  console.log('Closest Food:', closestFood);

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
    snake.body.forEach((segment) => {
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
  });

  if (process.env.DEBUG === 'true') {
    console.log('Safe Moves Before Filtering:', isMoveSafe);
  }

  // Use seekFood only if the move is safe
  const foodDirection = seekFood(gameState);
  if (foodDirection && isMoveSafe[foodDirection]) {
    console.log(`Seeking food: ${foodDirection}`);
    return { move: foodDirection };
  }

  // Fallback to a random safe move
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);
  const nextMove =
    safeMoves.length > 0
      ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
      : 'down';
  console.log(`MOVE ${gameState.turn}: ${nextMove}`);
  return { move: nextMove };
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});
