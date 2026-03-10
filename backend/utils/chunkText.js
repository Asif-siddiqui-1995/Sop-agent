export function chunkText(text, chunkSize = 1000, overlap = 100) {
    if (!text) throw new Error("No text provided for chunking");

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;
        const chunk = text.slice(start, end).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        start += chunkSize - overlap;
    }

    return chunks;
}
