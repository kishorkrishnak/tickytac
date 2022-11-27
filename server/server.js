const isProduction = process.env.NODE_ENV === "production";
const clientUrl = isProduction ? "site.com" : "http://localhost:3000";
const io = require("socket.io")(3001, {
  cors: {
    origin: clientUrl,
  },
});
const randomFirstTurn = () => {
  return Math.floor(Math.random() * 3) === 0 ? "X" : "O";
};
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

    if (room.users.length === 2) {
      io.to(room.id).emit("start-game", {
        usernames: [room.users[0].name, room.users[1].name],
        firstTurn: randomFirstTurn(),
      });
    }

    socket.on("player-move", () => {});

    socket.on("disconnect", (socket) => {
      io.to(room.id).emit("terminate-session");
      room.users = room.users.filter((user) => user.id === socket.id);
    });
  });
});
