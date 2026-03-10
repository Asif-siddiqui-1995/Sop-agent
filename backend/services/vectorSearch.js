import SOPChunk from "../models/SOP.js";

export const searchSOP = async (queryEmbedding) => {
    const results = await SOPChunk.aggregate([
        {
            $vectorSearch: {
                index: "sop_vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: 5,
            },
        },
        {
            $project: {
                text: 1,
                source: 1,
                score: {$meta: "vectorSearchScore"},
            },
        },
    ]);

    return results;
};
