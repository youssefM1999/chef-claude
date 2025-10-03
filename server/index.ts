import "dotenv/config";
import express from "express";
import cors from "cors";
import recipesRouter from "./routes/recipes.js";
import profilesRouter from "./routes/profiles.js";
import aiRouter from "./routes/ai.js";

const app = express();
const port = process.env.PORT || 4000;

// CORS: allow your local React dev server and production domains
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []
  : ["http://localhost:5173", "http://localhost:3000"];


app.use(cors({ 
  origin: allowedOrigins,
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Allowed', 
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ]
}));
app.use(express.json());

app.use("/api/recipes", recipesRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/ai", aiRouter);

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
