const isProduction = process.env.NODE_ENV === "production";
const clientUrl = isProduction ? "site.com" : "http://localhost:3000";
const io = require("socket.io")(3001, {
  cors: {
    origin: clientUrl,
  },
});

const rooms = {};
io.on("connection", (socket) => {
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
      const user = { id: socket.id, name: username, socket };
      room.users.push(user);
      socket.join(room.id);
    }
    const randomFirstTurn = () => {
      return Math.floor(Math.random() * 2);
    };
    if (room.users.length === 2) {
      const usernames = [room.users[0].name, room.users[1].name];
      const firstTurn = usernames[randomFirstTurn()];
      const gameInfo = {
        //randomize mark later
        players: [
          {
            name: usernames[0],
            mark: "X",
          },
          {
            name: usernames[1],
            mark: "O",
          },
        ],
        firstTurn,
      };
      io.to(room.id).emit("start-game", gameInfo);
    }

    socket.on("player-move", ({ cells, id, newstate }) => {
      let updatedcells = cells.map((cell) => {
        if (cell.id === id) {
          return { ...cell, state: newstate };
        }

        return cell;
      });
      io.to(room.id).emit("player-move", updatedcells);
    });

    socket.on("toggle-turn", () => {
      io.to(room.id).emit("toggle-turn");
    });
    socket.on("disconnect", (socket) => {
      io.to(room.id).emit("terminate-session");
      room.users = room.users.filter((user) => user.id === socket.id);
    });
  });
});
