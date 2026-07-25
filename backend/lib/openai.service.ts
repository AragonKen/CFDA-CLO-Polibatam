import axios from "axios";

// You can change this to any model you pulled via Ollama
const MODEL_NAME = "deepseek-r1:1.5b";

export const generateAIContent = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: MODEL_NAME,
      prompt,
      stream: false,
    });

    return response.data.response;
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw new Error("Failed to generate AI content");
  }
};
