import express from 'express';
import competitorIntelligenceService from '../services/competitorIntelligenceService.js';
import geminiService from '../services/geminiService.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Comprehensive competitor analysis
 * POST /api/competitor/analyze
 * Body: { email, yourSite, competitorSite, competitorInstagram, competitorFacebook, forceRefresh }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { 
      email, 
      yourSite, 
      competitorSite,
      competitorInstagram,
      competitorFacebook,
      facebookCompetitorData,
      forceRefresh = false 
    } = req.body;

    if (!email || !yourSite || !competitorSite) {
      return res.status(400).json({
        success: false,
        error: 'email, yourSite, and competitorSite are required'
      });
    }

    console.log(`🔍 Analyzing competitor: ${competitorSite} for ${email}`);

    // Get user ID from email
    const { data: userData } = await supabase
      .from('users_table')
      .select('id')
      .eq('email', email)
      .single();

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userId = userData.id;

    // Get user's social media handles from business settings
    let userInstagram = null;
    let userFacebook = null;
    let userLinkedIn = null;
    
    try {
      const businessInfoResponse = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`);
      if (businessInfoResponse.ok) {
        try {
          const businessData = await businessInfoResponse.json();
          if (businessData.success && businessData.data) {
            userInstagram = businessData.data.instagram_handle || null;
            userFacebook = businessData.data.facebook_handle || null;
            userLinkedIn = businessData.data.linkedin_handle || null;
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse business info JSON:', jsonError);
        }
      }
    } catch (err) {
      console.log('⚠️ Could not fetch user social handles for cache check');
    }

    // Check cache first (unless forceRefresh is true)
    // Cache key includes: domains + all social media handles
    if (!forceRefresh) {
      const { data: cachedData } = await supabase
        .from('competitor_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('user_domain', yourSite)
        .eq('competitor_domain', competitorSite)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedData) {
        // Check if social media handles match
        const cachedUserInstagram = cachedData.user_instagram_handle || null;
        const cachedUserFacebook = cachedData.user_facebook_handle || null;
        const cachedUserLinkedIn = cachedData.user_linkedin_handle || null;
        const cachedCompInstagram = cachedData.competitor_instagram_handle || null;
        const cachedCompFacebook = cachedData.competitor_facebook_handle || null;
        const cachedCompLinkedIn = cachedData.competitor_linkedin_handle || null;

        const socialHandlesMatch = 
          cachedUserInstagram === userInstagram &&
          cachedUserFacebook === userFacebook &&
          cachedUserLinkedIn === userLinkedIn &&
          cachedCompInstagram === competitorInstagram &&
          cachedCompFacebook === competitorFacebook &&
          cachedCompLinkedIn === (competitorLinkedIn ? competitorLinkedIn : null); // Use competitor's LinkedIn from business settings

        if (socialHandlesMatch) {
          console.log(`✅ Cache HIT - Domains and social handles match`);
          let cachedResult;
          try {
            cachedResult = typeof cachedData.full_result === 'string' ? JSON.parse(cachedData.full_result) : cachedData.full_result;
            if (!cachedResult || typeof cachedResult !== 'object') {
              console.error('❌ [CompetitorCache] Invalid cached result format');
              return null;
            }
          } catch (parseError) {
            console.error('❌ [CompetitorCache] Failed to parse cached result:', parseError);
            return null;
          }
          // Ensure cached data has the correct structure
          if (!cachedResult.yourSite || !cachedResult.competitorSite || !cachedResult.comparison) {
            console.log('⚠️ Cached data has old structure, will fetch fresh data');
          } else {
            return res.json({
              success: true,
              cached: true,
              data: cachedResult,
              cachedAt: cachedData.created_at,
              cacheAge: Math.round((Date.now() - new Date(cachedData.created_at).getTime()) / (1000 * 60 * 60))
            });
          }
        } else {
          console.log(`❌ Cache MISS - Social media handles changed`);
          console.log(`   User: IG=${cachedUserInstagram} → ${userInstagram}, FB=${cachedUserFacebook} → ${userFacebook}, LI=${cachedUserLinkedIn} → ${userLinkedIn}`);
          console.log(`   Comp: IG=${cachedCompInstagram} → ${competitorInstagram}, FB=${cachedCompFacebook} → ${competitorFacebook}`);
        }
      }
    }

    // If not cached or forceRefresh, run COMPLETE analysis
    console.log(`📊 Running COMPLETE competitor analysis for ${competitorSite}`);

    // Import the comprehensive competitor service
    const competitorService = (await import('../services/competitorService.js')).default;
    
    // Run the full analysis (SEO, traffic, technical, content, etc.)
    const analysisResult = await competitorService.compareWebsites(yourSite, competitorSite, email);

    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'Analysis failed');
    }

    // Extract the result structure
    const result = {
      yourSite: analysisResult.yourSite,
      competitorSite: analysisResult.competitorSite,
      comparison: analysisResult.comparison,
      timestamp: analysisResult.timestamp
    };

    // Fetch user's Facebook data from business settings
    try {
      console.log(`📘 Fetching user's Facebook data from business settings...`);
      const businessInfoResponse = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`);
      if (businessInfoResponse.ok) {
        try {
          const businessData = await businessInfoResponse.json();
          if (businessData.success && businessData.data?.facebook_handle) {
            const userFbHandle = businessData.data.facebook_handle;
            console.log(`📘 Found user's Facebook handle: ${userFbHandle}`);
            
            const userFbUrl = userFbHandle.startsWith('http') 
              ? userFbHandle 
              : `https://www.facebook.com/${userFbHandle}`;
            
            const userFbResult = await competitorIntelligenceService.getFacebookCompetitorMetrics(userFbUrl);
            if (userFbResult.success) {
              result.yourSite.facebook = {
                profile: {
                  name: userFbResult.data.name,
                  url: userFbResult.data.url,
                  image: userFbResult.data.image,
                  likes: userFbResult.data.likes,
                  avgEngagementRate: userFbResult.data.engagementRate / 100,
                  category: userFbResult.data.category,
                  rating: userFbResult.data.rating,
                  description: userFbResult.data.description,
                  website: userFbResult.data.website
                },
                metrics: {
                  followers: userFbResult.data.followers,
                  talkingAbout: userFbResult.data.talkingAbout
                },
                engagement: {
                  summary: {
                    avgReactionsPerPost: userFbResult.data.avgReactions,
                    avgCommentsPerPost: userFbResult.data.avgComments,
                    avgSharesPerPost: userFbResult.data.avgShares,
                    avgPostReach: userFbResult.data.avgPostReach
                  }
                },
                lastUpdated: userFbResult.data.lastUpdated
              };
              console.log(`✅ User's Facebook data added: ${userFbResult.data.name}`);
            }
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse business info JSON for Facebook:', jsonError);
        }
      }
    } catch (userFbError) {
      console.error('⚠️ Failed to fetch user Facebook data:', userFbError.message);
    }

    // Add competitor Facebook data if provided (overlay on top of existing data)
    if (competitorFacebook || facebookCompetitorData) {
      try {
        let fbData;
        if (facebookCompetitorData) {
          fbData = facebookCompetitorData;
        } else {
          const fbUrl = competitorFacebook.startsWith('http') 
            ? competitorFacebook 
            : `https://www.facebook.com/${competitorFacebook}`;
          
          const fbResult = await competitorIntelligenceService.getFacebookCompetitorMetrics(fbUrl);
          if (fbResult.success) {
            fbData = fbResult.data;
          }
        }

        if (fbData) {
          // Transform flat structure to nested structure expected by frontend
          result.competitorSite.facebook = {
            profile: {
              name: fbData.name,
              url: fbData.url,
              image: fbData.image,
              likes: fbData.likes,
              avgEngagementRate: fbData.engagementRate / 100, // Convert to decimal
              category: fbData.category,
              rating: fbData.rating,
              description: fbData.description,
              website: fbData.website
            },
            metrics: {
              followers: fbData.followers,
              talkingAbout: fbData.talkingAbout
            },
            engagement: {
              summary: {
                avgReactionsPerPost: fbData.avgReactions,
                avgCommentsPerPost: fbData.avgComments,
                avgSharesPerPost: fbData.avgShares,
                avgPostReach: fbData.avgPostReach
              }
            },
            lastUpdated: fbData.lastUpdated
          };
        }
      } catch (fbError) {
        console.error('⚠️ Failed to fetch Facebook data:', fbError.message);
      }
    }

    // Fetch user's Instagram data from business settings
    try {
      console.log(`📸 Fetching user's Instagram data from business settings...`);
      const businessInfoResponse = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`);
      if (businessInfoResponse.ok) {
        try {
          const businessData = await businessInfoResponse.json();
          if (businessData.success && businessData.data?.instagram_handle) {
            const userIgHandle = businessData.data.instagram_handle;
            console.log(`📸 Found user's Instagram handle: ${userIgHandle}`);
            
            const instagramEngagementService = (await import('../services/instagramEngagementService.js')).default;
            const userIgData = await instagramEngagementService.getCompleteEngagementMetrics(userIgHandle);
            
            if (userIgData.success) {
              result.yourSite.instagram = userIgData;
              console.log(`✅ User's Instagram data added: @${userIgData.profile.username}`);
            }
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse business info JSON for Instagram:', jsonError);
        }
      }
    } catch (userIgError) {
      console.error('⚠️ Failed to fetch user Instagram data:', userIgError.message);
    }

    // Add competitor Instagram data if provided
    if (competitorInstagram) {
      try {
        console.log(`📸 Competitor Instagram handle provided: ${competitorInstagram}`);
        const instagramEngagementService = (await import('../services/instagramEngagementService.js')).default;
        const compIgData = await instagramEngagementService.getCompleteEngagementMetrics(competitorInstagram);
        
        if (compIgData.success) {
          result.competitorSite.instagram = compIgData;
          console.log(`✅ Competitor's Instagram data added: @${compIgData.profile.username}`);
        }
      } catch (igError) {
        console.error('⚠️ Failed to fetch competitor Instagram data:', igError.message);
      }
    }

    // Fetch user's LinkedIn data from business settings using Apify
    try {
      console.log(`💼 Fetching user's LinkedIn data from business settings...`);
      const businessInfoResponse = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`);
      if (businessInfoResponse.ok) {
        try {
          const businessData = await businessInfoResponse.json();
          if (businessData.success && businessData.data?.linkedin_handle) {
            const userLinkedInHandle = businessData.data.linkedin_handle;
            console.log(`💼 Found user's LinkedIn handle: ${userLinkedInHandle}`);
            
            const linkedinScraperService = (await import('../services/linkedinScraperService.js')).default;
            const linkedInUrl = userLinkedInHandle.startsWith('http') 
              ? userLinkedInHandle 
              : `https://www.linkedin.com/company/${userLinkedInHandle}`;
            
            const userLinkedInData = await linkedinScraperService.scrapeCompanyPosts(linkedInUrl, 20);
            
            if (userLinkedInData.dataAvailable) {
              result.yourSite.linkedin = userLinkedInData;
              console.log(`✅ User's LinkedIn data added: ${userLinkedInData.companyName}`);
            }
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse business info JSON for LinkedIn:', jsonError);
        }
      }
    } catch (userLinkedInError) {
      console.error('⚠️ Failed to fetch user LinkedIn data:', userLinkedInError.message);
    }

    // Fetch competitor's LinkedIn data from business settings using Apify
    try {
      const businessInfoResponse = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`);
      if (businessInfoResponse.ok) {
        try {
          const businessData = await businessInfoResponse.json();
          if (businessData.success && businessData.data?.competitors && Array.isArray(businessData.data.competitors)) {
            const competitor = businessData.data.competitors.find(c => c.domain === competitorSite);
            if (competitor?.linkedin) {
              console.log(`💼 Found competitor's LinkedIn handle: ${competitor.linkedin}`);
              
              const linkedinScraperService = (await import('../services/linkedinScraperService.js')).default;
              const linkedInUrl = competitor.linkedin.startsWith('http') 
                ? competitor.linkedin 
                : `https://www.linkedin.com/company/${competitor.linkedin}`;
              
              const compLinkedInData = await linkedinScraperService.scrapeCompanyPosts(linkedInUrl, 20);
              
              if (compLinkedInData.dataAvailable) {
                result.competitorSite.linkedin = compLinkedInData;
                console.log(`✅ Competitor's LinkedIn data added: ${compLinkedInData.companyName}`);
              }
            }
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse business info JSON for competitor LinkedIn:', jsonError);
        }
      }
    } catch (compLinkedInError) {
      console.error('⚠️ Failed to fetch competitor LinkedIn data:', compLinkedInError.message);
    }

    // Fetch Google Ads data for both sites
    try {
      console.log(`📢 Fetching Google Ads data for both sites...`);
      const { getGoogleAdsMonitoring } = await import('../services/googleAdsMonitoringService.js');
      
      const [yourGoogleAds, compGoogleAds] = await Promise.all([
        getGoogleAdsMonitoring(yourSite),
        getGoogleAdsMonitoring(competitorSite)
      ]);
      
      if (!yourGoogleAds.error) {
        result.yourSite.googleAds = yourGoogleAds;
        console.log(`✅ Your Google Ads data added: ${yourGoogleAds.totalAds} ads`);
      }
      
      if (!compGoogleAds.error) {
        result.competitorSite.googleAds = compGoogleAds;
        console.log(`✅ Competitor's Google Ads data added: ${compGoogleAds.totalAds} ads`);
      }
    } catch (googleAdsError) {
      console.error('⚠️ Failed to fetch Google Ads data:', googleAdsError.message);
    }

    // Fetch Meta Ads data for both sites (if Facebook handles available)
    try {
      console.log(`📘 Fetching Meta Ads data for both sites...`);
      const { getMetaAdsMonitoring } = await import('../services/metaAdsMonitoringService.js');
      
      const businessInfoResponse = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`);
      if (businessInfoResponse.ok) {
        try {
          const businessData = await businessInfoResponse.json();
          if (businessData.success && businessData.data?.facebook_handle) {
            const yourMetaAds = await getMetaAdsMonitoring(businessData.data.facebook_handle);
            if (!yourMetaAds.error) {
              result.yourSite.metaAds = yourMetaAds;
              console.log(`✅ Your Meta Ads data added: ${yourMetaAds.totalAds} ads`);
            }
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse business info JSON for Meta Ads:', jsonError);
        }
      }
        
      if (competitorFacebook) {
        const compMetaAds = await getMetaAdsMonitoring(competitorFacebook);
        if (!compMetaAds.error) {
          result.competitorSite.metaAds = compMetaAds;
          console.log(`✅ Competitor's Meta Ads data added: ${compMetaAds.totalAds} ads`);
        }
      }
    } catch (metaAdsError) {
      console.error('⚠️ Failed to fetch Meta Ads data:', metaAdsError.message);
    }

    console.log(`✅ COMPLETE analysis finished for ${competitorSite}`);

    // Get competitor's LinkedIn handle from business settings
    let competitorLinkedIn = null;
    try {
      const businessInfoResponse = await fetch(`http://localhost:3010/api/business-info?email=${encodeURIComponent(email)}`);
      if (businessInfoResponse.ok) {
        try {
          const businessData = await businessInfoResponse.json();
          if (businessData.success && businessData.data?.competitors && Array.isArray(businessData.data.competitors)) {
            const competitor = businessData.data.competitors.find(c => c.domain === competitorSite);
            competitorLinkedIn = competitor?.linkedin || null;
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse business info JSON for cache LinkedIn:', jsonError);
        }
      }
    } catch (err) {
      console.log('⚠️ Could not fetch competitor LinkedIn handle for cache');
    }

    // Store in cache with social media handles as part of the cache key
    const cacheData = {
      user_id: userId,
      user_domain: yourSite,
      competitor_domain: competitorSite,
      user_instagram_handle: userInstagram,
      user_facebook_handle: userFacebook,
      user_linkedin_handle: userLinkedIn,
      competitor_instagram_handle: competitorInstagram || null,
      competitor_facebook_handle: competitorFacebook || null,
      competitor_linkedin_handle: competitorLinkedIn,
      facebook_data: result.competitorSite.facebook || null,
      instagram_data: result.competitorSite.instagram || null,
      full_result: result,
      analysis_status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    await supabase
      .from('competitor_cache')
      .upsert(cacheData, {
        onConflict: 'user_id,user_domain,competitor_domain'
      });

    console.log(`✅ Analysis complete for ${competitorSite}`);

    res.json({
      success: true,
      cached: false,
      data: result
    });

  } catch (error) {
    console.error('❌ Error in analyze route:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get competitor metrics for a single Facebook page
 * GET /api/competitor/facebook?url=https://www.facebook.com/page
 */
router.get('/facebook', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Facebook page URL is required'
      });
    }

    console.log(`🔍 Fetching competitor metrics for: ${url}`);

    const result = await competitorIntelligenceService.getFacebookCompetitorMetrics(url);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('❌ Error in competitor route:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Compare multiple competitors
 * POST /api/competitor/compare
 * Body: { urls: ['url1', 'url2', ...] }
 */
router.post('/compare', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array of Facebook page URLs is required'
      });
    }

    console.log(`📊 Comparing ${urls.length} competitors`);

    const result = await competitorIntelligenceService.compareCompetitors(urls);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('❌ Error in compare route:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate AI-powered insights from competitor analysis
 * POST /api/competitor/ai-insights
 * Body: { yourSite, competitorSite, comparison }
 */
router.post('/ai-insights', async (req, res) => {
  try {
    const { yourSite, competitorSite, comparison } = req.body;

    if (!yourSite || !competitorSite) {
      return res.status(400).json({
        success: false,
        error: 'yourSite and competitorSite data are required'
      });
    }

    console.log(`🧠 Generating AI insights for ${yourSite.domain || 'your site'} vs ${competitorSite.domain || 'competitor'}`);

    // Generate AI recommendations using Gemini
    const recommendations = await geminiService.generateRecommendations(
      yourSite,
      competitorSite,
      comparison || {}
    );

    console.log(`✅ Generated ${recommendations.length} AI recommendations`);

    res.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI insights'
    });
  }
});

export default router;
