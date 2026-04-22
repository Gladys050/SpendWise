const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getInsights, chat } = require("../controllers/aiController");

router.use(auth);
router.post("/insights", getInsights);
router.post("/chat", chat);

module.exports = router;
