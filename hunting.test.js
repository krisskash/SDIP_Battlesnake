import { findHuntableSnakes, calculateHuntDirection } from './index.js';

describe('Snake Hunting Behavior', () => {
  test('should identify smaller snakes as huntable', () => {
    const gameState = {
      you: {
        id: 'my-snake',
        body: [
          { x: 5, y: 5 }, // head
          { x: 5, y: 4 }, // body
          { x: 5, y: 3 }, // body
          { x: 5, y: 2 }, // tail - length 4
        ],
      },
      board: {
        snakes: [
          {
            id: 'my-snake',
            body: [
              { x: 5, y: 5 },
              { x: 5, y: 4 },
              { x: 5, y: 3 },
              { x: 5, y: 2 },
            ],
          },
          {
            id: 'smaller-snake',
            body: [
              { x: 7, y: 7 }, // head
              { x: 7, y: 6 }, // tail - length 2
            ],
          },
          {
            id: 'larger-snake',
            body: [
              { x: 3, y: 3 },
              { x: 3, y: 2 },
              { x: 3, y: 1 },
              { x: 2, y: 1 },
              { x: 1, y: 1 }, // length 5
            ],
          },
        ],
      },
    };

    const huntableSnakes = findHuntableSnakes(gameState);

    expect(huntableSnakes).toHaveLength(1);
    expect(huntableSnakes[0].id).toBe('smaller-snake');
    expect(huntableSnakes[0].length).toBe(2);
  });

  test('should calculate hunting direction towards smaller snake', () => {
    const gameState = {
      you: {
        body: [{ x: 5, y: 5 }], // head
      },
    };

    const targetSnake = {
      head: { x: 7, y: 5 }, // 2 units to the right
      length: 2,
    };

    const direction = calculateHuntDirection(gameState, targetSnake);
    expect(direction).toBe('right');
  });
});
