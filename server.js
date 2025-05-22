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
    up: myHead.y + 1 < boardHeight, // Prevent moving up if at the top edge
    down: myHead.y - 1 >= 0, // Prevent moving down if at the bottom edge
    left: myHead.x - 1 >= 0, // Prevent moving left if at the left edge
    right: myHead.x + 1 < boardWidth, // Prevent moving right if at the right edge
  };

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
