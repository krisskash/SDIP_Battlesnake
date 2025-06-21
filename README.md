# Battlesnake - Software Development In Practice

## About

We're using the official Battlesnake template written in JavaScript.
[play.battlesnake.com](https://play.battlesnake.com).

![Battlesnake Logo](https://i.ibb.co/NMKHjbF/Starter-Snake-Git-Hub-Repos-Java-Script.png)

## Technologies Used

This project uses [Node.js](https://nodejs.dev/) and [Express](https://expressjs.com/). It also comes with an optional [Dockerfile](https://docs.docker.com/engine/reference/builder/) to help with deployment.

## Run Your Battlesnake

Install dependencies using npm

```sh
npm install
```

Start your Battlesnake

```sh
npm run start
```

You should see the following output once it is running

```sh
Running Battlesnake at http://0.0.0.0:8000
```

Open [localhost:8000](http://localhost:8000) in your browser and you should see

```json
{
  "apiversion": "1",
  "author": "B1G_THAN0S, L1L 4GGELOS, CHR1S SL1M3",
  "color": "#D2042D",
  "head": "Silly",
  "tail": "Bolt"
}
```

## Play a Game Locally

Install the [Battlesnake CLI](https://github.com/BattlesnakeOfficial/rules/tree/main/cli)

Command to run a local game

```sh
battlesnake play -W 7 -H 7 --name 'Terminator' --url http://localhost:8000 -g solo --browser

battlesnake play --width 9 --height 9 --name Terminator1 --url http://localhost:8000 --name Terminator2 --url http://localhost:8000 --browser
```

---

## Snake Logic & Strategy

Our snake logic includes:
- Avoiding collisions with walls, itself, and other snakes
- Prioritizing food when health drops below a threshold
- Seeking the largest open space using a custom flood fill algorithm (`floodFill.js`)
- Avoiding head-to-head collisions with equal or longer snakes
- Hunting smaller snakes when in aggressive mode
- Tail-chasing for safe moves when food is not urgently needed
- Evaluating all possible moves and scoring them based on safety and opportunity
- Avoiding traps and dead ends by simulating future moves
- Preferring moves that keep the snake's body flexible and away from tight spaces
- Adapting strategy dynamically based on board state (number of snakes, food, hazards)
- Avoiding hazard tiles (if present in the game mode)
- Tracking enemy snake positions and predicting their likely moves

Open space is calculated with our custom `floodFill.js`.

---

##  Documentation

We use JSDoc to document our code.  
Generated HTML docs are available in the `/docs` folder.

To regenerate:
```bash
npx jsdoc -c jsdoc.json
```

---

##  CI/CD & Linting

We use GitHub Actions to:
- Run unit tests (Jest)
- Lint and format code (ESLint, Prettier)
- Check test coverage (>50%)
- Deploy on push to `main` (via Railway)

---

##  Testing

Run tests using:

```bash
npm test
```

---

## GenAI Usage

We leveraged AI assistance (ChatGPT and GitHub Copilot) throughout the project to:
- Generate and refine JSDoc comments for improved code documentation
- Suggest and automate unit and integration test cases
- Refactor and optimize code for readability and performance
- Brainstorm and validate snake logic and strategy ideas
- Troubleshoot bugs and resolve errors during development
- Draft and polish markdown documentation (including this README)
- Research best practices for Node.js, Express, and Battlesnake-specific patterns

All AI-generated content was reviewed and integrated by the development team to ensure quality and correctness.

All code was manually reviewed and integrated by the development team.
