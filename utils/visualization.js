import chalk from 'chalk';

/**
 * Prints a visual representation of the game board using emojis
 * 
 * @param {Object} gameState - Current game state
 */
export function printBoard(gameState) {
  try {
    console.log(`Turn ${gameState.turn} | Health: ${gameState.you.health}`);
    
    const board = gameState.board;
    const width = board.width;
    const height = board.height;
    
    // Create emoji board
    let boardString = "";
    for (let y = height - 1; y >= 0; y--) {
      let rowString = "";
      for (let x = 0; x < width; x++) {
        // Default empty cell
        let cell = "⬜";
        
        // Check if food is here
        if (board.food.some(f => f.x === x && f.y === y)) {
          cell = "🍎";
        }
        
        // Check if any snake is here
        board.snakes.forEach(snake => {
          snake.body.forEach((segment, i) => {
            if (segment.x === x && segment.y === y) {
              // My snake vs enemy snake
              if (snake.id === gameState.you.id) {
                cell = i === 0 ? "🟢" : "🟩";  // Your head / body
              } else {
                cell = i === 0 ? "🔴" : "🟥";  // Enemy head / body
              }
            }
          });
        });
        
        rowString += cell;
      }
      boardString += rowString + "\n";
    }
    
    console.log(boardString);
    
  } catch (error) {
    // Silent fail - don't add noise if visualization failsSilent fail - don't add noise if visualization fails
  }
}