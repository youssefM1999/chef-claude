import { StructuredRecipe } from "../types.js";

export interface RecipeResponse {
  recipe: string;
  recipeData: StructuredRecipe | null;
}

function cleanJsonString(jsonString: string): string {
  // This function properly escapes newlines only within string values, not in the JSON structure
  let result = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      // Inside a string, escape control characters
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      // Outside a string, keep as is
      result += char;
    }
  }
  
  return result;
}

export function parseRecipe(rawMarkdownRecipe: string): RecipeResponse {
  console.log('Raw AI response:', rawMarkdownRecipe);
  
  try {
    // Clean the JSON by properly escaping control characters only within strings
    const cleanedJson = cleanJsonString(rawMarkdownRecipe);
    console.log('Cleaned JSON:', cleanedJson);
    
    // Try to parse the cleaned JSON
    const parsedResponse = JSON.parse(cleanedJson);
    console.log('Parsed response:', parsedResponse);
    
    // Validate that we have the expected structure
    if (parsedResponse.recipe && parsedResponse.recipeData) {
      return parsedResponse;
    }
    
    // If structure is wrong, try to extract from nested JSON
    if (typeof parsedResponse.recipe === 'string' && parsedResponse.recipe.startsWith('{')) {
      try {
        const innerRecipe = JSON.parse(parsedResponse.recipe);
        console.log('Inner recipe parsed:', innerRecipe);
        return {
          recipe: innerRecipe.recipe || parsedResponse.recipe,
          recipeData: innerRecipe.recipeData || parsedResponse.recipeData
        };
      } catch (innerError) {
        console.log('Inner parsing failed:', innerError);
        return parsedResponse;
      }
    }
    
    return parsedResponse;
  } catch (parseError: any) {
    console.log('Initial parsing failed:', parseError);
    
    // If direct parsing fails, try to extract JSON from the response
    const jsonMatch = rawMarkdownRecipe.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const jsonString = jsonMatch[0];
        const cleanedJson = cleanJsonString(jsonString);
        const parsedResponse = JSON.parse(cleanedJson);
        console.log('Extracted JSON:', parsedResponse);
        return parsedResponse;
      } catch (nestedError) {
        console.log('JSON extraction failed:', nestedError);
      }
    }
  }
  
  // Fallback: return raw response as recipe
  console.log('Using fallback - returning raw response');
  return {
    recipe: rawMarkdownRecipe,
    recipeData: null
  };
}