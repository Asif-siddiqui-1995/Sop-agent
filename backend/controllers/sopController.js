import SOPChunk from "../models/SOPChunk.js";
import {generateEmbedding} from "../utils/hfEmbedding.js";

export const searchSOP = async (req, res) => {
    try {
        const {question} = req.body;

        if (!question) {
            return res.status(400).json({error: "Question is required"});
        }

        const queryEmbedding = await generateEmbedding(question);

        const results = await SOPChunk.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 5,
                },
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    score: {$meta: "vectorSearchScore"},
                    metadata: 1,
                },
            },
        ]);

        res.json({
            question,
            answers: results,
        });
    } catch (error) {
        console.error("SEARCH ERROR:", error);
        res.status(500).json({error: error.message});
    }
};
