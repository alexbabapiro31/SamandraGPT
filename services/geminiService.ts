import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TEXT_MODEL_NAME, IMAGE_MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

// Helper to get client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates text using Gemini 3 Pro with Thinking Config
 */
export const generateTextResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  prompt: string
): Promise<string> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // High thinking budget for "advanced" reasoning
        thinkingConfig: { thinkingBudget: 1024 }, 
        temperature: 0.7,
      }
    });

    return response.text || "Işlem hatası: Yanıt boş.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`API Error: ${error.message}`);
  }
};

/**
 * Generates an image using Nano Banana Pro (gemini-3-pro-image-preview)
 */
export const generateImageResponse = async (prompt: string): Promise<{ imageUrl: string, prompt: string }> => {
  const ai = getClient();

  try {
    // "Nano Banana Pro" implementation
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K" // High quality
        }
      }
    });

    // Extract image
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    
    if (part && part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        // MimeType usually returns 'image/png' or 'image/jpeg' from the API
        const mimeType = part.inlineData.mimeType || 'image/png';
        return {
            imageUrl: `data:${mimeType};base64,${base64Data}`,
            prompt: prompt
        };
    }

    throw new Error("Görsel oluşturulamadı (No image data returned).");

  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    throw new Error(`Görsel Oluşturma Hatası: ${error.message}`);
  }
};
