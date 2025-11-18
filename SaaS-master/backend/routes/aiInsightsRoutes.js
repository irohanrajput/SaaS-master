import express from 'express';
import aiInsightsService from '../services/aiInsightsService.js';

const router = express.Router();

/**
 * POST /api/ai-insights/generate
 * Generate new AI insights for a user
 */
router.post('/generate', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log(`🤖 Generating AI insights for: ${email}`);

    const result = await aiInsightsService.generateInsights(email);

    return res.json(result);

  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai-insights/latest
 * Get latest AI insights for a user
 */
router.get('/latest', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const insights = await aiInsightsService.getLatestInsights(email);

    if (!insights) {
      return res.json({
        success: true,
        insights: null,
        message: 'No insights generated yet'
      });
    }

    return res.json({
      success: true,
      insights: insights.insights,
      createdAt: insights.created_at
    });

  } catch (error) {
    console.error('❌ Error fetching AI insights:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
