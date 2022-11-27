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
      socket.on("fire", () => {
        io.to(room.id).emit("fire");
      });
      const user = { id: socket.id, name: username, socket };
      room.users.push(user);
      socket.join(room.id);
    }

    if (room.users.length === 2) {
      io.to(room.id).emit("start-game");
    }

    socket.on("disconnect", (socket) => {
      console.log("dis");
      room.users = room.users.filter((user) => user.id === socket.id);
    });
  });
});
