export function vectorSearchPipeline(queryEmbedding, limit = 5) {
    return [
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit,
            },
        },
        {
            $project: {
                _id: 0,
                content: 1,
                title: 1,
                page: 1,
                score: {$meta: "vectorSearchScore"},
            },
        },
    ];
}
