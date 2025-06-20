import { move } from '../server.js';  // Adjust the path based on where your server.js is located

test('should prevent out-of-bounds moves', () => {
  const gameState = {
    you: {
      body: [{ x: 0, y: 0 }] // Snake head at the top-left corner of the board
    },
    board: {
      width: 5,  // 5x5 grid
      height: 5,
      food: []
    }
  };

  // Simulate trying to move right when we're already at the edge
  const result = move(gameState);
  expect(result.move).not.toBe('right');  // The move should not be right because it's out of bounds
});
