import SOP from "../models/SOPChunk.js";
import {embedQuery} from "../utils/queryEmbedding.js";

export const testSearch = async (req, res) => {
    try {
        console.log("BODY:", req.body); // DEBUG

        const {question} = req.body;

        if (!question) {
            return res.status(400).json({error: "Question is required"});
        }

        const queryVector = await embedQuery(question);

        const results = await SOP.aggregate([
            {
                $vectorSearch: {
                    index: "sop_vector_index",
                    path: "embedding",
                    queryVector,
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
