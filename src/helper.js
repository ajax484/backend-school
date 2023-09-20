import axios from "axios";
import fs from "fs";
import cron from "node-cron";
import { sendMail } from "../config/nodemailer.config.js";

export const sendNotification = async () =>
  await axios.post(
    `https://api.pushy.me/push?api_key=28ffa7b0798dbceb8064d5dc40ec07db27db88b579aa3049ac9464ad647aedb1`,
    {
      to: "cd5d8035aab42dc90d8758",
      data: {
        title: "Test Notification",
        url: "https://8b99-105-112-178-69.ngrok-free.app/",
        message: "Hello World!",
        image: "https://example.com/image.png",
      },
    }
  );

function removeAllCronJobs() {
  const allCronJobs = cron.getTasks();
  console.log(allCronJobs, "cron");
  allCronJobs.forEach((task) => {
    task.destroy();
  });
  console.log("All cron jobs removed.");
}

// Read the JSON file and set up the cron job
export async function setupCronJob() {
  try {
    const schedulesData = await fs.promises.readFile(
      "feedingschedule.json",
      "utf8"
    );
    const scheduleArr = JSON.parse(schedulesData);

    scheduleArr.forEach((scheduleData) => {
      if (scheduleData.time) {
        const task = cron.schedule(
          isoTimeToCron(scheduleData.time),
          async () => {
            try {
              const paramsData = await fs.promises.readFile(
                "params.json",
                "utf8"
              );
              const params = JSON.parse(paramsData);
              console.log(params);
              const response = await axios.post("http://192.168.43.112/feed", {
                amount: params.totalAmount,
              });

              let status;
              let mailSubject;
              let mailHtml;

              if (response.status === 200) {
                status = true;
                mailSubject = "Feeding successful";
              } else {
                status = false;
                mailSubject = "Feeding unsuccessful";
              }

              mailHtml = `<h1>${mailSubject} for ${scheduleData.label} at ${scheduleData.time}</h1>
                  <p>${params.totalAmount}grams of feed was released at ${scheduleData.time} to ${params.fishNo} ${params.fishSpecies}</p>`;

              const mail = {
                to: process.env.TO,
                subject: mailSubject,
                html: mailHtml,
              };

              sendMail(mail);

              console.log(
                `Cron job executed: ${scheduleData.label} at ${isoTimeToCron(
                  scheduleData.time
                )}`
              );
            } catch (error) {
              console.log(error);

              // Send an email when there is an error in feeding
              const errorMail = {
                to: process.env.TO,
                subject: "Feeding error",
                html: `<h1>Error occurred during feeding for ${
                  scheduleData.label
                } at ${scheduleData.time}</h1>
                  <p>${error?.message || "system is currently offline "}</p>`,
              };

              sendMail(errorMail);
            }
          }
        );

        console.log(
          `Cron job set for schedule: ${isoTimeToCron(scheduleData.time)}`
        );
      } else {
        console.log("No schedule for this feeding period", scheduleData.label);
      }
    });
  } catch (error) {
    console.error("Error reading JSON file:", error);
  }
}
export function generateRandomNumber(min = 0, max = 10) {
  // Generate a random number between 0 and 1
  const randomFraction = Math.random();

  // Scale the random number to the desired range
  const randomNumberInRange = ((randomFraction * (max - min)) + min).toFixed(2);

  return randomNumberInRange;
}

function updateJsonFile(filePath, newData) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const updatedData = { ...jsonData, ...newData };

      fs.writeFile(
        filePath,
        JSON.stringify(updatedData, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing JSON file:", writeErr);
          } else {
            console.log("JSON file updated successfully.");
          }
        }
      );
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  });
}

function isoTimeToCron(isoTime) {
  const [hours, minutes] = isoTime.split(":");

  const cronExpression = `${minutes} ${hours} * * *`;

  return cronExpression;
}

export function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0'); // Get hours and format with leading zero if needed
  const minutes = now.getMinutes().toString().padStart(2, '0'); // Get minutes and format with leading zero if needed
  return `${hours}:${minutes}`;
}
