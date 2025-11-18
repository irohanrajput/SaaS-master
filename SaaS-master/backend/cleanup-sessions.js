// cleanup-sessions.js - Clean up old GSC scraper sessions
import fs from 'fs';
import path from 'path';

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'gsc-sessions');
const MAX_AGE_DAYS = 30; // Delete sessions older than 30 days

async function cleanupOldSessions() {
  console.log('🧹 Cleaning up old GSC scraper sessions...\n');
  
  try {
    // Check if sessions directory exists
    if (!fs.existsSync(SESSIONS_DIR)) {
      console.log('⚠️ No sessions directory found. Nothing to clean up.');
      return;
    }

    const sessionFolders = fs.readdirSync(SESSIONS_DIR);
    
    if (sessionFolders.length === 0) {
      console.log('✅ Sessions directory is empty. Nothing to clean up.');
      return;
    }

    console.log(`📁 Found ${sessionFolders.length} session(s) to check:\n`);

    let deletedCount = 0;
    let keptCount = 0;
    const now = Date.now();
    const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    for (const folder of sessionFolders) {
      const folderPath = path.join(SESSIONS_DIR, folder);
      const stats = fs.statSync(folderPath);
      
      if (!stats.isDirectory()) continue;

      const ageMs = now - stats.mtimeMs;
      const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

      console.log(`📂 ${folder}:`);
      console.log(`   - Created: ${stats.birthtime.toLocaleDateString()}`);
      console.log(`   - Last modified: ${stats.mtime.toLocaleDateString()}`);
      console.log(`   - Age: ${ageDays} days`);

      if (ageMs > maxAgeMs) {
        console.log(`   - ❌ Deleting (older than ${MAX_AGE_DAYS} days)`);
        
        // Delete the folder recursively
        fs.rmSync(folderPath, { recursive: true, force: true });
        deletedCount++;
      } else {
        console.log(`   - ✅ Keeping (${MAX_AGE_DAYS - ageDays} days remaining)`);
        keptCount++;
      }
      
      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('📊 Cleanup Summary:');
    console.log(`   - Sessions deleted: ${deletedCount}`);
    console.log(`   - Sessions kept: ${keptCount}`);
    console.log(`   - Max age: ${MAX_AGE_DAYS} days`);
    console.log('═══════════════════════════════════════\n');

    if (deletedCount > 0) {
      console.log('✅ Cleanup completed successfully!');
      console.log('💡 Tip: Deleted users will need to login again (non-headless) on their next scraping request.\n');
    } else {
      console.log('✅ No old sessions to delete. All sessions are still valid.\n');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run cleanup
cleanupOldSessions();
