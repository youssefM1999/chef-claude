import { useState, useRef, useEffect } from "react"
import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"
import RateLimitWarning from "./RateLimitWarning"
import { getRecipeFromChefClaude, saveRecipeToDatabase, type RecipeResponse } from "../../utils/ai"
import Auth from "./Auth"
import type { User } from "@supabase/supabase-js"
import SideBar from "./SideBar"
import { getSavedRecipes, type DatabaseRecipe } from "../../utils/recipe"

interface MainProps {
    user: User | null;
    onAuthChange: (user: User | null) => void;
    onSignOut: () => void;
}

export default function Main(props: MainProps) {
    const [ingredients, setIngredients] = useState<string[]>([])
    const [recipe, setRecipe] = useState<RecipeResponse | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [saveRecipeClicked, setSaveRecipeClicked] = useState(false)
    const [savedRecipes, setSavedRecipes] = useState<DatabaseRecipe[]>([])
    const [cheffing, setCheffing] = useState(false)
    const [rateLimitInfo, setRateLimitInfo] = useState<{ allowed: boolean; remaining: number; reset: number } | null>(null)
    const [showRateLimitWarning, setShowRateLimitWarning] = useState(false)
    const recipeSectionRef = useRef<HTMLDivElement>(null)

    async function getRecipe() {
        try {
            setCheffing(true)
            setShowRateLimitWarning(false) // Hide any existing warning
            const recipeResponse = await getRecipeFromChefClaude(ingredients)
            
            // Update rate limit info
            if (recipeResponse.rateLimit) {
                setRateLimitInfo(recipeResponse.rateLimit)
                
                // Show warning if rate limit is reached
                if (!recipeResponse.rateLimit.allowed) {
                    setShowRateLimitWarning(true)
                }
            }
            
            setRecipe(recipeResponse)
            setSaveRecipeClicked(false)
        } catch (error) {
            console.error(error)
            setCheffing(false)
        } finally {
            setCheffing(false)
        }
    }

    function addIngredient(formData: FormData) {
        const newIngredient = formData.get("ingredient")
        if (newIngredient) {
            setIngredients(prevIngredients => [...prevIngredients, newIngredient as string])
        }
    }

    function removeIngredient(ingredient: string) {
        setIngredients(prevIngredients => prevIngredients.filter(i => i !== ingredient))
    }

    function clearAll() {
        setIngredients([])
        setRecipe(null)
        setSaveRecipeClicked(false)
        setShowRateLimitWarning(false)
    }

    function dismissRateLimitWarning() {
        setShowRateLimitWarning(false)
    }

    function saveRecipe() {
        if (recipe?.recipeData && recipe?.recipe) {
            setSaveRecipeClicked(true)
            saveRecipeToDatabase(recipe?.recipeData, recipe?.recipe)
                .then(() => {
                    getSavedRecipes()
                        .then((recipes) => {
                            setSavedRecipes(recipes)
                        })
                })
        }
    }

    function handleSidebarToggle() {
        setSidebarOpen(prev => {
            const newSidebarOpen = !prev
            if (newSidebarOpen) {
                getSavedRecipes()
                    .then((recipes) => {
                        setSavedRecipes(recipes)
                    })
            }
            return newSidebarOpen
        })
    }

    function recipeUIFlow() {
        if (cheffing) {
            return (
                <div className="cheffing-container">
                    <div className="cheffing-container-header">
                        <div className="cheffing-spinner">🥘</div>
                        <h2>Chef Claude is cooking...</h2>
                    </div>
                </div>
            )
        } else if (recipe) {
            return (
                <>
                    <ClaudeRecipe
                        recipe={recipe}
                        onNewRecipe={clearAll}
                        recipeSectionRef={recipeSectionRef}
                    />
                    <div className="suggested-recipe-container-buttons">
                        <button onClick={saveRecipe} disabled={saveRecipeClicked}>Save Recipe</button>
                        <button onClick={clearAll}>New Recipe</button>
                    </div>
                </>
            )
        }
    }

    useEffect(() => {
        if (recipe && recipeSectionRef.current) {
            recipeSectionRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [recipe])

    if (!props.user) {
        return <Auth user={props.user} onAuthChange={props.onAuthChange} onSignOut={props.onSignOut} />
    }

    return (
        <div className={`main-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <SideBar savedRecipes={savedRecipes} />
            </div>
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
                <button className="sidebar-toggle" onClick={handleSidebarToggle}>☰</button>

                {ingredients.length > 0 &&
                    <IngredientsList
                        ingredients={ingredients}
                        toggleRecipeShown={getRecipe}
                        removeIngredient={removeIngredient}
                    />
                }

                {showRateLimitWarning && rateLimitInfo && (
                    <RateLimitWarning 
                        rateLimit={rateLimitInfo} 
                        onDismiss={dismissRateLimitWarning}
                    />
                )}

                {recipeUIFlow()}
            </main>
        </div>
    )
}
