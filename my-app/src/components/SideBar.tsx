import type { DatabaseRecipe } from "../../utils/recipe"
import RecipeList from "./RecipeList"

interface SideBarProps {
    savedRecipes: DatabaseRecipe[]
}

export default function SideBar(props: SideBarProps) {
    
    return (
        <>
            <h1>Saved Recipes</h1>
            {props.savedRecipes.length > 0 ? (
                <RecipeList recipes={props.savedRecipes} />
            ) : (
                <p>Ready for a recipe?</p>
            )}
        </>
    )
}