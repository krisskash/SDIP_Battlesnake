import { zigZagMovement } from '../logic/zigzag.js';

describe('ZigZag Movement', () => {
  // Test data setup
  const createGameState = (snakeBody, boardWidth = 11, boardHeight = 11) => {
    return {
      turn: 10,
      board: {
        width: boardWidth,
        height: boardHeight,
        snakes: [
          {
            id: 'my-snake-id',
            body: snakeBody
          }
        ]
      },
      you: {
        id: 'my-snake-id',
        body: snakeBody,
        length: snakeBody.length
      }
    };
  };
  
  describe('zigZagMovement', () => {
    test('should prioritize perpendicular movement to last direction', () => {
      // Snake moving right, should prefer up/down
      const gameState = createGameState([
        {x: 5, y: 5},  // head
        {x: 4, y: 5},  // neck (coming from left)
        {x: 3, y: 5}
      ]);
      
      const isMoveSafe = {up: true, down: true, left: false, right: true};
      const openSpace = {up: 10, down: 8, left: 0, right: 5};
      
      // Should prefer vertical moves (up/down) as they're perpendicular
      // to last direction (right)
      const move = zigZagMovement(gameState, isMoveSafe, openSpace);
      expect(['up', 'down']).toContain(move); // Either up or down is acceptable
    });
    
    test('should select move with most open space in primary directions', () => {
      // Snake moving up, should prefer left/right
      const gameState = createGameState([
        {x: 5, y: 6},  // head
        {x: 5, y: 5},  // neck (coming from below)
        {x: 5, y: 4}
      ]);
      
      const isMoveSafe = {up: true, down: false, left: true, right: true};
      const openSpace = {up: 7, down: 0, left: 12, right: 8};
      
      // Should prefer horizontal moves (left/right) as they're perpendicular
      // to last direction (up)
      const move = zigZagMovement(gameState, isMoveSafe, openSpace);
      expect(move).toBe('left'); // Left has more open space than right
    });
    
    test('should fall back to original direction if perpendicular is not safe', () => {
      // Snake moving right, but up/down aren't safe
      const gameState = createGameState([
        {x: 5, y: 5},  // head
        {x: 4, y: 5},  // neck (coming from left)
        {x: 3, y: 5}
      ]);
      
      const isMoveSafe = {up: false, down: false, left: false, right: true};
      const openSpace = {up: 0, down: 0, left: 0, right: 10};
      
      const move = zigZagMovement(gameState, isMoveSafe, openSpace);
      expect(move).toBe('right'); // Only safe move
    });
    
    test('should activate escape routes for larger snakes', () => {
      // Create a longer snake (length >= 8) to trigger escape route logic
      const snakeBody = [];
      for (let i = 0; i < 9; i++) {
        snakeBody.push({x: 5 - i, y: 5});
      }
      
      const gameState = createGameState(snakeBody);
      
      // Set up the safety and open space to make 'down' the obvious escape route choice
      // Very constrained in all directions except down
      const isMoveSafe = {up: true, down: true, left: false, right: true};
      const openSpace = {up: 5, down: 30, left: 0, right: 4};
      
      // With these settings, the escape route logic should pick 'down'
      const move = zigZagMovement(gameState, isMoveSafe, openSpace);
      expect(move).toBe('down');
    });
    
    test('should alternate axes based on turn when no previous direction', () => {
      // Snake with just a head (no previous direction)
      const gameState = createGameState([
        {x: 5, y: 5}  // only head
      ]);
      gameState.turn = 2; // Even turn number / 2 should prefer horizontal
      
      const isMoveSafe = {up: true, down: true, left: true, right: true};
      const openSpace = {up: 8, down: 8, left: 10, right: 10};
      
      const move = zigZagMovement(gameState, isMoveSafe, openSpace);
      // Should prefer horizontal on even turns
      expect(['left', 'right']).toContain(move); 
    });
    
    test('should return null if no safe move with enough open space', () => {
      const gameState = createGameState([
        {x: 5, y: 5},  // head
        {x: 4, y: 5},  // neck
        {x: 3, y: 5}
      ]);
      
      // All moves have very little space
      const isMoveSafe = {up: true, down: true, left: false, right: true};
      const openSpace = {up: 1, down: 1, left: 0, right: 1}; 
      
      const move = zigZagMovement(gameState, isMoveSafe, openSpace);
      expect(move).toBeNull(); // Not enough open space in any direction
    });
  });
});