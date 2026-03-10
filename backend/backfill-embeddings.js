import mongoose from "mongoose";
import dotenv from "dotenv";
import SOPChunk from "./models/SOPChunk.js";
import {generateEmbedding} from "./utils/hfEmbedding.js";

/*
  Script to backfill missing or empty embeddings in the OpsMindAI collection.
  Run it with:

      node backfill-embeddings.js

  It will connect to the database, find every document where `embedding` is
  either not set or an empty array, generate an embedding using the HF model,
  and update the document in place.
*/

dotenv.config();

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const cursor = SOPChunk.find({
        $or: [{embedding: {$exists: false}}, {embedding: {$size: 0}}],
    }).cursor();

    let count = 0;
    for (
        let doc = await cursor.next();
        doc != null;
        doc = await cursor.next()
    ) {
        try {
            console.log(
                `\n➡️ Generating embedding for _id=${doc._id} (chunkIndex=${doc.metadata?.chunkIndex})`,
            );
            const emb = await generateEmbedding(doc.content);
            if (!Array.isArray(emb) || emb.length === 0) {
                throw new Error("received invalid embedding");
            }
            doc.embedding = emb;
            await doc.save();
            console.log("✅ Updated embedding, length", emb.length);
            count++;
            // Rate-limit to avoid HF abuse
            await new Promise((r) => setTimeout(r, 500));
        } catch (err) {
            console.error("❌ error processing document", doc._id, err.message);
        }
    }

    console.log(`\nFinished. Updated ${count} documents.`);
    await mongoose.disconnect();
    console.log("Disconnected");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
