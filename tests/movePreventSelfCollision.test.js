import { move } from '../server.js';

test('should prevent self-collision', () => {
  const gameState = {
    you: { 
      body: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 }
      ] // Snake body (head is at position 2,2)
    },
    board: {
      food: [{ x: 3, y: 2 }] // Food at position (3, 2)
    }
  };

  // Try to simulate a move where the snake's head would collide with its own body
  const result = move(gameState);

  // The snake should not try to move into its own body, so it should avoid moving up (which would result in a collision)
  expect(result.move).not.toBe('up'); // Snake should not move 'up' into its own body
});
