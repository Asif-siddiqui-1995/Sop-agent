import express from "express";
import {upload} from "../utils/multer.js";
import {chunkText} from "../utils/chunkText.js";
import SOPChunk from "../models/SOPChunk.js";
import {searchSOP} from "../controllers/searchController.js";
import {parsePDF} from "../utils/parsePdf.js";
import {querySOP} from "../controllers/queryController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({message: "No file uploaded"});
        }

        const text = await parsePDF(req.file.path);

        const chunks = chunkText(text, 1000, 100);

        const docs = chunks.map((chunk, index) => ({
            content: chunk,
            metadata: {
                filename: req.file.originalname,
                chunkIndex: index,
                uploadedAt: new Date(),
            },
        }));

        await SOPChunk.insertMany(docs);

        res.json({
            message: "SOP uploaded & stored in MongoDB",
            chunksStored: docs.length,
        });
    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({error: error.message});
    }
});

router.post("/search", searchSOP);
router.post("/query", querySOP);

export default router;
