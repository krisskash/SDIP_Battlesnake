import { calculateOpenSpace } from '../utils/floodFill.js';
import { getSafeMoves } from './safety.js';
import { seekFood } from './food.js';
import { printBoard } from '../utils/visualization.js';
import { huntSmallerSnake } from './hunting.js';
import { zigZagMovement } from './zigzag.js';

// Movement patterns for fallback behavior
const PATTERNS = {
  spiral: ['right', 'down', 'left', 'left', 'up', 'up', 'right', 'right', 'right'],
  perimeter: ['right', 'right', 'right', 'down', 'down', 'down', 'left', 'left', 'left', 'up', 'up', 'up']
};

let patternIndex = 0;
let lastDirection = null;

/**
 * Determines the next move for your Battlesnake
 */
export function move(gameState) {
  try {
    console.log(`Turn ${gameState.turn} | Health: ${gameState.you.health}`);
    printBoard(gameState);
    
    // Get safe moves and open space
    const isMoveSafe = getSafeMoves(gameState);
    let openSpace = calculateOpenSpace(gameState) || { up: 1, down: 1, left: 1, right: 1 };
    
    // Ensure all directions have values
    ["up", "down", "left", "right"].forEach(dir => {
      if (openSpace[dir] === undefined) openSpace[dir] = 1;
    });
    
    // Choose pattern based on snake length
    const currentPattern = gameState.you.body.length > 15 ? 'perimeter' : 'spiral';
    
    // Strategy priority order
    let nextMove = null;
    const snakeLength = gameState.you.body.length;
    
    // 1. Hunt smaller snakes when we're big enough
    if (snakeLength > 5) {
      nextMove = huntSmallerSnake(gameState, isMoveSafe, openSpace);
    }
    
    // 2. Use zigzag movement to prevent self-boxing (more important when bigger)
    if (!nextMove && (snakeLength > 4)) {
      nextMove = zigZagMovement(gameState, isMoveSafe, openSpace);
    }
    
    // 3. Seek food when health is low or still growing
    if (!nextMove && (gameState.you.health < 70 || snakeLength < 15)) {
      nextMove = seekFood(gameState, isMoveSafe, openSpace);
    }
    
    // 4. Follow the selected movement pattern if moves are safe
    if (!nextMove) {
      const pattern = PATTERNS[currentPattern];
      for (let i = 0; i < pattern.length; i++) {
        const patternMove = pattern[(patternIndex + i) % pattern.length];
        if (isMoveSafe[patternMove] && openSpace[patternMove] > 5) {
          patternIndex = (patternIndex + i + 1) % pattern.length;
          nextMove = patternMove;
          break;
        }
      }
    }
    
    // 5. Follow our tail to avoid self-collision
    if (!nextMove) {
      const myTail = gameState.you.body[gameState.you.body.length - 1];
      const myHead = gameState.you.body[0];
      const tailDirections = [];
      
      // Find directions toward tail
      if (myTail.x < myHead.x && isMoveSafe.left) tailDirections.push('left');
      if (myTail.x > myHead.x && isMoveSafe.right) tailDirections.push('right');
      if (myTail.y < myHead.y && isMoveSafe.down) tailDirections.push('down');
      if (myTail.y > myHead.y && isMoveSafe.up) tailDirections.push('up');
      
      if (tailDirections.length > 0) {
        nextMove = tailDirections.reduce((best, dir) => 
          openSpace[dir] > openSpace[best] ? dir : best, tailDirections[0]);
      }
    }
    
    // 6. Continue in same direction for smoother movement
    if (!nextMove && lastDirection && isMoveSafe[lastDirection] && openSpace[lastDirection] > 3) {
      nextMove = lastDirection;
    }
    
    // 7. Move to direction with most open space
    if (!nextMove) {
      let maxSpace = -1;
      Object.keys(isMoveSafe).forEach(move => {
        if (isMoveSafe[move] && openSpace[move] > maxSpace) {
          maxSpace = openSpace[move];
          nextMove = move;
        }
      });
    }
    
    // 8. Last resort - pick any safe move
    if (!nextMove) {
      const safeMoves = Object.keys(isMoveSafe).filter(move => isMoveSafe[move]);
      if (safeMoves.length > 0) {
        nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
      } else {
        nextMove = "down"; // No safe moves available
      }
    }
    
    console.log(`Selected move: ${nextMove}`);
    lastDirection = nextMove;
    return { move: nextMove };
    
  } catch (error) {
    console.error("Error in move function:", error);
    return { move: "down" }; // Safe fallback
  }
}