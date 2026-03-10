import SOP from "../models/SOPChunk.js";
import {embedQuery} from "../utils/queryEmbedding.js";

export const searchSOP = async (req, res) => {
    try {
        const {question} = req.body;

        const queryVector = await embedQuery(question);

        const results = await SOP.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryVector,
                    numCandidates: 100,
                    limit: 5,
                },
            },
            {
                $project: {
                    content: 1,
                    score: {$meta: "vectorSearchScore"},
                },
            },
        ]);

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err.message});
    }
};
