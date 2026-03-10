// import fetch from "node-fetch";

// const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

// export const generateEmbedding = async (text) => {
//     const response = await fetch(
//         `https://router.huggingface.co/hf-inference/embeddings/${HF_MODEL}`,
//         {
//             method: "POST",
//             headers: {
//                 Authorization: `Bearer ${process.env.HF_API_KEY}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 input: text,
//             }),
//         },
//     );

//     if (!response.ok) {
//         const err = await response.text();
//         throw new Error(`HF Error: ${err}`);
//     }

//     const data = await response.json();
//     return data.data[0].embedding;
// };

import axios from "axios";
import {InferenceClient} from "@huggingface/inference";
import SOPChunk from "../models/SOPChunk.js";

const HF_MODEL = "all-MiniLM-L6-v2/pipeline/sentence-similarity"; //"sentence-transformers/all-MiniLM-L6-v2";

const DEFAULT_TIMEOUT = 60000;

async function postJson(url, body) {
    return axios.post(url, body, {
        headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
        },
        timeout: DEFAULT_TIMEOUT,
    });
}

async function tryRouterEndpoint(text) {
    // router endpoint seems to be down, so directly try api inference for now
    const url = `https://router.huggingface.co/hf-inference/embeddings/${HF_MODEL}`;
    const bodies = [{input: text}, {inputs: text}];

    for (const body of bodies) {
        try {
            const res = await postJson(url, body);
            const embedding =
                res.data?.data?.[0]?.embedding ||
                (Array.isArray(res.data) ? res.data[0] : res.data?.embedding);
            if (Array.isArray(embedding)) return embedding;
            console.error("HF router unexpected response:", res.data);
        } catch (err) {
            if (err.response) {
                console.error("HF router status:", err.response.status);
                console.error("HF router data:", err.response.data);
                if (err.response.status === 410)
                    return {error: "deprecated", detail: err.response.data};
                if (err.response.status === 404)
                    return {error: "not_found", detail: err.response.data};
            } else {
                console.error("HF router error:", err.message);
            }
        }
    }

    return null;
}

async function tryApiInference(text) {
    return await SOPChunk.semanticTextSearch("Can I enroll a ZS300 Sensor?");
    const url =
        "https://router.huggingface.co/hf-inference/models/sentence-transformers";
    try {
        const res = await postJson(url, {
            model: HF_MODEL,
            inputs: {
                source_sentence: "That is a happy person",
                sentences: [
                    "That is a happy dog",
                    "That is a very happy person",
                    "Today is a sunny day",
                ],
            },
        });
        console.log(
            "HF api-inference response:=================================================",
            res.data,
        );
        const embedding =
            res.data?.data?.[0]?.embedding ||
            (Array.isArray(res.data) ? res.data[0] : res.data?.embedding);
        if (Array.isArray(embedding)) return embedding;
        console.error("HF api-inference unexpected response:", res.data);
        return null;
    } catch (err) {
        if (err.response) {
            console.error("HF api-inference status:", err.response.status);
            console.error("HF api-inference data:", err.response.data);
        } else {
            console.error("HF api-inference error:", err.message);
        }
        return null;
    }
}

export const generateEmbedding = async (text) => {
    return await tryApiInference(text);
    if (!process.env.HF_API_KEY) {
        throw new Error("HF_API_KEY is not set in environment");
    }

    // Primary: use the official InferenceClient which handles correct endpoints
    try {
        const client = new InferenceClient(process.env.HF_API_KEY);
        const out = await client.embeddings({model: HF_MODEL, input: text});

        // Normalise possible response shapes from the SDK / providers
        const embedding =
            out?.data?.[0]?.embedding ||
            out?.embedding ||
            out?.embeddings ||
            (Array.isArray(out) ? out[0] : null);

        if (Array.isArray(embedding)) return embedding;
        console.error("HF SDK embeddings unexpected response:", out);
    } catch (err) {
        console.error(
            "HF SDK embeddings error:",
            err?.response?.status,
            err?.response?.data || err?.message,
        );
        // fallthrough to HTTP fallbacks below
    }

    // Fallbacks: try router / api endpoints as before
    const routerResult = await tryRouterEndpoint(text);
    if (Array.isArray(routerResult)) return routerResult;
    const apiResult = await tryApiInference(text);
    if (Array.isArray(apiResult)) return apiResult;

    throw new Error(
        "HF embedding failed: all endpoints returned errors or invalid responses (check HF_API_KEY and network)",
    );
};

// Sentence similarity helper using the official Hugging Face Inference client
// Example:
// const scores = await sentenceSimilarity("That is a happy person", ["That is a happy dog", "That is a very happy person"]);
export async function sentenceSimilarity(
    sourceSentence,
    sentences = [],
    options = {},
) {
    const model = options.model || HF_MODEL;
    const provider = options.provider || "hf-inference";
    const token = process.env.HF_API_KEY || process.env.HF_TOKEN;

    if (!token) {
        throw new Error("HF_API_KEY or HF_TOKEN is not set in environment");
    }

    try {
        const client = new InferenceClient(token);
        const output = await client.sentenceSimilarity({
            model,
            inputs: {
                source_sentence: sourceSentence,
                sentences,
            },
            provider,
        });

        return output;
    } catch (err) {
        console.error(
            "HF sentenceSimilarity error:",
            err?.response?.status,
            err?.response?.data || err?.message,
        );
        throw err;
    }
}
