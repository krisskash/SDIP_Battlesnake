import express from 'express';

// Define the info function
export function info() {
  return {
    apiversion: '1',
    author: 'B1G_THAN0S, L1L 4GGELOS, CHR1S SL1M3',
    color: '#D2042D', // Cherry Red
    head: 'silly', // Silly face head
    tail: 'bolt', // Lightning bolt tail
  };
}

export function move(gameState) {
  const myHead = gameState.you.body[0];
  const food = gameState.board.food;

  // If there's no food, return a default move (e.g., 'down')
  if (food.length === 0) {
    return { move: 'down' };
  }

  // Find the closest food by Manhattan distance
  const closestFood = food.reduce((closest, current) => {
    const closestDistance =
      Math.abs(closest.x - myHead.x) + Math.abs(closest.y - myHead.y);
    const currentDistance =
      Math.abs(current.x - myHead.x) + Math.abs(current.y - myHead.y);
    return currentDistance < closestDistance ? current : closest;
  });

  // Decide the direction towards the closest food
  if (closestFood.x < myHead.x) {
    return { move: 'left' };
  } else if (closestFood.x > myHead.x) {
    return { move: 'right' };
  } else if (closestFood.y < myHead.y) {
    return { move: 'down' };
  } else if (closestFood.y > myHead.y) {
    return { move: 'up' };
  }

  // Fallback to a default move
  return { move: 'down' };
}

export default function runServer(handlers) {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send(handlers.info());
  });

  app.post('/start', (req, res) => {
    handlers.start(req.body);
    res.send('ok');
  });

  app.post('/move', (req, res) => {
    res.send(handlers.move(req.body));
  });

  app.post('/end', (req, res) => {
    handlers.end(req.body);
    res.send('ok');
  });

  app.use(function (req, res, next) {
    res.set('Server', 'battlesnake/github/starter-snake-javascript');
    next();
  });

  const host = '0.0.0.0';
  const port = process.env.PORT || 8000;

  app.listen(port, host, () => {
    console.log(`Running Battlesnake at http://${host}:${port}...`);
  });
}
