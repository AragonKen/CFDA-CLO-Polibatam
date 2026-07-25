import { config as configDotenv } from "dotenv";

const env = configDotenv().parsed;

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_URL: process.env.APP_URL || "",

  DATABASE_URL: process.env.DATABASE_URL || "",
  REDIS_URL: process.env.REDIS_URL || "",

  API_VERSION: process.env.API_VERSION || "",
  API_PORT: process.env.API_PORT || "",

  API_POLIBATAM_URL: process.env.API_POLIBATAM_URL || "",

  JWT_SECRET: process.env.JWT_SECRET || "",
};
