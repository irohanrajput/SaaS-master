import express from 'express';
import { google } from 'googleapis';
import lighthouseService from '../services/lighthouseService.js';
import gscBacklinksScraper from '../services/gscBacklinksScraper.js';
import seoCacheService from '../services/seoCacheService.js';
import seRankingService from '../services/seRankingService.js';
import oauthTokenService from '../services/oauthTokenService.js';

const router = express.Router();

// Get user's Search Console data
router.get('/search-console/data', async (req, res) => {
  try {
    const { email, forceRefresh } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email parameter is required',
        dataAvailable: false,
        reason: 'Missing email parameter'
      });
    }

    console.log(`📊 Fetching Search Console data for: ${email}`);

    // Check cache first (unless forceRefresh is true)
    if (forceRefresh !== 'true') {
      const cachedData = await seoCacheService.getSearchConsoleCache(email);
      if (cachedData) {
        console.log('✅ Returning cached Search Console data (SE Ranking API NOT called)');
        console.log('💡 To test SE Ranking API, click "Refresh Analysis" button on frontend');
        return res.json(cachedData);
      }
    } else {
      console.log('🔄 Force refresh requested, skipping cache');
      console.log('🔗 SE Ranking API will be called for fresh backlinks data');
    }

    // Cache miss or expired - fetch fresh data
    console.log('📡 Fetching fresh data from Google Search Console...');

    // Get OAuth client with auto-refresh from oauthTokenService
    const oauth2Client = await oauthTokenService.getOAuthClient(email);
    
    if (!oauth2Client) {
      console.log('❌ User not authenticated or token refresh failed');
      return res.json({
        dataAvailable: false,
        reason: 'Authentication token expired. Please reconnect your Google account.',
        needsReconnect: true,
        connected: false
      });
    }

    console.log('✅ OAuth client ready');

    // Get Search Console service
    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    // List all sites the user has access to
    let sites;
    try {
      const sitesResponse = await searchConsole.sites.list();
      sites = sitesResponse.data.siteEntry || [];
      console.log(`✅ Found ${sites.length} sites in Search Console`);
    } catch (error) {
      console.error('❌ Error fetching sites:', error.message);
      
      // Check if it's an auth error
      if (error.message?.includes('invalid_grant') || error.message?.includes('expired')) {
        console.log('🔄 Token expired, attempting refresh...');
        const refreshed = await oauthTokenService.refreshTokens(email);
        if (!refreshed) {
          return res.json({
            dataAvailable: false,
            reason: 'Authentication token expired. Please reconnect your Google account.',
            needsReconnect: true,
            connected: false
          });
        }
        // Retry after refresh
        return res.redirect(`/api/search-console/data?email=${email}&forceRefresh=${forceRefresh}`);
      }
      
      // Check if it's a permission issue
      if (error.code === 403 || error.message.includes('insufficient')) {
        return res.json({
          dataAvailable: false,
          reason: 'Search Console permission not granted. Please reconnect your account with Search Console access.',
          needsReconnect: true,
          connected: false
        });
      }
      
      return res.json({
        dataAvailable: false,
        reason: 'Unable to access Search Console. Please ensure you have Search Console set up and try reconnecting.',
        needsReconnect: true,
        connected: false
      });
    }

    if (sites.length === 0) {
      return res.json({
        dataAvailable: false,
        reason: 'No sites found in Google Search Console. Please add and verify a site first at https://search.google.com/search-console'
      });
    }

    // Use the first site (or you can modify to select a specific one)
    const siteUrl = sites[0].siteUrl;
    console.log(`📍 Using site: ${siteUrl}`);

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    // Get search analytics data
    let analyticsResponse;
    try {
      analyticsResponse = await searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['query'],
          rowLimit: 100,
          dataState: 'all' // Use 'all' instead of 'final' for more recent data
        }
      });
    } catch (error) {
      console.error('❌ Error fetching search analytics:', error.message);
      return res.json({
        dataAvailable: false,
        reason: 'Unable to fetch search analytics data. The site may not have enough data yet.'
      });
    }

    // Get page analytics data (top pages)
    let pageAnalyticsResponse;
    try {
      pageAnalyticsResponse = await searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['page'],
          rowLimit: 100,
          dataState: 'all'
        }
      });
    } catch (error) {
      console.error('⚠️ Error fetching page analytics:', error.message);
      pageAnalyticsResponse = { data: { rows: [] } };
    }

    // Get daily analytics data for graph
    let dailyAnalyticsResponse;
    try {
      dailyAnalyticsResponse = await searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['date'],
          dataState: 'all'
        }
      });
    } catch (error) {
      console.error('⚠️ Error fetching daily analytics:', error.message);
      dailyAnalyticsResponse = { data: { rows: [] } };
    }

    const rows = analyticsResponse.data.rows || [];
    const pageRows = pageAnalyticsResponse.data.rows || [];
    const dailyRows = dailyAnalyticsResponse.data.rows || [];
    console.log(`📈 Retrieved ${rows.length} query rows, ${pageRows.length} page rows, ${dailyRows.length} daily rows`);

    if (rows.length === 0) {
      return res.json({
        dataAvailable: false,
        reason: 'No search data available for this site in the last 30 days. The site may be new or not indexed yet.',
        siteUrl
      });
    }

    // Calculate aggregated metrics
    const totalClicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
    const totalImpressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
    const averageCTR = rows.length > 0 
      ? rows.reduce((sum, row) => sum + (row.ctr || 0), 0) / rows.length 
      : 0;
    const averagePosition = rows.length > 0 
      ? rows.reduce((sum, row) => sum + (row.position || 0), 0) / rows.length 
      : 0;

    // Calculate organic traffic (total clicks from all pages)
    const organicTraffic = pageRows.reduce((sum, row) => sum + (row.clicks || 0), 0);

    // Get top queries
    const topQueries = rows
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(row => ({
        query: row.keys?.[0] || 'Unknown',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    // Get top pages
    const topPages = pageRows
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(row => ({
        page: row.keys?.[0] || 'Unknown',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    // Get daily data for graph
    const dailyData = dailyRows
      .sort((a, b) => (a.keys?.[0] || '').localeCompare(b.keys?.[0] || ''))
      .map(row => ({
        date: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));

    // Get backlinks data from SE Ranking API
    let backlinksResult = {
      available: false,
      topLinkingSites: [],
      topLinkingPages: [],
      totalBacklinks: 0,
      note: '',
      source: 'SE Ranking'
    };

    // Extract clean domain from siteUrl for backlinks analysis
    let domain = siteUrl;
    
    // Handle different GSC URL formats
    if (domain.startsWith('sc-domain:')) {
      // Domain property format: sc-domain:example.com -> example.com
      domain = domain.replace('sc-domain:', '');
      console.log(`� Extracted domain from sc-domain format: ${domain}`);
    } else {
      // URL prefix format: https://example.com/ -> example.com
      domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      console.log(`📍 Extracted domain from URL format: ${domain}`);
    }

    // Check SE Ranking cache first
    const cachedBacklinks = await seoCacheService.getSERankingCache(email, domain);
    
    if (cachedBacklinks && forceRefresh !== 'true') {
      console.log('✅ Using cached SE Ranking backlinks data');
      backlinksResult = cachedBacklinks;
    } else {
      if (forceRefresh === 'true') {
        console.log('🔄 Force refresh: Fetching fresh SE Ranking data');
      }
      
      try {
        console.log('🔗 Fetching backlinks data from SE Ranking API...');
        
        // Fetch backlinks data from SE Ranking
        const seRankingData = await seRankingService.getBacklinksSummary(domain);
        
        if (seRankingData && seRankingData.available) {
          backlinksResult.available = true;
          backlinksResult.topLinkingSites = seRankingData.topLinkingSites || [];
          backlinksResult.topLinkingPages = seRankingData.topLinkingPages || [];
          backlinksResult.totalBacklinks = seRankingData.totalBacklinks || 0;
          backlinksResult.totalRefDomains = seRankingData.totalRefDomains || 0;
          backlinksResult.metrics = seRankingData.metrics;
          backlinksResult.domainMetrics = seRankingData.domainMetrics;
          backlinksResult.topAnchors = seRankingData.topAnchors;
          backlinksResult.topTlds = seRankingData.topTlds;
          backlinksResult.topCountries = seRankingData.topCountries;
          backlinksResult.note = `Data from SE Ranking API - ${seRankingData.totalBacklinks.toLocaleString()} backlinks from ${seRankingData.totalRefDomains.toLocaleString()} domains`;
          console.log(`✅ SE Ranking: ${backlinksResult.totalBacklinks} backlinks from ${backlinksResult.totalRefDomains} domains`);
          
          // Cache the successful response (24 hours)
          await seoCacheService.saveSERankingCache(email, domain, backlinksResult, 24);
        } else {
          backlinksResult.note = seRankingData?.reason || 'Backlink data not available from SE Ranking API';
          console.log('⚠️ SE Ranking API returned no data');
        }
      } catch (err) {
        console.log('⚠️ SE Ranking API failed:', err.message);
        backlinksResult.note = `SE Ranking API error: ${err.message}`;
        
        // Try to use expired cache as fallback
        const expiredCache = await seoCacheService.getSERankingCache(email, domain, true);
        if (expiredCache) {
          console.log('📦 Using expired SE Ranking cache as fallback');
          backlinksResult = expiredCache;
          backlinksResult.note = `${backlinksResult.note} (Using cached data due to API error)`;
        }
      }
    }

    console.log('✅ Search Console data retrieved successfully');
    console.log(`📊 Stats: ${totalClicks} clicks, ${totalImpressions} impressions, ${organicTraffic} organic traffic`);

    // Domain already extracted above for backlinks
    console.log(`🔦 Fetching Lighthouse data for domain: ${domain}`);
    
    // Try to get cached Lighthouse data first (separate from Search Console cache)
    let lighthouseData = null;
    const cachedLighthouse = await seoCacheService.getLighthouseCache(email, domain);
    
    if (cachedLighthouse && forceRefresh !== 'true') {
      console.log('✅ Using cached Lighthouse data');
      lighthouseData = cachedLighthouse;
    } else {
      // Fetch fresh Lighthouse data
      try {
        console.log('📞 Calling lighthouseService.analyzeSite...');
        lighthouseData = await lighthouseService.analyzeSite(domain);
        console.log('📬 Received response from lighthouseService:', lighthouseData ? 'DATA' : 'NULL');
        if (lighthouseData) {
          console.log(`✅ Lighthouse: Performance ${lighthouseData.categoryScores.performance}%`);
          // Save Lighthouse data to separate cache
          await seoCacheService.saveLighthouseCache(email, domain, lighthouseData).catch(err => {
            console.error('⚠️ Failed to cache Lighthouse data:', err);
          });
        } else {
          console.log(`⚠️ Lighthouse data not available, trying to use old cache if exists`);
          // If fresh fetch fails, try to use old cached data even if expired
          const oldCache = await seoCacheService.getLighthouseCache(email, domain, true);
          if (oldCache) {
            console.log('🔄 Using expired Lighthouse cache as fallback');
            lighthouseData = oldCache;
          }
        }
      } catch (lighthouseError) {
        console.error('❌ Lighthouse fetch failed:', lighthouseError.message);
        console.error('❌ Error stack:', lighthouseError.stack);
        // Try to use old cached data as fallback
        const oldCache = await seoCacheService.getLighthouseCache(email, domain, true);
        if (oldCache) {
          console.log('🔄 Using expired Lighthouse cache as fallback after error');
          lighthouseData = oldCache;
        }
      }
    }

    // Prepare response data
    const responseData = {
      dataAvailable: true,
      totalClicks,
      totalImpressions,
      averageCTR,
      averagePosition,
      organicTraffic,
      topQueries,
      topPages,
      dailyData,
      lighthouse: lighthouseData, // Add Lighthouse data
      backlinks: {
        available: backlinksResult.available,
        topLinkingSites: backlinksResult.topLinkingSites,
        topLinkingPages: backlinksResult.topLinkingPages,
        totalBacklinks: backlinksResult.totalBacklinks || 0,
        note: backlinksResult.note || '',
        requiresSetup: backlinksResult.requiresSetup || false,
        sessionExpired: backlinksResult.sessionExpired || false
      },
      siteUrl,
      domain, // Add domain info
      dateRange: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      },
      lastUpdated: new Date().toISOString()
    };

    // Save to cache asynchronously (don't wait for it)
    seoCacheService.saveSearchConsoleCache(email, responseData).catch(err => {
      console.error('⚠️ Failed to save cache:', err);
    });

    res.json(responseData);

  } catch (error) {
    console.error('❌ Error fetching Search Console data:', error);
    
    // Handle specific error cases
    if (error.code === 403) {
      return res.json({
        dataAvailable: false,
        reason: 'Access denied. Please ensure you have granted Search Console permissions and try reconnecting.'
      });
    }
    
    if (error.code === 401) {
      return res.json({
        dataAvailable: false,
        reason: 'Authentication failed. Please reconnect your Google account.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch Search Console data',
      dataAvailable: false,
      reason: error.message || 'An unexpected error occurred'
    });
  }
});

// Get list of sites in Search Console
router.get('/search-console/sites', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Get OAuth client with auto-refresh
    const oauth2Client = await oauthTokenService.getOAuthClient(email);
    
    if (!oauth2Client) {
      return res.json({
        sites: [],
        message: 'Google account not connected',
        needsReconnect: true
      });
    }

    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    const sitesResponse = await searchConsole.sites.list();
    const sites = sitesResponse.data.siteEntry || [];

    res.json({
      sites: sites.map(site => ({
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching sites:', error);
    
    // Check for auth errors
    if (error.message?.includes('invalid_grant') || error.message?.includes('expired')) {
      return res.json({
        sites: [],
        message: 'Authentication expired. Please reconnect.',
        needsReconnect: true
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch sites',
      sites: []
    });
  }
});

// Get backlinks data
router.get('/search-console/backlinks', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Get OAuth client with auto-refresh
    const oauth2Client = await oauthTokenService.getOAuthClient(email);
    
    if (!oauth2Client) {
      return res.json({
        dataAvailable: false,
        message: 'Google account not connected',
        needsReconnect: true
      });
    }

    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    // Get sites list
    const sitesResponse = await searchConsole.sites.list();
    const sites = sitesResponse.data.siteEntry || [];
    
    if (sites.length === 0) {
      return res.json({
        dataAvailable: false,
        message: 'No sites found in Search Console'
      });
    }

    const siteUrl = sites[0].siteUrl;

    // Note: Google Search Console API v1 has very limited backlink support
    // Backlink data is primarily available through the Search Console UI
    // For comprehensive backlink analysis, third-party tools are recommended
    
    res.json({
      dataAvailable: false,
      siteUrl: siteUrl,
      message: 'Backlink data is limited in Google Search Console API',
      note: 'GSC API v1 does not provide detailed backlink data. You can view backlinks in the Search Console UI at https://search.google.com/search-console under "Links" section.',
      recommendation: 'For comprehensive backlink analysis, consider using: Ahrefs, Moz, Semrush, or Majestic',
      topLinkingSites: [],
      topLinkingPages: []
    });

  } catch (error) {
    console.error('❌ Error fetching backlinks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch backlinks data',
      dataAvailable: false
    });
  }
});

// NEW: Setup backlinks scraper with interactive login (first-time only)
router.post('/search-console/setup-backlinks-scraper', async (req, res) => {
  try {
    const { email, domain } = req.body;
    
    if (!email || !domain) {
      return res.status(400).json({ 
        error: 'Email and domain are required',
        success: false
      });
    }

    console.log(`🔧 Setting up backlinks scraper for: ${email}, domain: ${domain}`);

    // Launch Puppeteer with interactive login (non-headless)
    const result = await gscBacklinksScraper.scrapeBacklinksWithSession(email, domain, true);

    res.json({
      success: result.dataAvailable,
      message: result.dataAvailable 
        ? 'Backlinks scraper setup successfully! Future requests will use the saved session.'
        : 'Setup completed but no backlinks data found. Session is saved for future use.',
      data: result
    });

  } catch (error) {
    console.error('❌ Error setting up backlinks scraper:', error);
    res.status(500).json({ 
      error: 'Failed to setup backlinks scraper',
      success: false,
      message: error.message
    });
  }
});

export default router;
