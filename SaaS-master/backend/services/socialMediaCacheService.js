/**
 * Social Media Cache Service
 * Manages caching for LinkedIn, Facebook, and Instagram metrics
 * Uses Supabase for persistent storage with automatic expiration
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CACHE_DURATION_MINUTES = 30; // Default cache duration

const socialMediaCacheService = {
  /**
   * Get cached social media data (alias for getCachedMetrics)
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform ('linkedin', 'facebook', 'instagram')
   * @param {string} period - Time period (optional)
   * @returns {Promise<object|null>} Cached data or null if expired/missing
   */
  async getCachedData(userEmail, platform, period = 'month') {
    return this.getCachedMetrics(userEmail, platform, period);
  },

  /**
   * Get cached metrics (main method)
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform ('linkedin', 'facebook', 'instagram')
   * @param {string} period - Time period
   * @returns {Promise<object|null>} Cached data or null if expired/missing
   */
  async getCachedMetrics(userEmail, platform, period = 'month') {
    try {
      console.log(`📦 Checking cache for ${platform} - ${userEmail}`);
      
      const { data, error } = await supabase
        .from('social_media_cache')
        .select('*')
        .eq('user_email', userEmail)
        .eq('platform', platform)
        .gt('expires_at', new Date().toISOString())
        .order('last_fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`📭 No valid cache found for ${platform}`);
          return null;
        }
        throw error;
      }

      if (!data) {
        console.log(`📭 No valid cache found for ${platform}`);
        return null;
      }

      const ageMinutes = Math.floor((Date.now() - new Date(data.last_fetched_at).getTime()) / 60000);
      console.log(`✅ Cache hit for ${platform} (${ageMinutes} minutes old)`);

      // Log cache hit
      await this.logFetch(userEmail, platform, 'metrics', 'cached', 0, 0, true);

      return {
        companyName: data.account_name,
        pageName: data.account_name,
        companyUrl: data.profile_url,
        companyFollowers: data.follower_count,
        engagementScore: data.engagement_data || {
          likes: 0,
          comments: 0,
          shares: 0,
          clicks: 0,  // ✅ ADDED
          impressions: 0,  // ✅ ADDED
          totalReactions: 0,
          engagementRate: 0,
          score: 0,  // ✅ ADDED
          reach: 0,
          rateSource: null  // ✅ ADDED
        },
        followerGrowth: data.follower_growth || [],
        topPosts: data.top_posts || [],
        posts: data.posts_data || { total: 0, topPerforming: [] },
        reputationBenchmark: data.reputation_data || {},
        dataAvailable: data.data_available,
        lastUpdated: data.last_fetched_at,
        cacheAge: ageMinutes,
        source: `${platform} API (cached)`
      };
    } catch (error) {
      console.error(`❌ Error getting cached data for ${platform}:`, error);
      return null;
    }
  },

  /**
   * Store social media data in cache (alias for cacheMetrics)
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform ('linkedin', 'facebook', 'instagram')
   * @param {object} data - Data to cache
   * @param {string|number} periodOrDuration - Period or cache duration
   * @returns {Promise<boolean>} Success status
   */
  async setCachedData(userEmail, platform, data, periodOrDuration = CACHE_DURATION_MINUTES) {
    const cacheDuration = typeof periodOrDuration === 'number' ? periodOrDuration : CACHE_DURATION_MINUTES;
    return this.cacheMetrics(userEmail, platform, data, periodOrDuration);
  },

  /**
   * Cache metrics (main method)
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform ('linkedin', 'facebook', 'instagram')
   * @param {object} data - Data to cache
   * @param {string} period - Time period
   * @returns {Promise<boolean>} Success status
   */
  async cacheMetrics(userEmail, platform, data, period = 'month') {
    const cacheDuration = CACHE_DURATION_MINUTES;
    try {
      console.log(`💾 Caching ${platform} data for ${userEmail} (${cacheDuration} min)`);

      const expiresAt = new Date(Date.now() + cacheDuration * 60 * 1000).toISOString();

      const cacheEntry = {
        user_email: userEmail,
        platform: platform,
        account_id: data.accountId || data.companyId || null,
        account_name: data.companyName || data.pageName || data.username || null,
        username: data.username || null,
        profile_url: data.companyUrl || data.pageUrl || data.profileUrl || null,
        engagement_data: {
          likes: data.engagementScore?.likes || 0,
          comments: data.engagementScore?.comments || 0,
          shares: data.engagementScore?.shares || 0,
          clicks: data.engagementScore?.clicks || 0,  // ✅ ADDED
          impressions: data.engagementScore?.impressions || 0,  // ✅ ADDED
          totalReactions: data.engagementScore?.totalReactions || 0,
          engagementRate: data.engagementScore?.engagementRate || 0,
          score: data.engagementScore?.score || 0,  // ✅ ADDED
          reach: data.engagementScore?.reach || 0,
          rateSource: data.engagementScore?.rateSource || null  // ✅ ADDED
        },
        follower_count: data.companyFollowers || data.followerCount || 0,
        follower_growth: data.followerGrowth || [],
        top_posts: data.topPosts || [],
        posts_data: data.posts || { total: 0, topPerforming: [] },
        reputation_data: data.reputationBenchmark || {},
        linkedin_company_id: platform === 'linkedin' ? data.companyId : null,
        linkedin_company_urn: platform === 'linkedin' ? data.companyUrn : null,
        data_available: data.dataAvailable !== false,
        error_message: data.error || null,
        period: data.period || 'month',
        updated_at: new Date().toISOString(),
        last_fetched_at: new Date().toISOString(),
        expires_at: expiresAt
      };

      // Check if cache entry exists
      const { data: existing } = await supabase
        .from('social_media_cache')
        .select('id')
        .eq('user_email', userEmail)
        .eq('platform', platform)
        .single();

      if (existing) {
        // Update existing cache
        const { error } = await supabase
          .from('social_media_cache')
          .update(cacheEntry)
          .eq('id', existing.id);

        if (error) throw error;
        console.log(`✅ Cache updated for ${platform}`);
      } else {
        // Insert new cache
        const { error } = await supabase
          .from('social_media_cache')
          .insert(cacheEntry);

        if (error) throw error;
        console.log(`✅ Cache created for ${platform}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error caching ${platform} data:`, error);
      return false;
    }
  },

  /**
   * Invalidate cache for a platform
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform to invalidate
   * @returns {Promise<boolean>} Success status
   */
  async invalidateCache(userEmail, platform) {
    try {
      console.log(`🗑️ Invalidating cache for ${platform} - ${userEmail}`);

      const { error } = await supabase
        .from('social_media_cache')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_email', userEmail)
        .eq('platform', platform);

      if (error) throw error;

      console.log(`✅ Cache invalidated for ${platform}`);
      return true;
    } catch (error) {
      console.error(`❌ Error invalidating cache for ${platform}:`, error);
      return false;
    }
  },

  /**
   * Clear all cache for a user
   * @param {string} userEmail - User's email
   * @returns {Promise<boolean>} Success status
   */
  async clearAllCache(userEmail) {
    try {
      console.log(`🗑️ Clearing all cache for ${userEmail}`);

      const { error } = await supabase
        .from('social_media_cache')
        .delete()
        .eq('user_email', userEmail);

      if (error) throw error;

      console.log(`✅ All cache cleared for ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Error clearing cache:`, error);
      return false;
    }
  },

  /**
   * Log fetch attempt for monitoring (alias for logFetchHistory)
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform
   * @param {string} fetchType - Type of fetch ('metrics', 'posts', etc.)
   * @param {string} status - Status ('success', 'failed', 'cached')
   * @param {number|object} durationOrOptions - Duration in ms or options object
   * @param {number} recordsFetched - Number of records fetched
   * @param {boolean} cacheHit - Whether cache was used
   * @param {string} errorMessage - Error message if failed
   * @returns {Promise<boolean>} Success status
   */
  async logFetch(userEmail, platform, fetchType, status, durationOrOptions = 0, recordsFetched = 0, cacheHit = false, errorMessage = null) {
    // Handle both old and new calling conventions
    if (typeof durationOrOptions === 'object') {
      return this.logFetchHistory(userEmail, platform, fetchType, status, durationOrOptions);
    }
    return this.logFetchHistory(userEmail, platform, fetchType, status, {
      duration: durationOrOptions,
      recordCount: recordsFetched,
      cacheHit: cacheHit,
      error: errorMessage
    });
  },

  /**
   * Log fetch history (main method)
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform
   * @param {string} fetchType - Type of fetch
   * @param {string} status - Status
   * @param {object} options - Options object
   * @returns {Promise<boolean>} Success status
   */
  async logFetchHistory(userEmail, platform, fetchType, status, options = {}) {
    const duration = options.duration || 0;
    const recordsFetched = options.recordCount || 0;
    const cacheHit = options.cacheHit || false;
    const errorMessage = options.error || null;
    try {
      const { error } = await supabase
        .from('social_media_fetch_history')
        .insert({
          user_email: userEmail,
          platform: platform,
          fetch_type: fetchType,
          fetch_status: status,
          duration_ms: duration,
          records_fetched: recordsFetched,
          cache_hit: cacheHit,
          error_message: errorMessage
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error logging fetch:', error);
      return false;
    }
  },

  /**
   * Get cache statistics for a user
   * @param {string} userEmail - User's email
   * @returns {Promise<object>} Cache statistics
   */
  async getCacheStats(userEmail) {
    try {
      const { data, error } = await supabase
        .from('social_media_cache')
        .select('platform, last_fetched_at, expires_at, data_available')
        .eq('user_email', userEmail);

      if (error) throw error;

      const stats = {
        total: data.length,
        platforms: {},
        valid: 0,
        expired: 0
      };

      const now = new Date();
      data.forEach(cache => {
        const isValid = new Date(cache.expires_at) > now;
        stats.platforms[cache.platform] = {
          cached: true,
          valid: isValid,
          lastFetched: cache.last_fetched_at,
          expiresAt: cache.expires_at,
          dataAvailable: cache.data_available
        };
        if (isValid) stats.valid++;
        else stats.expired++;
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return { total: 0, platforms: {}, valid: 0, expired: 0 };
    }
  },

  /**
   * Clean up expired cache entries (maintenance function)
   * @returns {Promise<number>} Number of entries deleted
   */
  async cleanupExpiredCache() {
    try {
      console.log('🧹 Cleaning up expired cache entries...');

      const { data, error } = await supabase
        .from('social_media_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) throw error;

      const count = data?.length || 0;
      console.log(`✅ Cleaned up ${count} expired cache entries`);
      return count;
    } catch (error) {
      console.error('❌ Error cleaning up cache:', error);
      return 0;
    }
  },

  /**
   * Update connection status for a platform
   * @param {string} userEmail - User's email
   * @param {string} platform - Platform
   * @param {boolean} isConnected - Connection status
   * @param {object} metadata - Additional metadata
   * @returns {Promise<boolean>} Success status
   */
  async updateConnectionStatus(userEmail, platform, isConnected, metadata = {}) {
    try {
      const { error } = await supabase
        .from('social_connections_v2')
        .upsert({
          user_email: userEmail,
          platform: platform,
          is_connected: isConnected,
          connection_status: isConnected ? 'connected' : 'disconnected',
          platform_metadata: metadata,
          updated_at: new Date().toISOString(),
          connected_at: isConnected ? new Date().toISOString() : null
        }, {
          onConflict: 'user_email,platform'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error updating connection status:', error);
      return false;
    }
  },

  /**
   * Get all connection statuses for a user
   * @param {string} userEmail - User's email
   * @returns {Promise<Array>} Connection statuses
   */
  async getAllConnectionStatuses(userEmail) {
    try {
      const { data, error } = await supabase
        .from('social_connections_v2')
        .select('*')
        .eq('user_email', userEmail);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting connection statuses:', error);
      return [];
    }
  }
};

export default socialMediaCacheService;
