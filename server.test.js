import request from 'supertest';
import runServer from './server.js';

describe('Server Tests', () => {
  let server;

  beforeAll(() => {
    server = runServer({
      info: () => ({ apiversion: '1', author: 'test' }),
      start: () => 'ok',
      move: () => 'down',
      end: () => 'ok'
    });
  });

  afterAll(() => {
    server.close();  // Close the server after tests are done
  });

  test('should respond to /start endpoint with ok', async () => {
    const response = await request(server).post('/start').send({});
    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });
});
