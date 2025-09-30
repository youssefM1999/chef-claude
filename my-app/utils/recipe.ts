/// <reference types="vite/client" />

import supabase from "./supabase";

const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : import.meta.env.VITE_API_URL;

// Database recipe structure
export interface DatabaseRecipe {
    id: string;
    title: string;
    ingredients: string;
    instructions: string;
    macros: string;
    markdown: string;
    user_id: string;
    created_at: string;
}

// API response structure
export interface ApiResponse {
    success: boolean;
    recipes: DatabaseRecipe[];
}

export async function getSavedRecipes(): Promise<DatabaseRecipe[]> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error('User not authenticated');
        }
        
        const apiUrl = `${apiBaseUrl}/recipes`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            }
        });
        
        console.log('API response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to get saved recipes: ${response.status} ${response.statusText}`);
        }
        
        const data: ApiResponse = await response.json();
        console.log('Raw saved recipes from API:', data);
        
        return data.recipes;
    } catch (error) {
        console.error('Error getting saved recipes:', error);
        throw error;
    }
}