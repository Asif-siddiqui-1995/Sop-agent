import fetch from "node-fetch";

export async function getEmbedding(text) {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=" +
            process.env.GEMINI_API_KEY,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                content: {parts: [{text}]},
            }),
        },
    );

    const data = await response.json();
    return data.embedding.values;
}
