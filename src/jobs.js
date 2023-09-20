import cron from "node-cron";

console.log("here");

// Schedule tasks to be run on the server.
cron.schedule("* * * * * *", function () {
  console.log("running a task every minute");
});
