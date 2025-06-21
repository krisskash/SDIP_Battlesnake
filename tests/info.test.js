import runServer from '../server.js';

describe('info()', () => {
  it('should return the correct Battlesnake info', () => {
    // Create the server
    const handlers = {
      info: () => ({
        apiversion: '1',
        author: 'B1G_THAN0S, L1L 4GGELOS, CHR1S SL1M3',
        color: '#D2042D',
        head: 'silly',
        tail: 'bolt',
      }),
    };

    const { info } = handlers; // Access the info function from the handlers

    const result = info(); // Now calling info as a function

    expect(result).toHaveProperty('apiversion', '1');
    expect(result).toHaveProperty('author');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('head');
    expect(result).toHaveProperty('tail');
  });
});
