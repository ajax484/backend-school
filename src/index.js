dotenv.config();
import cors from "cors";
import body__parser from "body-parser";
import { default as dotenv } from "dotenv";
import router from "./routes.js";
import express, { json } from "express";
import expressWs from "express-ws";
import { setupCronJob } from "./helper.js";
import { webServerTest } from "./controller.js";

const { json: _json, urlencoded } = body__parser;
const app = express();
const appWs = expressWs(app);

app.use(cors({ origin: true }));
app.use(_json());
app.use(json());
app.use(urlencoded({ extended: false }));

app.use(function (req, res, next) {
  req.testing = "testing";
  return next();
});

app.get("/ping", (request, response) => {
  response.status(200).send({ message: "you ringed??" });
});

app.use("/", router);

app.ws("/echo", webServerTest);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Port is running on", PORT);

    setupCronJob(); // Set up the cron job when the server starts
});

// // Schedule tasks to be run on the server.
// cron.schedule("* * * * *", function () {
//   console.log("running a task every minute");
// });
