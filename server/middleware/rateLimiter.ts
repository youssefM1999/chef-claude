import { Request, Response, NextFunction } from "express";
import { recipeRateLimiter } from "../utils/redisRateLimiter.js";

export const recipeRateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const result = await recipeRateLimiter.checkLimit(userId);
    if (!result.allowed) {
      res.set({
        'X-RateLimit-Limit': process.env.RATE_LIMIT_RECIPES,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      })
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    res.set({
      'X-RateLimit-Limit': process.env.RATE_LIMIT_RECIPES,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    })
    next();
  } catch (error) {
    console.error('Error checking rate limit:', error);
    next();
  }
};