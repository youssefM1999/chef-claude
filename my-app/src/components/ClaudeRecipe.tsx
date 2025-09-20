import ReactMarkdown from "react-markdown"

interface ClaudeRecipeProps {
    recipe: string;
}

export default function ClaudeRecipe(props: ClaudeRecipeProps) {
    return (
        <section className="suggested-recipe-container" aria-live="polite">
            <h2>Chef Claude Recommends:</h2>
            <ReactMarkdown>{props.recipe}</ReactMarkdown>
        </section>
    )
}
