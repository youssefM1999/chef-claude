import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { recipeRateLimiterMiddleware } from "../middleware/rateLimiter.js";
import { parseRecipe } from "../utils/parse.js";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const router = Router();

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Also provide the macros for the recipe.

IMPORTANT: Return ONLY a valid JSON object in this exact format (no additional text or markdown):
{
  "recipe": "The recipe in markdown format with proper headings and formatting",
  "recipeData": {
    "title": "The title of the recipe",
    "ingredients": "The ingredients of the recipe as a bulleted list",
    "instructions": "The instructions of the recipe as a numbered list",
    "macros": "The macros of the recipe"
  }
}
`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const GenerateRecipeBody = z.object({
  ingredients: z.array(z.string().min(1)).min(1)
});

// Recipe endpoint - requires authentication
router.post("/generate-recipe", authMiddleware, recipeRateLimiterMiddleware, async (req, res) => {
  try {
    const { ingredients } = GenerateRecipeBody.parse(req.body);
    const ingredientsString = ingredients.join(", ");

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`
        }
      ]
    });

    const aiRecipeResponse = msg.content?.[0]?.type === "text" ? msg.content[0].text : String(msg.content ?? "");
    
    // Parse the AI response
    const parsedResponse = parseRecipe(aiRecipeResponse);
    console.log('Final parsed response:', parsedResponse);
    
    // Return both the markdown recipe and structured data
    res.json({ 
      recipe: parsedResponse.recipe,
      recipeData: parsedResponse.recipeData
    });
  } catch (err: any) {
    console.error(err);
    if (err?.issues) return res.status(400).json({ error: "Bad request", details: err.issues });
    res.status(500).json({ error: "Server error" });
  }
});

export default router;