import {generateEmbedding} from "../utils/hfEmbedding.js";
import SOP from "../models/SOP.js";
import {parsePDF} from "../utils/parsePdf.js";
import {chunkText} from "../utils/chunker.js";

export const uploadSOP = async (req, res) => {
    try {
        const text = await parsePDF(req.file.path);
        const chunks = chunkText(text, 1000, 100);

        const docs = [];

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk);

            docs.push({
                content: chunk,
                embedding,
            });
        }

        await SOP.insertMany(docs);

        res.json({message: "SOP uploaded & embedded successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err.message});
    }
};
