import express from "express";
import {retrieveContext} from "../services/retrieveContext.js";
import {buildContext} from "../utils/buildContext.js";

const router = express.Router();

router.post("/query", async (req, res) => {
    console.log("SOP QUERY ROUTE HIT");
    console.log("REQ BODY:", req.body);
    try {
        const {question} = req.body;

        if (!question) {
            return res.status(400).json({error: "Question is required"});
        }

        const retrievedChunks = await retrieveContext(question);
        const context = buildContext(retrievedChunks);

        res.json({
            success: true,
            matches: retrievedChunks.length,
            context,
        });
    } catch (err) {
        console.error("Vector retrieval failed:", err);
        res.status(500).json({error: "Vector search failed"});
    }
});

export default router;
