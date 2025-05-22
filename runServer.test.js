import runServer from './server.js';

describe('runServer()', () => {
  let server;
  
  // Clean up after each test
  afterEach(() => {
    // Close the server if it exists
    if (server && server.close) {
      server.close();
    }
  });

  it('should call the server setup function without errors', () => {
    const handlers = {
      info: () => {},
      start: () => {},
      move: () => {},
      end: () => {},
    };

    // Capture the server instance returned from runServer
    server = runServer(handlers, 0); // Use port 0 for random available port
    expect(server).toBeTruthy();
  });
});
