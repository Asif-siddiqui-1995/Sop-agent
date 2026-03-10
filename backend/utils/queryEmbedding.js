import {generateEmbedding} from "./hfEmbedding.js";

export const embedQuery = async (query) => {
    return await generateEmbedding(query);
};
