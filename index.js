const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 8080;
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const cors = require("cors");

const optionsCors = [
  "http://localhost:3000",
  "https://battlezombie.vercel.app",
];
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
let selectedBoard;
let ZOMBIES_NEEDED = 20;
let gameData = {
  id: 0,
  idPlayer: 0,
  player: {
    name: "",
    score: 0,
    turn: true,
    selectedBoard: [],
    playBoard: generateRandomBoard(10, 10, false),
  },
  rival: {
    name: "",
    score: 0,
    turn: false,
    selectedBoard: generateRandomBoard(10, 10, true),
    playBoard: [],
  },
};
app.get("/", (req, res) => {
  const origin = req.header("origin");
  if (optionsCors.includes(origin) || !origin) {
    req.header("Access-Control-Allow-Origin", origin);
    req.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  }
  const response = `<div>Soy un proyecto backend</div>`;
  res.send(response);
});

app.get("/api/get-game/:idGame/:idPlayer/:namePlayer", (req, res) => {
  const origin = req.header("origin");
  if (optionsCors.includes(origin) || !origin) {
    req.header("Access-Control-Allow-Origin", origin);
    req.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  }
  const idGame = req.params.idGame;
  const idPlayer = req.params.idPlayer;
  const name = req.params.namePlayer;
  gameData.id = idGame;
  gameData.idPlayer = idPlayer;
  gameData.player.name = name;
  gameData.rival.name = "Computadora";
  gameData.player.selectedBoard = selectedBoard;

  res.json(gameData);
});
app.post("/api/shot", (req, res) => {
  const origin = req.header("origin");
  if (optionsCors.includes(origin) || !origin) {
    req.header("Access-Control-Allow-Origin", origin);
    req.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  }
  const { idGame, idPlayer, xPosition, yPosition } = req.body;

  if (
    idGame &&
    idPlayer &&
    xPosition !== undefined &&
    yPosition !== undefined
  ) {
    const rivalBoardValue = gameData.rival.selectedBoard[xPosition][yPosition];

    if (gameData.player.turn) {
      if (rivalBoardValue === 1) {
        gameData.rival.turn = false;
        gameData.player.turn = true;
        gameData.player.playBoard[xPosition][yPosition] = 1;
        gameData.player.score = gameData.player.score + 20;
      } else {
        gameData.player.turn = false;
        gameData.rival.turn = true;
        gameData.player.playBoard[xPosition][yPosition] = 2;
      }
    }
    res.json(gameData);
  } else {
    res.status(400).json({
      error: "Invalid request. Required parameters are missing.",
    });
  }
});

const usedCoordinates = new Set();
app.post("/api/shot-computer", (req, res) => {
  const { idGame, idPlayer } = req.body;
  if (idGame && idPlayer) {
    let randomX, randomY;
    do {
      randomX = Math.floor(Math.random() * 10);
      randomY = Math.floor(Math.random() * 10);
    } while (usedCoordinates.has(`${randomX}-${randomY}`));
    usedCoordinates.add(`${randomX}-${randomY}`);
    const rivalBoardValue = gameData.player.selectedBoard[randomX][randomY];
    if (rivalBoardValue === 1) {
      gameData.rival.turn = true;
      gameData.player.turn = false;
      gameData.player.selectedBoard[randomX][randomY] = -1;
      gameData.rival.score = gameData.rival.score + 20;
    } else {
      gameData.player.turn = true;
      gameData.rival.turn = false;
      gameData.player.selectedBoard[randomX][randomY] = 2;
    }

    res.json(gameData);
  } else {
    res.status(400).json({
      error: "Invalid request. Required parameters are missing.",
    });
  }
});

app.post("/api/select-board", (req, res) => {
  const origin = req.header("origin");
  if (optionsCors.includes(origin) || !origin) {
    req.header("Access-Control-Allow-Origin", origin);
    req.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  }
  const { board, playerName } = req.body;
  if (board && playerName) {
    selectedBoard = board;
    const idPlayer = generateUniqueId();
    const idGame = generateUniqueId();
    res.json({
      idPlayer: idPlayer,
      idGame: idGame,
      message: "Board selected successfully",
    });
  } else {
    res.status(400).json({
      error: "Invalid request. Board efsfsf playerName are required.",
    });
  }
});

function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
function generateRandomBoard(rows, columns, isRival) {
  const board = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push(0);
    }
    board.push(row);
  }
  if (isRival) {
    let zombiesPlaced = 0;
    while (zombiesPlaced < ZOMBIES_NEEDED) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * columns);
      if (board[randomRow][randomCol] !== 1) {
        board[randomRow][randomCol] = 1;
        zombiesPlaced++;
      }
    }
  }
  return board;
}
server.listen(PORT, () => console.log(`SERVER RUNING ON PORT ${PORT}`));
io.on("conection", (socket) => {
  console.log("New ws conecction");
});
