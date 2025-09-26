import { useState, useRef, useEffect } from "react"
import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"
import { getRecipeFromChefClaude } from "../ai"

export default function Main() {
    const [ingredients, setIngredients] = useState<string[]>([])
    const [recipe, setRecipe] = useState("")
    const recipeSectionRef = useRef<HTMLDivElement>(null)

    async function getRecipe() {
        const recipeMarkdown = await getRecipeFromChefClaude(ingredients)
        setRecipe(recipeMarkdown)
    }

    function addIngredient(formData: FormData) {
        const newIngredient = formData.get("ingredient")
        if (newIngredient) {
            setIngredients(prevIngredients => [...prevIngredients, newIngredient as string])
        }
    }

    function clearAll() {
        setIngredients([])
        setRecipe("")
    }

    useEffect(() => {
        if (recipe !== "" && recipeSectionRef.current) {
            recipeSectionRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [recipe])


    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add ingredient</button>
            </form>

            {ingredients.length > 0 &&
                <IngredientsList
                    ingredients={ingredients}
                    toggleRecipeShown={getRecipe}
                />
            }

            {recipe && <ClaudeRecipe recipe={recipe} 
                                     onNewRecipe={clearAll} 
                                     recipeSectionRef={recipeSectionRef} 
                        />}
        </main>
    )
}
