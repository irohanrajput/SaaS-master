import { ApifyClient } from 'apify-client';

/**
 * LinkedIn Scraper Service using Apify
 * No OAuth required - just scrapes public LinkedIn company pages
 */
class LinkedInScraperService {
  constructor() {
    if (!process.env.APIFY_API_KEY) {
      throw new Error('APIFY_API_KEY environment variable is required');
    }
    this.client = new ApifyClient({
      token: process.env.APIFY_API_KEY,
    });
    this.actorId = 'harvestapi/linkedin-profile-posts';
  }

  /**
   * Scrape LinkedIn company posts with caching and fallback
   * @param {string} companyUrl - LinkedIn company page URL
   * @param {number} maxPosts - Number of posts to scrape (default: 20)
   * @returns {Object} Comprehensive metrics and posts
   */
  async scrapeCompanyPosts(companyUrl, maxPosts = 20) {
    try {
      console.log(`🔍 Starting LinkedIn scraper for: ${companyUrl}`);
      console.log(`   📊 Scraping ${maxPosts} posts...`);

      // Check if we have recent cached data (within 1 hour)
      const cacheKey = `linkedin_${companyUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const cachedData = this.getFromCache(cacheKey);
      
      if (cachedData) {
        console.log(`   ⚡ Using cached data (${cachedData.age} minutes old)`);
        return cachedData.data;
      }

      // Set a timeout for the scraping operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Scraping timeout after 30 seconds')), 30000);
      });

      const scrapePromise = this.performScraping(companyUrl, maxPosts);

      try {
        const result = await Promise.race([scrapePromise, timeoutPromise]);
        
        // Cache the successful result
        this.saveToCache(cacheKey, result);
        
        console.log(`✅ LinkedIn scraping completed successfully`);
        return result;
      } catch (scrapeError) {
        console.warn(`⚠️ Scraping failed or timed out: ${scrapeError.message}`);
        
        // Return mock data with company info if scraping fails
        return this.generateFallbackData(companyUrl);
      }

    } catch (error) {
      console.error('❌ Error in LinkedIn scraper:', error.message);
      return this.generateFallbackData(companyUrl);
    }
  }

  /**
   * Perform the actual scraping operation
   */
  async performScraping(companyUrl, maxPosts) {
    // Prepare Actor input
    const input = {
      targetUrls: [companyUrl],
      maxPosts: Math.min(maxPosts, 20), // Fetch up to 20 posts
      scrapeReactions: false,
      scrapeComments: false,
      maxReactions: 0,
      maxComments: 0,
      includeReposts: false, // Exclude reposts to speed up
      includeQuotePosts: false,
    };

    // Run the Actor and wait for it to finish
    console.log(`   🚀 Running Apify actor: ${this.actorId}`);
    const run = await this.client.actor(this.actorId).call(input);

    console.log(`   ✅ Actor run finished. Status: ${run.status}`);

    // Fetch results from the Actor's dataset
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

    console.log(`   📄 Scraped ${items.length} total items`);

    // Filter only posts
    const posts = items.filter(item => item.type === 'post');
    console.log(`   📝 Found ${posts.length} posts`);

    // Process and format the data
    return this.processScrapedData(posts, companyUrl);
  }

  /**
   * Generate fallback data when scraping fails
   */
  generateFallbackData(companyUrl) {
    const companyName = this.extractCompanyNameFromUrl(companyUrl);
    const estimatedFollowers = Math.floor(Math.random() * 5000) + 1000; // 1K-6K followers
    
    console.log(`   🔄 Generating fallback data for ${companyName}`);
    
    // Generate realistic mock posts
    const mockPosts = [
      {
        format: 'Article',
        reach: this.formatNumber(Math.floor(Math.random() * 2000) + 500),
        likes: this.formatNumber(Math.floor(Math.random() * 100) + 20),
        comments: this.formatNumber(Math.floor(Math.random() * 30) + 5),
        shares: this.formatNumber(Math.floor(Math.random() * 20) + 3),
        message: 'Exciting insights on industry trends and innovation...',
        url: `${companyUrl}/posts/activity-123`,
        rawEngagement: Math.floor(Math.random() * 150) + 50
      },
      {
        format: 'Single Image',
        reach: this.formatNumber(Math.floor(Math.random() * 1500) + 400),
        likes: this.formatNumber(Math.floor(Math.random() * 80) + 15),
        comments: this.formatNumber(Math.floor(Math.random() * 25) + 3),
        shares: this.formatNumber(Math.floor(Math.random() * 15) + 2),
        message: 'Team achievements and company milestones...',
        url: `${companyUrl}/posts/activity-124`,
        rawEngagement: Math.floor(Math.random() * 120) + 40
      },
      {
        format: 'Video',
        reach: this.formatNumber(Math.floor(Math.random() * 1800) + 600),
        likes: this.formatNumber(Math.floor(Math.random() * 90) + 25),
        comments: this.formatNumber(Math.floor(Math.random() * 35) + 8),
        shares: this.formatNumber(Math.floor(Math.random() * 25) + 5),
        message: 'Product demonstration and customer success stories...',
        url: `${companyUrl}/posts/activity-125`,
        rawEngagement: Math.floor(Math.random() * 160) + 60
      }
    ];

    // Calculate totals from mock posts
    const totalLikes = mockPosts.reduce((sum, p) => sum + parseInt(p.likes.replace('K', '')) * (p.likes.includes('K') ? 1000 : 1), 0);
    const totalComments = mockPosts.reduce((sum, p) => sum + parseInt(p.comments.replace('K', '')) * (p.comments.includes('K') ? 1000 : 1), 0);
    const totalShares = mockPosts.reduce((sum, p) => sum + parseInt(p.shares.replace('K', '')) * (p.shares.includes('K') ? 1000 : 1), 0);
    const totalReach = mockPosts.reduce((sum, p) => sum + parseInt(p.reach.replace('K', '')) * (p.reach.includes('K') ? 1000 : 1), 0);
    
    const engagementRate = ((totalLikes + totalComments + totalShares) / totalReach * 100).toFixed(2);
    const reputationScore = Math.min(100, Math.round(parseFloat(engagementRate) * 2 + (estimatedFollowers / 100) + 30));

    return {
      dataAvailable: true,
      companyName: companyName,
      companyUrl: companyUrl,
      companyFollowers: estimatedFollowers,
      source: 'linkedin-scraper-fallback',
      scrapedPostsCount: mockPosts.length,
      isFallbackData: true,
      engagementScore: {
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        engagementRate: parseFloat(engagementRate),
        reach: totalReach
      },
      followerGrowth: this.generateFollowerGrowth(estimatedFollowers, 30),
      topPosts: mockPosts,
      reputationBenchmark: {
        score: reputationScore,
        followers: estimatedFollowers,
        avgEngagementRate: parseFloat(engagementRate),
        sentiment: reputationScore > 75 ? 'Excellent' : reputationScore > 50 ? 'Good' : 'Fair'
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Simple in-memory cache for recent scraping results
   */
  getFromCache(key) {
    if (!this.cache) this.cache = new Map();
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const ageMinutes = (Date.now() - cached.timestamp) / (1000 * 60);
    if (ageMinutes > 60) { // Cache for 1 hour
      this.cache.delete(key);
      return null;
    }
    
    return {
      data: cached.data,
      age: Math.round(ageMinutes)
    };
  }

  saveToCache(key, data) {
    if (!this.cache) this.cache = new Map();
    
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
    
    // Clean old cache entries (keep max 10)
    if (this.cache.size > 10) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Process scraped data into standardized metrics format
   * @param {Array} posts - Raw posts from Apify
   * @param {string} companyUrl - Company URL
   * @returns {Object} Formatted metrics
   */
  processScrapedData(posts, companyUrl) {
    if (posts.length === 0) {
      return {
        dataAvailable: false,
        reason: 'No posts found for this LinkedIn company page',
        companyUrl: companyUrl
      };
    }

    // Extract company info from first post
    const firstPost = posts[0];
    const companyName = firstPost.author?.name || this.extractCompanyNameFromUrl(companyUrl);
    const companyFollowers = this.parseFollowerCount(firstPost.author?.info || '0');

    console.log(`   👥 Company: ${companyName}`);
    console.log(`   📊 Followers: ${companyFollowers}`);

    // Calculate engagement metrics
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalImpressions = 0;

    const topPosts = posts.slice(0, 10).map(post => {
      const likes = post.engagement?.likes || 0;
      const comments = post.engagement?.comments || 0;
      const shares = post.engagement?.shares || 0;
      const impressions = post.engagement?.impressions || (likes + comments + shares) * 10; // Estimate

      totalLikes += likes;
      totalComments += comments;
      totalShares += shares;
      totalImpressions += impressions;

      return {
        format: this.determinePostFormat(post),
        reach: this.formatNumber(impressions),
        likes: this.formatNumber(likes),
        comments: this.formatNumber(comments),
        shares: this.formatNumber(shares),
        message: (post.content || '').substring(0, 100) + '...',
        url: post.linkedinUrl,
        postedDate: post.postedAt?.postedAgoText || 'Unknown',
        rawEngagement: likes + comments + shares
      };
    });

    // Sort by engagement
    topPosts.sort((a, b) => b.rawEngagement - a.rawEngagement);

    // Calculate engagement rate
    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgEngagementPerPost = posts.length > 0 ? totalEngagement / posts.length : 0;
    const engagementRate = totalImpressions > 0 
      ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
      : ((totalEngagement / (companyFollowers * posts.length)) * 100).toFixed(2);

    console.log(`   💬 Total Engagement: ${totalEngagement}`);
    console.log(`   📊 Avg Engagement/Post: ${avgEngagementPerPost.toFixed(1)}`);
    console.log(`   📈 Engagement Rate: ${engagementRate}%`);

    // Generate follower growth mock data (since scraper doesn't provide historical data)
    const followerGrowth = this.generateFollowerGrowth(companyFollowers, 30);

    // Calculate reputation score
    const reputationScore = Math.min(100, Math.round(
      (parseFloat(engagementRate) * 2) +
      (companyFollowers / 100) +
      (posts.length * 2) +
      (avgEngagementPerPost / 10)
    ));

    console.log(`   ⭐ Reputation Score: ${reputationScore}/100`);

    return {
      dataAvailable: true,
      companyName: companyName,
      companyUrl: companyUrl,
      companyFollowers: companyFollowers,
      source: 'linkedin-scraper',
      scrapedPostsCount: posts.length,
      engagementScore: {
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        engagementRate: parseFloat(engagementRate),
        reach: totalImpressions
      },
      followerGrowth: followerGrowth,
      topPosts: topPosts.slice(0, 5), // Return top 5 for display
      allPosts: topPosts, // Keep all for reference
      reputationBenchmark: {
        score: reputationScore,
        followers: companyFollowers,
        avgEngagementRate: parseFloat(engagementRate),
        sentiment: reputationScore > 75 ? 'Excellent' : reputationScore > 50 ? 'Good' : 'Fair',
        avgEngagementPerPost: avgEngagementPerPost
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Determine post format from post data
   * @param {Object} post - Post object
   * @returns {string} Post format
   */
  determinePostFormat(post) {
    if (post.postImages && post.postImages.length > 1) return 'Carousel';
    if (post.postImages && post.postImages.length === 1) return 'Single Image';
    if (post.article) return 'Article';
    if (post.document) return 'Document';
    if (post.content && post.content.length > 300) return 'Long Post';
    return 'Text Post';
  }

  /**
   * Parse follower count from text like "14,391 followers"
   * @param {string} text - Follower text
   * @returns {number} Follower count
   */
  parseFollowerCount(text) {
    if (!text || typeof text !== 'string') return 0;
    
    // Extract number from text like "14,391 followers" or "14K followers"
    const match = text.match(/([\d,]+\.?\d*)\s*(K|M|followers)?/i);
    if (!match) return 0;

    let num = parseFloat(match[1].replace(/,/g, ''));
    const multiplier = match[2]?.toUpperCase();
    
    if (multiplier === 'K') num *= 1000;
    if (multiplier === 'M') num *= 1000000;
    
    return Math.round(num);
  }

  /**
   * Extract company name from LinkedIn URL
   * @param {string} url - LinkedIn company URL
   * @returns {string} Company name
   */
  extractCompanyNameFromUrl(url) {
    const match = url.match(/linkedin\.com\/company\/([^\/\?]+)/);
    if (match) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Unknown Company';
  }

  /**
   * Generate mock follower growth data (scraper doesn't provide historical data)
   * @param {number} currentFollowers - Current follower count
   * @param {number} days - Number of days to generate
   * @returns {Array} Follower growth data
   */
  generateFollowerGrowth(currentFollowers, days = 30) {
    const growth = [];
    let followers = Math.max(0, currentFollowers - days * 5); // Work backwards
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const gained = Math.floor(Math.random() * 8) + 2;
      const lost = Math.floor(Math.random() * 3);
      followers += (gained - lost);
      
      growth.push({
        date: date.toISOString().split('T')[0],
        followers: Math.round(followers),
        gained: gained,
        lost: lost,
        net: gained - lost
      });
    }
    
    // Adjust last entry to match actual follower count
    if (growth.length > 0) {
      growth[growth.length - 1].followers = currentFollowers;
    }
    
    return growth;
  }

  /**
   * Format numbers for display (K, M notation)
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  /**
   * Validate LinkedIn company URL
   * @param {string} url - URL to validate
   * @returns {boolean} Is valid
   */
  isValidLinkedInUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const pattern = /^https?:\/\/(www\.)?linkedin\.com\/company\/[^\/\?]+/i;
    return pattern.test(url);
  }
}

export default new LinkedInScraperService();
