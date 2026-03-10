import {embedText} from "../utils/embeddings.js";

export const querySOP = async (req, res) => {
    console.log("/query called");

    try {
        const {query, topK = 5} = req.body;

        console.log("Query:", query);

        if (!query) {
            return res.status(400).json({error: "Query is required"});
        }

        console.log("Generating embedding...");
        const queryEmbedding = await embedText(query);
        console.log("Embedding generated");

        console.log("Running vector search...");
        const results = await SOPChunk.aggregate([
            {
                $vectorSearch: {
                    index: "sop_vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: topK,
                },
            },
            {
                $project: {
                    content: 1,
                    metadata: 1,
                    score: {$meta: "vectorSearchScore"},
                },
            },
        ]);

        console.log("Vector search done:", results.length);

        return res.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error("QUERY ERROR:", error);
        return res.status(500).json({error: error.message});
    }
};
