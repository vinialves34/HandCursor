import { Server } from "socket.io";
import { createServer } from "node:http";
import express from "express";
import { mouse, Button, Point } from "@nut-tree-fork/nut-js";

mouse.config.mouseSpeed = 1000;

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ Socket conectado!");

  socket.on("position", async (position) => {
    try {
      const coordinates = JSON.parse(position);

      // console.log("Coordenadas:", coordinates);

      await mouse.move(
        new Point(coordinates.wrist.x, coordinates.wrist.y)
      );
    } catch (error) {
      console.error("❌ Erro ao processar dados:", error);
    }
  });
});

httpServer.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});