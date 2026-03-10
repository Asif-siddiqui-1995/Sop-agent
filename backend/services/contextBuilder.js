export function buildContext(chunks) {
    if (!chunks || chunks.length === 0) {
        return {
            contextText: "",
            sources: [],
        };
    }

    const contextText = chunks
        .map(
            (chunk, i) =>
                `Source ${i + 1} (${chunk.metadata.filename}, Page ${chunk.metadata.page}):\n${chunk.content}`,
        )
        .join("\n\n");

    const sources = chunks.map((chunk, i) => ({
        id: i + 1,
        filename: chunk.metadata.filename,
        page: chunk.metadata.page,
        chunkIndex: chunk.metadata.chunkIndex,
    }));

    return {contextText, sources};
}
