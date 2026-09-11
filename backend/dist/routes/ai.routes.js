"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_js_1 = require("../controllers/ai.controller.js");
const router = (0, express_1.Router)();
router.post("/diagnose", ai_controller_js_1.AIController.diagnose);
exports.default = router;
