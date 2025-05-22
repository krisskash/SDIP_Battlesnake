// seekFood.test.js
import { seekFood } from './server.js';

test('should return the correct direction towards the food', () => {
  const gameState = {
    you: { body: [{ x: 1, y: 1 }] },
    board: { food: [{ x: 3, y: 1 }] }
  };

  const result = seekFood(gameState);
  expect(result).toBe('right');
});

test('should return null when no food is present', () => {
  const gameState = {
    you: { body: [{ x: 1, y: 1 }] },
    board: { food: [] }
  };

  const result = seekFood(gameState);
  expect(result).toBeNull();
});
