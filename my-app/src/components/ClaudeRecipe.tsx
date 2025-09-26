import ReactMarkdown from "react-markdown"

interface ClaudeRecipeProps {
    recipe: string;
    onNewRecipe: () => void;
    recipeSectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function ClaudeRecipe(props: ClaudeRecipeProps) {
    function handleSaveRecipe() {
        console.log("Saving recipe")
    }

    function handleNewRecipe() {
        props.onNewRecipe()
    }

    return (
        <section className="suggested-recipe-container" aria-live="polite">
            <h2>Chef Claude Recommends:</h2>
            <ReactMarkdown>{props.recipe}</ReactMarkdown>
            <div className="suggested-recipe-container-buttons" ref={props.recipeSectionRef}>
                <button onClick={handleSaveRecipe}>Save Recipe</button>
                <button onClick={handleNewRecipe}>New Recipe</button>
            </div>
        </section>
    )
}
