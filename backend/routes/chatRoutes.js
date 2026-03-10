import express from "express";
import {retrieveContext} from "../services/retrieveContext.js";
import {buildContext} from "../utils/buildContext.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
    const {question} = req.body;

    if (!question) {
        return res.status(400).json({error: "Question is required"});
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
        const chunks = await retrieveContext(question);
        const {contextText, sources} = buildContext(chunks);

        const systemPrompt = `
You are an enterprise SOP assistant.

RULES:
- Answer ONLY using the provided context.
- If the answer is not in the context, say: "I don't know based on the SOPs."
- Cite sources using [Source X].

CONTEXT:
${contextText}

QUESTION:
${question}
`;

        // Call Gemini Streaming API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{text: systemPrompt}],
                        },
                    ],
                }),
            },
        );

        // Stream tokens to client
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            res.write(`data: ${chunk}\n\n`);
        }

        // Send sources at the end
        res.write(`data: ${JSON.stringify({type: "sources", sources})}\n\n`);

        res.write("event: end\n");
        res.write("data: END\n\n");
        res.end();
    } catch (err) {
        console.error("Chat error:", err);
        res.write(`event: error\ndata: ${err.message}\n\n`);
        res.end();
    }
});

export default router;
