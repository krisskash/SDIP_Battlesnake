import { info } from '../server.js';

describe('info()', () => {
  it('should return the correct Battlesnake info', () => {
    const result = info();
    expect(result).toHaveProperty('apiversion', '1');
    expect(result).toHaveProperty('author');
    expect(result.author).toBe('B1G_THAN0S, L1L 4GGELOS, CHR1S SL1M3');
  });
});
