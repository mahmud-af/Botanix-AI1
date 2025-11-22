import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlantIdentification, PlantHealthStatus } from "../types";

// Define the strict schema for the model output
const plantSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scientificName: { type: Type.STRING, description: "Scientific Latin name" },
    commonNames: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of common names"
    },
    confidence: { 
      type: Type.NUMBER, 
      description: "Confidence score between 0 and 100" 
    },
    description: { type: Type.STRING, description: "Brief botanical description" },
    reasoning: { type: Type.STRING, description: "Why the AI identified this plant based on visible features" },
    taxonomy: {
      type: Type.OBJECT,
      properties: {
        genus: { type: Type.STRING },
        family: { type: Type.STRING },
        order: { type: Type.STRING }
      }
    },
    morphology: {
      type: Type.OBJECT,
      properties: {
        leaves: { type: Type.STRING, description: "Shape, margin, texture" },
        flowers: { type: Type.STRING, description: "Color, petals, season" },
        fruits: { type: Type.STRING, description: "Type, seeds" },
        stems: { type: Type.STRING, description: "Structure, bark" }
      }
    },
    care: {
      type: Type.OBJECT,
      properties: {
        light: { type: Type.STRING },
        water: { type: Type.STRING },
        soil: { type: Type.STRING },
        humidity: { type: Type.STRING },
        temperature: { type: Type.STRING },
        fertilizer: { type: Type.STRING }
      }
    },
    ecology: {
      type: Type.OBJECT,
      properties: {
        nativeRegion: { type: Type.STRING },
        habitat: { type: Type.STRING },
        role: { type: Type.STRING }
      }
    },
    safety: {
      type: Type.OBJECT,
      properties: {
        isPoisonous: { type: Type.BOOLEAN },
        isInvasive: { type: Type.BOOLEAN },
        isEndangered: { type: Type.BOOLEAN },
        isMedicinal: { type: Type.BOOLEAN },
        notes: { type: Type.STRING }
      }
    },
    diagnostics: {
      type: Type.OBJECT,
      properties: {
        status: { 
          type: Type.STRING, 
          enum: ["Healthy", "Diseased", "Pest Infested", "Nutrient Deficient", "Unknown"]
        },
        details: { type: Type.STRING, description: "Explanation of the health status" },
        treatment: { type: Type.STRING, description: "Recommended treatment if applicable" }
      }
    },
    similarSpecies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          difference: { type: Type.STRING, description: "Key differentiator" }
        }
      }
    }
  },
  required: ["scientificName", "commonNames", "confidence", "taxonomy", "morphology", "care", "safety", "diagnostics"]
};

export const identifyPlant = async (base64Image: string): Promise<PlantIdentification> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an advanced botanical AI expert. Your task is to identify plants from images with high precision.
    Analyze the provided image for:
    1. Species identification (Genus species).
    2. Morphological features (leaves, flowers, bark, etc.).
    3. Ecological context and care requirements.
    4. Signs of distress, disease, or pests.
    
    If the image is unclear, provide the best possible guess with a lower confidence score and explain why in the reasoning.
    Return strictly valid JSON matching the provided schema.
  `;

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: plantSchema,
        temperature: 0.4, // Low temperature for factual accuracy
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming jpeg for simplicity, or detect from string
              data: cleanBase64
            }
          },
          {
            text: "Analyze this plant image thoroughly."
          }
        ]
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    // Hydrate with local metadata
    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      imageUrl: base64Image
    };

  } catch (error) {
    console.error("Plant identification failed:", error);
    throw error;
  }
};
