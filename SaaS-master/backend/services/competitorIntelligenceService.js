import axios from 'axios';

/**
 * Competitor Intelligence Service
 * Fetches and analyzes competitor social media metrics
 */
class CompetitorIntelligenceService {
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.rapidApiHost = 'facebook-pages-scraper2.p.rapidapi.com';
  }

  /**
   * Get Facebook page metrics for competitor analysis
   * @param {string} pageUrl - Facebook page URL
   * @returns {Object} Competitor metrics
   */
  async getFacebookCompetitorMetrics(pageUrl) {
    try {
      console.log(`🔍 Analyzing competitor: ${pageUrl}`);

      const options = {
        method: 'GET',
        url: `https://${this.rapidApiHost}/get_facebook_pages_details`,
        params: {
          link: pageUrl,
          show_verified_badge: 'false'
        },
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost
        }
      };

      const response = await axios.request(options);

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const pageData = response.data[0];
        
        // Validate pageData has required properties
        if (!pageData || typeof pageData !== 'object') {
          return {
            success: false,
            error: 'Invalid page data received from API'
          };
        }
        
        // Calculate engagement metrics based on page data
        const followers = pageData.followers_count || 0;
        const likes = pageData.likes_count || 0;
        
        // Estimate engagement metrics based on industry averages
        // Facebook average engagement rate is ~0.08% (source: Hootsuite 2024)
        const avgEngagementRate = 0.08;
        const estimatedPostReach = Math.round(followers * 0.05); // ~5% organic reach
        
        // Estimate reactions, comments, shares based on engagement rate
        const totalEngagementPerPost = Math.round(followers * (avgEngagementRate / 100));
        const estimatedReactions = Math.round(totalEngagementPerPost * 0.70); // 70% reactions
        const estimatedComments = Math.round(totalEngagementPerPost * 0.20); // 20% comments
        const estimatedShares = Math.round(totalEngagementPerPost * 0.10); // 10% shares
        
        // Calculate actual engagement rate from likes/followers ratio
        const engagementRate = followers > 0 
          ? ((likes / followers) * 100).toFixed(2)
          : avgEngagementRate.toFixed(2);

        console.log(`✅ Competitor analyzed: ${pageData.title}`);
        console.log(`   Followers: ${pageData.followers_display}`);
        console.log(`   Likes: ${pageData.likes_display}`);
        console.log(`   Engagement Rate: ${engagementRate}%`);
        console.log(`   Estimated Avg Reactions: ${estimatedReactions}`);
        console.log(`   Estimated Avg Comments: ${estimatedComments}`);
        console.log(`   Estimated Avg Shares: ${estimatedShares}`);

        return {
          success: true,
          platform: 'facebook',
          data: {
            name: pageData.title,
            url: pageData.url || pageUrl,
            image: pageData.image,
            followers: followers,
            followersDisplay: pageData.followers_display || '0',
            likes: likes,
            likesDisplay: pageData.likes_display || '0',
            totalEngagement: likes + followers,
            engagementRate: parseFloat(engagementRate),
            // Estimated post-level metrics
            avgReactions: estimatedReactions,
            avgComments: estimatedComments,
            avgShares: estimatedShares,
            avgPostReach: estimatedPostReach,
            // Additional data
            category: pageData.category || [],
            rating: pageData.rating || null,
            description: pageData.description || null,
            website: pageData.website || null,
            creationDate: pageData.creation_date || null,
            talkingAbout: pageData.followers_count || 0, // People talking about this
            lastUpdated: new Date().toISOString(),
            dataSource: 'rapidapi',
            note: 'Post-level metrics are estimated based on page followers and industry averages'
          }
        };
      }

      return {
        success: false,
        error: 'No data returned from API'
      };
    } catch (error) {
      console.error('❌ Error analyzing competitor:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Compare multiple competitors
   * @param {Array<string>} pageUrls - Array of Facebook page URLs
   * @returns {Object} Comparison data
   */
  async compareCompetitors(pageUrls) {
    try {
      // Validate input
      if (!Array.isArray(pageUrls) || pageUrls.length === 0) {
        return {
          success: false,
          error: 'Invalid page URLs array provided'
        };
      }
      
      console.log(`📊 Comparing ${pageUrls.length} competitors...`);

      const results = await Promise.all(
        pageUrls.map(url => this.getFacebookCompetitorMetrics(url))
      );

      const successfulResults = results.filter(r => r.success);

      if (successfulResults.length === 0) {
        return {
          success: false,
          error: 'Failed to fetch data for any competitor'
        };
      }

      // Sort by followers
      const sortedCompetitors = successfulResults
        .map(r => r.data)
        .sort((a, b) => b.followers - a.followers);

      // Calculate averages with validation
      const avgFollowers = sortedCompetitors.length > 0 
        ? sortedCompetitors.reduce((sum, c) => sum + (c.followers || 0), 0) / sortedCompetitors.length 
        : 0;
      const avgEngagementRate = sortedCompetitors.length > 0
        ? sortedCompetitors.reduce((sum, c) => sum + (c.engagementRate || 0), 0) / sortedCompetitors.length
        : 0;

      console.log(`✅ Comparison complete`);
      console.log(`   Average Followers: ${Math.round(avgFollowers)}`);
      console.log(`   Average Engagement Rate: ${avgEngagementRate.toFixed(2)}%`);

      return {
        success: true,
        competitors: sortedCompetitors,
        benchmarks: {
          avgFollowers: Math.round(avgFollowers),
          avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
          topCompetitor: sortedCompetitors[0],
          totalCompetitors: sortedCompetitors.length
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error comparing competitors:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format number for display
   */
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

export default new CompetitorIntelligenceService();
