import { Router } from "express";
import supabase from "../utils/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Post a profile to the database
router.post("/", authMiddleware, async (req, res) => {
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
router.get("/:id", authMiddleware, async (req, res) => {
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

export default router;