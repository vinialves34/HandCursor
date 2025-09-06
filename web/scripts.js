import * as tfCore from "@tensorflow/tfjs-core";
import * as tfConverter from "@tensorflow/tfjs-converter";
import * as tfWebgl from "@tensorflow/tfjs-backend-webgl";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { io } from "socket.io-client";

await main();

async function initSocketConnection() {
  const socket = io("http://localhost:5000");

  socket.on("connect", () => {
    console.log("✅ Socket conectado!");
  });

  return socket;
}

async function main() {
  const video = document.querySelector("#video");
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onplaying = () => resolve();
      video.play();
    });

    const detector = await handPoseDetection.createDetector(
      handPoseDetection.SupportedModels.MediaPipeHands,
      {
        runtime: "tfjs",
        modelType: "full", // "full" é mais preciso mas mais pesado
      }
    );
    console.log("✅ Modelo carregado!");

    const socketConnection = await initSocketConnection();

    const detectMove = async () => {
      const hands = await detector.estimateHands(video);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      hands.forEach(async (hand) => {
        const positions = await getPositions(hand.keypoints);
        
        await sendPositions(positions, socketConnection);
        
        hand.keypoints.forEach((point) => {
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      requestAnimationFrame(detectMove);
    }

    detectMove();
  } catch (error) {
    console.error("Erro ao acessar webcam:", error);
  }
}

async function getPositions(keypoints) {
  const { x: primaryPositionX, y: primaryPositionY } = keypoints[8]; //Ponta do dedo indicador
  const { x: secondPositionX, y: secondPositionY } = keypoints[4]; //Ponta do dedo polegar
  const { x: wristPositionX, y: wristPositionY } = keypoints[0]; //Posição do pulso

  return {
    primaryFinger: {
      x: primaryPositionX,
      y: primaryPositionY
    },
    secondFinger: {
      x: secondPositionX,
      y: secondPositionY
    },
    wrist: {
      x: wristPositionX,
      y: wristPositionY
    }
  }
}

async function sendPositions(positions, socketConnection) {
  console.log("Socket", socketConnection);
  
  socketConnection.emit("position", JSON.stringify(positions));
}