import runServer from './server.js';

describe('runServer()', () => {
  it('should call the server setup function without errors', () => {
    const handlers = {
      info: jest.fn(),
      start: jest.fn(),
      move: jest.fn(),
      end: jest.fn(),
    };

    expect(() => runServer(handlers)).not.toThrow();
  });
});
