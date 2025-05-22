import express from 'express';

export function move(gameState) {
  const myHead = gameState.you.body[0];
  const food = gameState.board.food;
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  // If there's no food, return a default move (e.g., 'down')
  if (food.length === 0) {
    return { move: 'down' };
  }

  // Prevent out-of-bounds moves
  const isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  if (myHead.x + 1 >= boardWidth) {
    isMoveSafe.right = false;
  }
  if (myHead.x - 1 < 0) {
    isMoveSafe.left = false;
  }
  if (myHead.y + 1 >= boardHeight) {
    isMoveSafe.up = false;
  }
  if (myHead.y - 1 < 0) {
    isMoveSafe.down = false;
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
  if (closestFood.x < myHead.x && isMoveSafe.left) {
    return { move: 'left' };
  } else if (closestFood.x > myHead.x && isMoveSafe.right) {
    return { move: 'right' };
  } else if (closestFood.y < myHead.y && isMoveSafe.down) {
    return { move: 'down' };
  } else if (closestFood.y > myHead.y && isMoveSafe.up) {
    return { move: 'up' };
  }

  // Fallback to a random safe move
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);
  const nextMove =
    safeMoves.length > 0
      ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
      : 'down';

  return { move: nextMove };
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
