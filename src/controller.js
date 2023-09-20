import axios from "axios";
import { generateRandomNumber } from "./helper.js";

export const webServerTest = function (ws, req) {
  ws.on("connection", (stream) => console.log("conn"));

  ws.on("message", function (msg) {
    console.log("from client: ", msg);
    ws.send(msg);
  });

  const msg = setInterval(async () => {
    let temperature = 0;
    const salinity = generateRandomNumber(1, 2.5);
    const pH = generateRandomNumber(7, 8);

    try {
      const tempFromESP = await axios.get("http://192.168.43.112/temperature");
      temperature = tempFromESP?.data?.value || generateRandomNumber(26, 29);
      // console.log(temperature);
    } catch (error) {
      // console.log(error);
      temperature = generateRandomNumber(26, 29);
    }

    const msg = JSON.stringify({ temperature, pH, salinity });
    ws.send(msg);
  }, 3500);

  ws.on("close", () => {
    console.log("WebSocket was closed");
    clearInterval(msg);
  });

  console.log("socket", req.testing);
};
