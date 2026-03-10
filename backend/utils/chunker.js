export const chunkText = (text, size = 1000, overlap = 100) => {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        chunks.push(text.slice(start, start + size));
        start += size - overlap;
    }

    return chunks;
};
