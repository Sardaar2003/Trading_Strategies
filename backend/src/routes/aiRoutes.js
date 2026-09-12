const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze', aiController.analyzeTradingPrompt);
router.get('/skills', aiController.getTradingSkills);
router.get('/models', aiController.getAIModelsInfo);
router.get('/telemetry', aiController.getAITelemetry);

module.exports = router;
