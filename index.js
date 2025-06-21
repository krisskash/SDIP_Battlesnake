// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

// Import the flood fill functions
import runServer from './server.js';
import { move } from './logic/movement.js';

/**
 * Returns information about your Battlesnake
 * 
 * @returns {Object} Battlesnake information including appearance
 */
function info() {
  console.log('INFO');
  
  return {
    apiversion: '1',
    author: 'B1G_THAN0S, L1L 4GGELOS, CHR1S SL1M3',
    color: '#D2042D', // Cherry Red
    head: 'silly', // Silly face head
    tail: 'bolt', // Lightning bolt tail
  };
}

/**
 * Called when your Battlesnake begins a game
 * 
 * @param {Object} gameState - Current game state
 */
function start(gameState) {
  console.log('GAME START');
}

/**
 * Called when your Battlesnake finishes a game
 * 
 * @param {Object} gameState - Final game state
 */
function end(gameState) {
  console.log('GAME OVER\n');
}

// Entry point for Battlesnake server
runServer({
  info,
  start,
  move,
  end,
});
