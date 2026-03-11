import mongoose from "mongoose";
import dotenv from "dotenv";
import SOPChunk from "./models/SOPChunk.js";
import {generateEmbedding} from "./utils/hfEmbedding.js";

dotenv.config();

const testVectorSearch = async () => {
    try {
        console.log("🔗 Connecting to MongoDB...");

        console.log("✅ Connected to MongoDB");

        // Test query
        const testQuery = "How do I reset the device?";
        console.log(`\n🔍 Test query: "${testQuery}"`);

        // Generate embedding for the test query
        console.log("\n📊 Generating embedding...");
        const queryEmbedding = await generateEmbedding(testQuery);
        console.log(
            `✅ Embedding generated (${queryEmbedding.length} dimensions)`,
        );

        // Perform vector search using the new static method
        console.log("\n🚀 Performing vector search on OpsMindAI collection...");
        const results = await SOPChunk.vectorSearch(queryEmbedding, {
            limit: 5,
            numCandidates: 100,
        });

        console.log(`\n✅ Found ${results.length} results:\n`);

        results.forEach((result, index) => {
            console.log(`--- Result ${index + 1} ---`);
            console.log(`Content: ${result.content?.substring(0, 100)}...`);
            console.log(`Score: ${result.score?.toFixed(4)}`);
            console.log(`Metadata:`, result.metadata);
            console.log("");
        });

        console.log("✅ Vector search test completed successfully!");
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
    }
};

testVectorSearch();
