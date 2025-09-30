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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return {
      recipe: 'Sorry, I could not generate a recipe at this time.',
      recipeData: null
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
