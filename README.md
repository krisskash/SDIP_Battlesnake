# Battlesnake - Software Development In Practice

Using the official Battlesnake template written in JavaScript.
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
  "author": "",
  "color": "#888888",
  "head": "default",
  "tail": "default"
}
```

## Play a Game Locally

Install the [Battlesnake CLI](https://github.com/BattlesnakeOfficial/rules/tree/main/cli)

- You can [download compiled binaries here](https://github.com/BattlesnakeOfficial/rules/releases)
- or [install as a go package](https://github.com/BattlesnakeOfficial/rules/tree/main/cli#installation) (requires Go 1.18 or higher)

Command to run a local game

```sh
battlesnake play -W 11 -H 11 --name 'JavaScript Starter Project' --url http://localhost:8000 -g solo --browser
```
