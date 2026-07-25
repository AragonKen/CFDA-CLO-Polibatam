import { config as configDotenv } from "dotenv";
import App from "./lib/app.service";

const app = new App();
const express = app.express;

configDotenv();

const port = process.env.API_PORT || 3000;
express.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  // printAppInfo(`http://localhost:${port}`, process.env.NODE_ENV);
});

process.on("SIGINT", async () => {
  await app.disconnectPrisma();
  await app.disconnectRedis();
  console.log("\n⚡️[server]: Server is stopped");
  process.exit();
});
