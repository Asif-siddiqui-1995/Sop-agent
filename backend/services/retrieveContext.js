// services/retrieveContext.js
import SOPChunk from "../models/SOPChunk.js";
import {generateEmbedding} from "../utils/hfEmbedding.js";

export async function retrieveContext(userQuestion) {
    console.log("➡️ retrieveContext START");

    // SAFETY CHECK
    if (!userQuestion || typeof userQuestion !== "string") {
        throw new Error("Invalid question");
    }

    console.log("➡️ Generating embedding...");
    const queryVector = await generateEmbedding(userQuestion);

    if (!Array.isArray(queryVector) || queryVector.length === 0) {
        throw new Error("Embedding generation failed");
    }

    console.log("➡️ Embedding generated:", queryVector.length);

    console.log("➡️ Running MongoDB vector search...");
    const results = await SOPChunk.aggregate([
        {
            $vectorSearch: {
                index: "vector_index", // ⚠️ MUST MATCH ATLAS
                path: "embedding",
                queryVector,
                numCandidates: 100,
                limit: 5,
            },
        },
        {
            $project: {
                _id: 0,
                content: 1,
                metadata: 1,
                score: {$meta: "vectorSearchScore"},
            },
        },
    ]);

    console.log("➡️ Vector search results:", results.length);

    return results;
}
