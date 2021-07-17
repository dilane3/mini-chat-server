const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const router = require("./router");

const {addUser, removeUser, getUser, getUsersRoom} = require("./user");

const PORT = process.env.PORT || 4002;

const app = express();
const server = http.createServer(app);
// const io = socketio(server, cors);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("we have a new connection");

  socket.on("join", ({ name, room }, callback) => {
    const {error, user} = addUser({id: socket.id, name, room});

    if (error) return callback({ error: "error" });

    if (user) {
      socket.emit("message", {user: "admin", text: `${user.name}, welcome to the room ${user.room}`});
      socket.broadcast.to(user.room).emit("message", {user: "admin", text: `${user.name}, has joined !`});

      socket.join(user.room);
      io.to(user.room).emit("roomUser", {room: user.room, users: getUsersRoom(user.room)});
    }

    callback();
  });

  socket.on("sendMessage", (message) => {
    const user = getUser(socket.id);

    if (user)
      socket.broadcast.to(user.room).emit("message", {user: user.name, text: message});
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.emit("message", {user: "admin", text: `${user.name} has left the room !`});
      io.to(user.room).emit("roomUser", {room: user.room, users: getUsersRoom(user.room)});
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`the server is listen on port: ${PORT}`));
