import { move } from '../logic/movement.js';
import { jest } from '@jest/globals';

// Setup mocks for the imported modules
jest.mock('../utils/floodFill.js', () => ({
  calculateOpenSpace: jest.fn().mockReturnValue({
    up: 10, down: 10, left: 10, right: 10
  })
}));

jest.mock('../logic/safety.js', () => ({
  getSafeMoves: jest.fn().mockReturnValue({
    up: true, down: true, left: true, right: true
  })
}));

jest.mock('../logic/food.js', () => ({
  seekFood: jest.fn().mockReturnValue(null)
}));

jest.mock('../utils/visualization.js', () => ({
  printBoard: jest.fn()
}));

describe('Movement Function', () => {
  // Helper function to create game state
  const createGameState = (overrides = {}) => {
    return {
      turn: 1,
      board: {
        width: 11,
        height: 11,
        snakes: [],
        food: []
      },
      you: {
        id: 'test-snake',
        body: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 }
        ],
        health: 100,
        ...overrides
      }
    };
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    getSafeMoves.mockReturnValue({
      up: true,
      down: true,
      left: true,
      right: true
    });
    
    calculateOpenSpace.mockReturnValue({
      up: 10,
      down: 10,
      left: 10,
      right: 10
    });
    
    huntSmallerSnake.mockReturnValue(null);
    zigZagMovement.mockReturnValue(null);
    seekFood.mockReturnValue(null);
  });

  describe('Strategy Priority Order', () => {
    test('should hunt smaller snakes when snake is big enough (length > 5)', () => {
      const gameState = createGameState({
        body: Array(7).fill().map((_, i) => ({ x: 5 - i, y: 5 }))
      });
      
      huntSmallerSnake.mockReturnValue('up');
      
      const result = move(gameState);
      
      expect(huntSmallerSnake).toHaveBeenCalled();
      expect(result.move).toBe('up');
    });

    test('should use zigzag movement when snake length > 4 and hunting fails', () => {
      const gameState = createGameState({
        body: Array(6).fill().map((_, i) => ({ x: 5 - i, y: 5 }))
      });
      
      huntSmallerSnake.mockReturnValue(null);
      zigZagMovement.mockReturnValue('right');
      
      const result = move(gameState);
      
      expect(zigZagMovement).toHaveBeenCalled();
      expect(result.move).toBe('right');
    });

    test('should seek food when health is low', () => {
      const gameState = createGameState({
        health: 50,
        body: [{ x: 5, y: 5 }, { x: 4, y: 5 }]
      });
      
      seekFood.mockReturnValue('down');
      
      const result = move(gameState);
      
      expect(seekFood).toHaveBeenCalled();
      expect(result.move).toBe('down');
    });

    test('should seek food when snake is still growing (length < 15)', () => {
      const gameState = createGameState({
        health: 80,
        body: Array(10).fill().map((_, i) => ({ x: 5 - i, y: 5 }))
      });
      
      seekFood.mockReturnValue('left');
      
      const result = move(gameState);
      
      expect(seekFood).toHaveBeenCalled();
      expect(result.move).toBe('left');
    });
  });

  describe('Pattern-based Movement', () => {
    test('should use spiral pattern for smaller snakes (length <= 15)', () => {
      const gameState = createGameState({
        body: Array(10).fill().map((_, i) => ({ x: 5 - i, y: 5 })),
        health: 100
      });
      
      const result = move(gameState);
      
      // Spiral pattern starts with 'right'
      expect(result.move).toBe('right');
    });

    test('should use perimeter pattern for larger snakes (length > 15)', () => {
      const gameState = createGameState({
        body: Array(20).fill().map((_, i) => ({ x: 5 - i, y: 5 })),
        health: 100
      });
      
      const result = move(gameState);
      
      // Perimeter pattern starts with 'right'
      expect(result.move).toBe('right');
    });

    test('should skip unsafe pattern moves and try next pattern move', () => {
      const gameState = createGameState({
        body: Array(10).fill().map((_, i) => ({ x: 5 - i, y: 5 })),
        health: 100
      });
      
      getSafeMoves.mockReturnValue({
        up: true,
        down: true,
        left: true,
        right: false // Make first pattern move unsafe
      });
      
      const result = move(gameState);
      
      // Should skip 'right' and try 'down' (second in spiral pattern)
      expect(result.move).toBe('down');
    });
  });

  describe('Tail Following Strategy', () => {
    test('should follow tail when no other strategies work', () => {
      const gameState = createGameState({
        body: [
          { x: 5, y: 5 }, // head
          { x: 4, y: 5 }, // body
          { x: 3, y: 5 }  // tail
        ],
        health: 100
      });
      
      // Make pattern moves unsafe by requiring more open space
      calculateOpenSpace.mockReturnValue({
        up: 3,
        down: 3,
        left: 15, // Direction toward tail has most space
        right: 3
      });
      
      const result = move(gameState);
      
      expect(result.move).toBe('left'); // Toward tail
    });

    test('should choose tail direction with most open space', () => {
      const gameState = createGameState({
        body: [
          { x: 5, y: 5 }, // head
          { x: 5, y: 4 }, // body
          { x: 5, y: 3 }  // tail (below head)
        ],
        health: 100
      });
      
      calculateOpenSpace.mockReturnValue({
        up: 3,
        down: 20, // Direction toward tail
        left: 3,
        right: 3
      });
      
      const result = move(gameState);
      
      expect(result.move).toBe('down'); // Toward tail with most space
    });
  });

  describe('Fallback Strategies', () => {
    test('should continue in same direction when available', () => {
      const gameState = createGameState({
        body: [
          { x: 5, y: 5 }, // head
          { x: 4, y: 5 }, // neck - snake was moving right
          { x: 3, y: 5 }
        ],
        health: 100
      });
      
      // Make all pattern moves require too much space
      calculateOpenSpace.mockReturnValue({
        up: 3,
        down: 3,
        left: 3,
        right: 8 // Last direction has enough space
      });
      
      const result = move(gameState);
      
      expect(result.move).toBe('right'); // Continue same direction
    });

    test('should move to direction with most open space', () => {
      const gameState = createGameState({
        body: [{ x: 5, y: 5 }], // Just head, no previous direction
        health: 100
      });
      
      calculateOpenSpace.mockReturnValue({
        up: 25, // Most open space
        down: 10,
        left: 15,
        right: 8
      });
      
      const result = move(gameState);
      
      expect(result.move).toBe('up');
    });

    test('should pick random safe move as last resort', () => {
      const gameState = createGameState({
        body: [{ x: 5, y: 5 }],
        health: 100
      });
      
      getSafeMoves.mockReturnValue({
        up: false,
        down: true,
        left: false,
        right: true
      });
      
      calculateOpenSpace.mockReturnValue({
        up: 0,
        down: 0,
        left: 0,
        right: 0
      });
      
      const result = move(gameState);
      
      expect(['down', 'right']).toContain(result.move);
    });

    test('should return "down" when no safe moves available', () => {
      const gameState = createGameState();
      
      getSafeMoves.mockReturnValue({
        up: false,
        down: false,
        left: false,
        right: false
      });
      
      const result = move(gameState);
      
      expect(result.move).toBe('down');
    });
  });

  describe('Error Handling', () => {
    test('should return fallback move on error', () => {
      const gameState = createGameState();
      
      // Force an error by making getSafeMoves throw
      getSafeMoves.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const result = move(gameState);
      
      expect(result.move).toBe('down');
    });
  });

  describe('Open Space Handling', () => {
    test('should handle null openSpace from calculateOpenSpace', () => {
      const gameState = createGameState();
      
      calculateOpenSpace.mockReturnValue(null);
      
      const result = move(gameState);
      
      // Should still return a valid move
      expect(['up', 'down', 'left', 'right']).toContain(result.move);
    });

    test('should handle undefined values in openSpace', () => {
      const gameState = createGameState();
      
      calculateOpenSpace.mockReturnValue({
        up: undefined,
        down: 10,
        left: undefined,
        right: 5
      });
      
      const result = move(gameState);
      
      // Should still return a valid move
      expect(['up', 'down', 'left', 'right']).toContain(result.move);
    });
  });

  describe('Pattern Index Management', () => {
    test('should advance pattern index when pattern move is selected', () => {
      const gameState1 = createGameState({ health: 100 });
      const gameState2 = createGameState({ health: 100 });
      
      // First call should use first pattern move
      const result1 = move(gameState1);
      expect(result1.move).toBe('right'); // First in spiral
      
      // Second call should use next pattern move
      const result2 = move(gameState2);
      expect(result2.move).toBe('down'); // Second in spiral
    });
  });
});