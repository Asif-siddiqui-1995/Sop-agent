import express from "express";
import {searchSOP} from "../controllers/searchController.js";
import {querySOP} from "../controllers/queryController.js";

const router = express.Router();

router.post("/search", searchSOP);
router.post("/query", querySOP);

export default router;
