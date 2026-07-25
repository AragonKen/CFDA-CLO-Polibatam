import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

import { ENV } from "../constants";

export const PolibatamAct = {
  Login: "Login",
  GetToken: "GetToken",
  GetBiodata: "GetBiodata",
  GetSemuaPegawai: "GetSemuaPegawai",
};

const polibatamInstance = axios.create({
  baseURL: ENV.API_POLIBATAM_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

// catch error response
polibatamInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error(
        "❌ Server responded with error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("❌ No response received:", error.message);
    } else {
      console.error("❌ Request setup error:", error.message);
    }

    if (error.response && error.response.status === 403) {
      const html = error.response.data;

      console.log("HTML:", html);

      try {
        const $ = cheerio.load(html);
        const title = $("title").text();
        const heading = $("h1").text();
        const paragraph = $("p").text();

        const errorMessage = `[POLIBATAM API] ${title} - ${heading}: ${paragraph}`;
        console.error("Error Message:", errorMessage);

        // Return a custom error message
        return Promise.reject(new Error(errorMessage));
      } catch (parsingError) {
        console.error("Error parsing HTML:", (parsingError as any).message);
        return Promise.reject(new Error("An unknown 403 error occurred."));
      }
    }

    // For other errors, pass them along as is
    return Promise.reject(error);
  }
);

export { polibatamInstance };
