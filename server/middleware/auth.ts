import { Request, Response, NextFunction } from "express";
import supabase from "../utils/supabase.js";
import { User } from "@supabase/supabase-js";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

// Authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
