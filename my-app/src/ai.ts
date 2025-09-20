export async function getRecipeFromChefClaude(ingredients: string[]): Promise<string> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/recipe';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return 'Sorry, I could not generate a recipe at this time.';
  }
}
