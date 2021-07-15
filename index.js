const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const router = require("./router");

const cors = require("cors");
const PORT = process.env.PORT || 5000;

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

  socket.on("disconnect", () => {
    console.log("User has left");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`the server is listen on port: ${PORT}`));
