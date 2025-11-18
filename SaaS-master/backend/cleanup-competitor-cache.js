/**
 * Cleanup script for expired competitor cache entries
 * Run this via cron or manually: node cleanup-competitor-cache.js
 */

import seoCacheService from './services/seoCacheService.js';

async function cleanupCompetitorCache() {
  console.log('🧹 Starting competitor cache cleanup...');
  
  try {
    const deletedCount = await seoCacheService.clearExpiredCompetitorCache();
    console.log(`✅ Cleanup completed. Removed ${deletedCount} expired entries.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupCompetitorCache();
