import mongoose from "mongoose";

const sopChunkSchema = new mongoose.Schema({
    content: String,
    embedding: [Number],
    metadata: {
        filename: String,
        chunkIndex: Number,
        page: Number,
        sopId: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
});

// Static model method for performing a MongoDB Atlas vector search
//
// Example usage:
// const queryEmbedding = await generateEmbedding("How do I reset the device?");
// const results = await SOPChunk.vectorSearch(queryEmbedding, {
//   index: 'vector_index',          // optional, defaults to 'vector_index'
//   path: 'embedding',              // optional, defaults to 'embedding'
//   numCandidates: 100,             // optional, defaults to 100
//   limit: 5,                       // optional, defaults to 5
//   projectFields: {                // optional, custom projection
//     _id: 0,
//     content: 1,
//     metadata: 1,
//     score: { $meta: 'vectorSearchScore' }
//   }
// });
sopChunkSchema.statics.vectorSearch = async function (
    queryEmbedding,
    options = {},
) {
    const {
        index = "vector_index",
        path = "embedding",
        numCandidates = 100,
        limit = 5,
        projectFields = null,
    } = options;

    const pipeline = [
        {
            $vectorSearch: {
                index,
                path,
                queryVector: queryEmbedding,
                numCandidates,
                limit,
            },
        },
        {
            $project: projectFields || {
                _id: 0,
                content: 1,
                score: {$meta: "vectorSearchScore"},
                metadata: 1,
            },
        },
    ];

    return this.aggregate(pipeline);
};

// Static model method for performing a semantic text search using Atlas Search
// Example usage:
// const results = await SOPChunk.semanticTextSearch("How do I reset the device?", {
//   index: 'sop_text_index',    // optional Atlas Search index name
//   path: ['content', 'metadata.filename'],
//   limit: 5,
//   projectFields: { _id: 0, content: 1, metadata: 1, score: { $meta: 'searchScore' } }
// });
sopChunkSchema.statics.semanticTextSearch = async function (
    queryText,
    options = {},
) {
    const {
        index = "default",
        path = ["content"],
        limit = 5,
        projectFields = null,
    } = options;

    const pipeline = [
        {
            $search: {
                index,
                text: {
                    query: queryText,
                    path,
                },
            },
        },
        {
            $project: projectFields || {
                _id: 0,
                content: 1,
                metadata: 1,
                score: {$meta: "searchScore"},
            },
        },
        {$limit: limit},
    ];

    return this.aggregate(pipeline);
};

export default mongoose.model("SOPChunk", sopChunkSchema, "OpsMindAI");
