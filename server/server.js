const PORT = process.env.PORT || 3001;
const io = require("socket.io")(PORT, {
  cors: {
    origin: "https://ticktacker.vercel.app/",
  },
});

//all game rooms
const rooms = {};
io.on("connection", (socket) => {
  /*get username and room id inputted by user..if room exists join the user 
  to it else create one and join */
  socket.on("create-or-join-room", ({ username, roomId }) => {
    let room = rooms[roomId];
    if (!room) {
      room = {
        users: [],
        id: roomId,
      };

      rooms[roomId] = room;
      io.to(socket.id).emit("room-created");
    }

    if (room.users.length > 1) {
      io.to(socket.id).emit("room-full");
    } else {
      const user = { id: socket.id, name: username, score: 0, socket };
      room.users.push(user);
      socket.join(room.id);
    }
    //decide which player gets first turn
    const randomFirstTurn = () => {
      return Math.floor(Math.random() * 2);
    };
    //if room is full(2),then emit start-game event and pass in player details
    if (room.users.length === 2) {
      const usernames = [room.users[0].name, room.users[1].name];
      const firstTurn = usernames[randomFirstTurn()];
      let gameInfo = {
        //randomize mark later
        players: [
          {
            name: usernames[0],
            mark: "X",
            priority: "player1",
            score: 0,
          },
          {
            name: usernames[1],
            mark: "O",
            priority: "player2",
            score: 0,
          },
        ],
        firstTurn,
      };
      io.to(room.id).emit("start-game", gameInfo);

      //restart the game event
      socket.on("restart-game", () => {
        const firstTurn = usernames[randomFirstTurn()];
        io.to(room.id).emit("restart-game", {
          ...gameInfo,
          firstTurn,
        });
      });

      //increase player score on win and emit updted game info
      socket.on("increase-score-and-restart", (winner) => {
        const firstTurn = usernames[randomFirstTurn()];

        gameInfo = {
          players: gameInfo.players.map((player) =>
            player.name === winner
              ? { ...player, score: player.score + 1 }
              : player
          ),
          firstTurn,
        };

        io.to(room.id).emit("increase-score-and-restart", gameInfo);
      });
    }

    //update cell state on playermove
    socket.on("player-move", ({ cells, id, newstate }) => {
      let updatedcells = cells.map((cell) => {
        if (cell.id === id) {
          return { ...cell, state: newstate };
        }

        return cell;
      });
      io.to(room.id).emit("player-move", updatedcells);
    });

    //toggle the current turn
    socket.on("toggle-turn", (players) => {
      io.to(room.id).emit("toggle-turn", players);
    });

    //remove socket from room when disconnected
    socket.on("disconnect", (socket) => {
      io.to(room.id).emit("terminate-session");
      room.users = room.users.filter((user) => user.id === socket.id);
    });
  });
});
