import { move } from './server.js';

test('should prevent out-of-bounds moves', () => {
  const gameState = {
    you: {
      body: [
        { x: 2, y: 2 }, // Snake head at position (2, 2)
        { x: 2, y: 3 },
        { x: 2, y: 4 }
      ]
    },
    board: {
      width: 5,  // The board is 5 units wide
      height: 5, // The board is 5 units tall
      food: [{ x: 3, y: 2 }] // Food at position (3, 2)
    }
  };

  // Simulate trying to move right when we're already at the edge
  const result = move(gameState);

  // The move should not be right because we're at the edge of the board
  expect(result.move).not.toBe('right'); 

  // Simulate trying to move down when we're already at the edge
  gameState.you.body[0].y = 4; // Move head to the bottom edge
  const resultDown = move(gameState);

  // The move should not be down because it's out of bounds
  expect(resultDown.move).not.toBe('down');
});
