"use server";

import { GoogleGenAI } from "@google/genai";

const aiOptions = {
    model: "gemini-2.5-flash", 
};

// System prompts for different contexts
const PROMPTS = {
  "resume-bullets": `You are an expert tech recruiter and career coach.
Your task is to take messy or weak bullet points and enhance them into powerful, action-oriented resume accomplishments.
Rules:
1. Use the STAR method (Situation, Task, Action, Result) where possible.
2. Start every bullet with a strong action verb.
3. Include metrics and numbers if implied.
4. Keep the output clean: return only the enhanced bullet points, clearly formatted. Do not include intro text.`,

  "professional-bio": `You are an elite executive brand consultant.
Your task is to rewrite a messy bio into a professional, compelling, and concise executive summary/bio.
Rules:
1. Tone should be confident, professional, and forward-looking.
2. Emphasize unique value propositions and key themes of the person's career.
3. Keep it under 150 words.
4. Return only the bio text. Do not include introductory phrases.`,

  "linkedin-summary": `You are a LinkedIn profile optimization expert.
Your task is to rewrite raw input into an engaging, personable, and optimized LinkedIn 'About' section.
Rules:
1. Write in the first person ("I").
2. Be engaging, authentic, and approachable.
3. Highlight key achievements, current focus, and what the person is looking for or open to.
4. Return only the summary text, properly formatted with paragraphs. No emojis unless requested. No introductory phrases.`
};

export async function enhanceText(type: keyof typeof PROMPTS, text: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please add it to your .env file or environment variables.");
  }
  
  if (!text || text.trim() === "") {
      throw new Error("Please provide some text to enhance.");
  }

  try {
    const client = new GoogleGenAI({ apiKey });

    const prompt = `${PROMPTS[type]}\n\nHere is the user's text to enhance:\n${text}`;

    console.log(`[Gemini API] Using model: ${aiOptions.model} (via @google/genai)`);
    const result = await client.models.generateContent({
      model: aiOptions.model,
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    const enhancedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!enhancedText) {
      throw new Error("Failed to extract text from Gemini response.");
    }

    return { success: true, text: enhancedText };
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    // Handle specific error cases
    if (error.status === 429 || error.message?.includes("quota")) {
      return {
        success: false,
        error: "Quota exceeded. Please try again in a moment."
      };
    }

    if (error.status === 400 && error.message?.includes("API key not valid")) {
      return { 
        success: false, 
        error: "The Gemini API key provided is invalid. Please double-check your .env.local file and ensure the key is correctly copied from Google AI Studio." 
      };
    }
    return { success: false, error: error.message || "Failed to generate text." };
  }
}
