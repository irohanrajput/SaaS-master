import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import os from 'os';
import path from 'path';

/**
 * Lighthouse Service for Competitor Analysis
 * Simplified version with better error handling for external domains
 */
const competitorLighthouseService = {
  async analyzeSite(domain) {
    let chrome;
    let url = domain;
    
    if (!url.startsWith('http')) {
      url = `https://${domain}`;
    }

    try {
      console.log(`🔦 Running Competitor Lighthouse audit for: ${url}`);
      
      const tempDir = os.tmpdir();
      
      chrome = await launch({
        chromeFlags: [
          '--headless',
          '--no-sandbox', 
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--disable-extensions',
          '--disable-default-apps',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          `--user-data-dir=${path.join(tempDir, 'lighthouse-chrome-data-competitor')}`
        ]
      });

      const options = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
        chromeFlags: ['--headless', '--no-sandbox'],
        maxWaitForFcp: 45000,
        maxWaitForLoad: 60000,
        skipAudits: ['screenshot-thumbnails', 'final-screenshot']
      };

      const runnerResult = await lighthouse(url, options);
      
      if (!runnerResult || !runnerResult.lhr) {
        throw new Error('Lighthouse audit failed - no results returned');
      }

      const { categories, audits } = runnerResult.lhr;

      console.log(`✅ Competitor Lighthouse audit completed for ${domain}`);
      console.log(`   Performance: ${Math.round(categories.performance.score * 100)}%`);
      console.log(`   SEO: ${Math.round(categories.seo.score * 100)}%`);

      return {
        dataAvailable: true,
        url: url,
        categories: {
          performance: {
            score: categories.performance.score,
            displayValue: Math.round(categories.performance.score * 100)
          },
          accessibility: {
            score: categories.accessibility.score,
            displayValue: Math.round(categories.accessibility.score * 100)
          },
          'best-practices': {
            score: categories['best-practices'].score,
            displayValue: Math.round(categories['best-practices'].score * 100)
          },
          seo: {
            score: categories.seo.score,
            displayValue: Math.round(categories.seo.score * 100)
          }
        },
        metrics: {
          firstContentfulPaint: audits['first-contentful-paint']?.numericValue || null,
          largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || null,
          totalBlockingTime: audits['total-blocking-time']?.numericValue || null,
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || null,
          speedIndex: audits['speed-index']?.numericValue || null,
          timeToInteractive: audits['interactive']?.numericValue || null
        }
      };

    } catch (error) {
      console.error(`❌ Competitor Lighthouse audit failed for ${domain}:`, error.message);
      
      return {
        dataAvailable: false,
        reason: 'Lighthouse audit failed',
        error: error.message,
        categories: {
          performance: { score: null, displayValue: null },
          accessibility: { score: null, displayValue: null },
          'best-practices': { score: null, displayValue: null },
          seo: { score: null, displayValue: null }
        }
      };
    } finally {
      if (chrome) {
        try {
          await chrome.kill();
          console.log(`🔴 Chrome instance closed for ${domain}`);
        } catch (killError) {
          console.error(`⚠️ Error killing Chrome for ${domain}:`, killError.message);
        }
      }
    }
  }
};

export default competitorLighthouseService;
