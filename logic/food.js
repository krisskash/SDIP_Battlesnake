/**
 * Strategically evaluates food options with a focus on growth advantage
 * 
 * @param {Object} gameState - Current game state
 * @param {Object} isMoveSafe - Object with directions as keys and boolean safety values
 * @param {Object} openSpace - Object with directions as keys and space count values
 * @returns {string|null} Direction to move ('up', 'down', 'left', 'right') or null if no strategic food
 */
export function seekFood(gameState, isMoveSafe, openSpace) {
  const myHead = gameState.you.body[0];
  const food = gameState.board.food;
  const myLength = gameState.you.body.length;
  const health = gameState.you.health;

  // No food or very low health - find any food
  if (food.length === 0) {
    return null;
  }
  
  // Emergency food seeking when health is critical
  const isEmergency = health < 20;
  
  // Calculate minimum safe space based on snake length
  // Longer snakes need more space after eating
  const MINIMUM_SAFE_SPACE = Math.min(Math.floor(myLength / 2), 10);
  
  // Evaluate all food options
  const foodOptions = [];
  
  food.forEach((f) => {
    // Calculate Manhattan distance
    const distance = Math.abs(f.x - myHead.x) + Math.abs(f.y - myHead.y);
    
    // Skip food that's too far during emergencies
    if (isEmergency && distance > health - 10) {
      return;
    }
    
    // Determine direction toward this food
    let moveDirection = null;
    if (f.x < myHead.x && isMoveSafe.left) moveDirection = 'left';
    else if (f.x > myHead.x && isMoveSafe.right) moveDirection = 'right';
    else if (f.y < myHead.y && isMoveSafe.down) moveDirection = 'down';
    else if (f.y > myHead.y && isMoveSafe.up) moveDirection = 'up';
    
    // If we have a safe direction toward food
    if (moveDirection) {
      // Check available space after moving there
      const availableSpace = openSpace[moveDirection];
      
      // Calculate competitive advantage
      const competitiveAdvantage = calculateCompetitiveAdvantage(gameState, f);
      
      // Calculate a strategic score (lower is better)
      let score = distance; // Base: distance
      
      // Strategic factors
      if (availableSpace < MINIMUM_SAFE_SPACE) {
        // Heavy penalty for moves that could trap us
        score += (MINIMUM_SAFE_SPACE - availableSpace) * 20;
      }
      
      // Competitive advantage adjustment (negative for advantage)
      score -= competitiveAdvantage * 5;
      
      // Health factor - only significant when low
      if (health < 50) {
        score -= (50 - health) * 0.5;
      }
      
      foodOptions.push({
        direction: moveDirection,
        score: score,
        distance: distance,
        space: availableSpace
      });
    }
  });
  
  // Sort by score (lower is better)
  foodOptions.sort((a, b) => a.score - b.score);
  
  // Pick the best option
  if (foodOptions.length > 0) {
    const best = foodOptions[0];
    
    // Take food if it's strategically advantageous OR we're in an emergency
    const isSafe = best.space >= MINIMUM_SAFE_SPACE;
    if (isSafe || isEmergency) {
      console.log(`Moving ${best.direction} toward food (score: ${best.score}, distance: ${best.distance})`);
      return best.direction;
    } else {
      console.log(`Avoiding risky food in direction ${best.direction}`);
    }
  }
  
  return null;
}

/**
 * Calculates competitive advantage of eating this food
 * 
 * @param {Object} gameState - Current game state
 * @param {Object} foodPos - Position of food being evaluated
 * @returns {number} Advantage score (positive means good for us)
 */
function calculateCompetitiveAdvantage(gameState, foodPos) {
  const myHead = gameState.you.body[0];
  const myDistance = Math.abs(foodPos.x - myHead.x) + Math.abs(foodPos.y - myHead.y);
  
  // Base advantage - relative snake sizes
  let advantage = 0;
  
  // Check opponent distances to this food
  gameState.board.snakes.forEach(snake => {
    if (snake.id === gameState.you.id) return;
    
    const opponentHead = snake.body[0];
    const opponentDistance = Math.abs(foodPos.x - opponentHead.x) + 
                           Math.abs(foodPos.y - opponentHead.y);
    
    // Calculate size difference
    const sizeDiff = gameState.you.body.length - snake.body.length;
    
    if (myDistance < opponentDistance) {
      // We're closer - advantage is getting even bigger
      advantage += 3;
      // Extra advantage if we're smaller and can catch up
      if (sizeDiff < 0) advantage += 2;
    } 
    else if (myDistance === opponentDistance) {
      // Equal distance - advantage if we're bigger
      advantage += (sizeDiff > 0) ? 1 : -1;
    }
    else {
      // They're closer - disadvantage
      advantage -= 2;
    }
  });
  
  return advantage;
}