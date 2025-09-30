import ReactMarkdown from "react-markdown"
import type { RecipeResponse } from "../../utils/ai"

interface ClaudeRecipeProps {
    recipe: RecipeResponse;
    onNewRecipe: () => void;
    recipeSectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function ClaudeRecipe(props: ClaudeRecipeProps) {
    return (
        <section className="suggested-recipe-container" aria-live="polite" ref={props.recipeSectionRef}>
            <h2>Chef Claude Recommends:</h2>
            <ReactMarkdown>{props.recipe.recipe}</ReactMarkdown>
        </section>
    )
}
