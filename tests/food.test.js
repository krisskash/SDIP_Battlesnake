import { seekFood } from '../logic/food.js';

describe('Food Seeking Strategy', () => {
  // Helper function to create game state
  const createGameState = (overrides = {}) => {
    return {
      turn: 1,
      board: {
        width: 11,
        height: 11,
        snakes: [
          {
            id: 'my-snake',
            body: [
              { x: 5, y: 5 },
              { x: 4, y: 5 },
              { x: 3, y: 5 }
            ]
          }
        ],
        food: [
          { x: 7, y: 5 },  // Right of snake
          { x: 5, y: 7 }   // Above snake
        ]
      },
      you: {
        id: 'my-snake',
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

  const defaultSafeMoves = {
    up: true,
    down: true,
    left: true,
    right: true
  };

  const defaultOpenSpace = {
    up: 20,
    down: 20,
    left: 20,
    right: 20
  };

  describe('Basic Food Seeking', () => {
    test('should return null when no food available', () => {
      const gameState = createGameState();
      gameState.board.food = [];

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBeNull();
    });

    test('should move toward closest food when safe', () => {
      const gameState = createGameState();
      gameState.board.food = [
        { x: 6, y: 5 },  // 1 step right
        { x: 5, y: 8 }   // 3 steps up
      ];

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('right'); // Closer food
    });

    test('should avoid unsafe moves even with food nearby', () => {
      const gameState = createGameState();
      gameState.board.food = [{ x: 6, y: 5 }]; // Right of snake

      const safeMoves = { ...defaultSafeMoves, right: false };
      
      const result = seekFood(gameState, safeMoves, defaultOpenSpace);
      expect(result).toBeNull(); // Can't go right safely
    });
  });

  describe('Emergency Food Seeking', () => {
    test('should prioritize any accessible food when health is critical', () => {
      const gameState = createGameState({ health: 15 });
      gameState.board.food = [{ x: 6, y: 5 }];

      // Even with limited space, should take food in emergency
      const limitedSpace = { up: 2, down: 2, left: 2, right: 2 };
      
      const result = seekFood(gameState, defaultSafeMoves, limitedSpace);
      expect(result).toBeTruthy(); // Instead of expecting a specific direction
    });

    test('should skip distant food when health is too low', () => {
      const gameState = createGameState({ health: 15 });
      gameState.board.food = [{ x: 15, y: 5 }]; // 10 steps away

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBeNull(); // Too far for emergency health
    });

    test('should take risky moves during emergency', () => {
      const gameState = createGameState({ health: 10 });
      gameState.board.food = [{ x: 6, y: 5 }];

      // Very limited space but emergency
      const limitedSpace = { up: 1, down: 1, left: 1, right: 1 };
      
      const result = seekFood(gameState, defaultSafeMoves, limitedSpace);
      expect(result).toBe('right'); // Takes risk due to emergency
    });
  });

  describe('Space Safety Considerations', () => {
    test('should avoid food that leads to insufficient space', () => {
      const gameState = createGameState();
      gameState.you.body = Array(10).fill().map((_, i) => ({ x: 5 - i, y: 5 })); // Long snake
      gameState.board.food = [{ x: 6, y: 5 }];

      // Right direction has very little space
      const limitedSpace = { up: 20, down: 20, left: 20, right: 2 };
      
      const result = seekFood(gameState, defaultSafeMoves, limitedSpace);
      expect(result).toBeNull(); // Avoids trap
    });

    test('should calculate minimum safe space based on snake length', () => {
      const longSnake = Array(20).fill().map((_, i) => ({ x: 5 - i, y: 5 }));
      const gameState = createGameState();
      gameState.you.body = longSnake;
      gameState.board.food = [{ x: 6, y: 5 }];

      // Space that would be safe for small snake but not large
      const moderateSpace = { up: 20, down: 20, left: 20, right: 8 };
      
      const result = seekFood(gameState, defaultSafeMoves, moderateSpace);
      expect(result).toBeNull(); // Long snake needs more space
    });
  });

  describe('Competitive Advantage', () => {
    test('should prefer food when we are closer than opponents', () => {
      const gameState = createGameState();
      // Add opponent snake farther from food
      gameState.board.snakes.push({
        id: 'opponent',
        body: [
          { x: 1, y: 1 }, // Far from food
          { x: 0, y: 1 }
        ]
      });
      gameState.board.food = [{ x: 6, y: 5 }]; // We're closer

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('right');
    });

    test('should consider size advantage when equidistant from food', () => {
      const gameState = createGameState();
      // Add smaller opponent at equal distance
      gameState.board.snakes.push({
        id: 'opponent',
        body: [
          { x: 3, y: 5 }, // Same distance to food at (6,5)
          { x: 2, y: 5 }  // Smaller snake
        ]
      });
      gameState.board.food = [{ x: 6, y: 5 }];

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('right'); // We're bigger, take the food
    });

    test('should avoid food when bigger opponent is closer', () => {
      const gameState = createGameState();
      // Add bigger opponent closer to food
      gameState.board.snakes.push({
        id: 'opponent',
        body: [
          { x: 7, y: 5 }, // Closer to food at (8,5)
          { x: 6, y: 5 },
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 }  // Bigger snake
        ]
      });
      gameState.board.food = [{ x: 8, y: 5 }];

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      // Should avoid this food due to competitive disadvantage
      expect(result).toBeNull();
    });
  });

  describe('Health-Based Decisions', () => {
    test('should factor in health when health is moderate', () => {
      const gameState = createGameState({ health: 40 });
      gameState.board.food = [{ x: 6, y: 5 }];

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('right');
    });

    test('should be more selective when health is high', () => {
      const gameState = createGameState({ health: 95 });
      // Add bigger opponent closer to food
      gameState.board.snakes.push({
        id: 'opponent',
        body: Array(8).fill().map((_, i) => ({ x: 7 - i, y: 5 }))
      });
      gameState.board.food = [{ x: 8, y: 5 }];

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBeNull(); // High health, can afford to be selective
    });
  });

  describe('Direction Selection', () => {
    test('should prioritize horizontal movement when food is to the side', () => {
      const gameState = createGameState();
      gameState.board.food = [{ x: 7, y: 5 }]; // Directly right

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('right');
    });

    test('should prioritize vertical movement when food is above/below', () => {
      const gameState = createGameState();
      gameState.board.food = [{ x: 5, y: 7 }]; // Directly up

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('up');
    });

    test('should handle diagonal food positioning', () => {
      const gameState = createGameState();
      gameState.board.food = [{ x: 7, y: 7 }]; // Up-right diagonal

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(['up', 'right']).toContain(result); // Either direction valid
    });
  });

  describe('Multiple Food Options', () => {
    test('should choose strategically best food among options', () => {
      const gameState = createGameState();
      gameState.board.food = [
        { x: 6, y: 5 },  // Close but competitive
        { x: 5, y: 8 }   // Farther but safer
      ];

      // Add opponent near first food
      gameState.board.snakes.push({
        id: 'opponent',
        body: [
          { x: 8, y: 5 },
          { x: 9, y: 5 }
        ]
      });

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      // Should consider competitive factors
      expect(['up', 'right']).toContain(result); // Accept either direction
    });

    test('should handle scoring with limited space options', () => {
      const gameState = createGameState();
      gameState.board.food = [
        { x: 6, y: 5 },  // Right - limited space
        { x: 5, y: 7 }   // Up - good space
      ];

      const mixedSpace = { up: 25, down: 20, left: 20, right: 3 };
      
      const result = seekFood(gameState, defaultSafeMoves, mixedSpace);
      expect(result).toBe('up'); // Better space option
    });
  });

  describe('Edge Cases', () => {
    test('should handle single-cell snake', () => {
      const gameState = createGameState();
      gameState.you.body = [{ x: 5, y: 5 }];
      gameState.board.snakes[0].body = [{ x: 5, y: 5 }];
      gameState.board.food = [{ x: 6, y: 5 }];

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('right');
    });

    test('should handle food at board edges', () => {
      const gameState = createGameState();
      gameState.board.food = [{ x: 0, y: 5 }]; // Left edge

      const result = seekFood(gameState, defaultSafeMoves, defaultOpenSpace);
      expect(result).toBe('left');
    });

    test('should handle all directions blocked except one', () => {
      const gameState = createGameState();
      gameState.board.food = [{ x: 6, y: 5 }];

      const limitedSafeMoves = { up: false, down: false, left: false, right: true };
      
      const result = seekFood(gameState, limitedSafeMoves, defaultOpenSpace);
      expect(result).toBe('right');
    });
  });
});