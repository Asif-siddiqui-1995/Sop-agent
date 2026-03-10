import express from "express";
import {testSearch} from "../controllers/testController.js";

const router = express.Router();

router.post("/test-search", testSearch);

export default router;
