import { move } from '../logic/movement.js';

describe('move', () => {
  it('returns a valid move direction', () => {
    const gameState = {
      turn: 1,
      you: {
        id: 'snake-id-123',
        health: 100,
        body: [
          { x: 5, y: 5 },
          { x: 5, y: 6 }
        ]
      },
      board: {
        height: 11,
        width: 11,
        food: [],
        snakes: []
      }
    };

    const result = move(gameState);
    expect(result).toHaveProperty('move');
    expect(['up', 'down', 'left', 'right']).toContain(result.move);
  });
});