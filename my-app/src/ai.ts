export async function getRecipeFromChefClaude(ingredients: string[]): Promise<string> {
  try {
    const response = await fetch('http://localhost:4000/api/recipe', {
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
