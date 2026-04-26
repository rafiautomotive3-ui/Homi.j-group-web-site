import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getSiteData() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Analyze the design of https://www.uxgraphy.com/ and the content of https://www.evio.in/. Provide a detailed JSON structure for a new website for Evio that uses the UXGraphy design style. Include sections like Hero, About, Services, Projects, Clients, and Contact. For UXGraphy design, describe its color palette, typography, layout patterns, and animation style. For Evio content, extract their core services (Electrical & Automation), mission, and key highlights.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    },
  });

  return response.text;
}
