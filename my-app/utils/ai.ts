/// <reference types="vite/client" />

import supabase from "./supabase";

export interface RecipeResponse {
  recipe: string;
  recipeData: {
    title: string;
    ingredients: string;
    instructions: string;
    macros: string;
  } | null;
  rateLimit?: {
    allowed: boolean;
    remaining: number;
    reset: number;
  };
}

const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : import.meta.env.VITE_API_URL;

export async function getRecipeFromChefClaude(ingredients: string[]): Promise<RecipeResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }
    const apiUrl = `${apiBaseUrl}/ai/generate-recipe`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ ingredients }),
    });

    // Read rate limit from headers
    const rateLimitInfo = {
      allowed: response.headers.get('X-RateLimit-Allowed') === 'true',
      remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
      reset: new Date(response.headers.get('X-RateLimit-Reset') || '0').getTime(),
    }
    console.log('Rate limit info:', rateLimitInfo);

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        return {
          recipe: 'Sorry, I could not generate a recipe at this time.',
          recipeData: null,
          rateLimit: rateLimitInfo
        };
      }
      throw new Error(`Error fetching recipe: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      rateLimit: rateLimitInfo
    };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return {
      recipe: 'Sorry, I could not generate a recipe at this time.',
      recipeData: null,
      rateLimit: {
        allowed: false,
        remaining: 0,
        reset: 0,
      }
    };
  }
}

export async function saveRecipeToDatabase(recipeData: {
  title: string;
  ingredients: string;
  instructions: string;
  macros: string;
}, recipe: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const apiUrl = `${apiBaseUrl}/recipes`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ ...recipeData, recipe }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save recipe: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Recipe saved successfully:', data);
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
}
