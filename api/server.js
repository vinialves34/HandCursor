import { Server } from "socket.io";
import { createServer } from "node:http";
import express from "express";
import robot from "robotjs";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected!");
  console.log("Connection Id:", socket.id);

  socket.on("position", (position) => {
    const coordinates = JSON.parse(position);

    console.log("Coordenadas:", coordinates);
    
    robot.moveMouse(
      coordinates.wrist.x,
      coordinates.wrist.y
    );
  });
});

httpServer.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});