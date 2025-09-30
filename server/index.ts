import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import supabase from "./utils/supabase.js";
import { User } from "@supabase/supabase-js";
import { StructuredRecipe } from "./types.js";
import { parseRecipe, RecipeResponse } from "./utils/parse.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}


const app = express();
const port = process.env.PORT || 4000;

// CORS: allow your local React dev server and production domains
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []
  : ["http://localhost:5173", "http://localhost:3000"];


app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Authentication middleware
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      throw new Error("No token provided");
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!user || error) {
      throw new Error("Invalid token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid token" });
  }
};

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
app.post("/api/ai/generate-recipe", authMiddleware, async (req, res) => {
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

// Post a recipe to the database
app.post("/api/recipes", authMiddleware, async (req, res) => {
  try {
    const { title, ingredients, instructions, macros, recipe } = req.body;
    const now = new Date().toISOString();
    
    // Validate required fields
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert recipe with user association
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        title,
        ingredients,
        instructions,
        macros,
        markdown: recipe, // Store the full markdown recipe
        user_id: req.user?.id, // Associate with authenticated user
        created_at: now
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to save recipe" });
    }

    res.json({ success: true, recipe: data });
  } catch (err: any) {
    console.error(err);
    if (err?.issues) return res.status(400).json({ error: "Bad request", details: err.issues });
    res.status(500).json({ error: "Server error" });
  }
});

// Get all recipes for a user
app.get("/api/recipes", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", req.user?.id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch recipes" });
    }

    res.json({ success: true, recipes: data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/api/profiles", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const now = new Date().toISOString();

    // Try to insert the profile - let database handle duplicates via unique constraints
    const { data, error } = await supabase
      .from("profiles")
      .insert({ 
        id: req.user?.id,
        full_name: name, 
        email, 
        created_at: now, 
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate key error gracefully
      if (error.code === '23505') { // PostgreSQL unique violation
        // Check if it's a duplicate ID or duplicate email
        if (error.message?.includes('id') || error.message?.includes('profiles_pkey')) {
          return res.status(409).json({ error: "Profile already exists" });
        } else if (error.message?.includes('email') || error.message?.includes('profiles_email_key')) {
          return res.status(409).json({ error: "Email already exists" });
        }
        return res.status(409).json({ error: "Profile already exists" });
      }
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to save profile", details: error.message });
    }

    res.json({ success: true, profile: data });
  } catch (err: any) {
    console.error('Server error in profiles endpoint:', err);
    if (err?.issues) return res.status(400).json({ error: "Bad request", details: err.issues });
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET profile by ID for verification
app.get("/api/profiles/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Profile not found" });
      }
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    res.json({ success: true, profile: data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Chef Claude API is running",
    allowedOrigins: allowedOrigins,
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
