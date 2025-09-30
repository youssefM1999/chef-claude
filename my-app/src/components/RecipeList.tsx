import type { DatabaseRecipe } from "../../utils/recipe"

interface RecipeListProps {
    recipes: DatabaseRecipe[]
}

export default function RecipeList(props: RecipeListProps) {
    function formatDate(dateString: string) {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <ul className="recipe-list">
            {props.recipes.map(recipe => (
                <li key={recipe.id} className="recipe-item">
                    <div className="recipe-title">{recipe.title}</div>
                    <div className="recipe-meta">
                        <span className="recipe-date">{formatDate(recipe.created_at)}</span>
                    </div>
                </li>
            ))}
        </ul>
    )
}