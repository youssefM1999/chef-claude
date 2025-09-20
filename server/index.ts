import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const app = express();
const port = process.env.PORT || 4000;

// CORS: allow your local React dev server
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Also provide the macros for the recipe. Format your response in markdown.
`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RecipeBody = z.object({
  ingredients: z.array(z.string().min(1)).min(1)
});

app.post("/api/recipe", async (req, res) => {
  try {
    const { ingredients } = RecipeBody.parse(req.body);
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

    const text = msg.content?.[0]?.type === "text" ? msg.content[0].text : String(msg.content ?? "");
    res.json({ recipe: text });
  } catch (err: any) {
    console.error(err);
    if (err?.issues) return res.status(400).json({ error: "Bad request", details: err.issues });
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
