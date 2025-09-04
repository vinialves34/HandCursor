import * as tfCore from "@tensorflow/tfjs-core";
import * as tfConverter from "@tensorflow/tfjs-converter";
import * as tfWebgl from "@tensorflow/tfjs-backend-webgl";
import * as handpose from "@tensorflow-models/handpose";
import { io } from "socket.io-client";

let socket;

await main();
initSocket();

async function main() {
  const video = document.querySelector("#video");
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    const model = await handpose.load();
    console.log("✅ Modelo carregado");

    const detectMove = async () => {
      const predictions = await model.estimateHands(video);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (predictions.length > 0) {
        const keypoints = predictions[0].landmarks;
        const positions = await getPositions(keypoints, ctx);

        console.log("Posições", positions);
        
        sendPositions(positions);
      }

      requestAnimationFrame(detectMove);
    }

    detectMove();
  } catch (error) {
    console.error("Erro ao acessar webcam:", error);
  }
}

async function initSocket() {
  socket = io("http://localhost:5000");

  socket.on("connect", () => {
    console.log("Socket connected!");
    console.log("Connection Id:", socket.id);
  });
}

async function getPositions(keypoints, ctx) {
  const [indexPositionX, indexPositionY] = keypoints[8]; //Ponta do dedo indicador
  const [middlePositionX, middlePositionY] = keypoints[12]; //Ponta do dedo médio
  const [wristPositionX, wristPositionY] = keypoints[0]; //Posição do pulso
  
  ctx.fillStyle = "red";
  ctx.fillRect(indexPositionX - 5, indexPositionY - 5, 10, 10);
  ctx.fillRect(middlePositionX - 5, middlePositionY - 5, 10, 10);
  ctx.fillRect(wristPositionX - 5, wristPositionY - 5, 10, 10);

  return {
    indexFinger: {
      x: indexPositionX,
      y: indexPositionY
    },
    middleFinger: {
      x: middlePositionX,
      y: middlePositionY
    },
    wrist: {
      x: wristPositionX,
      y: wristPositionY
    }
  }
}

async function sendPositions(positions) {
  // console.log("Recebendo dados:", positions);
  console.log("Socket", socket);
  
  socket.emit("position", JSON.stringify(positions));
}