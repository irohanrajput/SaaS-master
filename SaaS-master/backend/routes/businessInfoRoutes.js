import express from 'express';
import userBusinessInfoService from '../services/userBusinessInfoService.js';
import oauthTokenService from '../services/oauthTokenService.js';
import { google } from 'googleapis';

const router = express.Router();

/**
 * GET /api/business-info
 * Get user's business information with GA/GSC connection status
 */
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    console.log(`📊 Fetching business info for: ${email}`);

    const businessInfo = await userBusinessInfoService.getUserBusinessInfo(email);

    // Check GA/GSC connection status
    let gaGscConnected = false;
    try {
      const oauth2Client = await oauthTokenService.getOAuthClient(email);
      gaGscConnected = oauth2Client !== null;
    } catch (err) {
      console.log('⚠️ Could not check GA/GSC connection status');
    }

    if (!businessInfo) {
      return res.json({
        success: true,
        data: null,
        setup_completed: false,
        ga_gsc_connected: gaGscConnected
      });
    }

    res.json({
      success: true,
      data: businessInfo,
      setup_completed: businessInfo.setup_completed,
      ga_gsc_connected: gaGscConnected
    });
  } catch (error) {
    console.error('❌ Error in GET /api/business-info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/business-info
 * Create or update user's business information
 */
router.post('/', async (req, res) => {
  try {
    const { email, ...businessInfo } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // business_domain is now optional - it can come from GSC sync
    // if (!businessInfo.business_domain) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Business domain is required'
    //   });
    // }

    console.log(`💾 Saving business info for: ${email}`);

    const result = await userBusinessInfoService.upsertBusinessInfo(email, businessInfo);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in POST /api/business-info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/business-info/competitors
 * Get all competitors for a user
 */
router.get('/competitors', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    console.log(`📊 Fetching competitors for: ${email}`);

    const competitors = await userBusinessInfoService.getCompetitors(email);

    res.json({
      success: true,
      data: competitors,
      count: competitors.length
    });
  } catch (error) {
    console.error('❌ Error in GET /api/business-info/competitors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/business-info/competitors
 * Add a new competitor
 */
router.post('/competitors', async (req, res) => {
  try {
    const { email, competitor } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!competitor || !competitor.domain) {
      return res.status(400).json({
        success: false,
        error: 'Competitor domain is required'
      });
    }

    console.log(`➕ Adding competitor for: ${email}`);

    const result = await userBusinessInfoService.addCompetitor(email, competitor);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in POST /api/business-info/competitors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/business-info/competitors
 * Update all competitors
 */
router.put('/competitors', async (req, res) => {
  try {
    const { email, competitors } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!Array.isArray(competitors)) {
      return res.status(400).json({
        success: false,
        error: 'Competitors must be an array'
      });
    }

    console.log(`🔄 Updating competitors for: ${email}`);

    const result = await userBusinessInfoService.updateCompetitors(email, competitors);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/business-info/competitors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/business-info/competitors/:competitorId
 * Remove a competitor
 */
router.delete('/competitors/:competitorId', async (req, res) => {
  try {
    const { email } = req.query;
    const { competitorId } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    console.log(`🗑️  Removing competitor ${competitorId} for: ${email}`);

    const result = await userBusinessInfoService.removeCompetitor(email, competitorId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/business-info/competitors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/business-info/setup-status
 * Check if user has completed business setup
 */
router.get('/setup-status', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    const isCompleted = await userBusinessInfoService.isSetupCompleted(email);

    res.json({
      success: true,
      setup_completed: isCompleted
    });
  } catch (error) {
    console.error('❌ Error in GET /api/business-info/setup-status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/business-info/complete-setup
 * Mark business setup as completed
 */
router.post('/complete-setup', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log(`✅ Completing setup for: ${email}`);

    const result = await userBusinessInfoService.markSetupCompleted(email);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in POST /api/business-info/complete-setup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/business-info/sync-domain-from-gsc
 * Fetch domain from Google Search Console and update business info
 */
router.post('/sync-domain-from-gsc', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log(`🔄 Syncing domain from GSC for: ${email}`);

    // Check if user has GA/GSC connected
    const oauth2Client = await oauthTokenService.getOAuthClient(email);
    
    if (!oauth2Client) {
      return res.status(400).json({
        success: false,
        error: 'Google Analytics/Search Console not connected. Please connect first.'
      });
    }

    // Fetch sites from Search Console
    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    const sitesResponse = await searchConsole.sites.list();
    const sites = sitesResponse.data.siteEntry || [];

    if (sites.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No sites found in Google Search Console. Please add your site to GSC first.',
        help: 'Visit https://search.google.com/search-console to add your site'
      });
    }

    // Get the first site (user can have multiple, we take the first one)
    let domain = sites[0].siteUrl;
    
    // Clean domain
    domain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^sc-domain:/, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('/')[0];

    console.log(`✅ Domain found in GSC: ${domain}`);

    // Get existing business info or create new
    let businessInfo = await userBusinessInfoService.getUserBusinessInfo(email);
    
    const businessData = {
      business_domain: domain,
      business_name: businessInfo?.business_name || null,
      business_description: businessInfo?.business_description || null,
      business_industry: businessInfo?.business_industry || null,
      facebook_handle: businessInfo?.facebook_handle || null,
      instagram_handle: businessInfo?.instagram_handle || null,
      linkedin_handle: businessInfo?.linkedin_handle || null,
      twitter_handle: businessInfo?.twitter_handle || null,
      youtube_handle: businessInfo?.youtube_handle || null,
      tiktok_handle: businessInfo?.tiktok_handle || null
    };

    // Update or create business info with the domain from GSC
    const result = await userBusinessInfoService.upsertBusinessInfo(email, businessData);

    res.json({
      success: true,
      data: result,
      message: 'Domain successfully synced from Google Search Console',
      domain: domain
    });

  } catch (error) {
    console.error('❌ Error in POST /api/business-info/sync-domain-from-gsc:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
