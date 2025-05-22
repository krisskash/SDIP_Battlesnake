import { seekFood } from './server.js';

test('should return the correct direction towards the food', () => {
  const gameState = {
    you: { body: [{ x: 2, y: 2 }] }, // Snake head at position (2, 2)
    board: { food: [{ x: 3, y: 2 }] } // Food at position (3, 2)
  };

  const result = seekFood(gameState);
  expect(result).toBe('right'); // Should move towards the right
});

test('should return null when no food is present', () => {
  const gameState = {
    you: { body: [{ x: 2, y: 2 }] }, // Snake head at position (2, 2)
    board: { food: [] } // No food present
  };

  const result = seekFood(gameState);
  expect(result).toBeNull(); // Should return null when no food
});
