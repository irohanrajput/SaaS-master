import express from 'express';
import lighthouseService from '../services/lighthouseService.js';

const router = express.Router();

// Simple in-memory cache (5 minute expiry)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Analyze a domain with Lighthouse
router.get('/lighthouse/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter is required' });
    }

    // Check cache first
    const cacheKey = domain.toLowerCase();
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`📦 Returning cached results for: ${domain}`);
      return res.json(cached.data);
    }

    console.log(`📊 Starting Lighthouse analysis for: ${domain}`);
    
    const result = await lighthouseService.analyzeSite(domain);
    
    if (!result) {
      return res.status(500).json({ 
        error: 'Failed to analyze site',
        message: 'Lighthouse analysis returned no results'
      });
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log(`✅ Lighthouse analysis completed for: ${domain}`);
    return res.json(result);
    
  } catch (error) {
    console.error('❌ Error in lighthouse analysis:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Clean up old cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

export default router;