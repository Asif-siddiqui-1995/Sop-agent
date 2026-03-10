export function buildContext(userQuery, chunks) {
    const context = chunks
        .map(
            (c, i) =>
                `SOURCE ${i + 1} (${c.metadata.filename}, chunk ${c.metadata.chunkIndex}):\n${c.content}`,
        )
        .join("\n\n");

    return `
You are an enterprise SOP assistant.
Answer ONLY using the SOP content below.
If the answer is not present, say "Not found in SOPs".

${context}

User Question:
${userQuery}
`;
}
