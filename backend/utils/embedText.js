import fetch from "node-fetch";

export async function embedText(text) {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=" +
            process.env.GEMINI_API_KEY,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                content: {
                    parts: [{text}],
                },
            }),
        },
    );

    const data = await response.json();

    if (!data.embedding?.values) {
        throw new Error("Embedding failed");
    }

    return data.embedding.values; // array of numbers
}
