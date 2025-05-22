import { seekFood } from './server.js';

test('should return null when no food is present', () => {
  const gameState = {
    you: { body: [{ x: 2, y: 2 }] }, // Snake head at position (2, 2)
    board: { food: [] } // No food present
  };

  const result = seekFood(gameState);
  expect(result).toBeNull(); // Should return null when no food
});

test('should return "right" when food is to the right', () => {
  const gameState = {
    you: { body: [{ x: 2, y: 2 }] }, // Snake head at position (2, 2)
    board: { food: [{ x: 3, y: 2 }] } // Food at position (3, 2)
  };

  const result = seekFood(gameState);
  expect(result).toBe('right'); // Should move towards the right
});

test('should return "left" when food is to the left', () => {
  const gameState = {
    you: { body: [{ x: 2, y: 2 }] }, // Snake head at position (2, 2)
    board: { food: [{ x: 1, y: 2 }] } // Food at position (1, 2)
  };

  const result = seekFood(gameState);
  expect(result).toBe('left'); // Should move towards the left
});

test('should return "up" when food is above', () => {
  const gameState = {
    you: { body: [{ x: 2, y: 2 }] }, // Snake head at position (2, 2)
    board: { food: [{ x: 2, y: 3 }] } // Food at position (2, 3)
  };

  const result = seekFood(gameState);
  expect(result).toBe('up'); // Should move towards the up
});

test('should return "down" when food is below', () => {
  const gameState = {
    you: { body: [{ x: 2, y: 2 }] }, // Snake head at position (2, 2)
    board: { food: [{ x: 2, y: 1 }] } // Food at position (2, 1)
  };

  const result = seekFood(gameState);
  expect(result).toBe('down'); // Should move towards the down
});
