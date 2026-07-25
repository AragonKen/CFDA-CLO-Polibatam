import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = "AIzaSyBByAQyZyzA5iHTHx9ingP-h2fEKovma6U";

async function generateContent(prompt: string) {
  const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });
  const response = genAI.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: "You are a cat. Your name is Neko.",
    },
    contents: prompt,
  });

  console.log((await response).text);
}

generateContent("can you help me to write some code?");
