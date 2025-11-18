import express from 'express';
import userAnalyticsService from '../services/userAnalyticsService.js';
import seoCacheService from '../services/seoCacheService.js';

const router = express.Router();

// Get user's GA4 properties
router.get('/analytics/properties', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const result = await userAnalyticsService.getUserProperties(email);
    res.json(result);

  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get user's GA4 analytics data
router.get('/analytics/data', async (req, res) => {
  try {
    const { email, propertyId, dateRange = '30days', forceRefresh } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    console.log('📊 Fetching analytics with range:', dateRange);

    // Check cache first (unless forceRefresh is true or realtime data requested)
    if (forceRefresh !== 'true' && dateRange !== 'realtime') {
      const cachedData = await seoCacheService.getGoogleAnalyticsCache(email);
      if (cachedData) {
        console.log('✅ Returning cached Google Analytics data');
        cachedData.dateRange = dateRange; // Add dateRange to response
        return res.json(cachedData);
      }
    } else if (forceRefresh === 'true') {
      console.log('🔄 Force refresh requested, skipping cache');
    }

    // Cache miss or expired - fetch fresh data
    console.log('📡 Fetching fresh data from Google Analytics...');

    let data;
    // Handle realtime separately
    if (dateRange === 'realtime') {
      data = await userAnalyticsService.getUserRealtimeData(email, propertyId);
    } else {
      // For historical data (7days, 30days), use the regular method
      // The service currently uses 30daysAgo by default
      // We'll pass the dateRange info via property for now
      data = await userAnalyticsService.getUserAnalyticsData(email, propertyId);
      
      // Add dateRange info to response
      if (data.dataAvailable) {
        data.dateRange = dateRange;
        
        // Save to cache asynchronously (don't wait for it)
        seoCacheService.saveGoogleAnalyticsCache(email, data).catch(err => {
          console.error('⚠️ Failed to save GA cache:', err);
        });
      }
    }
    
    res.json(data);

  } catch (error) {
    console.error('❌ Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get social media metrics
router.get('/analytics/social', async (req, res) => {
  try {
    const { email, forceRefresh } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Check cache first (unless forceRefresh is true)
    if (forceRefresh !== 'true') {
      const cachedData = await seoCacheService.getSocialMediaCache(email);
      if (cachedData) {
        console.log('✅ Returning cached Social Media data');
        return res.json(cachedData);
      }
    } else {
      console.log('🔄 Force refresh requested, skipping cache');
    }

    // Cache miss or expired - fetch fresh data
    console.log('📡 Fetching fresh social media data...');
    
    const data = await userAnalyticsService.getSocialMediaMetrics(email);
    
    // Save to cache if data is available (this will update the GA cache table with social metrics)
    if (data.dataAvailable) {
      // Fetch full GA data to merge with social data for caching
      const gaData = await userAnalyticsService.getUserAnalyticsData(email);
      const mergedData = { ...gaData, ...data };
      
      seoCacheService.saveGoogleAnalyticsCache(email, mergedData).catch(err => {
        console.error('⚠️ Failed to save social media cache:', err);
      });
    }
    
    res.json(data);

  } catch (error) {
    console.error('❌ Error fetching social media data:', error);
    res.status(500).json({ error: 'Failed to fetch social media data' });
  }
});

export default router;