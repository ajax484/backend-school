import express from "express";
import { getCurrentTime, sendNotification, setupCronJob } from "./helper.js";
import axios from "axios";
import fs from "fs";
import { sendMail } from "../config/nodemailer.config.js";

const router = express.Router();

router.get("/led/off", async (request, response) => {
  try {
    const responseFromESP = await axios.get("http://192.168.43.112/led/off");
    if ((responseFromESP.status = 200)) {
      response.status(200).send({ msg: "led off" });
    }
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.get("/feed/now", async (request, response) => {
  try {
    const paramsData = await fs.promises.readFile("params.json", "utf8");
    const params = JSON.parse(paramsData);
    console.log(params, "params");
    
    const espResponse = await axios.post("http://192.168.43.112/feed", {
      amount: params.totalAmount,
    });
    
    let status;
    let mailSubject;
    let mailHtml;
    
    if (espResponse.status === 200) {
      status = true;
      mailSubject = "successful";
    } else {
      status = false;
      mailSubject = "unsuccessful";
    }

    console.log(status, mailSubject);
    
    const currentTime = getCurrentTime();
    
    mailHtml = `<h1>${mailSubject} farmer initiated feeding at ${currentTime}</h1>
    <p>${params.totalAmount}grams of feed was released at ${currentTime} to ${params.fishNo} ${params.fishSpecies}</p>`;
    
    const mail = {
      to: process.env.TO,
      subject: mailSubject,
      html: mailHtml,
    };
    
    sendMail(mail);
    
    console.log(
      `farmer executed job executed: at ${currentTime}`
      );
      response.status(200).send({ msg: "manual feeding successful" });
    } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.get("/led/on", async (request, response) => {
  try {
    const responseFromESP = await axios.get("http://192.168.43.112/led/on");
    if ((responseFromESP.status = 200)) {
      response.status(200).send({ msg: "led on" });
    }
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.get("/temperature", async (request, response) => {
  try {
    const responseFromESP = await axios.get(
      "http://192.168.43.112/temperature"
    );

    if ((responseFromESP.status = 200)) {
      response.status(200).send(responseFromESP.data);
    }
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.get("/weight", async (request, response) => {
  try {
    const responseFromESP = await axios.get("http://192.168.43.112/weight");

    if ((responseFromESP.status = 200)) {
      response.status(200).send(responseFromESP.data);
    }
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.get("/schedule", async (request, response) => {
  try {
    fs.readFile("feedingschedule.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        throw err;
      }

      const scheduleArr = JSON.parse(data);
      console.log(scheduleArr);

      response.status(200).send(scheduleArr);
    });
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.post("/schedule", async (request, response) => {
  try {
    console.log(request.body, request.params);
    const { newSchedules } = request.body;

    fs.writeFile(
      "feedingschedule.json",
      JSON.stringify(newSchedules, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing JSON file:", writeErr);
        } else {
          console.log("JSON file updated successfully.");
          setupCronJob();
          response.status(200).send({ msg: "schedule updated successfully!" });
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.get("/params", async (request, response) => {
  try {
    fs.readFile("params.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        throw err;
      }

      const scheduleArr = JSON.parse(data);

      response.status(200).send(scheduleArr);
    });
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.post("/params", async (request, response) => {
  try {
    console.log(request.body, request.params);
    const newParams = request.body;

    fs.writeFile(
      "params.json",
      JSON.stringify(newParams, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing JSON file:", writeErr);
        } else {
          console.log("JSON file updated successfully.");
          setupCronJob();
          response.status(200).send({ msg: "params updated successfully!" });
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(200).send({ msg: "something went wrong" });
  }
});

router.get("/test-mail", async (request, response) => {
  try {
    const mail = {
      to: process.env.TO,
      subject: "testing mail",
      html: `
                  <h1>Test mail</h1> 
                  <p>testing this</p>`,
    };

    sendMail(mail);
    response.status(200).send({ msg: "email sent." });
  } catch (error) {
    console.log(error);
    response.status(500).send({ msg: "something went wrong" });
  }
});

router.get("/readings", async (request, response) => {
  try {
    response.status(200).send({
      temperature: 35,
      pH: 7.5,
      salinity: 25,
    });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: "error" });
  }
});

router.get("/controllers", async (request, response) => {
  try {
    response.status(200).send({
      humidifier: true,
      door: false,
      belt: true,
    });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: "error" });
  }
});

router.post("/controllers", async (request, response) => {
  try {
    const { controller } = request.body;
    response.status(200).send({
      message: `${controller} is turned off`,
      controller,
    });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: "error" });
  }
});

router.get("/pingit", async (request, response) => {
  try {
    console.log("start");
    await sendNotification();

    response.status(200).send("huzzah!!");
  } catch (error) {
    console.log(error);
    response.status(500).send("didn't work");
  }
});

export default router;
