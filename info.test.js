import { info } from './server.js';

describe('info()', () => {
  it('should return the correct Battlesnake info', () => {
    const result = info();

    expect(result).toHaveProperty('apiversion', '1');
    expect(result).toHaveProperty('author');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('head');
    expect(result).toHaveProperty('tail');
  });
});
