import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import supabase from "../utils/supabase";

const router = Router();

// Post a recipe to the database
router.post("/", authMiddleware, async (req, res) => {
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
router.get("/", authMiddleware, async (req, res) => {
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

export default router;