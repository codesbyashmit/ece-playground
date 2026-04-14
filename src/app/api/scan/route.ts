import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API (it automatically picks up process.env.GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Strip the data:image/jpeg;base64, prefix for the API
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // UPDATED: Using the latest Gemini 3 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are an expert Electronics Engineer. Analyze this image. 
      Identify the specific electronic component or module shown.
      Provide the output in exactly this structured format:
      
      COMPONENT: [Name of the component]
      TYPE: [General category, e.g., Microcontroller, Passive, Sensor]
      PRIMARY FUNCTION: [1-2 sentences explaining what it does]
      COMMON USE CASES: [List 3 bullet points]
      
      Keep it strictly technical, concise, and formatted exactly as requested without markdown asterisks.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", 
        },
      },
    ]);

    const text = result.response.text();
    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to analyze component" }, { status: 500 });
  }
}